# GTK 3 Demo Gallery source candidate

Preserves all 22 historical files byte-for-byte from the pinned tree recorded
in provenance.json. source-inventory.json records each blob, mode, hash and size.
Fourteen original demo files plus COPYING match the historical UPSTREAM.json;
not every file is upstream. The local gallery launcher and historical installer,
manifest and acceptance helper are retained as provenance.

The owned X11 adapter compiles the original 15 translation units, including
colorsel-browser.c instead of colorsel.c. Its queue-draw workaround is preserved.
Only the owned launcher replaces the historical surface environment with
`gtk3-x11-run`. Exact dependencies and eight outputs are declared in the recipe
and output list. This includes the original five outputs, desktop entry,
upstream license copy and an explicit license-status notice. No kernel desktop
or session policy is added.

The staged headless test runs the actual executable with DISPLAY unset, compares
all fourteen demo names/titles in --list and --help, and checks exit 2 plus the
exact invalid-name diagnostic. It does not initialize GTK or accept GUI behavior.
No compilation or execution is claimed. Required later gates include independent
source/artifact review, installed consumer/reload, actual menu and bounded demo
interaction/model/rendering/close tests, public install and repeated execution.
Gallery and direct-launch scopes remain distinct; no persistence is claimed.

Publication is blocked on the local application license scope described in
LICENSE-STATUS.txt. Independent verification of official GTK 3.24.43 supports
LGPL-2.1-or-later attribution for the fourteen upstream demos. Its bundled
COPYING contains older version-2 text and is preserved unchanged; that text
discrepancy is documented separately from the unresolved local grant. The status
notice is not a grant.
