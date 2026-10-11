# gdk-pixbuf

Unpublished 2.42.12 historical configured profile. Exact original source and
port adaptations are retained in source.tar. Separate adapter installs declared
headers, static/shared libraries, pkg-config metadata and original licenses.
Static/shared consumers use retained historical codec tests. No fresh guest
build, binary installation or publication acceptance has run.

The separate JPEG integration consumer encodes a red image with Turbo, feeds
its bytes through GdkPixbuf's JPEG loader, and checks dimensions/channels/pixels
for static and shared links. This complements the original PNG/scaling test.
