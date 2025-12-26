from fastapi import FastAPI
import yaml
from pathlib import Path

app = FastAPI()

BASE_DIR = Path(__file__).resolve().parent.parent
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


@app.get("/flow/{flow_id}")
def resolve_flow(flow_id: str):
    flow_file = f"{flow_id}.yaml"
    flow = load_flow(flow_file)

    resolved_steps = []
    for item in flow["steps"]:
        step_data = load_step(item["step_id"])
        step_data["order"] = item["order"]
        # DEBUG: print each step being loaded
        print(f"Loaded step: {step_data['step_id']}")
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

