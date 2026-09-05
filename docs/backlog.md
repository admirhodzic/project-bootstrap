# Project Bootstrap v2 — Implementation Backlog

## 1. Backlog conventions

### Priority

- **P0:** Release-blocking correctness, compatibility, or safety work.
- **P1:** Required for a credible v2 product.
- **P2:** Important hardening or ecosystem work that may follow the beta.

### Size

- **S:** A focused change, normally less than half a day.
- **M:** A substantial single task, normally one day.
- **L:** Multi-part work that should be implemented through its listed acceptance criteria, normally two to three days.

Sizes are planning aids, not deadlines.

### Task states

- `[ ]` Not started
- `[~]` In progress
- `[x]` Complete
- `[!]` Blocked

### Completion rule

A task is complete only when its acceptance criteria pass, relevant automated checks are green, documentation affected by the change is updated, and unrelated user changes remain untouched. Commits are made only when the user has authorized committing.

## 2. Milestone summary

| Milestone | Objective                                  | Depends on                          |
| --------- | ------------------------------------------ | ----------------------------------- |
| M1        | Foundation and compatibility rescue        | None                                |
| M2        | Modular workflow content                   | M1                                  |
| M3        | Safe CLI and platform adapters             | M1; content registry portions of M2 |
| M4        | Behavioral evaluation system               | M1; relevant M2/M3 interfaces       |
| M5        | Security, migration, and release hardening | M2–M4                               |
| M6        | Ecosystem validation and stable v2 release | M5                                  |

### Execution tracker

- **M1:** [x] M1-T1 · [x] M1-T2 · [x] M1-T3 · [x] M1-T4 · [x] M1-T5 · [x] M1-T6 · [x] M1-T7
- **M2:** [x] M2-T1 · [x] M2-T2 · [x] M2-T3 · [x] M2-T4 · [x] M2-T5 · [x] M2-T6 · [x] M2-T7 · [x] M2-T8 · [x] M2-T9 · [x] M2-T10 · [x] M2-T11 · [x] M2-T12
- **M3:** [x] M3-T1 · [x] M3-T2 · [x] M3-T3 · [x] M3-T4 · [x] M3-T5 · [~] M3-T6 · [x] M3-T7 · [x] M3-T8 · [x] M3-T9 · [x] M3-T10 · [x] M3-T11
- **M4:** [x] M4-T1 · [x] M4-T2 · [x] M4-T3 · [x] M4-T4 · [x] M4-T5 · [x] M4-T6 · [x] M4-T7 · [x] M4-T8
- **M5:** [x] M5-T1 · [\~] M5-T2 · [x] M5-T3 · [x] M5-T4 · [x] M5-T5 · [x] M5-T6 · [\~] M5-T7 · [!] M5-T8
- **M6:** [!] M6-T1 · [~] M6-T2 · [x] M6-T3 · [x] M6-T4 · [!] M6-T5 · [!] M6-T6

## 3. M1 — Foundation and compatibility rescue

### M1-T1 — Scaffold the Node.js/TypeScript project

- **Priority / size:** P0 / M
- **Dependencies:** None
- **Deliverables:** `package.json`, `pnpm-lock.yaml`, TypeScript configuration, source/test folders, `.gitignore`, `.editorconfig`, formatting and lint configuration.
- **Acceptance criteria:**
  - Node.js 24 LTS is the documented development runtime; supported engine range excludes EOL Node releases.
  - pnpm is pinned through the package manager field.
  - `pnpm build`, `pnpm typecheck`, `pnpm lint`, and `pnpm test` exist and pass on the empty scaffold.
  - The CLI package has a reserved executable name and does not publish accidentally before release configuration exists.
  - Runtime and development dependencies are documented with justification.
- **Verification:** clean install from the lockfile followed by all four commands.

### M1-T2 — Define the canonical content registry and budgets

- **Priority / size:** P0 / M
- **Dependencies:** M1-T1
- **Deliverables:** content registry module, budget configuration, validation report format.
- **Acceptance criteria:**
  - Every canonical instruction, skill, template, adapter, and legacy file has one registry entry.
  - The root instruction budget is 10 KiB and 200 lines.
  - Platform-specific limits are configuration data with source URLs and review dates.
  - Validation fails with actionable messages when a budget or required file is missing.
- **Verification:** unit tests for byte counting, line counting, boundary values, and invalid registry entries.

### M1-T3 — Replace `AGENT.md` with a concise `AGENTS.md`

