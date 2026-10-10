# Cairo

Unpublished Cairo 1.18.4 candidate: one public image/PNG/FreeType/Xlib/Xrender
provider for both non-X consumers and GTK X11. Reuses the historical GTK X11
Cairo source list and three explicit overlays, now as a single public library.
No private libcairo.so is intended in GTK. Source and overlays are byte-preserved;
this is a new build profile requiring fresh guest acceptance, not an old binary
retag. No source build, relink, rendering or GTK composition acceptance has run.
