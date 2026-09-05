# Project Bootstrap

Portable, testable workflows for safer AI-assisted software delivery.

Project Bootstrap gives a repository a concise AI-agent contract, focused workflow skills, reusable planning templates, platform-native adapters, and a conflict-safe lifecycle CLI. It is designed for both greenfield and existing codebases and scales its process to the work: a documentation correction stays lightweight, while architecture, migrations, and security-sensitive changes receive deeper planning and review.

> **Release status:** v2.0.0-beta.0 was published to npm on 2026-09-05 and has passed a clean registry-install smoke test. It was published directly without provenance; live platform pilots and the workflow-produced stable release are still pending.

## Why use it?

Coding agents are most useful when they understand project conventions, preserve existing work, know their authority boundaries, and attach evidence to completion claims. Project Bootstrap makes those expectations portable without forcing every task through the same heavyweight process.

It provides:

- a small, always-on `AGENTS.md` contract;
- seven progressively loaded Agent Skills;
- Quick, Standard, Deep, and Incident workflow profiles;
- specification, plan, task, ADR, risk, and handoff templates;
- least-privilege reviewer, security reviewer, test runner, and researcher profiles;
- adapters for Codex, GitHub Copilot, Cursor, Cline, Windsurf, Claude Code, Gemini CLI, and Aider;
- safe installation, update, drift detection, migration, and uninstall behavior;
- deterministic behavioral evaluations that make safety and workflow claims testable.

Project Bootstrap does not initialize Git, commit changes, enable hooks, configure credentials, connect remote tools, deploy software, or publish releases on a user's behalf.

## Requirements

- Node.js 22 LTS or 24 LTS
- pnpm 10.15.1 for development from source
- A target repository whose files you are authorized to modify

The CLI has no production dependencies. pnpm is needed only to build and develop this repository; an installed package exposes the `project-bootstrap` executable through Node.js.

## Quick start

### Option 1: Use the CLI from this checkout

```sh
git clone https://github.com/admirhodzic/project-bootstrap.git
cd project-bootstrap
corepack enable
pnpm install --frozen-lockfile
pnpm build
```

Preview installation into another project:

```sh
node dist/cli.js init --root ../your-project --platform codex --dry-run
```

Apply the reviewed plan:

```sh
node dist/cli.js init --root ../your-project --platform codex
```

Use an explicit comma-separated list when a repository is used with several assistants:

```sh
node dist/cli.js init --root ../your-project --platform codex,copilot,cursor
```

### Option 2: Install plain files manually

The framework remains useful without the CLI.

1. Copy this repository's `AGENTS.md` to the target repository root.
2. Copy only the relevant skill directories from `content/skills/` to `.agents/skills/`.
3. Optionally copy templates to a location your team documents.
4. Add the thin wrapper from `content/adapters/<platform>/` to its native platform location.
5. Preserve existing instruction files and merge intentionally rather than overwriting them.

A minimal Codex installation needs only:

```text
your-project/
├── AGENTS.md
└── .agents/
    └── skills/
        └── implement-change/
            └── SKILL.md
```

Manual installations are not managed by the CLI unless the CLI itself later creates those files. Identical pre-existing files are deliberately not adopted into the uninstall manifest.

### Option 3: npm beta

The package is published as `@admirhodzic/project-bootstrap`; the unscoped `project-bootstrap` name belongs to another project. Invoke the beta explicitly:

```sh
pnpm dlx @admirhodzic/project-bootstrap@2.0.0-beta.0 init --root . --platform codex --dry-run
pnpm dlx @admirhodzic/project-bootstrap@2.0.0-beta.0 init --root . --platform codex
```

The exact-version form keeps beta use explicit while stable-release validation remains open.

## What gets installed

Every installation receives the canonical files below. Platform-specific files depend on `--platform`.

```text
your-project/
├── AGENTS.md
├── .agents/
│   ├── skills/
│   │   ├── bootstrap-project/SKILL.md
│   │   ├── specify-change/SKILL.md
│   │   ├── plan-change/SKILL.md
│   │   ├── implement-change/SKILL.md
│   │   ├── review-change/SKILL.md
│   │   ├── security-review/SKILL.md
│   │   └── handoff/SKILL.md
│   └── profiles/
│       ├── reviewer.md
│       ├── security-reviewer.md
│       ├── test-runner.md
│       └── researcher.md
└── .project-bootstrap/
    ├── manifest.json
    └── templates/
        ├── spec.md
        ├── plan.md
        ├── task.md
        ├── adr.md
        ├── risk-register.md
        └── project-state.md
```

