#!/bin/sh
set -eu
for source in source/port/ttf-refresh-check.c source/port/check.c; do
 cc "$source" -I"$DESTDIR/include/minihb" -I/usr/local/include/freetype2 "$DESTDIR/lib/libminihb.a" -lfreetype -lm -lpthread -o static-test
 ./static-test source/port/fonts/NotoSans-Regular.ttf
 cc "$source" -I"$DESTDIR/include/minihb" -I/usr/local/include/freetype2 -L"$DESTDIR/lib" -lminihb -lfreetype -lm -lpthread -o shared-test
 LD_LIBRARY_PATH="$DESTDIR/lib" ./shared-test source/port/fonts/NotoSans-Regular.ttf
done
