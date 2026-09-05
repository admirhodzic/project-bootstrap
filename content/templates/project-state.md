---
template: project-bootstrap/project-state
version: 2
status: { { status } }
last_updated: { { yyyy_mm_dd } }
---

# Project state

- **Objective:** {{current_objective}}
- **Active change:** {{active_change_or_none}}
- **Current status:** {{verified_status}}
- **Working-tree caveats:** {{uncommitted_or_unrelated_changes}}
- **Blockers:** {{blockers_or_none}}
- **Next action:** {{single_next_action}}
- **Last verification:** {{command_and_result}}

## References

{{links_to_active_spec_plan_task_issue_or_pr}}
