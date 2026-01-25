# Rule Validation Tests

Ensure rules are correct, complete, and non-contradictory.

## Checks

1. **Syntax** - Valid YAML
2. **Completeness** - All required fields present
3. **References** - Step IDs exist in data/steps/
4. **Logic** - No conflicting rules
5. **Coverage** - All personas have applicable rules

## Future Contents

- `test_eligibility.py` - Immigration rules validation
- `test_preconditions.py` - Ensure precondition chains are valid
