BASE_DIR = Path(__file__).resolve().parent.parent.parentBASE_DIR = Path(__file__).resolve().parent.parent.parentfrom fastapi import FastAPI
import yaml
from pathlib import Path

app = FastAPI()

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


@app.get("/resolve-flow")
def resolve_flow():
    # temporary static test for your main flow
    flow = load_flow("sk_non_eu_employee_first_entry_bratislava_v1.yaml")

    resolved_steps = []
    for item in flow["steps"]:
        step_data = load_step(item["step_id"])
        step_data["order"] = item["order"]
        resolved_steps.append(step_data)
        print(f"Loaded step: {item['step_id']}")  # debug

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
        print(f"Loaded step: {item['step_id']}")  # debug

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
