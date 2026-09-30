---
id: SPO-24
title: Release stable SpotMe 1.2.4 packaging fix
status: In Progress
assignee:
  - '@pi'
created_date: '2026-09-30 15:32'
updated_date: '2026-09-30 15:33'
labels: []
dependencies: []
ordinal: 24000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Publish the authorized TypeBox packaging fix as stable SpotMe 1.2.4 on npm latest and GitHub, preserving branch protection and avoiding automatic next publication on release PR creation.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 The packaging fix is reviewed through a passing pull request and merged into main.
- [ ] #2 Release automation publishes only on an actual release, with stable version 1.2.4.
- [ ] #3 GitHub release v1.2.4 and npm latest 1.2.4 exist, and the published tarball declares optional wildcard TypeBox peers and passes host smoke checks.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. With plan approval, make release-please use the repository config for stable semver releases and remove the automatic next publication triggered by release PR creation; retain latest publication only on actual release creation. 2. Push a fix branch, open and merge a PR after checks pass, without bypassing protections. 3. Review and merge the generated release-please PR for exactly 1.2.4, then monitor the GitHub release and npm OIDC publishing workflow. 4. Fetch the published 1.2.4 artifact, verify npm latest and wildcard optional peer metadata, rerun host smoke checks, and report the user update command.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
User authorized making a new release. GitHub and npm both currently show 1.2.3; main matches the local base, and no open PRs exist. GitHub authentication and npm OIDC publishing workflow are available. Current release workflow dispatches a next publish on release PR creation; repository release-please config enables prereleases, while the action uses its legacy release-type input. Stable release automation changes need plan approval before editing.
<!-- SECTION:NOTES:END -->
