# GTK3 X11 software profile

Unpublished3.24.43 migration candidate. Exact GTK/X11 overlays and GTK/GIO
source trees retain pinned historical provenance. The adapter compiles the586
original GTK/GDK units. It omits the private Cairo build, X11 archive relinks,
private Cairo headers/pkg-config files and private X11 pkg-config overrides.
Cairo and X11 shared libraries are explicit public dependencies. GTK/GDK keep
their historical private gtk3-x11 library/header paths.

The recipe test currently checks shared linking/version only. Full guest GUI,
input, resize, clipboard, reload and composition acceptance remains pending.
Historical profile excludes GLArea, printing and AT-SPI bridge. Co-installation
with the later SDL GTK profile is not yet verified. No compatibility claim is
inferred from the source-level provider cleanup.
