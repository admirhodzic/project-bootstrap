# Repository security activation

Configuration files provide Dependabot, dependency review, CodeQL, pinned Actions, least-privilege workflow permissions, and CODEOWNERS. A maintainer must verify the following GitHub settings because local files cannot enable them:

## Verified repository evidence

As of 2026-09-05:

- `pnpm audit --audit-level high` reports no known vulnerabilities.
- The pinned `actions/checkout` v7.0.0, `actions/setup-node` v7.0.0, `actions/dependency-review-action` v5.0.0, and `github/codeql-action` v4.37.6 commit SHAs match their official upstream tags.
- The public GitHub API reports that remote `main` is not protected and has no Actions runs. The local v2 workflows cannot run until the source is committed and pushed with explicit authority.

## Maintainer-controlled settings

- [ ] Private vulnerability reporting is enabled.
- [ ] Secret scanning and push protection are enabled where available.
- [ ] Dependency graph and Dependabot alerts are enabled.
- [ ] Branch/ruleset protection requires CI and dependency review.
- [ ] Workflow changes require owner review.
- [ ] The `npm` environment has required reviewers and only the release workflow can deploy.
- [ ] npm trusted publishing maps exactly to the repository and release workflow.

Record the reviewer and date when these are verified. Do not mark them enabled based only on the presence of workflow files.
