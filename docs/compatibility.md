# Compatibility matrix

Evidence levels are **documented** (official behavior reviewed), **fixture** (output checked locally), and **live** (dated end-to-end run). Live evidence is never inferred from fixture success.

| Platform       | Tier | Generated location                     | Evidence                        | Limitation                               |
| -------------- | ---: | -------------------------------------- | ------------------------------- | ---------------------------------------- |
| OpenAI Codex   |    1 | `AGENTS.md`, `.agents/skills/`         | documented + fixture 2026-09-05 | Live pilot pending                       |
| GitHub Copilot |    1 | `.github/copilot-instructions.md`      | documented + fixture 2026-09-03 | Host-dependent tool restrictions         |
| Cursor         |    1 | `.cursor/rules/project-bootstrap.mdc`  | documented + fixture 2026-09-03 | Live pilot pending                       |
| Cline          |    1 | `.clinerules/project-bootstrap.md`     | documented + fixture 2026-09-03 | Live pilot pending                       |
| Windsurf       |    1 | `.windsurf/rules/project-bootstrap.md` | documented + fixture 2026-09-03 | Live pilot pending                       |
| Claude Code    |    2 | `CLAUDE.md`                            | documented + fixture 2026-09-05 | Import behavior needs live smoke test    |
| Gemini CLI     |    2 | `GEMINI.md`                            | documented + fixture 2026-09-05 | Live smoke test pending                  |
| Aider          |    2 | `.aider.conf.yml`                      | documented + fixture 2026-09-05 | Read-list behavior needs live smoke test |

Compatibility claims change only with dated official sources or recorded live runs. Registry validation ensures fixture sources exist and root instructions stay within budget.
