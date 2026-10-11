#!/bin/sh
set -eu
cc source/port/gio-core-accept.c -I"$DESTDIR/include/gio-core-2.0" -I/usr/local/include/glib-2.0 -I/usr/local/include "$DESTDIR/lib/libgio-core.a" "$DESTDIR/lib/libgmodule-2.0.a" -lgio-listmodel -lgobject-2.0 -lglib-2.0 -lz -lintl -lm -o static-test
./static-test
cc source/port/gio-core-accept.c -I"$DESTDIR/include/gio-core-2.0" -I/usr/local/include/glib-2.0 -I/usr/local/include -L"$DESTDIR/lib" -lgio-core -lgmodule-2.0 -lgio-listmodel -lgobject-2.0 -lglib-2.0 -lz -lintl -lm -o shared-test
LD_LIBRARY_PATH="$DESTDIR/lib" ./shared-test