The manifest records the package version, workflow profile, selected platforms, normalized managed paths, and SHA-256 hashes. It is the ownership record used by `doctor`, `update`, and `uninstall`; it is not a general project-state database.

## Platform adapters

| Platform       | Tier | Generated files                                                | Current evidence           |
| -------------- | ---: | -------------------------------------------------------------- | -------------------------- |
| OpenAI Codex   |    1 | `AGENTS.md`, `.agents/skills/`, `.codex/agents/*.toml`         | Documentation and fixtures |
| GitHub Copilot |    1 | `.github/copilot-instructions.md`, `.github/agents/*.agent.md` | Documentation and fixtures |
| Cursor         |    1 | `.cursor/rules/project-bootstrap.mdc`                          | Documentation and fixtures |
| Cline          |    1 | `.clinerules/project-bootstrap.md`                             | Documentation and fixtures |
| Windsurf       |    1 | `.windsurf/rules/project-bootstrap.md`                         | Documentation and fixtures |
| Claude Code    |    2 | `CLAUDE.md`                                                    | Fixture only               |
| Gemini CLI     |    2 | `GEMINI.md`                                                    | Fixture only               |
| Aider          |    2 | `.aider.conf.yml`                                              | Fixture only               |

Tier 1 means the adapter is a primary compatibility target. Tier 2 means fixture support exists but live verification is still more limited. “Fixture” proves generated paths, content, budgets, and lifecycle behavior; it does not prove a current hosted agent interpreted every instruction correctly.

Adapters are intentionally thin and refer back to canonical policy. Specialist profiles are technically read-only only when the host platform can enforce that restriction; otherwise the same constraint is explicit guidance, not claimed isolation. See the dated [compatibility matrix](docs/compatibility.md).

### Platform detection

When `--platform` is omitted, the CLI checks for common signals:

| Signal            | Selected adapter |
| ----------------- | ---------------- |
| `.codex/`         | Codex            |
| `.github/`        | GitHub Copilot   |
| `.cursor/`        | Cursor           |
| `.clinerules`     | Cline            |
| `.windsurf/`      | Windsurf         |
| `CLAUDE.md`       | Claude Code      |
| `GEMINI.md`       | Gemini CLI       |
| `.aider.conf.yml` | Aider            |

If no signal is found, Codex is selected. Because some signals—especially `.github/`—may exist for unrelated reasons, explicit `--platform` selection is recommended for reproducible installations.

## Workflow profiles

| Profile  | Use when                                                                                                | Typical behavior                                                                                  |
| -------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Quick    | Read-only work, docs, formatting, localized safe fixes                                                  | Inspect, change if needed, run a focused check                                                    |
| Standard | Ordinary features and bugs                                                                              | Define acceptance criteria, make a short plan, implement, verify                                  |
| Deep     | Greenfield systems, architecture, migrations, security, sensitive data, destructive or external effects | Specify, threat-model, compare alternatives, stage rollout and rollback, seek independent review  |
| Incident | Urgent regressions                                                                                      | Reproduce, contain, apply the smallest safe fix, run targeted regression checks, record follow-up |

Select a profile during installation:

```sh
project-bootstrap init --root . --platform codex --profile deep
```

The selected profile is recorded in the manifest and establishes the default workflow posture. It does not grant additional authority. Updates retain the installed profile unless another profile is explicitly supplied.

Read [workflow profiles and examples](docs/workflows.md) for greenfield, brownfield, quick-fix, and security-sensitive walkthroughs.

## Skills and templates

| Skill               | Purpose                                                          | Avoid when                                                  |
| ------------------- | ---------------------------------------------------------------- | ----------------------------------------------------------- |
| `bootstrap-project` | Establish justified foundations in a new or existing repository  | The request is an ordinary localized change                 |
| `specify-change`    | Turn ambiguity into observable outcomes and acceptance criteria  | A Quick task is already clear                               |
| `plan-change`       | Resolve material implementation uncertainty and decompose work   | The change is one obvious step                              |
| `implement-change`  | Deliver approved criteria with bounded edits and evidence        | The task is read-only analysis or review                    |
| `review-change`     | Find correctness, regression, security, and verification defects | Only stylistic commentary is desired                        |
| `security-review`   | Perform threat-driven review of sensitive surfaces               | Ordinary input handling has no meaningful security exposure |
| `handoff`           | Leave a compact, verified continuation point                     | A trivial task is finished in the current session           |

