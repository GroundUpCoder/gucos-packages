# PCManFM source candidate

`source.tar` preserves all 124 blobs under `apps/pcmanfm/source` at historical
commit `0b9b3245fe11a3bc677d81113cba90cd0ae80446`: PCManFM 1.3.2,
configuration, wrapper, applications.menu and historical recipe. Provenance
binds the owned archive and source inventory (Git IDs, modes and SHA256).
The unchanged historical sources.lock.json preserves original upstream
archive provenance. None of the ordinary build inputs reads an old checkout.

`build.sh` adapts the retained direct nine-unit install recipe to the owned
extraction root, local build directory and DESTDIR. Current pkgconf replaces
the retired private tool; public Cairo flags come from pkgconf, not the retired
private GTK Cairo include path. Existing AF_UNIX startup adaptation is retained.
Dependencies bind libfm 1.3.2-1, gtk3-x11 3.24.43-1, pkgconf 2.3.0-1,
libintl 0.23.1-1 and x11-shared 0.1.0-1. Build/install libfm first.

The manifest preserves the historical 14 outputs and adds an exact COPYING
copy at share/licenses/pcmanfm/COPYING (15 outputs). GPL notices remain in the
archive and historical share/doc location. The only desktop-entry delta adds
`--no-desktop` to the main launcher. The retained desktop-preferences entry
is not acceptance of desktop-background management. Wrapper XDG configuration
and lxde menu prefix remain unchanged.

The headless source test verifies staged payload/launcher and compiles the
installed module SDK header against libfm/GTK. Its retained-consumer adaptation
checks normalized local paths, detailed enumeration and exact fixture bytes.
This is SDK/dependency coverage, not execution of PCManFM or its GUI.

Fresh source build/export, private binary and public gates remain. Initial
application scope is local file operations: actual JWM file-manager launch,
physical Ctrl+L navigation, directory creation, copy/rename/move/delete with
exact disk verification, normal physical close/PID exit, relaunch and persisted
fresh-session reload. Capture renamed labels before F5; label any refresh-
assisted result. Historical GIO/unref/menu-detach diagnostics, incomplete icons,
stale labels and unverified SIGTERM shutdown require fresh observation.
Existing-instance IPC/two-window behavior needs its own gate.

Application, terminal and custom-action launch callbacks in libfm are not
claimed to work with current GLib. Helper applications, desktop preferences,
GVfs, removable media and desktop takeover are outside initial fileops scope.
