#!/bin/sh
set -eu
tar -xzf prepared.tar.gz -C source/port
cc source/port/consumer.c -Isource/port/generated/include -I/usr/local/include/freetype2 -I/usr/local/include/glib-2.0 -I/usr/local/include "$DESTDIR/lib/libharfbuzz.a" "$DESTDIR/lib/libharfbuzz-runtime.a" -lglib-2.0 -lpcre2-8 -lintl -liconv -lz -lfreetype -lm -o static-test
./static-test source/tests/fonts/a59fd13f1525a91cbe529c882e93d9d1fbb80463.ttf source/port/fonts/ABeeZee-Regular.ttf
