# Dependency and supply-chain decisions

Project Bootstrap has no runtime dependencies. Node built-ins cover argument parsing, hashing, path validation, and file operations, reducing install-time and transitive risk.

Before adding a production dependency, document its necessity, existing alternatives, maintenance and security posture, license compatibility, transitive impact, lockfile behavior, provenance, and replacement cost. Popularity or a recent commit alone is not sufficient evidence. Use ecosystem-appropriate compatible ranges and commit the lockfile; use exact pins when reproducibility or upstream volatility requires them.

Development dependencies provide compilation, linting, formatting, Markdown checking, unit tests, and coverage. Dependabot reviews npm and GitHub Actions updates.
