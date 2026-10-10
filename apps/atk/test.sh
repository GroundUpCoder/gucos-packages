#!/bin/sh
set -eu
cc source/port/atk-accept.c -I"$DESTDIR/include/atk-1.0" -I/usr/local/include/glib-2.0 -I/usr/local/include "$DESTDIR/lib/libatk-1.0.a" -lgobject-2.0 -lglib-2.0 -lintl -lm -o static-test
./static-test
cc source/port/atk-accept.c -I"$DESTDIR/include/atk-1.0" -I/usr/local/include/glib-2.0 -I/usr/local/include -L"$DESTDIR/lib" -latk-1.0 -lgobject-2.0 -lglib-2.0 -lintl -lm -o shared-test
LD_LIBRARY_PATH="$DESTDIR/lib" ./shared-test
