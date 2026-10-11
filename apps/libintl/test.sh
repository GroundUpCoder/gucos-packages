#!/bin/sh
set -eu
sed 's|/usr/src/gettext/port/locale|source/port/locale|' source/port/test.c > consumer.c
cc consumer.c -I"$DESTDIR/include" "$DESTDIR/lib/libintl.a" -liconv -lm -o static-test
./static-test
cc consumer.c -I"$DESTDIR/include" -L"$DESTDIR/lib" -lintl -liconv -lm -o shared-test
LD_LIBRARY_PATH="$DESTDIR/lib" ./shared-test
