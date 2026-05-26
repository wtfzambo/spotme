---
id: SPO-21
title: Test and customise SpotMe for Pi
status: Done
assignee:
  - '@myself'
created_date: '2026-05-12 00:02'
updated_date: '2026-05-26 21:31'
labels:
  - testing
dependencies: []
priority: medium
ordinal: 21000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
SpotMe was built and iterated on OpenCode. The Pi harness has a separate implementation in pi.ts that mirrors the OpenCode logic but uses Pi's extension API. Needs end-to-end testing in a Pi project and any Pi-specific adjustments.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 All commands work in Pi: spotme:on, spotme:off, spotme:status, spotme:done, spotme:hint, spotme:solve, spotme:skip, spotme:rep
- [x] #2 Counter trigger and exercisePending bypass behave correctly in Pi
- [x] #3 donePrompt / solvePrompt produce useful review/solution responses in Pi
- [x] #4 Any Pi-specific UX differences (e.g. select dialog for commands) are evaluated and implemented if worthwhile
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
dist/pi.js was removed from the npm build (build script + exports map) to reduce package size from 11.6MB to ~0.9MB. Pi users load src/pi.ts directly via the 'pi.extensions' field in package.json, so dist/pi.js was unused. When starting Pi work, remember to add pi.ts back to the build script if a bundled dist is ever needed.

All 8 commands tested successfully in Pi:
- /spotme:on, /spotme:off, /spotme:status execute programmatically via ctx.ui.notify (no LLM round-trip)
- /spotme:done, /spotme:solve, /spotme:skip inject exercise details directly into prompts (no spotme_status tool call needed)
- /spotme:hint and /spotme:rep send generic prompts to LLM
- Counter trigger and exercisePending bypass work correctly
- spotme_exercise, spotme_end, spotme_status tools registered and functional
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Implemented and tested full Pi integration for SpotMe. Key changes:

1. Pi adapter (src/pi.ts): Registered spotme_status, spotme_exercise, spotme_end tools. Refactored commands so on/off/status are pure programmatic (toast notifications), while done/solve/skip inject exercise details into LLM prompts directly.

2. Unified prompts (src/prompts.ts): Merged PROMPTS and PI_PROMPTS into single adaptive object with done()/solve()/skip() methods that accept optional exercise data. OpenCode uses static getters (DONE/SOLVE/SKIP), Pi uses method calls with exercise details.

3. Dependencies (package.json): Moved @earendil-works/pi-coding-agent to optional peerDependencies with wildcard version (Pi provides at runtime). Pinned to ^0.74.0 in devDependencies for reproducible builds. Reduces install size for OpenCode users.

4. README: Removed WIP warning from Pi section, documented tested and working integration.

Tested all flows: counter trigger, exercise registration, done/solve/skip/hint/rep commands, and programmatic on/off/status.
<!-- SECTION:FINAL_SUMMARY:END -->
