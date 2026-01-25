# Simplify Slovakia

**Deterministic bureaucracy navigation for foreigners moving to Slovakia.**

## What This Is

A free, open-source checklist generator that helps non-EU foreigners navigate Slovak immigration and life setup procedures. Unlike chatbots, we provide **deterministic, auditable checklists** based on explicit rules.

## Current Status

**v1.0 MVP** - Non-EU employee first entry to Bratislava (11-step checklist)

## Quick Start

### Backend (FastAPI)
```bash
cd backend
docker build -t simplify-slovakia-backend .
docker run -p 8000:8000 simplify-slovakia-backend
```

Visit: http://localhost:8000/docs

### Frontend
Coming soon (Phase 1 in progress)

## Project Structure

- `docs/` - Architecture decisions and vision
- `rules/` - Business logic (immigration rules)
- `data/` - Reference data (flows, steps, authorities)
- `backend/` - FastAPI resolver engine
- `frontend/` - React web application (in progress)
- `infra/` - AWS deployment configs
- `scripts/` - Developer automation
- `tests/` - Integration tests

## Philosophy

1. **Deterministic, not probabilistic** - Same input = same output, always
2. **Auditable** - Rules are explicit YAML files, not hidden in code
3. **Free forever** - Designed for AWS free tier
4. **No legal advice** - We show checklists, not interpretations

## Contributing

See `docs/README.md` for architecture overview.  
Contributing guide coming soon.

## License

[To be determined - suggest MIT or Apache 2.0]
