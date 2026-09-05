---
name: specify-change
description: Turn an ambiguous or substantial product change into observable requirements and acceptance criteria. Use for Standard or Deep work; skip for a clearly bounded Quick change.
---

# Specify a change

Describe what success means before choosing implementation details.

## Inputs

- User objective and affected users.
- Existing behavior and constraints discovered from the repository.
- Relevant product, design, API, or policy sources.

## Workflow

1. Separate confirmed facts, reasonable reversible assumptions, and material open decisions.
2. Ask only targeted questions whose answers change the delivered behavior or risk.
3. Define user-visible outcomes, edge cases, non-functional constraints, and non-goals.
4. Write acceptance criteria as observable examples or assertions.
5. For Deep work, include rollout, compatibility, privacy/security, and operational expectations.
6. Use `content/templates/spec.md` when a durable artifact is warranted.

## Quality bar

- Requirements say what and why; architecture belongs in the plan.
- Each acceptance criterion can be verified without interpreting vague adjectives.
- Constraints cite their source when one exists.
- Unknowns remain explicit; do not manufacture certainty.

## Output

Return an approved or review-ready specification, the remaining decisions, and the evidence that will demonstrate completion.

## Verification

Confirm every criterion is observable, every material assumption is visible, and placeholders are resolved.

## Stop

Stop when the specification can guide planning, or request only a decision whose absence materially changes the outcome.
