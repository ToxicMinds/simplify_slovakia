from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import yaml
from pathlib import Path

app = FastAPI()

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
    """Return metadata for all available flows"""
    flows = []
    
    for flow_file in FLOWS_DIR.glob("*.yaml"):
        flow_data = load_yaml(flow_file)
        flows.append({
            "flow_id": flow_data["flow_id"],
            "persona_id": flow_data["persona_id"],
            "country": flow_data["country"],
            "version": flow_data["version"],
            "step_count": len(flow_data["steps"]),
            "title": format_persona_title(flow_data["persona_id"]),
        })
    
    return {"flows": flows}


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
    flow = load_flow(f"{flow_id}.yaml")

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


@app.get("/health")
def health():
    return {"status": "ok"}