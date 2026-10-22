#!/bin/sh
set -eu
mkdir -p "$DESTDIR/lib" "$DESTDIR/share/licenses/x11-shared" objects
for lib in Xau xcb X11 Xext Xrender Xfixes Xi Xtst; do
 mkdir "objects/$lib"
 (cd "objects/$lib" && ar x "/usr/local/lib/lib$lib.a")
 case "$lib" in
  Xau) deps=;;
  xcb) deps='-lXau';;
  X11) deps='-lxcb -lXau';;
  Xext|Xrender|Xfixes) deps='-lX11';;
  Xi) deps='-lXext -lX11';;
  Xtst) deps='-lXi -lXext -lX11';;
 esac
 cc -shared "objects/$lib/"*.o -L"$DESTDIR/lib" $deps -Wl,-soname,lib$lib.so -o "$DESTDIR/lib/lib$lib.so"
 cp "/usr/local/share/licenses/x11-server/lib$lib-COPYING" "$DESTDIR/share/licenses/x11-shared/"
done
cp /usr/local/share/licenses/x11-server/libX11-lcUniConv-COPYRIGHT "$DESTDIR/share/licenses/x11-shared/"
