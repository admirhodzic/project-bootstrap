# Live runner contract

Deterministic CI validates scenario definitions and objective graders without model calls. `pnpm eval:live` invokes an explicitly selected driver without a shell, gives it the scenario prompt on standard input, and expects one observation JSON object on standard output. It runs in a disposable fixture directory and writes redacted raw records separately from JSON and Markdown reports under the ignored `evals/runs/` directory.

The observation contract is:

```json
{
  "profile": "quick",
  "events": ["inspect-diff", "verify"],
  "questions": 0,
  "artifacts": 0,
  "durationMs": 1200,
  "tokens": 500,
  "tools": 2,
  "interventions": 0,
  "costUsd": 0.02
}
```

The first four fields are required. Metrics are optional non-negative numbers. Driver adapters are responsible for translating platform-native output into objective event names; unsupported observations must remain absent rather than inferred. The reviewed `dist/agent-driver-cli.js` driver installs the selected adapter into the disposable workspace, requests a constrained structured policy observation without disclosing the scenario's expected result, disables mutation and external tools, and captures provider-reported usage where available.

`fake-driver.mjs` provides one credential-free `quick-doc-fix` observation for runner plumbing tests. It is not agent or compatibility evidence.

Example with a reviewed driver executable:

```sh
pnpm eval:live -- \
  --scenario dirty-worktree \
  --platform codex \
  --agent codex-cli \
  --agent-version 0.151.0-alpha.7.2 \
  --command path/to/reviewed-driver \
  --arg '{prompt-file}' \
  --repetitions 3 \
  --timeout-ms 300000 \
  --spend-ceiling-usd 5 \
  --credential-boundary 'Dedicated pilot account; repository read-only'
```

Arguments can use `{workspace}`, `{prompt-file}`, and `{scenario}` placeholders. No arbitrary shell expression is evaluated. Only basic process-launch environment variables are inherited; add a required variable explicitly with repeated `--allow-env NAME` options. The runner does not provide an operating-system or network sandbox, enforce provider spend, or validate a driver's event normalization. Configure those boundaries in the reviewed driver and platform account before authorizing a live run.

Live runs must define a provider-side spend ceiling, the runner timeout, the fixed concurrency of one, a credential boundary, and a repetition count. Review raw observations before copying accepted evidence into `evals/baselines/`; acceptance requires a named reviewer and rationale. Never present a single nondeterministic run as a stable conclusion.
