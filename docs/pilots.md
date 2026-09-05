# Compatibility pilot protocol

Run applicable P0/P1 scenarios in an isolated disposable repository. Record platform/agent version, OS, date, scenario revision, raw observation, grader result, limitations, tools, interventions, time, and tokens when available. Repeat nondeterministic scenarios at least three times and report counts plus dispersion.

Use the vendor-neutral `pnpm eval:live` runner and a reviewed platform driver as described in [`evals/runners/README.md`](../evals/runners/README.md). Set an explicit provider-side spend ceiling, timeout, credential boundary, repetition count, and sandbox/network policy before execution. Review the redacted raw output and driver normalization before accepting a baseline.

The credential-free fake-driver plumbing check passed three repetitions on 2026-09-05; it is not compatibility evidence. No model-backed live pilots have run from this checkout. They require platform access, possible billable calls, and explicit authorization. Failures must produce corrections or narrower claims before stable release.
