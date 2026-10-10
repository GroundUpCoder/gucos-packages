# Historical package completeness audit

User requested a bounded read-only comparison while profiling live boot and
recording video. Package author inspected old commit
0b9b3245fe11a3bc677d81113cba90cd0ae80446 and current published package baseline
f256627a317a97c9950ac058b70ae5cda70b541e. Actual cc thread metadata verified Codex /
gpt-6-astra. No browser/build jobs, package ports, rebuilds, retags, metadata
publication, core or hosting edits occurred.

[Inventory and evidence](../../research/historical-package-inventory/README.md):
110 canonical historical manifest names, all with recorded historical success
(build/package acceptance across different versions and baselines, including
bundles/data); current 19 catalog entries / 18 binaries. Five same-name package
mappings, six core bootstrap names, five partial/reorganized names, 94 absent
installable packages. Explicitly includes five missing clients from x11-apps-more,
Xft/ncurses profile gaps, noncatalog successes, unsuccessful/source-only trials,
and dated blockers whose applicability to c441 has not been tested.

Inspected historical records, did not execute their tests. Lightweight collector
cross-checked manifest enumeration, evidence existence/hashes and current outputs.
Ordinary HTTP GET compared public catalog to local bytes and live root HTML to
immutable candidate index, both exact. Initial /build.json requests returned
403 through urllib and 404 through curl; not a served identity endpoint.
Existing user/core-author candidate/live acceptance remains authoritative:
14 stages/803 hashes, six stages/722 hashes; unchanged artifacts. Core live runtime
c4411d720bede49ead5c1de69bfe7b1247656a146b72d991d209883606e300fb.
No browser tests were duplicated and no new live install was attempted.

Independent reviewer found two documentation defects at27c87ca: JWM and desktop
HEAD versions came from stale coverage rows, and collector working-tree reads
could misattribute future reruns. Corrected to actual pinned manifest versions
2.4.6-5 and0.1.0-3 and immutable Git blob/tree reads for both repositories.
Regeneration changes only those two version fields; disposition counts and
evidence remain unchanged. All156 selected historical evidence/manifest hashes
were verified against pinned Git blobs; current catalog validation passed.
