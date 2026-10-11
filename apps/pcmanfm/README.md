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

The manifest preserves the historical 14 payload files (with the configuration relocation below) and adds an exact COPYING
copy at share/licenses/pcmanfm/COPYING (15 outputs). GPL notices remain in the
archive and historical share/doc location. The only desktop-entry delta adds
`--no-desktop` to the main launcher. This flag is a compatibility no-op in
this version; ordinary file-manager mode follows from omitting desktop and
daemon options. The retained desktop-preferences entry
is not acceptance of desktop-background management. The lxde menu-prefix fallback remains; XDG lookup is adapted as described below.

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

The owned adapter relocates the two historical `etc/xdg` outputs to
`share/pcmanfm/xdg/menus/lxde-applications.menu` and
`share/pcmanfm/xdg/pcmanfm/default/pcmanfm.conf`. Both retain exact source bytes
and mode 0644; the output count remains 15. The original archived launcher is
preserved. Its installed copy retains nonempty caller `XDG_CONFIG_DIRS`, uses
`/usr/local/etc/xdg:/etc/xdg` for unset/empty values, then appends
`/usr/local/share/pcmanfm/xdg:/usr/local/share/libfm/xdg`. The existing
`lxde-` fallback for unset/empty `XDG_MENU_PREFIX`, argv, and GTK delegation
remain. System config precedence follows unchanged upstream algorithms:
PCManFM applies directories forwards (later wins), whereas LibFM applies them
in reverse (first wins). User configuration is loaded afterward; its paths and
writes are unchanged. No core or global GTK policy is changed.

Tests compare both relocated files to their extracted source and check modes;
stub delegation checks unset/empty/custom XDG directories and menu prefixes,
including spaced/empty/literal-glob arguments. The headless consumer checks the
XDG-relative default profile's dimensions, not PCManFM GUI execution. Isolated
user/data/cache directories and a staged configuration root exercise relative
`applications.menu` discovery with `lxde-` through the installed generator and
an exact fixture desktop entry. These guest assertions await execution.
Source archive, inventory and provenance remain unchanged; all relocation
adaptations are recorded in owned build/test files.
