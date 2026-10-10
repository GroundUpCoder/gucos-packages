#!/bin/sh
set -eu
cp source/port/check.c consumer.c
cc consumer.c -I"$DESTDIR/include" "$DESTDIR/lib/libffi.a" -lm -o static-test
./static-test
cc consumer.c -I"$DESTDIR/include" -L"$DESTDIR/lib" -lffi -lm -o shared-test
LD_LIBRARY_PATH="$DESTDIR/lib" ./shared-test