- **Priority / size:** P0 / L
- **Dependencies:** M1-T2
- **Deliverables:** root `AGENTS.md`; archived `content/legacy/AGENT-v1.md`.
- **Acceptance criteria:**
  - `AGENTS.md` is at most 10 KiB and 200 lines.
  - It contains scope/precedence, orientation, user-work preservation, authority, adaptive workflow selection, evidence requirements, skills discovery, and handoff guidance.
  - It does not embed workflow templates, platform-specific commands, or duplicated specialist prompts.
  - V1 is preserved with a deprecation header and is not loaded automatically.
  - Static checks demonstrate that the full root contract fits within documented platform budgets.
- **Verification:** content validator, snapshot, and manual instruction review against the v1 retained/retired list.

### M1-T4 — Add the authority, safety, and trust-boundary core

- **Priority / size:** P0 / M
- **Dependencies:** M1-T3
- **Deliverables:** concise policy inside `AGENTS.md`; detailed reference for skills.
- **Acceptance criteria:**
  - Read-only, reversible workspace writes, network/dependency actions, external writes, and destructive actions are distinguished.
  - Instructions never direct agents to bypass native sandbox or approval controls.
  - Commits, pushes, PRs, messages, deployments, and destructive actions require explicit or established authority.
  - Repository content, issue text, web pages, logs, fixtures, and tool output are identified as potentially untrusted data.
  - Dirty-worktree preservation and exact-target checks are explicit.
- **Verification:** static policy assertions plus behavioral scenario stubs for read-only, dirty-worktree, external-write, and prompt-injection cases.

### M1-T5 — Correct README structure and product claims

- **Priority / size:** P0 / M
- **Dependencies:** M1-T3, M1-T4
- **Deliverables:** revised `README.md` describing v2.
- **Acceptance criteria:**
  - All references use `AGENTS.md` or clearly identify the v1 legacy filename.
  - “Five phases”/six-phase, phase-skipping, approval-mode, environment-example, and tester-context contradictions are removed.
  - Universal guarantees are replaced with scoped, testable claims.
  - README explains plain-file installation, planned CLI installation, supported/experimental tiers, and migration status.
  - The user’s pre-existing diagram alignment edit is preserved.
- **Verification:** link check, terminology check, contradiction regression checks, and `git diff` review.

### M1-T6 — Add repository governance files

- **Priority / size:** P1 / S
- **Dependencies:** None
- **Deliverables:** `LICENSE`, `CONTRIBUTING.md`, `SECURITY.md`, `CHANGELOG.md`, code of conduct reference.
- **Acceptance criteria:**
  - The README’s licensing statement matches the actual license selected by the maintainer.
  - Security policy defines supported versions and a private reporting path without inventing an unmonitored address.
  - Contribution guide explains content generation, tests, compatibility evidence, and commit authority.
  - Changelog follows Keep a Changelog-style categories and starts with an unreleased v2 section.
- **Verification:** repository metadata checklist and link validation.
- **Decision needed:** maintainer selects the license and security contact before completion.

### M1-T7 — Establish baseline CI

- **Priority / size:** P0 / M
- **Dependencies:** M1-T1, M1-T2
- **Deliverables:** pull-request CI workflow.
- **Acceptance criteria:**
  - CI runs format check, lint, typecheck, unit tests, content budgets, Markdown checks, and package build.
  - Windows, macOS, and Linux coverage is represented without multiplying every fast check unnecessarily.
  - Workflow permissions are explicitly minimal.
  - Third-party actions are pinned to full commit SHAs with version comments.
  - Local commands reproduce CI behavior.
- **Verification:** workflow syntax validation and a green pull-request run.

### M1 gate

- [x] Canonical `AGENTS.md` is natively discoverable and inside budget.
- [x] V1 remains accessible but is not loaded by default.
- [x] Public claims match implemented behavior.
- [ ] Baseline CI is green on all supported operating systems.

## 4. M2 — Modular workflow content

### M2-T1 — Define the Agent Skill authoring standard

- **Priority / size:** P0 / M
- **Dependencies:** M1-T2
- **Deliverables:** skill schema/conventions, author checklist, validator.
- **Acceptance criteria:**
  - Skills include valid name and description metadata, triggers, non-triggers, inputs, workflow, output, verification, and stopping conditions.
  - Descriptions are concise enough for initial skill catalogs.
  - References and templates resolve within the repository.
  - Validation catches duplicate names, broken references, missing sections, and oversized descriptions.
- **Verification:** valid and invalid fixture tests.

### M2-T2 — Implement the adaptive workflow selector

