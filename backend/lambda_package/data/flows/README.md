# Flows

A flow is a complete user journey through Slovak bureaucracy.

## Current Flows

- `sk_non_eu_employee_first_entry_bratislava_v1.yaml` - Non-EU employee moving to Bratislava

## Flow Format
```yaml
flow_id: unique_identifier
persona_id: target_user_persona
country: Slovakia
version: 1.0.0
steps:
  - step_id: reference_to_step_file
    order: 1
  - step_id: another_step
    order: 2
```

## Adding a Flow

1. Identify the persona (e.g., "EU student", "Non-EU family reunification")
2. List all required steps in order
3. Create corresponding step files in `steps/`
4. Define applicable rules in `rules/`
