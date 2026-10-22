#!/bin/sh
set -eu
cc source/port/fribidi-accept.c -I"$DESTDIR/include/fribidi" -I/usr/local/include/glib-2.0 -I/usr/local/include "$DESTDIR/lib/libfribidi.a"  -lm -o static-test
./static-test
cc source/port/fribidi-accept.c -I"$DESTDIR/include/fribidi" -I/usr/local/include/glib-2.0 -I/usr/local/include -L"$DESTDIR/lib" -lfribidi  -lm -o shared-test
LD_LIBRARY_PATH="$DESTDIR/lib" ./shared-test
