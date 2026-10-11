#!/bin/sh
set -eu
cp source/port/pcre2-accept.c consumer.c
cc consumer.c -I"$DESTDIR/include" "$DESTDIR/lib/libpcre2-8.a" -lm -o static-test
./static-test
cc consumer.c -I"$DESTDIR/include" -L"$DESTDIR/lib" -lpcre2-8 -lm -o shared-test
LD_LIBRARY_PATH="$DESTDIR/lib" ./shared-test
