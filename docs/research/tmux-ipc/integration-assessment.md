# Read-only package integration assessment

Observed 2026-10-11 after b8178c0 acceptance. No integration performed.

Local main /Users/jku/git/gucos-packages was clean at d966694. Parallel
/Users/jku/git/gucos-packages-porting is porting-continuation at d7d1bfb,
with untracked apps/cpython/ and apps/gtk-desk/; neither was inspected or changed.
The user has not yet designated which destination branch should receive tmux.

Remote port/tmux-additive-ipc history starts at a standalone snapshot commit
(a5f8d0b) corresponding to upstream b4507a9, not shared original Git ancestry.
Do not merge this repository wholesale or overwrite the destination tree.
Recommend a path-scoped integration commit on an isolated branch from the
coordinator-designated destination HEAD after independent review/final acceptance.

Exact package files to import:

- apps/tmux/README.md
- apps/tmux/build.sh
- apps/tmux/outputs.json
- apps/tmux/provenance.json
- apps/tmux/recipe.json
- apps/tmux/source.tar
- apps/tmux/test.sh

Also preserve docs/logs/2026-10-11/tmux-ipc.md and the complete
new docs/research/tmux-ipc/ tree (scripts, results, hashes, pinned artifacts,
failed attempts and final acceptance). The machine-readable exact path list is
integration-paths.txt and covers current committed/new handoff files.

The only tracked change outside those new tmux paths is apps/ncurses/test.sh.
Its bytes already match BOTH local main and porting-continuation exactly:
SHA256 c16ef304b99f7b7a8cbcf6864b8f6f4b6e9c1d8ed309ac5e7da500174af38005.
Main contains the matching change in8201e0103d5ed8d0a16bf678ec8b999342287fd1.
Do not reapply or replace that file. tests/compatibility/session.mjs also matches
main exactly (6f37d0e065a3a8aad1a715191806bc59c3ed2011b629b95b60b29c4d064ce675)
and needs no import. Neither destination currently has tracked apps/tmux files.
Recheck destination HEAD and path collisions at actual integration time.

Exclude remote untracked package-lock.json, test-results/, node_modules/,
all catalogs/manifests/publication state and other workers' package files.
No deployment or publication is authorized by this integration assessment.

Recipe eligibility corrected in7b1d205 (minimum1.0.2 and required capabilities)
and7cf0b1b (exact tested dependency versions). Actual final1.0.2 client install,
installed-byte checks and lifecycle passed; see final-install-02/acceptance.md.
The accepted original binary artifact and receipt retain their initial identity.
Destination branch remains pending coordinator designation; assessment has not
performed an import or catalog mutation.
