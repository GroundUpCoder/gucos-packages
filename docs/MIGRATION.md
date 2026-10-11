# gucos-packages migration

Imported source history: wasm-posix-packages 123f6d5f9631d887b1dce8fecd8cda1ded43fd2a.
The active catalog contains the same 70 package entries as the checkpoint.
`tools/migrate-publication.py` reads the original catalog's immutable manifests,
rewrites their repository URLs, verifies the original pinned bytes, and repins
the catalog. Inputs, binaries, output sets, versions, ABI requirements and build
provenance are preserved. `tools/publication-baseline.json` records the migrated
baseline for future publication. Historical receipts are not rewritten.

All referenced original Git commits remain in this repository's history, so
relocated source and binary URLs do not depend on the old repository. A few
upstream jsmn inputs retain their existing public upstream source URLs.

```
pnpm install --frozen-lockfile
pnpm --dir tests/migration install --frozen-lockfile
python3 tools/check-catalog.py
python3 tools/check-publication.py --remote
```

The latter verifies every active source/manifest/binary hash through anonymous
HTTP. Package browser tests use this repository's own Playwright dependency.
Supply a core distribution explicitly using GUCOS_CORE_DIST, or use the
COMPAT_CORE_URL/COMPAT_EXPECT_RUNTIME contract in tools/accept-core-compat.mjs.
Core is never built implicitly by this repository.

Historical import/preparation helpers require the explicit environment variable
WASM_POSIX_HISTORICAL_CHECKOUT. They reproduce historical evidence and are not
required for catalog validation, public installation or building published
packages in the browser. No sibling repository is automatically discovered.
The platform feature snapshot in tools/platform.json comes from gucos's accepted
platform 1.0.1 baseline; update it deliberately when preparing new requirements.

Unfinished desktop work is preserved at checkpoint/snake-packaging (82ab4db),
including the JWM integration and its latest unrun GUI fix. Source preparation
for unpublished ports remains in apps/ and is not added to the active catalog.
The original local worktrees, browser profiles and exported artifacts remain
preserved for future resumption. The old porting threads remain paused.

Scheduler tools were copied unchanged from wasm-posix-old
0b9b3245fe11a3bc677d81113cba90cd0ae80446 and share the machine-wide queue. Use
node tools/machine-job.mjs when the global command is not installed.
