# Galculator owned C migration

The source archive retains all 132 historical blobs at the pinned revision,
including the nine C compilation units, checked-in Flex scanner, existing C
fixes, double-precision configuration, upstream origin, GPL text and notices.
No C++ translation or scanner regeneration is involved.

The recipe adapts staging and GTK3-X11 include/library/pkgconf paths and uses
its launcher. It preserves -rdynamic for GtkBuilder named callback exports.
The 24 outputs retain the historical application/UI/icon scope, with COPYING
in the package license directory. Translations and extra upstream artwork are
not added to the historical payload.

The staged test checks payload presence and GTK dependency linking. It does
not launch galculator: main calls gtk_init before argument parsing. Source
build, real menu launch, callback arithmetic/scientific input, quit/relaunch,
browser reload, independent review and public gates remain required.
