from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, List
from pydantic import BaseModel
import yaml
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
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = BASE_DIR / "data"
FLOWS_DIR = DATA_DIR / "flows"
STEPS_DIR = DATA_DIR / "steps"

# Add after the existing models/before routes
class UserProgress(BaseModel):
    """User's progress through a flow"""
    flow_id: str
    completed_steps: List[str]

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