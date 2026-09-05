---
name: review-change
description: Review a proposed change for correctness, regressions, security, and missing verification. Use for requested review or meaningful risk; do not add routine stylistic noise.
---

# Review a change

Prioritize defects that could change behavior, security, compatibility, or operability.

## Inputs

The request or specification, acceptance criteria, diff, surrounding code, and relevant verification output.

## Workflow

Apply the review order below and verify each suspected defect against repository evidence.

## Required context

- User request or specification and acceptance criteria.
- Relevant diff and surrounding code.
- Tests and verification results.
- Applicable architecture and conventions.

## Review order

1. Correctness and requirement coverage.
2. Authorization, trust boundaries, and sensitive data.
3. Regression, concurrency, failure, and compatibility paths.
4. Test quality and missing evidence.
5. Performance and operational impact.
6. Maintainability issues with concrete future cost.

## Finding format

For each finding provide severity, file and line, evidence, impact, and the smallest reasonable remediation. Use Critical, High, Medium, or Low. Do not invent findings to fill categories.

If no actionable defect remains, say so and identify any verification limitation or residual risk. When the reviewer shares the implementer's context, label the result self-review rather than independent review.

## Output

Actionable findings in the format above, followed by residual risks and verification limitations.

## Verification

Recheck locations and failure paths; avoid claims that cannot be reproduced from supplied evidence.

## Stop

Stop after the bounded diff and criteria are covered, or identify the missing evidence required to proceed.
