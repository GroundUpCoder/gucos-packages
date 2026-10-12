# GTK Desk source candidate

Owns all five byte-exact files from `vendor/gtk-desk` at historical revision
`0b9b3245fe11a3bc677d81113cba90cd0ae80446`. `source-inventory.json` records
Git blob identities, modes, sizes and SHA-256 hashes; `provenance.json` binds
the archive and inventory. Original main.c, installer, PORT.md, historical
manifest and historical browser test remain unchanged in source.tar.

The original 120-line C program supplies a left-to-right four-operation
calculator, solvable Lights Out (including one-move practice), and session-only
appearance/hint controls. Escape destroys its window and exits the GTK loop.
There is no saved-game or settings persistence contract.

The owned recipe uses GTK3-X11 pkgconf paths and `gtk3-x11-run` for the private
shared-library search path. It replaces the historical WASM_POSIX_SURFACES
launcher with an X11 launcher and adds a desktop entry. It neither implements
a desktop session nor adds kernel window policy. main.c is unmodified; the
historical compiler flags -O2 and -lintl are retained. Version 0.1.0-3 identifies
this adapter, following historical 0.1.0-2. gio-core is an explicit dependency
consistent with existing GTK3-X11 application recipes.

Exact five-output contract: bin/gtk-desk, libexec/gtk-desk,
share/applications/gtk-desk.desktop, share/doc/gtk-desk/PORT.md and
share/licenses/gtk-desk/LICENSE-STATUS.txt. The last file is a provenance notice,
not a license grant: the pinned tree has no license text or source license
notice, and its manifest declares licenses: []. No license is inferred from
GTK or another application. Authoritative licensing clarification is required
before publication. The checker validates notice presence, not license rights.

The staged test checks payload presence and compiles/runs a headless GTK3.24.43
SDK linking consumer through the same loader wrapper. It does not execute the
application, test its callbacks or prove GUI readiness. No compilation or test
execution is claimed by this source preparation.

Required gates: independent source review, license clarification, guest source
build/export, exact artifact review, installed consumers, real owned-menu
launch, calculator results/error recovery, Lights Out practice solve/new-game,
session controls, Escape/PID exit/terminal restoration, fresh browser reload
with unchanged package identity, and public install/function/reload review.
Reload means relaunching a session-local application; settings/game persistence
must not be inferred. Original historical tests require their old harness and
are retained solely as provenance, not invoked by the owned recipe.
