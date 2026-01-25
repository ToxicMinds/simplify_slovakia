# Backend

FastAPI-based deterministic resolver engine.

## Architecture
## Running Locally
```bash
# Install dependencies
pip install -r requirements.txt

# Run with hot reload
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Running with Docker
```bash
docker build -t simplify-slovakia-backend .
docker run -p 8000:8000 simplify-slovakia-backend
```

## Endpoints

- `GET /health` - Health check
- `GET /resolve-flow` - Get the main non-EU employee flow (hardcoded)
- `GET /flow/{flow_id}` - Get any flow by ID

## Design Principle

> Given the same input, output must be identical. Always.

No randomness, no AI inference, no interpretation. Pure deterministic resolution.
