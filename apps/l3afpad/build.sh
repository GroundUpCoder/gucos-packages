#!/bin/sh
set -eu
tar -xf source.tar
mkdir -p "$DESTDIR/bin" "$DESTDIR/libexec" "$DESTDIR/share/applications" "$DESTDIR/share/pixmaps" "$DESTDIR/share/doc/l3afpad" "$DESTDIR/share/licenses/l3afpad"
stage="$DESTDIR"
cd source
export PKG_CONFIG_PATH=/usr/local/lib/gtk3-x11/pkgconfig:/usr/local/lib/pkgconfig
cc -DHAVE_CONFIG_H -Iport -Isrc -I/usr/local/include/gtk3-x11 -I/usr/local/include/gtk3-x11/cairo src/main.c src/window.c src/menu.c src/callback.c src/view.c src/undo.c src/font.c src/linenum.c src/indent.c src/hlight.c src/selector.c src/file.c src/encoding.c src/search.c src/dialog.c src/dnd.c src/utils.c src/emacs.c src/gtksourceiter.c $(/usr/local/bin/pkgconf --cflags --libs gtk+-3.0) -L/usr/local/lib/gtk3-x11 -lintl -o "$stage/libexec/l3afpad"
cp data/l3afpad.png "$stage/share/pixmaps/"
cp PORT.md "$stage/share/doc/l3afpad/"
cp COPYING "$stage/share/licenses/l3afpad/"
cp ../licenses/GPL-2.0.txt "$stage/share/licenses/l3afpad/"
cp ../l3afpad.desktop "$stage/share/applications/"
printf '#!/bin/sh\nexec gtk3-x11-run /usr/local/libexec/l3afpad "$@"\n' > "$stage/bin/l3afpad"
chmod +x "$stage/bin/l3afpad"