- **Priority / size:** P0 / M
- **Dependencies:** M1-T3, M1-T4
- **Deliverables:** quick, standard, deep, and incident profile definitions.
- **Acceptance criteria:**
  - Selection considers scope, ambiguity, reversibility, security, and external side effects.
  - Small or read-only tasks do not generate specs/backlogs by default.
  - Deep work produces explicit requirements, risks, architecture, and staged verification.
  - The user can explicitly request a profile, and the framework explains material escalation or de-escalation.
- **Verification:** table-driven classification tests and corresponding behavioral scenarios.

### M2-T3 — Create `bootstrap-project` skill

- **Priority / size:** P1 / M
- **Dependencies:** M2-T1, M2-T2
- **Acceptance criteria:**
  - Handles greenfield and brownfield entry separately.
  - Detects existing conventions and user-provided assets without loading unrelated content.
  - Produces only artifacts justified by the selected profile.
  - Does not initialize Git, add dependencies, or overwrite files without applicable authority.
- **Verification:** greenfield, brownfield, and existing-file fixtures.

### M2-T4 — Create `specify-change` skill and specification template

- **Priority / size:** P1 / M
- **Dependencies:** M2-T1, M2-T2
- **Acceptance criteria:**
  - Specification separates problem, users, outcomes, functional behavior, non-functional constraints, acceptance criteria, non-goals, assumptions, and open decisions.
  - Clarification is limited to material ambiguity.
  - Acceptance criteria are observable and implementation-agnostic where appropriate.
  - MoSCoW is optional rather than mandatory.
- **Verification:** schema/placeholder tests and representative filled example.

### M2-T5 — Create `plan-change` skill and plan/task templates

- **Priority / size:** P1 / M
- **Dependencies:** M2-T1, M2-T4
- **Acceptance criteria:**
  - Plan covers current state, proposed design, affected interfaces/data, alternatives, risks, rollout, rollback, and verification.
  - Task template includes objective, scope, non-goals, dependencies, acceptance criteria, and verification.
  - Tasks are independently verifiable but not tied to arbitrary session length.
  - Architecture decisions use ADRs only when durable and consequential.
- **Verification:** template validation and a feature decomposition fixture.

### M2-T6 — Create `implement-change` skill

- **Priority / size:** P1 / M
- **Dependencies:** M2-T5
- **Acceptance criteria:**
  - Starts from acceptance criteria and the current diff/state.
  - Preserves unrelated changes and avoids unsolicited refactors.
  - Uses focused checks during iteration and broader checks before handoff based on risk.
  - Never marks incomplete or failing work complete.
  - Treats commits and external actions according to the authority model.
- **Verification:** behavioral scenarios for dirty worktree, failing tests, and scope control.

### M2-T7 — Create `review-change` skill and restricted reviewer profile

- **Priority / size:** P1 / M
- **Dependencies:** M2-T1, M2-T6
- **Acceptance criteria:**
  - Review prioritizes correctness, security, regressions, and missing tests over style commentary.
  - Findings include severity, evidence, location, impact, and remediation.
  - Reviewer context includes the request/spec, acceptance criteria, diff, and relevant tests.
  - Platform adapters restrict reviewer write tools where supported.
  - Self-review is labeled honestly when independent review is unavailable.
- **Verification:** seeded-defect fixture with expected finding coverage and false-positive limit.

### M2-T8 — Create `security-review` skill and threat template

- **Priority / size:** P0 / L
- **Dependencies:** M1-T4, M2-T1
- **Acceptance criteria:**
  - Review is threat-driven and covers authorization, data flow, injection, secrets, dependencies, logging, network, file operations, and deployment exposure as applicable.
  - Critical/high findings block completion; accepted risk requires an owner and rationale.
  - Guidance distinguishes source review, dependency scanning, dynamic verification, and infrastructure review.
  - Agent-specific prompt-injection and excessive-agency risks are included.
- **Verification:** vulnerable fixture scenarios and severity calibration tests.

### M2-T9 — Create `handoff` skill and bounded project-state template

- **Priority / size:** P1 / M
- **Dependencies:** M2-T1
- **Acceptance criteria:**
  - State captures objective, active change, current status, blockers, next action, relevant references, and last verification.
  - It does not duplicate full history available in Git or issue trackers.
  - Lessons are curated and scoped rather than appended after every failed attempt.
  - Stale placeholders and broken references are detectable.
- **Verification:** resume scenarios with fresh, stale, and contradictory state.

### M2-T10 — Add dependency and supply-chain decision guidance

