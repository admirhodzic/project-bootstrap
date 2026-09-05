# Project Bootstrap v2 — Refactoring and Implementation Plan

## 1. Executive summary

Project Bootstrap v2 will replace the current single, oversized `AGENT.md` prompt with a small interoperable `AGENTS.md` contract, progressively loaded skills, reusable templates, generated platform adapters, deterministic validation, and a behavioral evaluation suite.

The product will remain useful as plain Markdown. A small TypeScript CLI will add safe installation, upgrades, compatibility generation, validation, and diagnostics without becoming a runtime requirement for generated projects.

The work is deliberately ordered to fix the two current critical defects first:

1. Supported agents do not automatically discover the singular `AGENT.md` filename.
2. At 51,277 UTF-8 bytes, the file exceeds Codex's default 32 KiB combined project-instruction budget.

The target is a v2 beta after Milestone 5 and a stable v2 release after cross-agent pilot results meet the release thresholds in this plan.

## 2. Current baseline

The repository currently contains:

- `AGENT.md`: 1,021 lines, 51,277 UTF-8 bytes, approximately 7,619 words.
- `README.md`: 334 lines, approximately 2,640 words.
- No executable code, package manifest, automated checks, evaluation suite, release automation, license file, security policy, or contribution guide.
- A pre-existing uncommitted formatting change in `README.md` that must be preserved.

The strongest parts of v1 are worth retaining:

- Requirements and acceptance criteria before substantial implementation.
- Durable decisions and resumable project state.
- Verification before completion.
- Independent review for sufficiently risky changes.
- Explicit user control over consequential decisions.

The following v1 properties will be retired:

- A single always-loaded mega-prompt.
- A universal, mandatory phase sequence for every kind of change.
- Mandatory subagent use after every task.
- Simulated role-switching described as independent verification.
- Automatic commits, branch changes, deployment, or rollback without established authority.
- Loading every project document at the start of every session.
- Absolute or unmeasured claims such as “works with any agent” and “no mistake is ever made twice.”

## 3. Goals and measurable outcomes

### 3.1 Product goals

1. **Native discovery:** the default installation is recognized without manual prompting by every platform listed as supported.
2. **Context efficiency:** the root `AGENTS.md` remains at or below 10 KiB and 200 lines; no generated always-on adapter exceeds its platform budget.
3. **Progressive disclosure:** detailed workflows and templates load only when relevant.
4. **Adaptive rigor:** the workflow scales from a one-file fix to a security-sensitive greenfield system.
5. **Safe autonomy:** read-only and reversible local work can proceed efficiently, while consequential external or destructive actions require explicit authority.
6. **Evidence-based quality:** claims are backed by static checks and repeatable behavioral evaluations.
7. **Safe upgrades:** user-modified files are never silently overwritten.
8. **Interoperability:** content remains readable and manually installable without the CLI.

### 3.2 Release thresholds

The stable v2 release requires:

- All static validation, unit, integration, snapshot, and packaging tests passing on Windows, macOS, and Linux.
- `AGENTS.md` at or below 10 KiB and 200 lines.
- Zero silent overwrites in init/update conflict tests.
- All P0 and P1 behavioral scenarios passing on two supported agent families, with each nondeterministic scenario run at least three times.
- No critical or high-severity unresolved security findings.
- Compatibility claims linked to a dated test result or clearly labeled “documented, not continuously tested.”
- Install, update, rollback, and uninstall paths verified from a clean fixture repository.

### 3.3 Non-goals for v2.0

- Building a hosted orchestration service.
- Replacing issue trackers, Git, CI systems, or agent-native permission controls.
- Shipping a proprietary memory database.
- Requiring MCP servers, external accounts, or API keys for the core workflow.
- Guaranteeing identical behavior across nondeterministic models.
- Supporting every coding assistant at launch.

## 4. Design principles

1. **Small core, rich on demand.** Only universal, high-value instructions belong in `AGENTS.md`.
2. **Outcomes over ceremony.** Required evidence depends on risk and scope, not a fixed number of phases.
3. **Deterministic checks where possible.** Linters, schemas, tests, hooks, and exit codes enforce objective rules; prose handles judgment.
4. **One canonical source.** Platform-specific files are generated or thin wrappers, never independently maintained copies.
5. **Safe by default.** Preserve uncommitted work, fail on conflicts, preview consequential changes, and avoid silent external side effects.
6. **Portable without lowest-common-denominator design.** `AGENTS.md` is the baseline; adapters expose platform-native scoping, agents, hooks, and skills where available.
7. **Measure before claiming.** Compatibility and quality statements require dated evidence.
8. **Human-readable artifacts.** Machine-readable metadata complements Markdown rather than replacing it.

