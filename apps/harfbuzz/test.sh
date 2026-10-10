#!/bin/sh
set -eu
cc source/port/consumer.c -I"$DESTDIR/include/harfbuzz" -I/usr/local/include/freetype2 -I/usr/local/include/glib-2.0 -I/usr/local/include "$DESTDIR/lib/libharfbuzz.a" "$DESTDIR/lib/libharfbuzz-runtime.a" -lglib-2.0 -lpcre2-8 -lintl -liconv -lz -lfreetype -lm -o static-test
./static-test source/tests/fonts/a59fd13f1525a91cbe529c882e93d9d1fbb80463.ttf source/port/fonts/ABeeZee-Regular.ttf
cc source/port/consumer.c -I"$DESTDIR/include/harfbuzz" -I/usr/local/include/freetype2 -I/usr/local/include/glib-2.0 -I/usr/local/include -L"$DESTDIR/lib" -lharfbuzz "$DESTDIR/lib/libharfbuzz-runtime.a" -lglib-2.0 -lpcre2-8 -lintl -liconv -lz -lfreetype -lm -o shared-test
LD_LIBRARY_PATH="$DESTDIR/lib" ./shared-test source/tests/fonts/a59fd13f1525a91cbe529c882e93d9d1fbb80463.ttf source/port/fonts/ABeeZee-Regular.ttf