- **Priority / size:** P1 / M
- **Dependencies:** M2-T1, M2-T8
- **Acceptance criteria:**
  - Guidance covers necessity, existing alternatives, maintenance, license, vulnerabilities, transitive impact, lockfiles, provenance, and replacement/removal cost.
  - It avoids hard-coded popularity or “last commit within six months” gates as sole decision criteria.
  - Exact version, compatible range, and lockfile policies are ecosystem-aware.
  - New production dependencies require an explicit documented rationale.
- **Verification:** dependency proposal scenarios for maintained, abandoned, duplicate, and incompatible-license packages.

### M2-T11 — Remove canonical duplication and validate cross-references

- **Priority / size:** P0 / M
- **Dependencies:** M2-T3 through M2-T10
- **Acceptance criteria:**
  - Each policy or template has one canonical owner.
  - `AGENTS.md`, skills, templates, README, and adapters reference rather than copy long sections.
  - A drift check detects forbidden duplicate canonical blocks.
  - All internal links and template references resolve.
- **Verification:** duplication detector, link checker, and snapshot review.

### M2-T12 — Define least-privilege specialist agent profiles

- **Priority / size:** P1 / M
- **Dependencies:** M2-T1, M2-T7, M2-T8
- **Deliverables:** canonical reviewer, security reviewer, test runner, and researcher profiles.
- **Acceptance criteria:**
  - Every profile defines triggers, non-triggers, required inputs, permitted outputs, stopping conditions, and tool capabilities.
  - Reviewer and security reviewer are read-only by default; the test runner may execute documented checks but not modify implementation files; the researcher cannot mutate repository or external state.
  - Profiles receive the request/spec and acceptance criteria needed to evaluate behavior rather than only the implementation.
  - Platforms without native tool restrictions degrade to skills with an explicit limitation, not a claim of equivalent isolation.
  - Profile definitions are canonical and adapter output is generated from them.
- **Verification:** schema/static capability tests and seeded delegation scenarios.

### M2 gate

- [x] All seven skills validate and load independently.
- [x] Adaptive profiles cover quick, standard, deep, and incident work.
- [x] Safety, review, state, dependency, and verification guidance have one canonical source.
- [x] Specialist profiles use least-privilege capabilities and honest fallbacks.
- [x] No skill requires the CLI to remain usable.

## 5. M3 — Safe CLI and platform adapters

### M3-T1 — Implement CLI shell and structured output

- **Priority / size:** P0 / M
- **Dependencies:** M1-T1
- **Acceptance criteria:**
  - Help, version, exit codes, errors, `--json`, and `--dry-run` conventions are consistent.
  - Argument parsing uses Node built-ins unless a dependency is justified.
  - Expected user errors do not emit stack traces by default.
  - Commands are testable without spawning uncontrolled subprocesses.
- **Verification:** CLI contract and exit-code tests.

### M3-T2 — Implement safe file planning and path containment

- **Priority / size:** P0 / L
- **Dependencies:** M3-T1
- **Acceptance criteria:**
  - All mutations originate from an inspectable in-memory plan.
  - Resolved targets cannot escape the selected project root through `..`, symlinks, junctions, absolute paths, or case differences.
  - Create, update, conflict, retain, and remove operations are explicit.
  - Failed plans cause no partial writes.
- **Verification:** Windows and POSIX path, symlink/junction, traversal, and interruption tests.

### M3-T3 — Implement installation manifest and hashing

- **Priority / size:** P0 / M
- **Dependencies:** M3-T2
- **Acceptance criteria:**
  - Manifest conforms to a versioned JSON schema.
  - Managed files store normalized paths and cryptographic hashes.
  - Unknown schema versions fail safely with migration guidance.
  - Hashing is stable across supported operating systems and line-ending policies.
- **Verification:** schema, round-trip, corruption, and line-ending tests.

### M3-T4 — Implement `init`

- **Priority / size:** P0 / L
- **Dependencies:** M2-T3 through M2-T10, M3-T2, M3-T3
- **Acceptance criteria:**
  - Supports manual platform/profile selection and safe capability detection.
  - Writes only new or explicitly mergeable managed files.
  - Existing `AGENTS.md`, `CLAUDE.md`, and platform rules produce a conflict plan rather than an overwrite.
  - Dry-run output matches the eventual applied plan.
  - Partial failure rolls back files created during that invocation.
- **Verification:** clean, existing-content, dirty-repository, dry-run, and injected-failure fixtures.

### M3-T5 — Generate Tier 1 platform adapters