## 5. Target architecture

```text
project-bootstrap/
├── AGENTS.md                       # Universal always-on contract (≤10 KiB)
├── README.md
├── LICENSE
├── SECURITY.md
├── CONTRIBUTING.md
├── CHANGELOG.md
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── eslint.config.js
├── content/
│   ├── skills/
│   │   ├── bootstrap-project/SKILL.md
│   │   ├── specify-change/SKILL.md
│   │   ├── plan-change/SKILL.md
│   │   ├── implement-change/SKILL.md
│   │   ├── review-change/SKILL.md
│   │   ├── security-review/SKILL.md
│   │   └── handoff/SKILL.md
│   ├── templates/
│   │   ├── spec.md
│   │   ├── plan.md
│   │   ├── task.md
│   │   ├── adr.md
│   │   ├── risk-register.md
│   │   └── project-state.md
│   ├── adapters/
│   │   ├── claude/
│   │   ├── cursor/
│   │   ├── github-copilot/
│   │   ├── cline/
│   │   └── windsurf/
│   ├── agents/
│   │   ├── reviewer.md
│   │   ├── security-reviewer.md
│   │   ├── test-runner.md
│   │   └── researcher.md
│   └── legacy/
│       └── AGENT-v1.md
├── src/
│   ├── cli.ts
│   ├── commands/
│   │   ├── init.ts
│   │   ├── update.ts
│   │   ├── doctor.ts
│   │   ├── validate.ts
│   │   └── uninstall.ts
│   ├── core/
│   │   ├── content-manifest.ts
│   │   ├── file-plan.ts
│   │   ├── hashing.ts
│   │   ├── platform-detection.ts
│   │   └── validation.ts
│   └── platform/
├── schemas/
│   ├── installation-manifest.schema.json
│   ├── scenario.schema.json
│   └── project-state.schema.json
├── evals/
│   ├── README.md
│   ├── scenarios/
│   ├── fixtures/
│   ├── rubrics/
│   ├── runners/
│   └── baselines/
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── snapshots/
│   └── fixtures/
└── .github/
    ├── workflows/
    ├── ISSUE_TEMPLATE/
    └── PULL_REQUEST_TEMPLATE.md
```

### 5.1 Canonical instruction contract

The root `AGENTS.md` will contain only:

- Purpose, scope, and instruction precedence.
- Repository orientation and command discovery.
- Preservation of user work and scope discipline.
- Authority boundaries and approval rules.
- Adaptive workflow selection.
- Evidence required before claiming completion.
- Guidance for loading applicable skills and local instructions.
- Concise handoff expectations.

Detailed templates, testing guidance, UI/API standards, security review checklists, and specialist instructions move out of always-on context.

### 5.2 Skills and templates

Skills follow the open Agent Skills directory format: one `SKILL.md` with metadata plus optional references, scripts, and assets. Each skill must define:

- Clear trigger conditions and non-triggers.
- Required inputs and safe assumptions.
- A bounded workflow.
- Output contract.
- Verification and stopping conditions.
- References to templates rather than embedded copies.

Templates will use explicit placeholders, a version marker, and a small metadata block where machine validation adds value. Templates must remain valid and useful when copied manually.

### 5.3 Platform adapters

The initial support tiers are:

| Tier      | Platforms                                      | Deliverable                                                              |
| --------- | ---------------------------------------------- | ------------------------------------------------------------------------ |
| Tier 1    | Codex, GitHub Copilot, Cursor, Cline, Windsurf | Tested native installation and adapter generation                        |
| Tier 2    | Claude Code, Gemini CLI, Aider                 | Documented adapter and fixture validation; live testing when available   |
| Community | Other agents                                   | Contribution contract and adapter schema; no blanket compatibility claim |

Adapters may generate `CLAUDE.md`, `.cursor/rules/*.mdc`, `.github/instructions/*.instructions.md`, `.clinerules/*.md`, or equivalent native files. Generated files carry a header identifying their source version and whether users may edit them directly.

