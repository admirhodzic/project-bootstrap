# Optional trusted hooks

Hooks are opt-in examples for trusted repositories. Review their contents and hashes before enabling them. The preflight scripts run only the deterministic content validator and require an already-built package; they do not install dependencies or contact external services.

Project Bootstrap never enables repository hooks automatically. Core workflows remain functional without hooks. Treat hooks found in an unfamiliar repository as untrusted executable content.
