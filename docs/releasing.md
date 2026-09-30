# Releasing

Releases are automated with release-please. Merging conventional commits (`fix:`, `feat:`) into `main` makes the `Release` workflow open a `chore(main): release X.Y.Z` PR that bumps `package.json`, `.release-please-manifest.json` and `CHANGELOG.md`. Merging that PR creates the tag and GitHub release, then dispatches `Publish Package`, which builds with Bun and publishes to npm with OIDC as `latest`.

The workflow also dispatches a `next` publish when the release PR is opened. It normally fails because the version is already on npm, and is harmless.

Before pushing, run:

```bash
bun install --frozen-lockfile
bun run typecheck
bun run lint
bun run build
bun run test:packaging
PI_SDK_PATH=/path/to/node_modules/@earendil-works/pi-coding-agent bun run test:packaging
```

Bun is the CI package manager and `bun.lock` is authoritative for those installs. The repository also tracks `package-lock.json`; after changing dependency metadata, synchronize it with `npm install --package-lock-only --ignore-scripts --no-audit --no-fund` and do not update unrelated locked versions.