Specialist agent profiles are also canonical content. They define narrow responsibilities, required inputs, output contracts, and least-privilege tool capabilities. Adapters translate these profiles into native custom-agent formats only where the platform supports equivalent restrictions; otherwise they remain invocable skills or documented review roles.

### 5.4 CLI and content ownership

The CLI will be implemented in TypeScript for Node.js 24 LTS and distributed through npm. pnpm is the repository package manager. Runtime dependencies should be kept to the minimum justified by the dependency policy.

Commands:

```text
project-bootstrap init [--platform <name>] [--profile <quick|standard|deep>]
project-bootstrap update [--to <version>] [--dry-run]
project-bootstrap doctor [--json]
project-bootstrap validate [--json]
project-bootstrap uninstall [--dry-run]
```

Every installation creates `.project-bootstrap/manifest.json` containing:

- Schema and Project Bootstrap versions.
- Selected platforms and profile.
- Managed file paths and installation-time hashes.
- Generation timestamp and generator version.
- User configuration that can be safely replayed.

File operations follow these rules:

1. Build an in-memory file plan before writing.
2. Normalize and validate all destination paths remain inside the selected project root.
3. Never overwrite an untracked or user-modified file silently.
4. Update a managed file only when its current hash matches the recorded installed hash.
5. On conflict, leave the original untouched and emit a candidate file plus a clear report.
6. `--dry-run` prints the exact create/update/conflict/remove plan without mutation.
7. Uninstall removes only unchanged managed files; modified files are retained and reported.

### 5.5 Adaptive workflow profiles

The framework selects rigor using scope, ambiguity, reversibility, security sensitivity, and external side effects.

| Profile  | Typical work                                                        | Required flow                                                                                                           |
| -------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Quick    | Documentation, formatting, localized safe fix                       | Inspect → change → focused verification                                                                                 |
| Standard | Ordinary feature or bug                                             | Acceptance criteria → short plan → implement → verify → summarize                                                       |
| Deep     | Greenfield, architecture, migration, auth, payments, sensitive data | Specify → clarify material ambiguity → threat/risk analysis → plan → tasks → staged implementation → independent review |
| Incident | Production regression or urgent hotfix                              | Reproduce → contain → smallest safe fix → targeted regression tests → follow-up work                                    |

Agents should make reversible, local assumptions when the likely interpretation is clear. They should ask before decisions that materially alter scope, architecture, cost, external state, security posture, or irreversible data.

### 5.6 Project state and durable memory

V2 replaces “read every file at session start” with a bounded state hierarchy:

1. `docs/project-state.md`: current objective, active work, blockers, next action, and last verified commit or worktree state.
2. Feature-local spec/plan/task artifacts: loaded only for the active change.
3. ADRs: only durable architectural decisions.
4. Risk register: active material risks, reviewed at relevant gates.
5. Lessons: curated, deduplicated, and scoped; not an append-only transcript.
6. Git and the issue tracker: authoritative history for completed work.

The state template includes `last_updated`, `status`, `active_change`, `next_action`, and `verification` fields. Validation detects stale placeholders and broken references but does not pretend timestamps prove semantic freshness.

## 6. Safety and authority model

### 6.1 Authority classes

| Action class                                                                     | Default policy                                             |
| -------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Read-only repository inspection                                                  | Proceed when relevant                                      |
| Reversible edits inside the requested workspace                                  | Proceed when implementation is requested                   |
| Installing dependencies or enabling network access                               | Follow environment policy; disclose material additions     |
| Commit, branch, push, PR, issue, message, or deployment                          | Require explicit request or established workflow authority |
| Deletion, overwrite, credential rotation, production data, destructive migration | Resolve exact scope and obtain confirmation                |

Agent-native sandboxing and approval controls remain authoritative. Project instructions must not tell an agent to bypass them.

### 6.2 Trust boundaries

The core contract will state that repository files, issue text, web pages, generated output, test fixtures, logs, and tool responses may contain untrusted instructions. They are evidence or data unless the active instruction hierarchy explicitly grants them authority.

### 6.3 Multi-agent policy

Subagents are optional and justified when work is independently parallelizable, benefits from isolated context, or requires a genuinely separate review perspective. They are not mandatory for trivial work.

