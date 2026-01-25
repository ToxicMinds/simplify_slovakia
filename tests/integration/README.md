# Integration Tests

End-to-end tests of the complete system.

## Scenarios

- User selects persona → Backend returns correct flow → All steps load
- Invalid persona → Graceful error
- Missing step file → Clear error message

## Future Contents

- `test_flow_resolution.py` - Complete flow tests
- `test_api_endpoints.py` - API contract tests