Templates are starting points, not mandatory artifacts. Quick work should not create a specification, risk register, or backlog by default. Remove unused placeholders before treating a generated document as approved.

## CLI reference

```text
project-bootstrap <command> [options]
```

### Commands

| Command     | Purpose                                                                     |           Writes files? |
| ----------- | --------------------------------------------------------------------------- | ----------------------: |
| `init`      | Install canonical content and selected adapters                             | Yes, unless `--dry-run` |
| `update`    | Update only unchanged managed files and retain local customizations         | Yes, unless `--dry-run` |
| `validate`  | Validate package content, budgets, registry entries, and skill contracts    |                      No |
| `doctor`    | Compare installed files with the manifest and report missing/modified files |                      No |
| `uninstall` | Remove only unchanged files owned by the manifest                           | Yes, unless `--dry-run` |
| `migrate`   | Install v2 alongside a copied or customized v1, preserving `AGENT.md`       | Yes, unless `--dry-run` |

### Options

| Option              | Meaning                                                          |
| ------------------- | ---------------------------------------------------------------- |
| `--root <path>`     | Target project; defaults to the current directory                |
| `--source <path>`   | Package/content root; intended for development and diagnostics   |
| `--platform <list>` | Comma-separated adapter list                                     |
| `--profile <name>`  | `quick`, `standard`, `deep`, or `incident`                       |
| `--dry-run`         | Print the complete mutation plan without filesystem side effects |
| `--json`            | Emit structured JSON for automation                              |
| `--help`, `-h`      | Show command help                                                |
| `--version`, `-v`   | Show the package version                                         |

Invalid commands/options and malformed or unsupported manifests return exit code 2. Content-validation failures, installation drift, and unexpected operational failures return exit code 1. Successful operations return 0.

## Common how-tos

### Preview and initialize a repository

Always inspect a dry run first when the target contains existing agent instructions:

```sh
project-bootstrap init --root . --platform codex,cursor --profile standard --dry-run
project-bootstrap init --root . --platform codex,cursor --profile standard
```

Plan actions are explicit:

- `CREATE`: target does not exist and will be installed;
- `UPDATE`: an unchanged managed file will receive new canonical content;
- `RETAIN`: content is already current or must remain untouched;
- `CONFLICT`: an unknown or locally modified target will not be overwritten;
- `REMOVE`: an unchanged managed file will be removed during uninstall.

### Check installation health

```sh
project-bootstrap doctor --root .
project-bootstrap doctor --root . --json
```

`doctor` reports a healthy installation only when every manifest-owned file exists and still matches its recorded hash. A missing manifest is reported as not installed rather than guessed from filenames.

### Update safely

```sh
project-bootstrap update --root . --dry-run
project-bootstrap update --root .
```

An update replaces a managed file only when its current hash matches the previous manifest. If a user changed the file, Project Bootstrap keeps the user's version and writes the proposed replacement to:

```text
.project-bootstrap/candidates/<original-destination>
```

Review and merge that candidate manually. Project Bootstrap never treats a conflict candidate as an automatically accepted change.

### Resolve a conflict

1. Compare the current file with its candidate.
2. Merge the desired canonical changes into the current file.
3. Remove the candidate after review if it is no longer needed.
4. Run `update` again. If the result still reports a conflict, the current file intentionally remains user-owned or modified.
5. Run `doctor` to see the resulting managed-file state.

Do not edit the manifest hash merely to silence drift; that changes the ownership evidence without verifying content.

### Uninstall without deleting customizations

```sh
project-bootstrap uninstall --root . --dry-run
project-bootstrap uninstall --root .
```

Only unchanged manifest-owned files are removed. Modified files are retained and remain recorded so the unresolved ownership state is visible. Pre-existing identical files that Project Bootstrap did not create are not claimed and therefore are not removed.

### Migrate from v1

V1 used a singular `AGENT.md` and a mandatory phase-heavy process. V2 uses `AGENTS.md`, adaptive profiles, and focused skills.

```sh
project-bootstrap migrate --root . --platform codex --dry-run
project-bootstrap migrate --root . --platform codex
```

Migration preserves an existing `AGENT.md` and reports it for manual reconciliation. It does not delete customized v1 content or require a clean Git repository. Follow the complete [v1 migration guide](docs/migration-v1.md).

### Use JSON output in automation

