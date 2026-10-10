#!/bin/sh
set -eu
cc source/test/test-name-parse.c -I"$DESTDIR/include" -I/usr/local/include/freetype2 "$DESTDIR/lib/libfontconfig.a" -lfreetype -lexpat -lm -o fontconfig-static-test
./fontconfig-static-test
cc source/test/test-name-parse.c -I"$DESTDIR/include" -I/usr/local/include/freetype2 -L"$DESTDIR/lib" -lfontconfig -lfreetype -lexpat -lm -o fontconfig-shared-test
LD_LIBRARY_PATH="$DESTDIR/lib" ./fontconfig-shared-test
