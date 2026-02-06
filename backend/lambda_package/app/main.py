from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, List
from pydantic import BaseModel
import yaml
import os
from pathlib import Path

app = FastAPI(title="Simplify Slovakia API",
    description="Deterministic bureaucracy navigation for Slovakia",
    version="1.0.0",
    contact={
        "name": "Simplify Slovakia",
        "url": "https://github.com/ToxicMinds/simplify_slovakia",
        },
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=False,  # Must be False when using "*"
    allow_methods=["*"],
    allow_headers=["*"],
)

# Detect if running in Lambda
if os.environ.get('AWS_LAMBDA_FUNCTION_NAME'):
    # In Lambda: /var/task/app/main.py -> /var/task
    BASE_DIR = Path(__file__).resolve().parent.parent
else:
    # Local: backend/app/main.py -> project root
    BASE_DIR = Path(__file__).resolve().parent.parent.parent

DATA_DIR = BASE_DIR / "data"
FLOWS_DIR = DATA_DIR / "flows"
STEPS_DIR = DATA_DIR / "steps"
RULES_DIR = BASE_DIR / "rules"

# Add after the existing models/before routes
class UserProgress(BaseModel):
    """User's progress through a flow"""
    flow_id: str
    completed_steps: List[str]


class IntakeAnswers(BaseModel):
    """User's intake questionnaire answers - maps to eligibility.yaml dimensions"""
    nationality: str      # EU or NON_EU
    entry_context: str    # FIRST_ENTRY or IN_COUNTRY
    purpose: str          # EMPLOYMENT, BUSINESS, STUDY, FAMILY
    city: str             # BRATISLAVA or OTHER


# In-memory storage (for MVP - will use localStorage in frontend)
# In production, this would be a database
user_progress_store: Dict[str, UserProgress] = {}


def load_yaml(path: Path):
    with open(path, "r") as f:
        return yaml.safe_load(f)


def load_flow(flow_file: str):
    return load_yaml(FLOWS_DIR / flow_file)


def load_step(step_id: str):
    return load_yaml(STEPS_DIR / f"{step_id}.yaml")


def load_eligibility_rules():
    """Load eligibility rules from rules/immigration/eligibility.yaml"""
    return load_yaml(RULES_DIR / "immigration" / "eligibility.yaml")


# NEW ENDPOINT: List all available flows
@app.get("/flows")
def list_flows():
    """List all available flows with metadata"""
    try:
        flows = []
        
        for flow_file in FLOWS_DIR.glob("*.yaml"):
            try:
                flow_data = load_yaml(flow_file)
                flows.append({
                    "flow_id": flow_data["flow_id"],
                    "persona_id": flow_data["persona_id"],
                    "country": flow_data["country"],
                    "version": flow_data["version"],
                    "step_count": len(flow_data["steps"]),
                    "title": format_persona_title(flow_data["persona_id"]),
                })
            except Exception as e:
                # Skip malformed flow files, log error
                print(f"Error loading {flow_file}: {e}")
                continue
        
        if not flows:
            raise HTTPException(
                status_code=500,
                detail="No valid flows found in data/flows/"
            )
        
        return {"flows": flows}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def format_persona_title(persona_id: str):
    """Convert persona_id to human-readable title"""
    # non_eu_employee_first_entry_bratislava_single -> Non-EU Employee, First Entry, Bratislava
    parts = persona_id.replace("_", " ").split()
    formatted = " ".join(word.capitalize() for word in parts)
    return formatted


