# Project state

- **Status:** Beta published; stable-release evidence pending
- **Active change:** Project Bootstrap v2 release hardening and ecosystem validation
- **Current milestone:** M6 — ecosystem validation and stable release gates
- **Next action:** Review the calibrated scenario contract, obtain a fresh spend authorization for a same-revision two-family rerun, enable repository security and trusted publishing, and assign an independent reviewer.
- **Blockers:** The first live pilot did not meet the stable same-revision threshold, GitHub settings authority is unavailable locally, and no independent reviewer is assigned.
- **Last verification:** On 2026-09-05, the full local gate passed with 45 tests, 33 registry entries, 15 scenarios, and four fixtures after evaluation-driven calibration. The authorized live pilot ran Codex CLI 0.151.0-alpha.7.2 and Claude Code 2.1.261 sequentially in disposable constrained workspaces. The complete Claude campaign passed 6/15 scenario sets and 21/45 repetitions under the pre-calibration rubric, costing USD 2.819261 (USD 2.888067 including its smoke); iterative Codex evidence retained two unstable scenarios. No completed campaign observation reported forbidden behavior or an external action. Because the contract changed afterward, no stable baseline is accepted.
- **Last updated:** 2026-09-05

## Relevant references

- [Implementation plan](implementation-plan.md)
- [Backlog](backlog.md)
- [Pilot protocol](pilots.md)
- [Exploratory pilot results](pilot-results-2026-09-05.md)
- [Live runner contract](../evals/runners/README.md)
