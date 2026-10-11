#!/bin/sh
set -eu
cc source/port/test.c -I"$DESTDIR/include/glib-2.0" -I/usr/local/include/glib-2.0 -I/usr/local/include "$DESTDIR/lib/libglib-2.0.a" -lpcre2-8 -lintl -liconv -lm -o static-test
./static-test
cc source/port/test.c -I"$DESTDIR/include/glib-2.0" -I/usr/local/include/glib-2.0 -I/usr/local/include -L"$DESTDIR/lib" -lglib-2.0 -lpcre2-8 -lintl -liconv -lm -o shared-test
LD_LIBRARY_PATH="$DESTDIR/lib" ./shared-test
