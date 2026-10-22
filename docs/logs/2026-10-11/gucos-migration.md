# gucos-packages publication acceptance

Imported 123f6d5 source/history and retained the paused desktop work on
checkpoint/snake-packaging 82ab4db. No unfinished source candidate was newly
published by this migration.

All 70 entries from the accepted catalog were relocated. Manifest commit 9474fca
and catalog commit 9390bab pin raw.githubusercontent.com/GroundUpCoder/gucos-packages.
Independent review confirmed every manifest differs only in the repository URL;
versions, ABI metadata, input/binary hashes, inventories and historical build
provenance are unchanged. Reviewed tooling commit 32443c0 supplies independent
test dependencies, an explicit core-distribution interface and closure checks.

`python3 tools/check-catalog.py` passed ownership/dependency closure and binary
inventories. `python3 tools/check-publication.py --remote` verified all 398 active
objects (849,528,930 bytes) anonymously, including every source and binary. The
retained log is gucos-publication-closure.log; its SHA256 is recorded alongside.

The fresh public gucos preview and os.groundupcoder.com production each passed
binary install and guest source build of jsmn, reload/persistence and GPU/terminal
checks while requests to the retired repository were blocked. This is migration
acceptance, not a claim of rerunning every package's full source/GUI suite.
Relocated compatibility preparation passed for 17 packages and 803 output hashes.

Published packages now operate without wasm-posix-packages. Git history retains
the old immutable objects under the new repository. Historical helper scripts
are explicitly opt-in via WASM_POSIX_HISTORICAL_CHECKOUT; ordinary published
package operations need no historical checkout. Historical logs and recipes on
checkpoint branches retain their original references as provenance.

GitHub API verification on 2026-10-11 confirms both GroundUpCoder/wasm-posix
and GroundUpCoder/wasm-posix-packages are archived. The owner completed archival
after migration. No old browser disk or historical worktree was removed.
