---
name: implement-change
description: Implement an approved, sufficiently defined software change while preserving scope and producing verification evidence. Do not use for read-only analysis or review.
---

# Implement a change

Deliver the acceptance criteria with focused, reversible edits.

## Inputs

The request or specification, acceptance criteria, current diff, applicable instructions, and verified project commands.

## Workflow

Use the before, during, and completion stages below; keep every edit traceable to the requested outcome.

## Before editing

1. Read applicable instructions and the active task/specification.
2. Inspect current Git state and representative implementation/tests.
3. Identify the smallest coherent change and the focused verification command.
4. Confirm authority before dependencies, network, external writes, or destructive operations when required.

## While working

- Follow existing conventions and keep unrelated changes untouched.
- Add tests at the level that best detects the behavior: unit for isolated logic, integration for boundaries, and end-to-end for critical journeys.
- Run focused checks during iteration. Diagnose failures before changing multiple causes at once.
- Update durable state only when it adds information not already present in Git or the active task.

## Before completion

- Run the broader relevant checks proportional to risk.
- Inspect the final diff for accidental changes, secrets, debug output, and unresolved placeholders.
- Map evidence to each acceptance criterion.
- If verification fails or cannot run, report the work as incomplete or limited.

Do not commit, push, deploy, or change external systems unless that authority was explicitly granted.

## Output

The bounded implementation, verification evidence, changed-file summary, and explicit limitations.

## Verification

Map fresh command output and manual evidence to acceptance criteria; do not rely on stale results.

## Stop

Stop only when criteria pass, or report the exact failure, missing authority, or external dependency preventing completion.
