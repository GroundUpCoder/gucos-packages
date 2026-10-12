#!/bin/sh
set -eu
tar -xf source.tar
stage="$DESTDIR"
mkdir -p "$stage/bin" "$stage/libexec" "$stage/share/applications" "$stage/share/doc/gtk-desk" "$stage/share/licenses/gtk-desk"
cp gtk-desk.desktop "$stage/share/applications/"
cp LICENSE-STATUS.txt "$stage/share/licenses/gtk-desk/"
cd source
export PKG_CONFIG_PATH=/usr/local/lib/gtk3-x11/pkgconfig:/usr/local/lib/pkgconfig
cc -O2 main.c $(pkgconf --cflags --libs gtk+-3.0) -L/usr/local/lib/gtk3-x11 -lintl -o "$stage/libexec/gtk-desk"
cp PORT.md "$stage/share/doc/gtk-desk/"
printf '#!/bin/sh\nexec gtk3-x11-run /usr/local/libexec/gtk-desk "$@"\n' > "$stage/bin/gtk-desk"
chmod 755 "$stage/bin/gtk-desk" "$stage/libexec/gtk-desk"
chmod 644 "$stage/share/applications/gtk-desk.desktop" "$stage/share/doc/gtk-desk/PORT.md" "$stage/share/licenses/gtk-desk/LICENSE-STATUS.txt"