```sh
project-bootstrap init --root . --platform codex --dry-run --json
project-bootstrap doctor --root . --json
```

JSON output mirrors the in-memory plan or diagnostic report. Automation should still fail closed on non-zero exit codes and should not apply a plan containing unresolved conflicts without human review.

### Validate a source checkout

```sh
pnpm validate
# Equivalent after building:
node dist/cli.js validate --source .
```

Validation checks every canonical registry source, required install destination, path safety, root instruction budget, adapter budget, skill metadata, unique skill names, and required skill sections.

## Safety model

Project Bootstrap's file lifecycle follows these invariants:

- all mutations originate from a complete in-memory plan;
- relative destinations are normalized and cannot use absolute paths, `..`, empty segments, or drive-qualified paths;
- the nearest existing ancestor is resolved before every write to reject symlink and Windows junction escapes;
- writes use a temporary file and atomic rename;
- an invocation attempts to restore touched files if a later operation fails;
- unknown and locally modified content is never silently overwritten or deleted;
- `--dry-run` has no filesystem side effects;
- generated hooks are examples and are never enabled automatically;
- no credentials or remote integrations are installed.

Process-level rollback cannot defend against every hostile concurrent filesystem writer or sudden power loss. Use normal repository backups, least-privilege execution, and review for high-trust environments. The full analysis is in the [threat model](docs/threat-model.md).

## Behavioral evaluation

The repository includes 15 scenarios covering:

- dirty worktrees, external writes, prompt injection, and path traversal;
- quick fixes, localized bugs, greenfield work, dependencies, and incidents;
- nested instruction precedence and honest delegation fallbacks;
- stale or contradictory handoff state.

Run deterministic schema and grader checks:

```sh
pnpm eval
```

The command loads all scenarios and verifies safe and intentionally unsafe fixtures against objective graders. Default CI never performs model calls.

Live evaluation is a separate, explicitly authorized activity. A live runner must record platform and agent version, scenario revision, repetitions, duration, tools, interventions, and token usage when available, and must set spend, timeout, concurrency, and credential boundaries. See the [live runner contract](evals/runners/README.md) and [pilot protocol](docs/pilots.md).

## Development

### Install dependencies

```sh
corepack enable
pnpm install --frozen-lockfile
```

### Run checks

```sh
pnpm format:check   # Prettier
pnpm lint           # ESLint
pnpm typecheck      # TypeScript without emitting files
pnpm test           # deterministic Vitest suite
pnpm test:coverage  # suite plus enforced coverage thresholds
pnpm docs:lint      # Markdown checks
pnpm validate       # build and canonical content validation
pnpm eval           # behavioral scenario/fixture validation
pnpm eval:live -- --help # authorized live-driver runner; no model calls by default
pnpm check          # complete local gate
```

### Build and test the package

```sh
pnpm build
pnpm pack --pack-destination .
pnpm smoke:package ./admirhodzic-project-bootstrap-2.0.0-beta.0.tgz
```

The smoke test installs the tarball into a disposable project and exercises version output, dry-run purity, initialization, health checks, conflict generation, and customization-preserving uninstall.

### Repository layout

```text
AGENTS.md                  contributor/agent contract for this repository
content/
├── skills/                canonical workflow skills
├── templates/             reusable durable artifact templates
├── agents/                canonical specialist definitions
├── adapters/              platform-native thin wrappers/profiles
├── hooks/                 opt-in deterministic examples
└── legacy/                archived v1 instructions
src/                       CLI, planner, manifest, validation, and eval code
tests/                     deterministic unit/integration tests
schemas/                   versioned JSON contracts
evals/                     scenarios, fixtures, runners, and baselines
docs/                      architecture, security, compatibility, and status
.github/                   CI, security analysis, release, and contribution files
```

## Continuous integration and releases

Pull-request CI performs the full quality gate on Node.js 24 and portability build/tests across Linux, macOS, and Windows with Node.js 22/24 coverage. GitHub Actions are pinned to immutable commit SHAs and use explicit minimal permissions. Separate workflows provide dependency review and CodeQL analysis.

The tag-driven release workflow:

1. runs only in the canonical repository for `v2.*` tags;
2. installs from the frozen lockfile;
3. runs the complete gate;
4. packs one reviewed tarball;
5. generates SHA-256 checksums;
6. publishes with npm provenance through the protected `npm` environment;
7. creates a GitHub release from the same artifacts.

