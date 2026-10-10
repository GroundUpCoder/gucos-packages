#!/bin/sh
set -eu
fixtures="$PWD/source/upstream/test"
cc -I"$DESTDIR/include" source/port/check.c -L"$DESTDIR/lib" -lSDL3_image -lSDL3 -lm -o shared-test
cc -I"$DESTDIR/include" source/port/check.c "$DESTDIR/lib/libSDL3_image.a" -lSDL3 -lm -o static-test
LD_LIBRARY_PATH="$DESTDIR/lib:/usr/local/lib" ./shared-test "$fixtures"
./static-test "$fixtures"
cp roundtrip.png /tmp/migration-sdl3-image-roundtrip.png
