# Beta review record

## 2026-09-03 self-review

Scope covered CLI mutations, path containment, manifest trust, packaging, adapters, optional hooks, migration, CI, and release design.

Resolved findings:

- High: the initial package allowlist omitted `AGENTS.md`; the packed-artifact smoke test caught it, the allowlist was corrected, and the full lifecycle smoke passed.
- Medium: an identical pre-existing file could have been adopted and later removed; manifest ownership now excludes uncreated identical files and has a regression test.
- Medium: a modified managed file was dropped from the next manifest; conflicts now retain the prior ownership/hash record and have a regression assertion.
- Medium: unscoped npm name was already owned; metadata moved to an unoccupied scoped name.

Residual limitations:

- This is self-review, not the independent review required for release.
- Link replacement by a hostile concurrent local process is outside process-level rollback guarantees.
- Platform-native profile enforcement and all compatibility claims still need live pilots.
- GitHub security settings, trusted publishing, and stable-release ownership need maintainer verification. npm scope ownership was confirmed by the public beta publication on 2026-09-05.

No known unresolved Critical or High implementation finding remains from this self-review.
