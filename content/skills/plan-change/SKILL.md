---
name: plan-change
description: Design an implementation and verification approach for a non-trivial approved change. Use after requirements are sufficiently clear; do not plan ordinary one-step edits.
---

# Plan a change

Produce the smallest plan that removes meaningful implementation uncertainty.

## Inputs

Accepted requirements, current repository evidence, constraints, risks, and applicable architecture decisions.

## Workflow

1. Reconcile the requested outcome with current architecture, interfaces, data, tests, and deployment constraints.
2. Compare credible approaches when the choice is consequential; recommend one with concrete tradeoffs.
3. Define affected components, interface or schema changes, compatibility, rollout, rollback, observability, and verification.
4. Decompose work by dependency into outcome-oriented tasks with acceptance criteria and commands or evidence.
5. Record a durable ADR only for a consequential decision future maintainers would otherwise relitigate.

Use `content/templates/plan.md`, `task.md`, and `adr.md` when durable artifacts are justified.

## Boundaries

- Do not prescribe technology before inspecting the codebase.
- Do not split work solely to fit an assumed context window.
- Do not hide unresolved security, data migration, or external coordination behind an implementation task.

## Output

Return the recommended design, task dependency order, risk controls, verification strategy, and decisions that still require the user.

## Verification

Trace each task to an acceptance criterion and ensure rollout, rollback, and verification are executable.

## Stop

Stop when the plan is implementation-ready, or surface a material unresolved decision with its tradeoffs.