- **Priority / size:** P0 / L
- **Dependencies:** M2-T11, M2-T12, M3-T4
- **Acceptance criteria:**
  - Codex, GitHub Copilot, Cursor, Cline, and Windsurf outputs use documented native locations and scoping.
  - Adapters are generated from canonical content and contain provenance headers.
  - Native custom-agent profiles and tool restrictions are generated where supported.
  - Unsupported capabilities degrade explicitly rather than being silently simulated.
  - Adapter output remains within each documented budget.
- **Verification:** snapshots, budget checks, path-scope fixtures, and dated compatibility matrix entries.

### M3-T6 — Generate Tier 2 adapters

- **Priority / size:** P1 / L
- **Dependencies:** M3-T5
- **Acceptance criteria:**
  - Claude Code, Gemini CLI, and Aider adapters are documented and generated.
  - Thin-wrapper/import behavior is used only where officially supported.
  - Untested live behavior is labeled separately from fixture validation.
- **Verification:** fixture validation and available live smoke tests.
- **Current evidence:** Official Claude Code, Gemini CLI, and Aider documentation was rechecked on 2026-09-05 and fixtures validate; their CLIs are unavailable in this environment, so live smoke tests remain open.

### M3-T7 — Implement `validate`

- **Priority / size:** P0 / M
- **Dependencies:** M1-T2, M2-T11, M3-T3
- **Acceptance criteria:**
  - Validates content registry, budgets, schemas, skill metadata, links, placeholders, generated drift, and manifest integrity.
  - Human and JSON reports identify file, rule, severity, and remediation.
  - Exit codes distinguish clean, warnings-only, validation failure, and tool failure.
- **Verification:** golden diagnostic fixtures.

### M3-T8 — Implement `doctor`

- **Priority / size:** P1 / M
- **Dependencies:** M3-T7
- **Acceptance criteria:**
  - Reports runtime, package version, project root, detected platforms, installation version, modified managed files, conflicts, and recommended commands.
  - Never prints secret values or arbitrary file contents.
  - Works before installation and in a partially corrupted installation.
- **Verification:** clean, absent, modified, and corrupt installation fixtures.

### M3-T9 — Implement conflict-safe `update`

- **Priority / size:** P0 / L
- **Dependencies:** M3-T3, M3-T4, M3-T7
- **Acceptance criteria:**
  - Unchanged managed files update automatically after preview.
  - User-modified files remain untouched and receive candidate output plus resolution instructions.
  - Manifest changes are committed atomically only after successful file updates.
  - Upgrade paths are versioned and tested from the oldest supported v2 manifest.
  - Dry-run has no filesystem side effects.
- **Verification:** same-version, forward-version, modified-file, removed-file, corrupt-manifest, and rollback tests.

### M3-T10 — Implement safe `uninstall`

- **Priority / size:** P1 / M
- **Dependencies:** M3-T3, M3-T9
- **Acceptance criteria:**
  - Removes only unchanged managed files and empty managed directories.
  - Modified and unknown files are retained and reported.
  - Dry-run accurately predicts removal.
  - Manifest removal occurs only when all removable operations succeed; retained conflicts are recorded.
- **Verification:** clean and modified installation fixtures on all supported operating systems.

### M3-T11 — Package and smoke-test the CLI

- **Priority / size:** P1 / M
- **Dependencies:** M3-T4 through M3-T10
- **Acceptance criteria:**
  - Packed npm artifact contains only required runtime files, content, schemas, license, and documentation.
  - Executable works after installation into a clean temporary project.
  - Package metadata, files allowlist, engines, repository, license, and provenance settings are correct.
  - Package size is measured and budgeted.
- **Verification:** `pnpm pack` followed by install and command smoke tests from the tarball.

### M3 gate

- [ ] Init, update, doctor, validate, and uninstall pass cross-platform integration tests.
- [x] No conflict test silently overwrites or deletes user content.
- [x] Tier 1 adapters are generated from canonical content and inside budget.
- [x] Packed artifact works independently of the source checkout.

## 6. M4 — Behavioral evaluation system

### M4-T1 — Define scenario schema and grading rubric

- **Priority / size:** P0 / M
- **Dependencies:** M1-T4, M2-T2
- **Acceptance criteria:**
  - Schema supports fixtures, prompts, profiles, required/forbidden behavior, objective checks, rubric checks, severity, and repetitions.
  - Rubrics use observable evidence and avoid vague “good quality” labels.
  - P0 safety failures cannot be averaged away by style scores.
- **Verification:** schema fixtures and grader calibration examples.

### M4-T2 — Implement deterministic evaluation runner

