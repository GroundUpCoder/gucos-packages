# libfm and bundled menu-cache source candidate

`source.tar` preserves all 400 blobs under `apps/libfm/source` at historical
commit `0b9b3245fe11a3bc677d81113cba90cd0ae80446`, including the adapted
libfm 1.3.2 and menu-cache 1.1.0, generated headers/configuration, marshal code,
source lists and original install/test inputs. `source-inventory.json` records
Git modes, blob IDs and SHA256 identities; `provenance.json` binds the archive
and inventory. The unchanged historical `sources.lock.json` records upstream
archive identities, not the digest of this owned adapted archive.

The direct `build.sh` adapts retained `source/install.sh`: extraction and build
are local, staging uses DESTDIR, and pkgconf comes from the current package.
No normal build reads a historical checkout. Core/GTK lists retain 35/37 units.
menu-cache remains bundled because its generator needs libfm-extra and libfm
needs menu-cache. Separate libraries, six modules, two GTK helpers, generated
menu-cache 1.1.0 header, WASM_POSIX, DISABLE_DAEMONIZE and the historical spawn
adaptations are retained. Installed paths and pkg-config prefixes stay
`/usr/local`; staging paths are never baked into installed metadata.

Exact direct requirements are gtk3-x11 3.24.43-1, gio-core 2.84.4-1,
pkgconf 2.3.0-1 and libintl 0.23.1-1. `outputs.json` declares the historical
109 payload files (with the configuration relocation below) plus two explicit `share/licenses/libfm` copies: 111 total.
The GPLv2 COPYING and menu-cache LGPL2.1 COPYING remain in the historical doc
locations too. Individual LGPL2.1-or-later and Exo-derived LGPL2-or-later
notices remain in the exact source archive; this bundle is not uniformly GPL.

`consumer.c` adapts retained `source/tests/consumer.c`: isolated compile-time
fixture root, path normalization, detailed directory enumeration, recursive
copy/move/delete, and exact nested/hello bytes after moving. `test.sh` compiles
against the staged headers/libraries and independently generates and checks a
fixture desktop-menu cache. Neither needs an X server. With DESTDIR exactly
`/usr/local`, it additionally tests retained synchronous menu lookup through
an isolated foreground daemon, with known PID cleanup and retained guest log.
Staged runs explicitly leave installed menu lookup pending: the daemon's
compiled generator path is `/usr/local/libexec/menu-cache`. This managed-daemon
test does not prove libmenu-cache's automatic daemon startup; that installed
lifecycle gate remains separate. Temporary evidence directories are retained.

Preparation is not build, export, binary, GUI or publication acceptance.
Application/terminal/custom-action launching remains blocked by non-null
child-setup callbacks in fm-app-info, fm-terminal and fm-action against current
GLib spawning. No assertion is made about these callbacks, helper GUI behavior,
remote backends, FIFO copying or removable media. Fresh installed consumer,
auto-start lifecycle and reload gates remain before those scopes are accepted.

The owned adapter relocates `etc/xdg/libfm/libfm.conf` to
`share/libfm/xdg/libfm/libfm.conf`, preserving its exact bytes and mode 0644.
The separate `share/libfm/libfm.conf` copy remains. This fits gucman's allowed
output roots without changing core policy or the 111-file contract.
Both helper launchers preserve nonempty caller `XDG_CONFIG_DIRS`, default
unset/empty values to `/usr/local/etc/xdg:/etc/xdg`, and append
`/usr/local/share/libfm/xdg`. They preserve menu-prefix environment and argv
and delegate to `gtk3-x11-run`. Standalone library consumers must include this
configuration root themselves; no global GLib/GTK environment is changed.
LibFM reads system directories in reverse order (first directory wins), then
user configuration. User configuration paths and writes remain unchanged.

Tests compare relocated bytes to the retained extracted source and check file
modes. Stub GTK delegation checks unset, empty and custom XDG environments,
menu-prefix preservation, and spaced/empty/literal-glob arguments. A separate
headless consumer invocation uses an isolated user directory and the staged
configuration root, sets sentinel values, and asserts actual LibFM config
loading. The existing private menu generator/managed-daemon tests keep their
original isolated XDG roots. These new guest assertions await execution.
Original historical source archive, inventory and provenance remain unchanged;
relocation and launcher changes exist only in the owned build/test adapters.

Consumer file checks distinguish regular staged files from gucman-installed
managed links. Installed checks require the exact package/current link, owned
path entry, canonical release payload and original regular-file mode. Config
bytes and launcher environment/argument checks remain unchanged. The original
silent failure did not trace its exact failing assertion. Revised test pins
require explicit review and rebuilt receipts before further acceptance.
