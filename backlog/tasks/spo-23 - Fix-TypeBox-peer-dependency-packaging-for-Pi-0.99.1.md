---
id: SPO-23
title: Fix TypeBox peer dependency packaging for Pi 0.99.1
status: Done
assignee:
  - '@pi'
created_date: '2026-09-30 14:49'
updated_date: '2026-09-30 15:01'
labels: []
dependencies: []
ordinal: 23000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Fix the source repository rather than the installed node_modules workaround, preserving Pi and OpenCode support and preparing a patch release without publishing.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 TypeBox is a wildcard optional peer dependency and remains available for development build and typecheck.
- [x] #2 Tracked lockfiles are synchronized using Bun as the project package manager and npm for the tracked npm lockfile.
- [x] #3 Typecheck, lint, build and packaged-host smoke checks pass; Pi 0.99.1 loads the package and registers tools without warnings; OpenCode entrypoints work without TypeBox.
- [x] #4 Patch release preparation is documented without publishing or pushing changes.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Move @sinclair/typebox to peerDependencies with range *, mark it optional for OpenCode-only installs, and retain ^0.34.0 in devDependencies. 2. Refresh bun.lock and synchronize the tracked package-lock.json without unrelated upgrades. 3. Run typecheck, lint, build and tarball smoke checks: Pi 0.99.1 package discovery, zero warnings/errors and registered tools; OpenCode root/subpath imports and tools without TypeBox or Pi installed. 4. Prepare patch release notes for 1.2.4 under the existing release-please workflow; leave publication, push and release triggers untouched until authorized.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Repository found at ~/mystuff/projects/.archive/spotme; working tree initially clean. TypeBox is imported only by src/pi.ts; OpenCode uses tool.schema from @opencode-ai/plugin. CI uses Bun; both bun.lock and package-lock.json are tracked. The release workflow can dispatch npm publication when a release PR is created, so no push or workflow dispatch will be performed.

Moved TypeBox to a wildcard optional peer and retained ^0.34.0 in devDependencies. bun install --ignore-scripts and npm install --package-lock-only synchronized both lockfiles; no locked package versions changed. The npm lockfile was already stale (Pi marked as a runtime dependency), so synchronization also corrected development-only flags.

Added npm-tarball regression smoke checks. Pi 0.99.1 must discover SpotMe through settings packages, not a direct extension path: the negative control caught that direct CLI paths omit package warnings. Verified the actual package warning fires with the original broken manifest and disappears after restoring the fix. Packaged OpenCode root/subpath exports work without installed Pi/TypeBox; both Pi 0.74.0 and 0.99.1 register the expected tools and commands.

Final checks passed: Bun frozen-lockfile install, typecheck, lint, ESLint for the smoke script, Prettier checks, build, packaged-entrypoint smoke tests with Pi 0.74.0 and actual Pi 0.99.1, and git diff --check. Self-review confirms no adapter behavior, locked package versions, release workflows, installed SpotMe copy, or user settings changed. Documented stable patch target 1.2.4; release-please version/manifest remain at published 1.2.3 until authorization.
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Fixes Pi 0.99.1 packaging warnings in the source repository, preserving OpenCode-only installs.

- Move @sinclair/typebox from runtime dependencies to an optional wildcard peer, retaining ^0.34.0 for build/typecheck.
- Synchronize bun.lock and the previously stale package-lock.json without changing locked package versions.
- Add an npm-tarball smoke check covering both OpenCode exports without Pi/TypeBox, real Pi package discovery, tool/command registration, and a negative control proving the original warning is detected.
- Document dependency ownership, reproducible checks, and patch 1.2.4 preparation. Keep release state at 1.2.3 pending authorization; no push, tag, workflow dispatch, or publication.

Validation: frozen Bun install, typecheck, lint, build, script ESLint/Prettier, git diff --check, and packaging tests against Pi 0.74.0 and 0.99.1 all passed. Pi 0.99.1 registered all three tools and eight commands with zero errors/warnings. OpenCode root and subpath exports registered all four tools and ran without installed Pi/TypeBox.
<!-- SECTION:FINAL_SUMMARY:END -->
