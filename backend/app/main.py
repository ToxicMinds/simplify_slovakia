# backend/app/main.py
# UPDATED VERSION - Uses flow metadata for intelligent routing

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, List, Optional
from pydantic import BaseModel
import yaml
import os
from pathlib import Path

app = FastAPI(
    title="Simplify Slovakia API",
    description="Deterministic bureaucracy navigation for Slovakia",
    version="2.0.0",
    contact={
        "name": "Simplify Slovakia",
        "url": "https://github.com/ToxicMinds/simplify_slovakia",
    },
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Detect if running in Lambda
if os.environ.get('AWS_LAMBDA_FUNCTION_NAME'):
    BASE_DIR = Path(__file__).resolve().parent.parent
else:
    BASE_DIR = Path(__file__).resolve().parent.parent.parent

DATA_DIR = BASE_DIR / "data"
FLOWS_DIR = DATA_DIR / "flows"
STEPS_DIR = DATA_DIR / "steps"

def load_yaml(path: Path):
    with open(path, "r") as f:
        return yaml.safe_load(f)

def load_flow(flow_file: str):
    return load_yaml(FLOWS_DIR / flow_file)

def load_step(step_id: str):
    return load_yaml(STEPS_DIR / f"{step_id}.yaml")


# ==============================================================================
# MODELS
# ==============================================================================

class IntakeAnswersV2(BaseModel):
    """V2 intake answers - matches intakeQuestions.js structure"""
    nationality_type: str  # EU | NON_EU_VISA_FREE | NON_EU_VISA_REQUIRED
    current_location: str  # OUTSIDE_SK | IN_SK
    urgency_level: Optional[str] = None  # EMERGENCY | NORMAL
    visit_purpose: str  # TOURISM | EMPLOYMENT | BUSINESS | FAMILY | STUDY | PERMANENT | CITIZENSHIP
    visit_duration: Optional[str] = None  # SHORT_STAY | MEDIUM_STAY | LONG_STAY | PERMANENT
    years_in_slovakia: Optional[str] = None  # 0 | 1-2 | 3-4 | 5-7 | 8+
    city: str  # BRATISLAVA | OTHER


class FlowRecommendation(BaseModel):
    """Flow recommendation with confidence scoring"""
    flow_id: str
    title: str
    score: int  # 0-100
    confidence: str  # HIGH | MEDIUM | LOW
    reason: str
    warnings: List[str] = []


# ==============================================================================
# HELPER FUNCTIONS
# ==============================================================================

def calculate_flow_match_score(flow_data: dict, answers: IntakeAnswersV2) -> tuple[int, str]:
    """
    Calculate match score using flow's intake_matches rules
    Returns: (score, reason)
    """
    if 'intake_matches' not in flow_data:
        # Fallback to simple scoring if no intake_matches
        return calculate_simple_score(flow_data, answers)
    
    total_score = 0
    max_possible = 0
    matched_reasons = []
    
    for match_rule in flow_data['intake_matches']:
        question = match_rule['question']
        required_answer = match_rule['required_answer']
        weight = match_rule['weight']
        reason = match_rule.get('reason', '')
        
        max_possible += weight
        
        # Get user's answer for this question
        user_answer = getattr(answers, question, None)
        
        # Check if it matches
        if required_answer == 'ANY':
            # ANY means any answer is acceptable
            total_score += weight
            matched_reasons.append(reason)
        elif user_answer == required_answer:
            total_score += weight
            matched_reasons.append(reason)
        elif isinstance(required_answer, list) and user_answer in required_answer:
            total_score += weight
            matched_reasons.append(reason)
        elif required_answer.endswith('+') and user_answer:
            # Handle "5+" type requirements
            try:
                required_years = int(required_answer[:-1])
                user_years_str = user_answer.split('-')[0]  # "5-7" -> "5"
                if user_years_str.endswith('+'):
                    user_years = int(user_years_str[:-1])
                else:
                    user_years = int(user_years_str)
                
                if user_years >= required_years:
                    total_score += weight
                    matched_reasons.append(reason)
            except:
                pass
    
    if max_possible == 0:
        return (0, "No matching criteria defined")
    
    # Calculate percentage
    score = int((total_score / max_possible) * 100)
    
    # Combine reasons
    reason_text = " | ".join(matched_reasons) if matched_reasons else "No matches"
    
    return (score, reason_text)


def calculate_simple_score(flow_data: dict, answers: IntakeAnswersV2) -> tuple[int, str]:
    """
    Fallback scoring using intake_routing (backward compatibility)
    """
    routing = flow_data.get('intake_routing', {})
    score = 0
    
    # Nationality match (30 points)
    if routing.get('nationality_requirement') == 'ANY':
        score += 30
    elif routing.get('nationality_requirement') == answers.nationality_type:
        score += 30
    
    # Location match (25 points)
    if routing.get('entry_context') == 'ANY':
        score += 25
    elif routing.get('entry_context') == answers.current_location:
        score += 25
    
    # Purpose match (35 points)
    if routing.get('purpose') == 'ANY':
        score += 35
    elif routing.get('purpose') == answers.visit_purpose:
        score += 35
    
    # Urgency match (10 points)
    if routing.get('urgency') == 'ANY' or not routing.get('urgency'):
        score += 10
    elif routing.get('urgency') == answers.urgency_level:
        score += 10
    
    reason = f"Matched via intake_routing (fallback method)"
    return (score, reason)


def get_confidence_from_score(score: int, threshold: int) -> str:
    """Convert score to confidence level"""
    if score >= 85:
        return "HIGH"
    elif score >= threshold:
        return "MEDIUM"
    elif score >= 30:
        return "LOW"
    else:
        return "NONE"


def generate_recommendation_reason(flow_data: dict, score: int, match_reason: str) -> str:
    """Generate human-readable recommendation reason"""
    if score >= 85:
        return f"Perfect match! {match_reason}"
    elif score >= 60:
        return f"Good match. {match_reason}"
    elif score >= 30:
        return f"Partial match. {match_reason}"
    else:
        return "This flow doesn't seem to match your situation well."


# ==============================================================================
# ENDPOINTS
# ==============================================================================

@app.get("/flows")
def list_flows():
    """List all available flows with metadata"""
    try:
        flows = []
        
        for flow_file in FLOWS_DIR.glob("*.yaml"):
            try:
                flow_data = load_yaml(flow_file)
                
                # Extract metadata
                display_info = flow_data.get('display_info', {})
                
                flows.append({
                    "flow_id": flow_data["flow_id"],
                    "title": display_info.get('title', flow_data.get('title', flow_data["flow_id"])),
                    "category": display_info.get('category', 'Other'),
                    "description": display_info.get('description', ''),
                    "difficulty": display_info.get('difficulty_level', 'MEDIUM'),
                    "timeline": display_info.get('estimated_timeline', ''),
                    "cost": display_info.get('estimated_cost', ''),
                    "priority": display_info.get('priority', 'MEDIUM'),
                    "tags": display_info.get('tags', []),
                    "step_count": len(flow_data.get("steps", [])),
                    "version": flow_data.get("version", "1.0.0"),
                    
                    # Legacy fields for backward compatibility
                    "persona_id": flow_data.get("persona_id", ""),
                    "country": flow_data.get("country", "Slovakia"),
                })
            except Exception as e:
                print(f"Error loading {flow_file}: {e}")
                continue
        
        if not flows:
            raise HTTPException(
                status_code=500,
                detail="No valid flows found in data/flows/"
            )
        
        # Sort by priority
        priority_order = {"CRITICAL": 0, "HIGH": 1, "MEDIUM": 2, "LOW": 3}
        flows.sort(key=lambda x: priority_order.get(x.get("priority", "MEDIUM"), 2))
        
        return {"flows": flows}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/recommend-flow-v2")
def recommend_flow_v2(answers: IntakeAnswersV2):
    """
    V2: Recommend flows using metadata-driven matching
    
    Uses intake_matches rules from flow YAML metadata for intelligent scoring.
    Falls back to intake_routing if intake_matches not defined.
    """
    try:
        # Load all available flows
        all_flows = []
        
        for flow_file in FLOWS_DIR.glob("*.yaml"):
            try:
                flow_data = load_yaml(flow_file)
                all_flows.append(flow_data)
            except Exception as e:
                print(f"Error loading {flow_file}: {e}")
                continue
        
        if not all_flows:
            raise HTTPException(status_code=500, detail="No flows available")
        
        # Score each flow
        recommendations = []
        
        for flow_data in all_flows:
            score, match_reason = calculate_flow_match_score(flow_data, answers)
            
            display_info = flow_data.get('display_info', {})
            intake_routing = flow_data.get('intake_routing', {})
            confidence_threshold = flow_data.get('intake_matches', [{}])[0].get('confidence_threshold', 70) if 'intake_matches' in flow_data else 70
            
            confidence = get_confidence_from_score(score, confidence_threshold)
            
            # Only include if score > 0
            if score > 0:
                recommendation = FlowRecommendation(
                    flow_id=flow_data['flow_id'],
                    title=display_info.get('title', flow_data.get('title', flow_data['flow_id'])),
                    score=score,
                    confidence=confidence,
                    reason=generate_recommendation_reason(flow_data, score, match_reason),
                    warnings=display_info.get('warnings', [])
                )
                recommendations.append(recommendation)
        
        if not recommendations:
            return {
                "flow_id": "",
                "title": "No exact match found",
                "score": 0,
                "confidence": "NONE",
                "reason": "We couldn't find a flow matching your situation. Please browse all flows manually.",
                "warnings": [],
                "step_count": 0
            }
        
        # Sort by score descending
        recommendations.sort(key=lambda x: x.score, reverse=True)
        
        # Return top recommendation
        top = recommendations[0]
        
        # Get step count
        flow_data = load_yaml(FLOWS_DIR / f"{top.flow_id}.yaml")
        
        return {
            "flow_id": top.flow_id,
            "title": top.title,
            "score": top.score,
            "confidence": top.confidence,
            "reason": top.reason,
            "warnings": top.warnings,
            "step_count": len(flow_data.get("steps", [])),
            "alternatives": [
                {
                    "flow_id": rec.flow_id,
                    "title": rec.title,
                    "score": rec.score,
                    "confidence": rec.confidence
                }
                for rec in recommendations[1:4]  # Top 3 alternatives
            ] if len(recommendations) > 1 else []
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Keep old endpoint for backward compatibility
@app.post("/recommend-flow")
def recommend_flow_v1(answers: dict):
    """
    V1: Legacy endpoint - converts to V2 format and delegates
    """
    try:
        # Convert old format to new format
        v2_answers = IntakeAnswersV2(
            nationality_type=answers.get('nationality', 'NON_EU_VISA_REQUIRED'),
            current_location=answers.get('entry_context', 'OUTSIDE_SK'),
            urgency_level=answers.get('urgency', 'NORMAL'),
            visit_purpose=answers.get('purpose', 'EMPLOYMENT'),
            visit_duration=None,
            years_in_slovakia=None,
            city=answers.get('city', 'BRATISLAVA')
        )
        
        return recommend_flow_v2(v2_answers)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/flow/{flow_id}")
def get_flow(flow_id: str):
    """Get a specific flow by ID with all resolved steps"""
    try:
        flow_file = f"{flow_id}.yaml"
        flow_path = FLOWS_DIR / flow_file
        
        if not flow_path.exists():
            raise HTTPException(
                status_code=404,
                detail=f"Flow '{flow_id}' not found. Available flows: /flows"
            )
        
        flow = load_yaml(flow_path)
        resolved_steps = []
        
        for item in flow["steps"]:
            step_file = STEPS_DIR / f"{item['step_id']}.yaml"
            
            if not step_file.exists():
                raise HTTPException(
                    status_code=500,
                    detail=f"Step file '{item['step_id']}.yaml' not found"
                )
            
            step_data = load_yaml(step_file)
            step_data["order"] = item["order"]
            resolved_steps.append(step_data)
        
        # Include metadata in response
        display_info = flow.get('display_info', {})
        
        return {
            "flow": {
                "flow_id": flow["flow_id"],
                "title": display_info.get('title', flow.get('title', flow["flow_id"])),
                "description": display_info.get('description', flow.get('description', '')),
                "category": display_info.get('category', 'Other'),
                "difficulty": display_info.get('difficulty_level', 'MEDIUM'),
                "timeline": display_info.get('estimated_timeline', flow.get('estimated_timeline', '')),
                "cost": display_info.get('estimated_cost', flow.get('estimated_cost', '')),
                "persona_id": flow.get("persona_id", ""),
                "country": flow.get("country", "Slovakia"),
                "version": flow.get("version", "1.0.0"),
            },
            "steps": resolved_steps,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
def health():
    return {"status": "ok", "version": "2.0.0"}
