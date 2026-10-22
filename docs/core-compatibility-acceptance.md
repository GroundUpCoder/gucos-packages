# Test a frozen core against published packages

Run this from `wasm-posix-packages`. The driver uses only the unchanged public
catalog at `fab65cba24c8c6dd59e11a63e096138e13835c42`, including its original
`2a9cca…` binary archives and legacy manifests. It does not rebuild packages,
rewrite runtime tags, add platform requirements, publish metadata, or deploy.
The new core's package client must accept the legacy baseline itself.

For a local distribution containing `index.html`:

```sh
cd /Users/jku/git/wasm-posix-packages
COMPAT_CORE_DIST=/absolute/path/to/frozen/core-distribution \
COMPAT_EXPECT_RUNTIME=<candidate-build-sha256> \
node tools/accept-core-compat.mjs
```

For a hosted candidate, supply its base URL instead of a distribution:

```sh
COMPAT_CORE_URL=https://candidate.example/ \
COMPAT_EXPECT_RUNTIME=<candidate-build-sha256> \
node tools/accept-core-compat.mjs
```

`COMPAT_EXPECT_RUNTIME` identifies which candidate is being tested. It is **not**
a replacement package compatibility rule and need not equal the package baseline.
Supply exactly one core location. The URL must provide cross-origin isolation
and remain frozen throughout the run. The directory is read-only: its complete
file inventory is hashed at run start, rechecked each session, and checked again
when serving each file. Symlink-containing distributions are rejected. The local
server supplies isolation headers. No core checkout is built or modified.

Do not wrap the driver in another machine-job reservation. It reserves the browser
lane separately for each stage, with a 300-second execution deadline, and releases
it before queuing the next stage. It never prequeues a second job. Browser sessions
are sequential; candidate servers live inside their reservation. This leaves
other browser work, including startup profiling, able to run between stages.

Each invocation creates a fresh, package-local automation profile and evidence
folder under `test-results/compatibility/`. `COMPAT_RUN_NAME=my-frozen-candidate`
sets a readable folder name; an existing name is rejected. No user profile or
historical disk is opened. `report.json` records candidate identity, distribution
snapshot identity when local, per-stage exit codes, log hashes, timings and skipped
stages. The driver fails on the first failed stage and exits nonzero; it never
rebuilds a package to recover. Read the failing log before classifying a failure:
these browser harnesses use internal shell/DOM test hooks, which are not promised
application APIs. A harness failure alone is not proof of a binary ABI regression.

## Acceptance scope

1. Boot/isolation and expected candidate build; byte-check the pinned public catalog.
2. Public binary installation of all 17 baseline packages: X11 server, toolkit,
   widgets, JWM, xterm, the ten other X clients, Lua and Zstandard.
3. Compare installed manifests to the original public manifests and SHA256-check
   every declared output against bytes extracted from the original binary archives.
4. Execute retained Lua/luac and Zstandard, including protected errors, coroutines,
   bytecode, a two-thread compression round trip and invalid-input rejection.
5. Use the candidate guest compiler/linker for small new test programs linked against
   retained `liblua.a`, `libzstd.a`, and Xaw/Xpm/Xt/Xmu/X11 libraries. Original
   libraries and executables are never recompiled. Existing graphics controllers
   also relink against the retained XTest/Xext/X11/xcb/Xau libraries.
6. Run original JWM, X11 clients and xterm: WM controls/workspaces/menu/exit,
   browser dragging, hidden-VT progress, calculator/clock/eyes/property/event
   interactions, keyboard input through a PTY, and launcher readiness/cleanup.
7. Reload the candidate, check user-file persistence, and repeat original manifest
   and **all output byte** checks after the relinking/runtime tests.

This is execution and selected static-library relinking acceptance. It is not a
claim that every function in every archive is covered, a new platform-metadata
gate, or an in-place upgrade test from an existing baseline disk. Package limits
remain those in the published package READMEs. New platform-aware metadata stays
unpublished until candidate acceptance and a separately reviewed release.

`--probe-only` tests candidate boot/identity and public catalog transport without
installing packages. Its report says `probe-passed`, never full compatibility
`passed`. It is useful for checking a candidate URL before the full run.

Requirements: Node, Python 3, Git history containing the published baseline,
`machine-job` on PATH, and the existing installed Playwright/Chromium dependency
used by this repository's other browser tests. The harness reads Playwright from
the sibling core installation; it does not edit or build that repository.
