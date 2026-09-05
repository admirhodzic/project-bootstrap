# Changelog

All notable changes to Project Bootstrap are documented here.

## [Unreleased]

### Changed

- Hardened CI and release automation with cross-platform packed-artifact smoke tests, tag/package-version validation, prerelease dist-tag selection, registry post-publish verification, and curated release notes.
- Added the missing vendor-neutral live evaluation runner with isolated fixture directories, bounded execution, explicit environment allowlisting, redacted raw output, and JSON/Markdown reports.

### Security

- Narrowed the npm evaluation-asset allowlist and added a package smoke assertion so ignored raw live-run output cannot be published.

## [2.0.0-beta.0] - 2026-09-05

Published to npm under `@admirhodzic/project-bootstrap`. This beta was published directly without provenance; a matching Git tag and GitHub release were not created.

### Added

- Concise `AGENTS.md`, seven focused skills, six artifact templates, and four least-privilege specialist profiles.
- TypeScript CLI with `init`, `migrate`, `validate`, `doctor`, `update`, and `uninstall`, structured output, dry-run plans, hash manifests, atomic writes, conflict candidates, path containment, and rollback.
- Tier 1 and Tier 2 platform adapters, including native Codex and Copilot specialist definitions.
- Fifteen behavioral scenarios, safe/unsafe fixtures, objective graders, repeated-run summaries, and credential-free CI evaluation.
- Multi-OS CI, dependency review, CodeQL, Dependabot, CODEOWNERS, release workflow, governance documents, threat model, migration guide, and packed-artifact smoke test.

### Changed

- Replaced the monolithic mandatory-phase workflow with adaptive Quick, Standard, Deep, and Incident profiles.
- Moved release metadata to `@admirhodzic/project-bootstrap` because the unscoped npm name is occupied.
- Expanded the README into the primary installation, CLI, workflow, adapter, safety, evaluation, development, release, and troubleshooting guide.

### Deprecated

- The singular `AGENT.md` v1 entry point.

### Security

- Unknown or modified files are never silently overwritten or removed; managed ownership is cryptographically tracked.
- Destination checks reject traversal, absolute paths, and symlink/junction escapes.

[Unreleased]: https://github.com/admirhodzic/project-bootstrap/compare/v1...HEAD
[2.0.0-beta.0]: https://www.npmjs.com/package/@admirhodzic/project-bootstrap/v/2.0.0-beta.0