- **Priority / size:** P0 / L
- **Dependencies:** M4-T1, M3-T7
- **Acceptance criteria:**
  - Runner can prepare isolated fixture repositories, execute objective graders, and emit JSON plus Markdown reports.
  - It records framework version, adapter, scenario version, environment, and timestamps.
  - It does not require API credentials for default CI.
  - Failed cleanup does not delete paths outside runner-owned temporary directories.
- **Verification:** runner self-tests including interrupted and malicious-path fixtures.

### M4-T3 — Define vendor-neutral live-runner interface

- **Priority / size:** P1 / M
- **Dependencies:** M4-T2
- **Acceptance criteria:**
  - Adapter contract supports agent command, version capture, timeout, budget, output artifacts, and redaction.
  - Secrets are passed through environment-specific mechanisms and never written to reports.
  - Live runners are opt-in and disabled in pull requests from forks.
- **Verification:** fake-agent runner and redaction tests.

### M4-T4 — Add P0 safety and preservation scenarios

- **Priority / size:** P0 / L
- **Dependencies:** M4-T2
- **Scenarios:** read-only/no-write, dirty worktree, destructive exact-target approval, unauthorized push/deploy, prompt injection, failed-verification honesty.
- **Acceptance criteria:**
  - Every scenario has objective forbidden-action checks.
  - Fixtures include unrelated user changes and adversarial instruction text.
  - Any forbidden destructive/external action is a release-blocking failure.
- **Verification:** scenarios fail against intentionally unsafe stub behavior and pass against expected fixtures.

### M4-T5 — Add workflow calibration scenarios

- **Priority / size:** P1 / L
- **Dependencies:** M4-T2, M2-T2
- **Scenarios:** quick documentation fix, localized bug, ambiguous greenfield build, brownfield feature, dependency proposal, parallel research.
- **Acceptance criteria:**
  - Tests detect both insufficient rigor and unnecessary ceremony.
  - Clarification count, generated artifact count, and completion evidence are recorded.
  - Profile escalation is scored based on stated risk factors.
- **Verification:** baseline dry runs and rubric review.

### M4-T6 — Add instruction, delegation, and continuity scenarios

- **Priority / size:** P1 / L
- **Dependencies:** M4-T2, M2-T7, M2-T9
- **Scenarios:** nested precedence, missing subagents, useful delegation, stale state, contradictory state.
- **Acceptance criteria:**
  - Tests distinguish independent review from self-review.
  - Parallel delegation is rewarded only for independent work.
  - Stale state is verified against repository evidence before resumption.
- **Verification:** seeded fixtures with expected pass/fail outcomes.

### M4-T7 — Add report comparison and baseline management

- **Priority / size:** P1 / M
- **Dependencies:** M4-T3 through M4-T6
- **Acceptance criteria:**
  - Reports compare framework versions, agents, scenario revisions, success, safety failures, tokens, time, tools, and interventions when available.
  - Repeated runs include counts and dispersion rather than presenting one run as deterministic truth.
  - Baseline acceptance requires a documented reviewer and rationale.
- **Verification:** comparison snapshots and incompatible-baseline tests.

### M4-T8 — Integrate deterministic eval checks into CI

- **Priority / size:** P0 / M
- **Dependencies:** M4-T2, M4-T4
- **Acceptance criteria:**
  - Pull requests validate scenario schemas, fixtures, runners, objective graders, and stored baseline format.
  - CI never performs billable model calls by default.
  - Scheduled/manual live workflow has concurrency, timeout, and spend safeguards where the provider supports them.
- **Verification:** pull-request and manually dispatched workflow runs.

### M4 gate

- [x] All 15 initial scenarios are valid and executable.
- [x] P0 objective graders demonstrably catch unsafe stub behavior.
- [x] Default CI is credential-free and non-billable.
- [x] Reports support repeated-run and version comparisons.

## 7. M5 — Security, migration, and release hardening

### M5-T1 — Threat-model the CLI and generated workflows

- **Priority / size:** P0 / L
- **Dependencies:** M3, M4-T4
- **Acceptance criteria:**
  - Threat model covers path traversal, symlink/junction attacks, template injection, malicious repositories, manifest tampering, dependency compromise, hook execution, credential leakage, and CI privilege.
  - Each high-risk threat maps to a control and a test or accepted-risk record.
  - Trust boundaries and residual risks are documented.
- **Verification:** security-review skill plus human review of critical controls.

### M5-T2 — Harden dependencies and repository security

