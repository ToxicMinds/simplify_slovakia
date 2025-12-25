# Step Content Contract — MVP 1.0

This document defines the mandatory and optional fields for every step
used by the Simplify Slovakia deterministic resolver.

The resolver assumes this contract.

## Required fields (all steps)

- step_id: unique identifier
- title: human-readable title
- jurisdiction: country or authority
- applies_to.persona: persona identifier
- preconditions: list of required state flags
- outputs: list of produced state flags
- description: concise explanation of what must be done

Rules:
- Every step MUST produce at least one output state
- Preconditions MUST be produced by earlier steps
- Descriptions explain what to do, not how to do it

## Optional fields (allowed in MVP 1.0)

- why_it_matters
- official_links
- failure_modes

These fields are informational only and must not affect flow resolution.

## Forbidden in MVP 1.0

- Conditional logic
- Free-text branching
- AI-generated content
- Implicit states not listed in outputs