# NEW ENDPOINT: Recommend flow based on intake answers
@app.post("/recommend-flow")
def recommend_flow(answers: IntakeAnswers):
    """
    Recommend a flow based on user's intake answers
    
    ROUTING LOGIC:
    - Uses eligibility.yaml rules to determine correct flow
    - Maps intake dimensions to existing flow personas
    - Returns flow_id, title, reason, confidence level
    
    EXTENSIBILITY:
    - When new flows added, update routing logic here
    - Keep logic deterministic (no ML for v1)
    """
    try:
        # Load all available flows
        flows_response = list_flows()
        available_flows = {f["flow_id"]: f for f in flows_response["flows"]}
        
        # ROUTING LOGIC - Based on eligibility.yaml dimensions
        
        # Rule 1: Non-EU + Employment + First Entry → sk_non_eu_employee_first_entry
        if (answers.nationality == "NON_EU" and 
            answers.purpose == "EMPLOYMENT" and 
            answers.entry_context == "FIRST_ENTRY"):
            
            flow_id = "sk_non_eu_employee_first_entry_bratislava_v1"
            if flow_id in available_flows:
                return {
                    "flow_id": flow_id,
                    "title": available_flows[flow_id]["title"],
                    "step_count": available_flows[flow_id]["step_count"],
                    "reason": "You need a national visa (Type D) and temporary residence permit for employment.",
                    "confidence": "high",
                }
        
        # Rule 2: EU + Employment → sk_eu_employee_first_entry
        if (answers.nationality == "EU" and 
            answers.purpose == "EMPLOYMENT"):
            
            flow_id = "sk_eu_employee_first_entry_bratislava_v1"
            if flow_id in available_flows:
                return {
                    "flow_id": flow_id,
                    "title": available_flows[flow_id]["title"],
                    "step_count": available_flows[flow_id]["step_count"],
                    "reason": "As an EU citizen, you have simplified requirements. No visa needed!",
                    "confidence": "high",
                }
        
        # Rule 3: Non-EU + Business → sk_non_eu_freelancer_setup (when available)
        if (answers.nationality == "NON_EU" and 
            answers.purpose == "BUSINESS"):
            
            flow_id = "sk_non_eu_freelancer_setup_v1"
            if flow_id in available_flows:
                return {
                    "flow_id": flow_id,
                    "title": available_flows[flow_id]["title"],
                    "step_count": available_flows[flow_id]["step_count"],
                    "reason": "You'll need a trade license (živnosť) and business residence permit.",
                    "confidence": "high",
                }
            else:
                # Fallback to closest match
                return {
                    "flow_id": "sk_non_eu_employee_first_entry_bratislava_v1",
                    "title": "Non-EU Employee (Temporary)",
                    "step_count": available_flows.get("sk_non_eu_employee_first_entry_bratislava_v1", {}).get("step_count", 0),
                    "reason": "Freelancer flow not yet available. This is the closest match.",
                    "confidence": "medium",
                }
        
        # Rule 4: Family → sk_family_reunification (when available)
        if answers.purpose == "FAMILY":
            flow_id = "sk_family_reunification_v1"
            if flow_id in available_flows:
                return {
                    "flow_id": flow_id,
                    "title": available_flows[flow_id]["title"],
                    "step_count": available_flows[flow_id]["step_count"],
                    "reason": "You'll join your family member who has residence in Slovakia.",
                    "confidence": "high",
                }
            else:
                # No exact match - let user choose manually
                return {
                    "flow_id": "",
                    "title": "No exact match found",
                    "step_count": 0,
                    "reason": "Family reunification flow not yet available. Please select manually.",
                    "confidence": "low",
                }
        
        # Fallback: Default to showing manual selector
        return {
            "flow_id": "",
            "title": "Please select manually",
            "step_count": 0,
            "reason": "We couldn't find an exact match for your situation. Please review all available flows.",
            "confidence": "low",
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/resolve-flow")
def resolve_flow():
    # Keep existing hardcoded version for backward compatibility
    flow = load_flow("sk_non_eu_employee_first_entry_bratislava_v1.yaml")

    resolved_steps = []
    for item in flow["steps"]:
        step_data = load_step(item["step_id"])
        step_data["order"] = item["order"]
        resolved_steps.append(step_data)

    return {
        "flow": {
            "flow_id": flow["flow_id"],
            "persona_id": flow["persona_id"],
            "country": flow["country"],
            "version": flow["version"],
        },
        "steps": resolved_steps,
    }


@app.get("/flow/{flow_id}")
def get_flow(flow_id: str):
    """Get a specific flow by ID with all resolved steps"""
    try:
        flow_file = f"{flow_id}.yaml"
        flow_path = FLOWS_DIR / flow_file
        
        # Check if flow exists
        if not flow_path.exists():
            raise HTTPException(
                status_code=404, 
                detail=f"Flow '{flow_id}' not found. Available flows: /flows"
            )
        
        flow = load_yaml(flow_path)
        resolved_steps = []
        
        for item in flow["steps"]:
            step_file = STEPS_DIR / f"{item['step_id']}.yaml"
            
            # Check if step file exists
            if not step_file.exists():
                raise HTTPException(
                    status_code=500,
                    detail=f"Step file '{item['step_id']}.yaml' not found"
                )
            
            step_data = load_yaml(step_file)
            step_data["order"] = item["order"]
            resolved_steps.append(step_data)
        
        return {
            "flow": {
                "flow_id": flow["flow_id"],
                "persona_id": flow["persona_id"],
                "country": flow["country"],
                "version": flow["version"],
            },
            "steps": resolved_steps,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/progress/{flow_id}")
def save_progress(flow_id: str, progress: UserProgress):
    """Save user's progress for a flow"""
    user_progress_store[flow_id] = progress
    return {"status": "saved", "flow_id": flow_id}


@app.get("/progress/{flow_id}")
def get_progress(flow_id: str):
    """Get user's saved progress for a flow"""
    if flow_id in user_progress_store:
        return user_progress_store[flow_id]
    return {"flow_id": flow_id, "completed_steps": []}
