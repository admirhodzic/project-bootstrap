# Release checklist

- [ ] Full checks pass from a clean checkout on supported OS/runtime combinations.
- [x] Packed artifact completes install, validate, update, and uninstall smoke tests.
- [ ] Threat controls and Critical/High review findings are resolved.
- [ ] Compatibility and repeated Tier 1 pilot evidence are current.
- [ ] Package name, security reporting path, and release owners are confirmed.
- [ ] Tag, changelog, migration guide, checksums, provenance, and notes agree.
- [ ] Maintainer authorizes tag and publication.
- [x] Post-publication smoke tests pass.

The 2026-09-05 direct publication of `@admirhodzic/project-bootstrap@2.0.0-beta.0` passed public-tarball checksum verification, packed lifecycle smoke, clean registry installation, and CLI version execution. It was published without provenance and without a matching Git tag or GitHub release, so it does not satisfy the approved-workflow gate.

Local code cannot truthfully check account settings, independent human review, or live pilots; those gates remain open until evidence exists.
