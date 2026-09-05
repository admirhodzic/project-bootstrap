# Threat model

## Scope and trust boundaries

The CLI reads canonical package content and an untrusted target repository, then may write only inside the selected root. Manifests, existing instructions, repository text, symlinks/junctions, hooks, CI input, and remote integration output are untrusted. Package/release infrastructure and the local runtime form separate supply-chain boundaries.

| Threat                                 | Control                                                            | Evidence               | Residual risk                                                              |
| -------------------------------------- | ------------------------------------------------------------------ | ---------------------- | -------------------------------------------------------------------------- |
| Traversal, absolute paths, case tricks | Portable normalization plus resolved-root containment              | `paths.test.ts`        | Filesystem semantics vary; Tier 1 pilots remain needed                     |
| Symlink/junction escape                | Real-path check of nearest existing ancestor before every mutation | `paths.test.ts`        | Concurrent link replacement needs OS isolation against hostile local users |
| Unknown or modified overwrite          | Hash manifest, explicit conflict, candidate output                 | `file-plan.test.ts`    | User must resolve candidates correctly                                     |
| Partial mutation                       | In-memory plan, atomic rename, invocation rollback                 | `file-plan.test.ts`    | Power loss and hostile concurrent writers can exceed process rollback      |
| Manifest tampering/schema confusion    | Versioned parser, path checks, fail-closed versions                | `manifest.test.ts`     | A local writer can alter files and manifest together                       |
| Template/prompt injection              | Bundled canonical content; repository/tool output treated as data  | behavioral scenarios   | Depends partly on host instruction enforcement                             |
| Malicious hooks                        | Opt-in, reviewable, never automatically enabled                    | `docs/hooks.md`        | Teams may enable unsafe third-party hooks                                  |
| Credential leakage/excessive agency    | No credentials/remotes; least-scope guidance                       | `docs/integrations.md` | Connector controls differ by host                                          |
| Dependency compromise                  | No runtime dependencies, lockfile, updates, provenance design      | CI/package checks      | Development and Actions dependencies remain upstream trust                 |
| CI privilege/release injection         | Minimal PR permissions; tag/OIDC publication design                | workflow review        | Settings need maintainer activation                                        |

Critical and High findings block release unless an authorized owner records rationale, ownership, compensating control, and target date.