- **Priority / size:** P0 / M
- **Dependencies:** M1-T7, M5-T1
- **Acceptance criteria:**
  - Dependabot/Renovate covers npm and GitHub Actions.
  - Dependency review, secret scanning, push protection, and CodeQL are enabled where available.
  - Lockfile is committed and reproducible-install checks pass.
  - Workflow permissions are least-privilege and actions are full-SHA pinned.
- **Verification:** repository settings checklist, dependency review test PR, and workflow audit.
- **Current evidence:** Repository configuration exists locally, npm audit reports no known vulnerabilities, and all pinned Action SHAs match official upstream tags as of 2026-09-05. Remote `main` is unprotected with no workflow runs, so maintainer-controlled settings and clean-checkout CI remain open.

### M5-T3 — Add optional trusted hooks pack

- **Priority / size:** P2 / L
- **Dependencies:** M2-T8, M3-T5, M5-T1
- **Acceptance criteria:**
  - Hooks cover high-value deterministic checks such as validation or secret-pattern blocking.
  - Command-executing hooks are opt-in, hash-reviewable, least-privilege, and documented per platform.
  - Core behavior remains functional without hooks.
  - Untrusted project hooks are never silently enabled.
- **Verification:** hook fixtures, trust-flow documentation review, and supported-platform smoke tests.

### M5-T4 — Add optional MCP/integration guidance

- **Priority / size:** P2 / M
- **Dependencies:** M1-T4, M2-T3
- **Acceptance criteria:**
  - Documents optional use of issue trackers, design systems, documentation, browsers, and deployment tools through MCP/connectors.
  - Core installation includes no credentials or enabled remote servers.
  - Tool permissions, data sensitivity, prompt injection, rate limits, and destructive annotations are addressed.
  - Missing integrations degrade to manual workflows.
- **Verification:** configuration examples pass schema/static checks and contain no secrets.

### M5-T5 — Implement v1 migration workflow

- **Priority / size:** P0 / L
- **Dependencies:** M3-T9, M3-T10
- **Acceptance criteria:**
  - Detects common copied and customized v1 layouts.
  - Dry-run reports retained customizations, generated v2 files, and unresolved conflicts.
  - Unknown or modified v1 content is never deleted.
  - Migration and rollback instructions work without assuming a clean Git repository.
- **Verification:** pristine v1, customized v1, existing `AGENTS.md`, and non-Git fixture tests.

### M5-T6 — Complete user and maintainer documentation

- **Priority / size:** P1 / L
- **Dependencies:** M3, M4, M5-T5
- **Acceptance criteria:**
  - Quick start covers manual and CLI installation.
  - Guides cover profiles, skills, adapters, safe updates, conflict resolution, evals, security, migration, uninstall, and contributing an adapter.
  - Examples include greenfield, brownfield, quick fix, and deep/security-sensitive flows.
  - Compatibility matrix distinguishes official documentation, fixture validation, and live test evidence with dates.
- **Verification:** fresh-user walkthrough and documentation/link checks.

### M5-T7 — Configure beta release pipeline

- **Priority / size:** P0 / L
- **Dependencies:** M3-T11, M4-T8, M5-T2, M5-T6
- **Acceptance criteria:**
  - Tag-driven workflow builds from a clean checkout, runs all release checks, packs once, and publishes the verified artifact.
  - npm provenance is enabled and release permissions use trusted publishing/OIDC where supported.
  - GitHub release includes notes, checksums, compatibility status, migration notes, and known limitations.
  - SBOM is generated when distributable artifacts/dependencies warrant it.
  - A release cannot publish from an unreviewed fork or pull request.
- **Verification:** non-publishing rehearsal followed by a beta tag after maintainer approval.
- **Current evidence:** `2.0.0-beta.0` was published directly to npm on 2026-09-05 and passed post-publication smoke checks. The local workflow now verifies tag/version agreement, prerelease dist-tags, cross-platform packed artifacts, registry propagation, and curated notes. Because the beta had no provenance, tag, GitHub release, or workflow run, the pipeline acceptance criteria remain open.

### M5-T8 — Conduct beta security and code review

- **Priority / size:** P0 / M
- **Dependencies:** M5-T1 through M5-T7
- **Acceptance criteria:**
  - Independent review covers CLI mutations, path containment, manifest trust, CI, packaging, hooks, and migration.
  - Critical/high findings are resolved and retested.
  - Medium/low findings are fixed or recorded with owner and target release.
- **Verification:** signed-off review artifact linked from the beta release checklist.

### M5 gate

- [x] Threat model controls map to passing tests.
- [ ] V1 migration preserves customized files.
- [ ] Security and dependency protections are enabled.
- [x] Beta artifact is reproducible and installable from the packed package.
- [ ] No unresolved critical/high findings remain.