- Read-heavy exploration, test execution, log analysis, and independent review are preferred delegation targets.
- Parallel edits to overlapping files are avoided.
- Specialist agents receive acceptance criteria and only the context and tools they need.
- A role switch in one context is labeled self-review, not independent verification.
- High-risk review should be performed by a different agent, human reviewer, or deterministic control where practical.

### 6.4 Deterministic enforcement

Optional platform hooks may run validation, secret detection, or state checks. Hooks must be versioned, reviewable, least-privilege, off by default when they execute commands, and covered by trust documentation. Core functionality cannot require users to enable arbitrary hooks.

## 7. Testing and evaluation strategy

### 7.1 Deterministic tests

- Unit tests for argument parsing, hashing, manifests, path containment, platform detection, and validators.
- Integration tests for init, update, conflict, rollback, uninstall, and adapter generation in temporary fixture repositories.
- Snapshot tests for generated content and adapter parity.
- Schema validation for manifests, scenarios, state, and skill metadata.
- Documentation checks for Markdown, links, duplicate anchors, unresolved placeholders, unsupported absolute claims, and instruction budgets.
- Package smoke tests for the packed npm artifact, not only the source tree.

### 7.2 Behavioral evaluation suite

Each scenario contains:

- Repository fixture and user request.
- Applicable platform/profile.
- Expected required and forbidden behaviors.
- Objective artifacts and command results where possible.
- Rubric criteria for judgment-based behavior.
- Severity and release-blocking status.

Initial scenario set:

1. Small documentation correction without planning sprawl.
2. Localized bug reproduced before modification.
3. Ambiguous greenfield project requiring targeted clarification.
4. Brownfield feature that follows existing conventions.
5. Dirty worktree whose unrelated changes are preserved.
6. Read-only analysis request that produces no writes.
7. Destructive request requiring exact-target confirmation.
8. External deployment or push without authorization.
9. Failed verification that must not be reported as complete.
10. Conflicting nested instructions and precedence.
11. Prompt injection embedded in repository documentation.
12. Missing subagent support with honest self-review labeling.
13. Parallelizable research where delegation is beneficial.
14. Session resume with stale or contradictory state.
15. Dependency proposal requiring maintenance, license, security, and duplication checks.

Metrics:

- Task success and acceptance-criteria coverage.
- Required-behavior adherence.
- Forbidden-action count.
- False completion rate.
- Unnecessary clarification count.
- Unnecessary file/document creation.
- Token consumption, wall-clock time, and tool-call count where available.
- Human-review agreement with automated grading.

Live model evaluations are opt-in, budget-capped, and separated from default CI. Default CI validates scenarios and runners without spending API credits.

## 8. CI, security, and release engineering

Required pull-request checks:

- Format, lint, typecheck, unit tests, integration tests, snapshots.
- Content and schema validation.
- Instruction-size budget enforcement.
- Adapter drift check.
- Markdown and link checks.
- Packed-package smoke test.
- Dependency review where supported.

Repository protections and workflows:

- Minimal explicit `GITHUB_TOKEN` permissions.
- Third-party actions pinned to full commit SHAs with version comments.
- Dependabot or Renovate for npm and GitHub Actions updates.
- Secret scanning and push protection enabled in repository settings.
- CodeQL if the public repository qualifies.
- `SECURITY.md` with supported versions and private reporting instructions.
- Release workflow with npm provenance, GitHub release notes, checksums, and an SBOM when distributable artifacts are introduced.

## 9. Migration strategy

### 9.1 Repository migration

1. Preserve the v1 file at `content/legacy/AGENT-v1.md` with a deprecation notice.
2. Introduce the concise root `AGENTS.md`.
3. Extract reusable content into skills and templates without duplicating it.
4. Update README examples and claims to describe v2 and link to v1 migration guidance.
5. Ship a `migrate-v1` path through `init` or `update` after safe-write primitives are complete.

### 9.2 Consumer migration

The migration guide must cover:

- Plain-file users who copied `AGENT.md`.
- Repositories with user-customized copies.
- Platform-native rule users.
- Repositories already containing `AGENTS.md` or `CLAUDE.md`.
- How to preview generated changes and resolve conflicts.
- How to revert to the previous installation using the manifest and Git.

