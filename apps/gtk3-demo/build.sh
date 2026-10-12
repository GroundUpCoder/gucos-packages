#!/bin/sh
set -eu
tar -xf source.tar
stage="$DESTDIR"
mkdir -p "$stage/bin" "$stage/libexec" "$stage/share/applications" "$stage/share/doc/gtk3-demo" "$stage/share/licenses/gtk3-demo"
cp gtk3-demo.desktop "$stage/share/applications/"
cp LICENSE-STATUS.txt "$stage/share/licenses/gtk3-demo/"
cd source
export PKG_CONFIG_PATH=/usr/local/lib/gtk3-x11/pkgconfig:/usr/local/lib/pkgconfig
cc -O2 main.c drawingarea.c panes.c editable_cells.c button_box.c entry_buffer.c colorsel-browser.c combobox.c entry_completion.c expander.c hypertext.c search_entry.c list_store.c tree_store.c flowbox.c $(pkgconf --cflags --libs gtk+-3.0) -L/usr/local/lib/gtk3-x11 -lintl -o "$stage/libexec/gtk3-demo"
cp COPYING UPSTREAM.json PORT.md "$stage/share/doc/gtk3-demo/"
cp COPYING "$stage/share/licenses/gtk3-demo/"
printf '#!/bin/sh\nexec gtk3-x11-run /usr/local/libexec/gtk3-demo "$@"\n' > "$stage/bin/gtk3-demo"
chmod 755 "$stage/bin/gtk3-demo" "$stage/libexec/gtk3-demo"
chmod 644 "$stage/share/applications/gtk3-demo.desktop" "$stage/share/doc/gtk3-demo/"* "$stage/share/licenses/gtk3-demo/"*
