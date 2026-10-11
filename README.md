# gucos packages

Runtime package sources for the standalone browser OS. Neither the OS build nor
its hosting deployment reads this checkout. Browser gucman discovers catalog.json,
verifies pinned manifests and inputs, and builds or installs explicitly requested
packages. Additional repositories can implement the same protocol.

Recipes are trusted shell programs with access to the user's guest filesystem.
Adding a source permits discovery; `gucman build` explicitly executes its recipe.
Host C++ preparation must publish declared prepared inputs; guest Clang is not implied.

Package inputs live under apps/. Catalog records refer to immutable Git commits
and SHA256/size-pinned manifests. Keep upstream URLs and license provenance with each
package. Binaries may live in release assets or another CORS-enabled object store.
Publishing recipes does not assert binary compatibility or independent acceptance.
The repository is public. Anonymous browser access is verified separately from
source publication; see the recorded acceptance evidence when available.

## Desktop and development packages

The expansion adds JWM, xterm, xcalc, xclock, xeyes, xlogo, xlsfonts, xkill,
xrefresh, xmessage, xprop, xev, Lua, Zstandard and the XPM/Athena widget libraries.
JWM is the desktop session; twm remains an optional existing package.

```sh
gucman search jwm
gucman install groundupcoder:jwm
gucman install groundupcoder:xterm
gucman install groundupcoder:xcalc
gucman install groundupcoder:xclock
gucman install groundupcoder:xeyes
start-jwm
```

Optional clients appear in JWM's menu when installed. “Refresh applications”
updates the menu during a session. Exit from the menu closes the launcher-owned
session. The OS terminal VT remains available. This is software X11 with core
fonts, not accelerated X11. Lua uses its portable ISO C profile without `io.popen`
or dynamic module loading. Zstandard includes the CLI and static development
library, with assembly and legacy-format support disabled.

The expansion supplies guest-built binaries for those 15 packages plus the X11
server and toolkit. The original binaries retain their 2a9cca build provenance and are accepted by
platform 1.0 through its verified legacy mapping; source builds use
`gucman build groundupcoder:NAME`. Existing jsmn has a binary;
twm remains source-only. Package READMEs document each supported profile.
Acceptance, immutable publication and independent review are recorded in
[the expansion journal](docs/logs/2026-10-10/package-expansion.md).

Future builds and publications follow the [platform package contract](docs/package-publication.md). Existing catalog and binary metadata remain unchanged.

The historical migration now also publishes zlib, cJSON, pkgconf, bzip2,
bzip2recover and Expat. Their guest source/binary/installed-consumer/reload gates
and live public installation passed on platform 1.0.1. This is the first six-package
foundation increment, not completion of the historical queue. Other new source
candidates under apps/ are not installable until added to the catalog after review
and acceptance. See docs/research/package-migration/queue.json and the migration
journal for exact per-item scope and remaining work.
