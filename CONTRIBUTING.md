# Contributing

Contributions to Project Bootstrap should improve observable agent behavior, portability, safety, or maintainability.

## Development

1. Use Node.js 24 LTS and the pnpm version declared in `package.json`.
2. Install with `pnpm install --frozen-lockfile`.
3. Run `pnpm check` before requesting review.

Do not commit, push, or publish on another contributor's behalf without explicit authorization.

## Content changes

- Keep `AGENTS.md` below its enforced 10 KiB and 200-line budgets.
- Put detailed repeatable workflows in `content/skills/` and output templates in `content/templates/`.
- Change canonical content, then regenerate adapters. Do not hand-maintain divergent copies.
- Add or update a behavioral scenario when fixing an instruction-following regression.
- Compatibility claims need a dated official source, fixture result, or live-test artifact.

## Code changes

- Preserve conflict-safe and path-containment invariants.
- Add unit tests for logic and integration tests for filesystem workflows.
- Keep runtime dependencies minimal and document why a new production dependency is necessary.

## Pull requests

Describe the user-visible outcome, risks, tests run, compatibility impact, and migration considerations. Security-sensitive changes require an independent review.
