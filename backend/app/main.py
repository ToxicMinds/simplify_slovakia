# backend/app/main.py
# FIXED VERSION - Robust scoring that doesn't crash on bad data

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import yaml
import os
from pathlib import Path

app = FastAPI(title="Simplify Slovakia API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Paths
BASE_DIR = Path(__file__).parent.parent.parent  # backend/app -> backend -> project root
FLOWS_DIR = BASE_DIR / "data" / "flows"
STEPS_DIR = BASE_DIR / "data" / "steps"

# Models
class IntakeAnswersV2(BaseModel):
    nationality_type: Optional[str] = None
    current_location: Optional[str] = None
    urgency_level: Optional[str] = None
    visit_purpose: Optional[str] = None
    visit_duration: Optional[str] = None
    years_in_slovakia: Optional[str] = None
    city: Optional[str] = None

class FlowRecommendation(BaseModel):
    flow_id: str
    title: str
    confidence: str
    score: float
    reason: Optional[str] = None

# Load flows
def load_all_flows():
    flows = []
    if not FLOWS_DIR.exists():
        return flows
    
    for yaml_file in FLOWS_DIR.glob("*.yaml"):
        try:
            with open(yaml_file, 'r', encoding='utf-8') as f:
                flow = yaml.safe_load(f)
                if flow:
                    flows.append(flow)
        except Exception as e:
            print(f"Error loading {yaml_file}: {e}")
    
    return flows

# Calculate match score
def calculate_flow_match_score(flow: dict, answers: dict) -> tuple[float, list[str]]:
    """
    Calculate match score based on intake_matches rules.
    Returns (score, reasons) where score is 0-100
    """
    intake_matches = flow.get('intake_matches', [])
    
    if not intake_matches:
        # No matching rules - return low score
        return 0.0, ["Flow has no intake_matches rules"]
    
    total_possible_weight = sum(match.get('weight', 0) for match in intake_matches)
    if total_possible_weight == 0:
        return 0.0, ["Total weight is zero"]
    
    matched_weight = 0
    reasons = []
    
    for match in intake_matches:
        question_id = match.get('question')
        required_answer = match.get('required_answer')
        weight = match.get('weight', 0)
        reason = match.get('reason', '')
        
        # Skip if no question or weight
        if not question_id or weight == 0:
            continue
        
        # Get user's answer
        user_answer = answers.get(question_id)
        
        # Handle special cases
        if required_answer is None or required_answer == 'ANY':
            # Match any answer
            matched_weight += weight
            if reason:
                reasons.append(f"✓ {reason}")
            continue
        
        if required_answer == 'null':
            # Treat 'null' string as any match
            matched_weight += weight
            if reason:
                reasons.append(f"✓ {reason}")
            continue
        
        # Check if user answered this question
        if user_answer is None:
            # User hasn't answered - skip this rule
            continue
        
        # Handle array of acceptable answers
        if isinstance(required_answer, list):
            if user_answer in required_answer:
                matched_weight += weight
                if reason:
                    reasons.append(f"✓ {reason}")
        # Handle single answer
        elif str(user_answer) == str(required_answer):
            matched_weight += weight
            if reason:
                reasons.append(f"✓ {reason}")
    
    # Calculate percentage score
    score = (matched_weight / total_possible_weight) * 100
    
    return score, reasons

@app.get("/")
def root():
    return {"status": "ok", "message": "Simplify Slovakia API"}

@app.get("/flows")
def get_flows():
    """Get all available flows with metadata"""
    flows = load_all_flows()
    
    flow_list = []
    for flow in flows:
        display_info = flow.get('display_info', {})
        flow_list.append({
            "flow_id": flow.get('flow_id'),
            "title": display_info.get('title', flow.get('flow_id')),
            "category": display_info.get('category', 'General'),
            "description": display_info.get('description', ''),
            "difficulty": display_info.get('difficulty_level', 'MEDIUM'),
            "estimated_timeline": display_info.get('estimated_timeline', 'Unknown'),
            "estimated_cost": display_info.get('estimated_cost', 'Unknown'),
            "priority": display_info.get('priority', 'MEDIUM'),
            "tags": display_info.get('tags', []),
            "step_count": len(flow.get('steps', [])),
            "recommended_for": display_info.get('recommended_for', ''),
            "not_for": display_info.get('not_for', ''),
        })
    
    return {"flows": flow_list}

@app.get("/flow/{flow_id}")
def get_flow(flow_id: str):
    """Get specific flow with all steps"""
    flows = load_all_flows()
    flow = next((f for f in flows if f.get('flow_id') == flow_id), None)
    
    if not flow:
        raise HTTPException(status_code=404, detail=f"Flow {flow_id} not found")
    
    # Load step details
    steps = []
    for step_ref in flow.get('steps', []):
        step_id = step_ref.get('step_id')
        order = step_ref.get('order')
        
        step_file = STEPS_DIR / f"{step_id}.yaml"
        if step_file.exists():
            try:
                with open(step_file, 'r', encoding='utf-8') as f:
                    step_data = yaml.safe_load(f)
                    if step_data:
                        step_data['order'] = order
                        steps.append(step_data)
            except Exception as e:
                print(f"Error loading step {step_id}: {e}")
        else:
            # Step file doesn't exist - create placeholder
            steps.append({
                "step_id": step_id,
                "order": order,
                "title": f"Step {order}: {step_id}",
                "description": f"Step file {step_id}.yaml not found",
                "error": "Step file missing"
            })
    
    # Sort by order
    steps.sort(key=lambda x: x.get('order', 999))
    
    return {
        "flow": flow,
        "steps": steps
    }

@app.post("/recommend-flow-v2", response_model=FlowRecommendation)
def recommend_flow_v2(answers: IntakeAnswersV2):
    """
    Recommend best flow based on intake answers using metadata scoring.
    This is the new intelligent recommendation engine.
    """
    # Convert to dict and remove None values
    answers_dict = {k: v for k, v in answers.dict().items() if v is not None}
    
    print(f"📥 Received answers: {answers_dict}")
    
    flows = load_all_flows()
    
    if not flows:
        raise HTTPException(status_code=500, detail="No flows available")
    
    # Score each flow
    scored_flows = []
    for flow in flows:
        try:
            score, reasons = calculate_flow_match_score(flow, answers_dict)
            
            display_info = flow.get('display_info', {})
            confidence_threshold = flow.get('confidence_threshold', 70)
            
            # Determine confidence level
            if score >= 85:
                confidence = "HIGH"
            elif score >= confidence_threshold:
                confidence = "MEDIUM"
            elif score >= 30:
                confidence = "LOW"
            else:
                confidence = "NONE"
            
            scored_flows.append({
                "flow_id": flow.get('flow_id'),
                "title": display_info.get('title', flow.get('flow_id')),
                "score": score,
                "confidence": confidence,
                "reasons": reasons,
                "description": display_info.get('description', ''),
            })
            
            print(f"   {flow.get('flow_id')}: {score:.1f}% ({confidence})")
            
        except Exception as e:
            print(f"❌ Error scoring flow {flow.get('flow_id')}: {e}")
            # Don't let one bad flow crash the whole recommendation
            continue
    
    # Sort by score
    scored_flows.sort(key=lambda x: x['score'], reverse=True)
    
    if not scored_flows:
        raise HTTPException(status_code=500, detail="Could not score any flows")
    
    # Get best match
    best_match = scored_flows[0]
    
    print(f"🎯 Best match: {best_match['flow_id']} ({best_match['score']:.1f}%)")
    
    return FlowRecommendation(
        flow_id=best_match['flow_id'],
        title=best_match['title'],
        confidence=best_match['confidence'],
        score=best_match['score'],
        reason="; ".join(best_match['reasons'][:3]) if best_match['reasons'] else None
    )

# Backward compatibility endpoint
@app.post("/recommend-flow")
def recommend_flow_v1_compat(answers: dict):
    """
    Old recommendation endpoint - converts to v2 format
    """
    # Map old format to new
    v2_answers = IntakeAnswersV2(
        nationality_type=answers.get('nationality_type'),
        current_location=answers.get('current_location') or answers.get('entry_context'),
        urgency_level=answers.get('urgency_level') or answers.get('urgency'),
        visit_purpose=answers.get('visit_purpose') or answers.get('purpose'),
        visit_duration=answers.get('visit_duration'),
        years_in_slovakia=answers.get('years_in_slovakia'),
        city=answers.get('city'),
    )
    
    return recommend_flow_v2(v2_answers)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
