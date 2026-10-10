#!/bin/sh
set -eu
cc source/port/check.c -I"$DESTDIR/include/cairo" -I/usr/local/include/cairo -I/usr/local/include/glib-2.0 "$DESTDIR/lib/libcairo-gobject.a" -lcairo -lgobject-2.0 -lglib-2.0 -o static-test
./static-test
cc source/port/check.c -I"$DESTDIR/include/cairo" -I/usr/local/include/cairo -I/usr/local/include/glib-2.0 -L"$DESTDIR/lib" -lcairo-gobject -lcairo -lgobject-2.0 -lglib-2.0 -o shared-test
LD_LIBRARY_PATH="$DESTDIR/lib" ./shared-test
