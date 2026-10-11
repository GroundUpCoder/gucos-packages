#!/bin/sh
set -eu
fixtures="$PWD/source/port/fixtures"
cc -I"$DESTDIR/include" source/port/check.c -L"$DESTDIR/lib" -lSDL3_mixer -lm -lpthread -o shared-test
cc -I"$DESTDIR/include" source/port/check.c "$DESTDIR/lib/libSDL3_mixer.a" -lm -lpthread -o static-test
LD_LIBRARY_PATH="$DESTDIR/lib:/usr/local/lib" ./shared-test "$fixtures"
./static-test "$fixtures"
