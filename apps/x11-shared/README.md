# X11 shared libraries

Unpublished candidate providing Xau, xcb, X11, Xext, Xrender, Xfixes, Xi and
Xtst DSOs by guest relinking installed x11-server static archives. Existing
archives and their provenance remain unchanged; these are new derived artifacts.
The historical x11-shared recipe/source is preserved in source.tar for provenance.
This profile extends its three-library set for Cairo/GTK dependencies.
Licenses are copied from the actual installed baseline dependency, including
libX11 lcUniConv notices. Headers and pkg-config files remain owned by x11-server.
No build, relink, installed consumer or X server connection acceptance has run.
