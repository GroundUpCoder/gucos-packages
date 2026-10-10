#!/bin/sh
set -eu
# Adapt both retained Arabic and CJK fixtures without changing source.tar.
sed 's@/usr/src/pango/@source/@g' source/port/check.c > consumer.c
cc consumer.c -DPANGO_TEST_CJK_FONT='"source/port/fonts/cjk-subset.otf"' -I"$DESTDIR/include/pango-1.0" -I/usr/local/include/glib-2.0 -I/usr/local/include/cairo -I/usr/local/include/freetype2 -I/usr/local/include/harfbuzz -I/usr/local/include/fribidi -I/usr/local/include "$DESTDIR/lib/libpangocairo-1.0.a" "$DESTDIR/lib/libpangoft2-1.0.a" "$DESTDIR/lib/libpango-1.0.a" -lgio-listmodel -lgobject-2.0 -lglib-2.0 -lharfbuzz -lharfbuzz-runtime -lpcre2-8 -lintl -liconv -lz -lfribidi -lfontconfig -lfreetype -lcairo -lm -o static-test
./static-test
cc consumer.c -DPANGO_TEST_CJK_FONT='"source/port/fonts/cjk-subset.otf"' -I"$DESTDIR/include/pango-1.0" -I/usr/local/include/glib-2.0 -I/usr/local/include/cairo -I/usr/local/include/freetype2 -I/usr/local/include/harfbuzz -I/usr/local/include/fribidi -I/usr/local/include -L"$DESTDIR/lib" -lpangocairo-1.0 -lpangoft2-1.0 -lpango-1.0 -lgio-listmodel -lgobject-2.0 -lglib-2.0 -lharfbuzz -lharfbuzz-runtime -lpcre2-8 -lintl -liconv -lz -lfribidi -lfontconfig -lfreetype -lcairo -lm -o shared-test
LD_LIBRARY_PATH="$DESTDIR/lib" ./shared-test
