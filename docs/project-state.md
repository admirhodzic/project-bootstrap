# Project state

- **Status:** Beta published; stable-release evidence pending
- **Active change:** Project Bootstrap v2 release hardening and ecosystem validation
- **Current milestone:** M6 — ecosystem validation and stable release gates
- **Next action:** Obtain green cross-platform CI evidence for the v2 baseline, enable repository security and trusted publishing, assign an independent reviewer, and authorize repeated live pilots with platform access and spend limits.
- **Blockers:** Cross-platform CI evidence is pending, GitHub settings authority is unavailable locally, no independent reviewer is assigned, Tier 2 CLIs are unavailable, and model-backed pilot runs have no explicit spend/credential authorization.
- **Last verification:** On 2026-09-05, the pinned pnpm 10.15.1 full gate passed with 41 tests, 33 registry entries, and 15 scenarios/four fixtures; coverage passed at 82.64% statements/75.67% branches/93.75% functions/84.75% lines; npm audit reported no known vulnerabilities; the live runner passed a three-repetition credential-free fake-driver check; and the hardened candidate package excluded raw run output and passed its full lifecycle smoke. The published `2.0.0-beta.0` tarball and clean registry install were verified separately. All pinned GitHub Action SHAs matched their official tags, while the public GitHub API showed remote `main` unprotected with no workflow runs.
- **Last updated:** 2026-09-05

## Relevant references

- [Implementation plan](implementation-plan.md)
- [Backlog](backlog.md)
- [Pilot protocol](pilots.md)
- [Live runner contract](../evals/runners/README.md)