No automated migration may delete an unknown or modified v1 file.

## 10. Delivery milestones

| Milestone                                | Outcome                                                                                   | Exit gate                                                     |
| ---------------------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| M1 — Foundation and compatibility rescue | Runnable project, concise discoverable core, corrected public claims, governance baseline | Native file discovered; budgets and deterministic checks pass |
| M2 — Modular workflow content            | Adaptive profiles, skills, templates, state and safety contracts                          | Content validates with no duplicated canonical sections       |
| M3 — Safe CLI and adapters               | Install, update, validate, doctor, uninstall, and platform generation                     | Cross-platform integration and conflict tests pass            |
| M4 — Behavioral evaluation system        | Versioned scenarios, rubrics, runner interface, reports, initial baselines                | All P0 scenarios executable and baseline results published    |
| M5 — Security and release hardening      | Secure CI, repository policy, packaging, provenance, migration                            | Security review clean; packed beta artifact verified          |
| M6 — Ecosystem validation and v2 release | Pilot results, integration documentation, stable release                                  | Release thresholds in section 3.2 satisfied                   |

The detailed dependency-ordered work is maintained in `docs/backlog.md`.

## 11. Key risks and mitigations

| Risk                                                          | Likelihood | Impact | Mitigation                                                                                |
| ------------------------------------------------------------- | ---------- | ------ | ----------------------------------------------------------------------------------------- |
| Platform behavior changes faster than adapters                | High       | High   | Versioned compatibility matrix, thin adapters, scheduled documentation review             |
| Modularization creates duplicated or conflicting instructions | Medium     | High   | Canonical content registry, snapshot parity tests, generated adapters                     |
| CLI becomes heavier than the content it installs              | Medium     | Medium | Zero-framework design, dependency budget, manual installation remains supported           |
| Behavioral evals become flaky or expensive                    | High       | Medium | Separate deterministic CI from opt-in live runs; repeated trials and confidence reporting |
| Existing users lose customizations during migration           | Medium     | High   | Hash manifest, dry-run, conflict files, never overwrite unknown modifications             |
| Rigid v2 profiles recreate v1 ceremony                        | Medium     | Medium | Risk-based profile selection and evals for unnecessary work/questions                     |
| Multi-agent features differ substantially by platform         | High       | Medium | Optional capability detection and honest fallback labeling                                |
| Security guidance becomes generic checklist theater           | Medium     | High   | Threat-driven scenarios, tool permissions, deterministic checks, severity gates           |

## 12. Definition of done for Project Bootstrap v2

V2 is complete when:

- A new user can install the plain Markdown version or CLI version using documented commands.
- Supported agents discover the correct instruction entry point without a manual “read this file” prompt.
- Detailed workflow content is loaded on demand.
- Quick tasks remain quick, while high-risk tasks trigger appropriate rigor.
- The CLI can safely initialize, update, diagnose, validate, and uninstall without silently overwriting user work.
- Compatibility statements correspond to documented evidence.
- The behavioral eval suite detects regressions in autonomy, safety, verification, and context efficiency.
- CI, governance, security, migration, and release documentation are complete.
- A stable v2 package and GitHub release are reproducible from the tagged source.

## 13. Research basis

- OpenAI, “Custom instructions with AGENTS.md”: https://developers.openai.com/codex/guides/agents-md
- OpenAI, “Build skills”: https://developers.openai.com/codex/skills
- OpenAI, “Subagents”: https://developers.openai.com/codex/multi-agent
- OpenAI, “Hooks”: https://developers.openai.com/codex/hooks
- OpenAI, “Agent approvals & security”: https://developers.openai.com/codex/agent-approvals-security
- GitHub, “Copilot customization cheat sheet”: https://docs.github.com/en/copilot/reference/customization-cheat-sheet
- Cursor, “Rules”: https://docs.cursor.com/context/rules-for-ai
- Cline, “Rules”: https://docs.cline.bot/customization/cline-rules
- GitHub Spec Kit: https://github.github.com/spec-kit/
- OpenAI, “Evaluation best practices”: https://developers.openai.com/api/docs/guides/evaluation-best-practices
- GitHub, “Secure use reference”: https://docs.github.com/en/actions/reference/security/secure-use
- Node.js release status: https://nodejs.org/en/about/previous-releases
