# Cairo

Cairo 1.18.4: one public image/PNG/FreeType/Xlib/Xrender
provider for both non-X consumers and GTK X11. Reuses the historical GTK X11
Cairo source list and three explicit overlays, now as a single public library.
No private libcairo.so is intended in GTK. Source and overlays are byte-preserved;
this new source build passed image/PNG, static/shared, Xlib/FreeType rendering
and installed font checks. Full GTK composition acceptance remains pending.

Published after independent approval of85a890a. Fresh public installation,
installed consumers/rendering and reload output/parsed-manifest integrity passed
on runtime61a87f8861fa6ddaa6052eb25408036a2bcb238ad4b8e48dd91303beb36714d0.
Evidence: docs/research/package-migration/batch-04 at repository root.
