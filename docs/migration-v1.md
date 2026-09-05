# Migrating from v1

V1 used a copied `AGENT.md` and mandatory phase-heavy workflow. V2 uses native `AGENTS.md`, optional skills, bounded state, and adaptive rigor.

1. Preserve current work using the repository's normal process.
2. Run `project-bootstrap migrate --root <project> --dry-run`.
3. Review every `CONFLICT`; customized v1 and existing platform files are never deleted.
4. Apply and merge any generated candidate manually.
5. Run `doctor` and exercise a representative task.
6. Roll back with `uninstall`; modified files remain.

Original instructions remain at `content/legacy/AGENT-v1.md`. The former README diagram included a user-corrected final-column alignment; the correction remains in Git history while v2 retires that contradictory mandatory-phase model.

For preservation, this is the corrected historical diagram (not the v2 workflow):

```text
Phase 0          Phase 1          Phase 2          Phase 3          Phase 4          Phase 5
Orientation  →  Requirements  →  Planning  →  Backlog  →  Implementation  →  Closure
   │               │               │            │              │                │
   │  Read docs,   │  Gather       │  Tech      │  Break into  │  Build, test,  │  Final review,
   │  detect env,  │  requirements,│  stack,    │  tasks &     │  commit, demo  │  deploy,
   │  resume if    │  produce      │  arch,     │  milestones  │  per milestone │  handoff
   │  continuing   │  spec.md      │  plan.md   │  backlog.md  │                │
   │               │               │            │              │                │
   └── auto ──────►└── 🚫 gate ──►└── 🚫  ────►└── 🚫 ──────►└── 🚫  ────────►└── done
```

Unknown v1 layouts are user content. Migration installs v2 alongside them and reports conflicts instead of guessing which customizations are disposable.
