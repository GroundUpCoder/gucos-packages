#!/bin/sh
set -eu
cp source/port/test.c consumer.c
cc consumer.c -I"$DESTDIR/include" "$DESTDIR/lib/libiconv.a" -lm -o static-test
./static-test
cc consumer.c -I"$DESTDIR/include" -L"$DESTDIR/lib" -liconv -lm -o shared-test
LD_LIBRARY_PATH="$DESTDIR/lib" ./shared-test
