# Compatibility pilot protocol

Run applicable P0/P1 scenarios in an isolated disposable repository. Record platform/agent version, OS, date, scenario revision, raw observation, grader result, limitations, tools, interventions, time, and tokens when available. Repeat nondeterministic scenarios at least three times and report counts plus dispersion.

For the v2.0.0 stable-release gate, OpenAI Codex and Claude Code are the selected two supported agent families. Other adapters retain their documented or fixture-only evidence labels until a dated live run supports a stronger claim.

Use the vendor-neutral `pnpm eval:live` runner and a reviewed platform driver as described in [`evals/runners/README.md`](../evals/runners/README.md). Set an explicit provider-side spend ceiling, timeout, credential boundary, repetition count, and sandbox/network policy before execution. Review the redacted raw output and driver normalization before accepting a baseline.

Scenarios use `expectedProfile` for the preferred rigor. `acceptedProfiles` may list adjacent rigor levels only when either is proportionate and the scenario's required and forbidden behaviors—not ceremony—determine correctness. Canonical workflow-selection scenarios keep one exact profile.

The credential-free fake-driver plumbing check passed three repetitions on 2026-09-05; it is not compatibility evidence. The first authorized Codex and Claude Code pilot is recorded in [the 2026-09-05 exploratory report](pilot-results-2026-09-05.md). It produced evaluation-driven corrections but did not meet the same-revision stable threshold. Failures must produce corrections or narrower claims before stable release.
