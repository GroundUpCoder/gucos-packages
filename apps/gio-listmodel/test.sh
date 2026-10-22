#!/bin/sh
set -eu
cc source/port/gio-listmodel-accept.c -I"$DESTDIR/include/glib-2.0" -I/usr/local/include/glib-2.0 -I/usr/local/include "$DESTDIR/lib/libgio-listmodel.a" -lgobject-2.0 -lglib-2.0 -lm -o static-test
./static-test
cc source/port/gio-listmodel-accept.c -I"$DESTDIR/include/glib-2.0" -I/usr/local/include/glib-2.0 -I/usr/local/include -L"$DESTDIR/lib" -lgio-listmodel -lgobject-2.0 -lglib-2.0 -lm -o shared-test
LD_LIBRARY_PATH="$DESTDIR/lib" ./shared-test
