#!/bin/sh
set -eu
cc source/port/pixman-accept.c -I"$DESTDIR/include/pixman-1" "$DESTDIR/lib/libpixman-1.a" -lm -o pixman-static-test
./pixman-static-test
cc source/port/pixman-accept.c -I"$DESTDIR/include/pixman-1" -L"$DESTDIR/lib" -lpixman-1 -lm -o pixman-shared-test
LD_LIBRARY_PATH="$DESTDIR/lib" ./pixman-shared-test
