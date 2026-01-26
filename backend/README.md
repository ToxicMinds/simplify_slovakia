# Backend

FastAPI-based deterministic resolver engine.

## Architecture
## Running Locally

### With Virtual Environment (Development)
```bash
# From project root
source venv/bin/activate
cd backend

# Install dependencies
pip install -r requirements.txt

# Run with hot reload
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# API available at: http://localhost:8000
# Docs at: http://localhost:8000/docs
```

### With Docker (Production-like)

**IMPORTANT:** Docker must be built from **project root**, not from `backend/` directory, because the `data/` and `rules/` directories are at the root level.
```bash
# From project root (NOT from backend/)
docker build -f backend/Dockerfile -t simplify-slovakia-backend .

# Run container
docker run -p 8000:8000 simplify-slovakia-backend

# Or run in background
docker run -d -p 8000:8000 --name ss-backend simplify-slovakia-backend

# View logs
docker logs -f ss-backend

# Stop
docker stop ss-backend
docker rm ss-backend
```

## Endpoints

- `GET /health` - Health check
- `GET /resolve-flow` - Get the main non-EU employee flow (hardcoded)
- `GET /flow/{flow_id}` - Get any flow by ID

## Design Principle

> Given the same input, output must be identical. Always.

No randomness, no AI inference, no interpretation. Pure deterministic resolution.

## Project Structure
## Troubleshooting

### "FileNotFoundError: data/flows/..."

This means Docker was built from wrong directory. Always build from project root:
```bash
# Wrong (from backend/):
cd backend
docker build -t simplify-slovakia .  # ✗ Can't see ../data/

# Correct (from project root):
docker build -f backend/Dockerfile -t simplify-slovakia .  # ✓ Can see data/
```

### "ModuleNotFoundError: No module named 'fastapi'"

Activate venv and install dependencies:
```bash
source venv/bin/activate
pip install -r backend/requirements.txt
```

### API returns 500 errors

Check that data files exist:
```bash
ls data/flows/
ls data/steps/
```

Check backend logs:
```bash
# With uvicorn:
# Errors show in terminal

# With Docker:
docker logs ss-backend
```