## 8. M6 — Ecosystem validation and stable v2 release

### M6-T1 — Run Tier 1 compatibility pilot

- **Priority / size:** P0 / L
- **Dependencies:** M5
- **Acceptance criteria:**
  - Codex, GitHub Copilot, Cursor, Cline, and Windsurf each run the applicable P0/P1 scenario subset.
  - Each nondeterministic scenario is repeated at least three times.
  - Agent/version, platform, date, result, limitations, and evidence are recorded.
  - Failures produce issues or corrected compatibility claims.
- **Verification:** published pilot report and baseline artifacts.
- **Current evidence:** The vendor-neutral live runner passes a three-repetition credential-free fake-driver test with bounded execution and redacted reports. No model-backed Tier 1 pilot has been authorized or run.

### M6-T2 — Validate Tier 2 adapters

- **Priority / size:** P1 / L
- **Dependencies:** M5, access to platforms
- **Acceptance criteria:**
  - Claude Code, Gemini CLI, and Aider adapters pass fixture checks.
  - Available platforms receive live smoke tests.
  - Unsupported or untested capabilities are plainly labeled.
- **Verification:** dated compatibility matrix updates.

### M6-T3 — Build Spec Kit interoperability path

- **Priority / size:** P2 / L
- **Dependencies:** M2, M3
- **Acceptance criteria:**
  - Decide and document whether Project Bootstrap ships as a Spec Kit extension/preset, an import/export bridge, or a coexistence guide.
  - Avoid duplicating conflicting project state or generated instructions.
  - Demonstrate one end-to-end interoperable fixture.
- **Verification:** architecture decision record and fixture walkthrough.

### M6-T4 — Publish adapter contribution contract

- **Priority / size:** P1 / M
- **Dependencies:** M3-T5, M5-T6
- **Acceptance criteria:**
  - Defines adapter metadata, generated paths, budgets, feature flags, tests, documentation evidence, and maintenance ownership.
  - Community adapters cannot silently promote themselves to tested support.
  - Includes a minimal example adapter and CI fixture.
- **Verification:** create an example adapter from the guide without undocumented steps.

### M6-T5 — Tune content from evaluation results

- **Priority / size:** P0 / L
- **Dependencies:** M6-T1, M6-T2
- **Acceptance criteria:**
  - Address false completions, unsafe actions, excessive questions, unnecessary ceremony, and context cost found in pilots.
  - Rerun affected scenarios and compare against beta baselines.
  - Content changes include rationale and do not exceed budgets.
- **Verification:** comparison report showing no P0 regression and documented P1 tradeoffs.

### M6-T6 — Release Project Bootstrap v2.0.0

- **Priority / size:** P0 / M
- **Dependencies:** M6-T1, M6-T4, M6-T5; M6-T2 may remain documented Tier 2 work if accurately labeled
- **Acceptance criteria:**
  - Every stable-release threshold in `docs/implementation-plan.md` section 3.2 is satisfied.
  - Changelog, migration guide, compatibility matrix, package metadata, and documentation match the tag.
  - GitHub and npm artifacts come from the approved release workflow.
  - Post-publish installation, validation, update, and uninstall smoke tests pass.
- **Verification:** signed release checklist and published artifacts.

### M6 gate

- [ ] Tier 1 compatibility evidence is current and repeatable.
- [ ] Evaluation-driven fixes meet the stable thresholds.
- [x] Community adapter process is documented and tested.
- [ ] v2.0.0 package and GitHub release pass post-publish smoke tests.

## 9. Recommended execution order

Local implementation has progressed through M6, and the npm scope was confirmed by publishing `2.0.0-beta.0`. The next work is external validation in this order: reconcile release metadata, activate repository security settings and trusted publishing, identify stable-release ownership, obtain independent security/code review, run repeated Tier 1 pilots, tune from those observations, rehearse the release, then obtain explicit tag and stable-publication approval.

## 10. Decisions required from the maintainer

Apache-2.0 and GitHub private vulnerability reporting are selected locally. npm scope ownership is confirmed by the public beta. The remaining decisions require maintainer or account authority:

1. **Repository security settings:** enable and verify the controls in `docs/repository-security.md`.
2. **Tier 1 access and spend:** authorize the platforms and any billable calls used by repeated live pilots.
3. **Independent reviewer:** assign a reviewer for the beta security/code audit.
4. **Release ownership:** identify who may approve the protected environment, tag, npm publication, and GitHub release.
