# Package migration paused by jku

Stopped on 2026-10-12 by explicit user direction because retained migration runs consume about 53 GiB. The user reports about 53 GB now free; capacity is no longer the reason for the pause. Do not resume browser, collector, migration, porting or review runs without new direction. No such run was launched during closeout.

## Checkpoint

96 packages are accepted within their recorded scopes; 98 are published. CPython public foundation acceptance is recorded in `86cb4f0` (main `43b29ff`), with public evidence at `abe65b2`. Imlib2 and Feh remain pending public acceptance. Publication baseline `c303f33` is unchanged; the complete 98-entry catalog is not accepted.

`apps/gtk-desk/` and `apps/gtk3-demo/` are real source preparations, now committed as unpublished candidates. They retain source archives, inventories, recipes, tests and explicit unresolved-license notices. This commit is preservation, not a license grant, build result or publication approval. The local-contribution license decision remains unresolved.

## Next work, only if explicitly resumed

The independently reviewed private Imlib2 prerequisite retry is ready: driver SHA256 `233e86357663e86327210e442fb053cb9c488c7297e9840d89b545df31668062`, bundle index `60bf3f4b84f14222738a09a0c486d5b4d55174557ac37e7dd4b5cdd13f65a64f`. Its five-file executable subset is in `/Users/jku/git/.gucos-migration-checkpoints/2026-10-11-porting-pause/imlib2-public-prerequisite-retry-proposal-a/`. It requires a fresh exclusive profile, production origin and frozen runtime, 2 GiB starting and 1 GiB continuing free-space checks. Sequence: install, validated baseline, confirmed close, reopen, read-only topology/manifest/mapping checks, then the original consumer only if intact. It does not authorize Feh GUI/reload or package acceptance. It has NOT run.

Four historical failed profiles contain CRC-verified origin-mapping deletion/recreation; cause remains unknown. The separate small sentinel retained its file and mapping across close/reopen. That does not resolve the historical failures. LibFM/PCManFM, Xarchiver and Galculator gates remain blocked on their recorded installed-state discrepancies.

## Evidence and preservation

Durable public evidence and the migration queue are under `docs/research/package-migration/`; CPython public evidence is `cpython/gucos-public/`, CLI/game public evidence is `cli-shooters/gucos-public/`, and prior failures remain in their package evidence directories.

Original runs, browser profiles and exports remain under `/Users/jku/git/gucos-packages-porting/test-results/migration/`. Private proposals, diagnostics, profiles and coordination state remain under `/Users/jku/git/.gucos-migration-checkpoints/2026-10-11-porting-pause/`, including `persistence-sentinel-run-v1/`. No evidence in either tree was deleted or moved. The user will decide pruning separately. Historical wasm-posix checkouts were separately retired by the user; the supplied replacement instructions identify `/Users/jku/git/.gucos-retired-backup-2026-10-11` as their backup. Old checkout paths in historical provenance must not be treated as currently available.

## Coordination closeout

No active timers or wake handles were found for the owner or reviewers A/B. Owner decision watches `01a12b3e-b6e8-70be-9b5c-2957681d55b9` (disk) and `01a12a3f-2f60-77e7-a43e-13bbbbe7cc0c` (GTK licensing) were cancelled. No reviewer message or new review was started.

Requested disk decision resolution: “Resolved: work paused by jku.” The `cc-meta decision resolve` request was rejected with HTTP 403: “Agent resolution requires an explicit active delegation.” Therefore decision `817b1b4f4ab24a5c047f219530652d52115ac6ca66bef06a2f7d9e201478c349` still requires owner-side closure; its watch is cancelled. GTK license decision `8cfde48ff26042defacde2d345ea130cff243761ded2e081f1fc78f2063248e9` remains pending without an owner-thread watch. No automatic resumption is scheduled.
