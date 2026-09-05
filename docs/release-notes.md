# Project Bootstrap v2 release notes

Project Bootstrap v2 replaces the monolithic v1 instruction file with a concise `AGENTS.md` contract, progressively loaded skills, reusable templates, platform adapters, a conflict-safe lifecycle CLI, and deterministic behavioral evaluation.

## Installation and migration

Installations can use the npm package or copy the plain Markdown content. Existing v1 installations should follow the [v1 migration guide](https://github.com/admirhodzic/project-bootstrap/blob/main/docs/migration-v1.md); migration retains customized `AGENT.md` content for manual reconciliation and does not silently delete it.

## Compatibility

The [compatibility matrix](https://github.com/admirhodzic/project-bootstrap/blob/main/docs/compatibility.md) identifies each platform's evidence level and limitations. Tier 1 claims require dated repeated pilot evidence before the stable tag is authorized. Tier 2 capabilities remain explicitly labeled when only fixture-validated or when live smoke evidence is unavailable.

## Known limitations

- Platform behavior remains subject to the documented agent/version and host capabilities in the compatibility matrix.
- Process-level rollback cannot prevent a hostile concurrent local process from replacing a checked path between inspection and mutation.
- Optional hooks and external integrations require separate trust and permission review and are never enabled by the core installation.

See the [changelog](https://github.com/admirhodzic/project-bootstrap/blob/main/CHANGELOG.md), [security policy](https://github.com/admirhodzic/project-bootstrap/blob/main/SECURITY.md), and [release checklist](https://github.com/admirhodzic/project-bootstrap/blob/main/docs/release-checklist.md) for the complete release record.
