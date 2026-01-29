# Data

Reference data and user journey definitions.

## Structure

- `flows/` - Complete user journeys (ordered step sequences)
- `steps/` - Atomic checklist items
- `reference/` - Static lookups (countries, visa types, authorities)

## Data vs Rules

**Data** (this folder):
- Enumerations and constants
- "List of all visa types"
- No conditional logic

**Rules** (`rules/` folder):
- Business logic
- "Which visa type applies to you"
- Conditional branching

## Adding a New Flow

1. Create YAML in `flows/`
2. Define all required steps in `steps/`
3. Reference rule conditions
4. Test with `scripts/validate_rules.py` (coming soon)