The beta was published directly on 2026-09-05 without provenance, so it does not validate this workflow. Trusted publishing, protected-environment reviewers, and release authority must be confirmed before the stable release. See the [release checklist](docs/release-checklist.md) and [repository security activation checklist](docs/repository-security.md).

## Security and optional integrations

Report vulnerabilities through GitHub private vulnerability reporting, not a public issue. Read [SECURITY.md](SECURITY.md) for supported versions and reporting expectations.

Core installation enables no Model Context Protocol servers, connectors, browser sessions, issue trackers, deployment tools, or credentials. Teams can add those integrations deliberately after reviewing scopes, exposed data, prompt-injection risk, rate limits, and destructive operations. See [optional integration guidance](docs/integrations.md) and [trusted hook guidance](docs/hooks.md).

## Contributing

Before contributing:

1. Read [CONTRIBUTING.md](CONTRIBUTING.md) and the root `AGENTS.md`.
2. Keep each policy or template canonical; adapters should reference it rather than copy it.
3. Add tests for mutation, schema, compatibility, or behavior changes.
4. Run `pnpm check` and inspect the final diff.
5. Update `CHANGELOG.md` for user-visible changes.

Adapter contributions must declare native paths, evidence date/source, budget, feature limitations, fixtures, and maintenance ownership. Follow the [adapter contribution contract](docs/adapter-contribution.md).

## Troubleshooting

### `doctor` says no manifest exists

The repository may be a manual installation or initialization may not have run. Use `init --dry-run` before deciding whether to create a managed installation.

### `update` reports conflicts

This is expected when installed content was edited. Your file was retained. Review its candidate under `.project-bootstrap/candidates/` and merge manually.

### `doctor` reports a missing file

The manifest owns a file that no longer exists. Run `update --dry-run` to see whether it will be recreated, then apply the plan if appropriate.

### `uninstall` retains files

Retained files differ from their recorded hashes. This protects customizations. Delete them manually only after confirming their exact paths and contents are no longer needed.

### A platform adapter is selected unexpectedly

Automatic detection uses repository signals and may infer Copilot from `.github/`. Pass an explicit `--platform` list to make the installation reproducible.

### `validate` checks the wrong location

`validate` checks canonical package sources, not an installed target. From a source checkout use `--source .`; use `doctor --root <target>` for an installation.

### The npm command cannot find the package

Use the scoped name and explicit beta version:

```sh
pnpm dlx @admirhodzic/project-bootstrap@2.0.0-beta.0 --version
```

If registry metadata is temporarily unavailable, build and invoke `node dist/cli.js` from a source checkout.

## Documentation index

- [Implementation plan](docs/implementation-plan.md)
- [Backlog and completion tracker](docs/backlog.md)
- [Current project state](docs/project-state.md)
- [Workflow profiles and examples](docs/workflows.md)
- [Compatibility matrix](docs/compatibility.md)
- [Threat model](docs/threat-model.md)
- [Beta review record](docs/beta-review.md)
- [V1 migration guide](docs/migration-v1.md)
- [Spec Kit interoperability decision](docs/spec-kit-interop.md)
- [Dependency policy](docs/dependencies.md)
- [Optional integrations](docs/integrations.md)
- [Optional hooks](docs/hooks.md)
- [Pilot protocol](docs/pilots.md)
- [Adapter contribution contract](docs/adapter-contribution.md)
- [Repository security activation](docs/repository-security.md)
- [Release checklist](docs/release-checklist.md)
- [Release notes](docs/release-notes.md)
- [Security policy](SECURITY.md)
- [Changelog](CHANGELOG.md)

## Current status and limitations

Local implementation and verification are complete. The latest recorded evidence is:

- 36 deterministic tests passing;
- coverage of 83.54% statements, 78.13% branches, 94% functions, and 85.76% lines;
- format, lint, typecheck, Markdown, build, and content-validation gates passing;
- 33 canonical registry entries validated;
- 15 behavioral scenarios and four safe/unsafe fixtures validated;
- packed-package init, doctor, update/conflict, and uninstall lifecycle passing;
- `@admirhodzic/project-bootstrap@2.0.0-beta.0` published to npm and verified through a clean registry install.

Stable release still requires maintainer-controlled work: activate repository security settings, obtain independent beta review, run repeated Tier 1 live pilots, tune from those observations, configure trusted publishing, and publish from the approved tag workflow. Current evidence and blockers are maintained in [project state](docs/project-state.md).

## License

Project Bootstrap is licensed under the [Apache License 2.0](LICENSE).
