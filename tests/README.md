# Tests

Integration and validation tests.

## Structure

- `rules/` - Rule validation (YAML correctness, no conflicts)
- `integration/` - End-to-end tests (API + rule resolution)

## Philosophy

> Tests should read like real user scenarios.

**Good test:**
"Non-EU employee with signed contract, first entry to Bratislava"

**Bad test:**
"Test function XYZ returns 200"

## Running Tests
```bash
# All tests
pytest

# Specific suite
pytest tests/rules/
```
