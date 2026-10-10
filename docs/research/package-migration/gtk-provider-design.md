# GTK/Cairo provider migration

Implementation design, pending independent review and guest acceptance. This is
not a compatibility result. Historical evidence is pinned to
`0b9b3245fe11a3bc677d81113cba90cd0ae80446` in wasm-posix-old.

Observed: `docs/logs/2026-10-10/gtk3-source-composition-blocker.md` records two
different objects declaring SONAME libcairo.so: public Cairo and GTK's private
Xlib-enabled Cairo. Pango and cairo-gobject bring the public provider into the
closure. `apps/gtk3-x11/source/install.sh` builds its private X libraries from
static archives, then compiles 130 Cairo units plus GDK/GTK and puts all their
DSOs into lib/gtk3-x11. The historical validator rejected that closure. This is
an observed historical package conflict, not a demonstrated current core defect.

The new package design uses one public Cairo provider, with the historical
Xlib/Xrender overlays and 130-unit source list moved into apps/cairo. It retains
image, PNG and FreeType support. pixman, FreeType, Fontconfig and libpng remain
separate packages; X11 DSOs belong to x11-shared. No baseline19 archive or metadata
is rewritten. x11-shared derives new DSOs by guest relinking the accepted static
archives; this does not change their original provenance or prove new relinking.

GTK3-X11 must depend on this Cairo and x11-shared, remove its private Cairo/X
builds and corresponding output declarations, and link against their public
paths. Pango and cairo-gobject must resolve the same exact Cairo version. Private
GTK/GDK paths may remain for backend separation; they must not introduce a second
Cairo provider. Do not claim the SDL GTK and X11 GTK variants are one compatible
backend merely because they share upstream version/SONAME. Their mixed-closure
scope remains an explicit later design/acceptance item.

Current concrete files are the Cairo, pixman, freetype, fontconfig, libpng and
x11-shared candidates. GTK/Pango/cairo-gobject migration is still queued. A design
on paper is not resolution of the old blocker: keep it open until the complete
new closure passes provider/output validation and actual guest installation.

Required acceptance: independent review of the complete closure; guest source
builds; retained static-library consumers; installed shared consumers; Cairo
image/PNG/FreeType and Xlib drawing; GTK text/input/resource rendering; Scintilla's
prepared-source provenance and execution; reload and cross-package installation.
No validator weakening, omitted dependency, synthetic runtime receipt or old
binary retag is part of this design.

## Concrete X11 adapter

apps/gtk3-x11 now retains pinned GTK/GIO source archives and X11 overlays, and
compiles the original586 GTK/GDK units. Private Cairo compilation, private X11
relinks, Cairo headers and Cairo/X11 pkg-config overrides are removed from the
adapter. It retains only GTK/GDK private library/header paths and depends on
public Cairo/x11-shared. The original build script remains untouched in source.tar.
This is source preparation, not a passed composition or GUI result. The original
blocker remains open until actual full closure acceptance; SDL GTK co-installation
also remains unverified.
