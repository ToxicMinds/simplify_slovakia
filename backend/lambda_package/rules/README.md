# Rules

Business logic that determines **what applies** to a given user.

## Structure

- `immigration/` - Entry, residence, visa rules
- `life_setup/` - Post-arrival procedures (health, banking, etc.)

## Rules vs Data

**Rules** (this folder):
- Conditional logic
- "If nationality=NON_EU AND purpose=EMPLOYMENT, then..."
- Determines which steps apply

**Data** (`data/` folder):
- Static lookups
- Lists of countries, visa types, authorities
- No branching logic

## Format

Rules are YAML files with:
- `when:` conditions
- `requires:` mandatory steps
- `skips:` optional steps
- `blocks:` forbidden actions

See `docs/architecture.md` for detailed specification.
