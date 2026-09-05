---
name: handoff
description: Create a bounded continuation record when work is pausing, changing owners, or spanning sessions. Do not use as a duplicate activity log after every trivial change.
---

# Handoff work

Leave the next worker enough verified state to continue without replaying the entire history.

## Inputs

Current objective, active diff, repository evidence, verification output, blockers, decisions, and next action.

## Workflow

1. Inspect the current diff, active task, latest verification, and unresolved review findings.
2. Finish the current coherent step or clearly describe the partial state; do not hide broken work.
3. Update `docs/project-state.md` using `content/templates/project-state.md`.
4. Link the active spec, plan, task, ADR, issue, or pull request rather than copying them.
5. Curate a lesson only when it is reusable, non-obvious, and not better represented by a test or code comment.

## State requirements

Include objective, status, active change, blockers, next action, relevant references, working-tree caveats, and the exact verification last run. Verify stale or contradictory state against repository evidence before trusting it.

## Output

Summarize what changed, what is verified, what remains, and what the next worker should do first.

## Verification

Compare state claims with the current diff and fresh output; resolve stale placeholders and broken references.

## Stop

Stop when another contributor can resume without reconstructing recent context, or state the evidence still unavailable.
