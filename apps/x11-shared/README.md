# X11 shared libraries

Provides Xau, xcb, X11, Xext, Xrender, Xfixes, Xi and
Xtst DSOs by guest relinking installed x11-server static archives. Existing
archives and their provenance remain unchanged; these are new derived artifacts.
The historical x11-shared recipe/source is preserved in source.tar for provenance.
This profile extends its three-library set for Cairo/GTK dependencies.
Licenses are copied from the actual installed baseline dependency, including
libX11 lcUniConv notices. Headers and pkg-config files remain owned by x11-server.
Guest relinking, installed consumers and X server/extension checks passed.

Published after independent approval of85a890a. Fresh public installation,
installed consumers/rendering and reload output/parsed-manifest integrity passed
on runtime61a87f8861fa6ddaa6052eb25408036a2bcb238ad4b8e48dd91303beb36714d0.
Evidence: docs/research/package-migration/batch-04 at repository root.
