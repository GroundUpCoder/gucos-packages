# feh

Unpublished 3.13.1 candidate preserving the exact historical source, three C
overlays, generated headers, fonts and image assets. The owned recipe uses the
migrated Imlib2 and X11 library providers. gtk3-x11 supplies the launcher wrapper;
Feh itself uses X11/Imlib2. The package owns its desktop entry and license files.

Source tests exercise version reporting and exact PNG dimensions for a file and
a two-image directory using the retained fixture generator. No source, installed,
GUI or reload execution has run. Real menu/image navigation, visible pixels,
normal exit and browser reload remain separate required acceptance gates.

The retained wallpaper header includes X11/Intrinsic.h. The exact
x11-toolkit 1.0-1 dependency supplies that header; no Xt symbols or additional
Xt linkage are required. The first source attempt failed on this undeclared
header provider before producing a Feh binary.
