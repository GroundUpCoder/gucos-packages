#!/bin/sh
set -eu
# Use the staged archive explicitly, then independently exercise the DSO.
cc source/src/test/example.c -I"$DESTDIR/include" "$DESTDIR/lib/libz.a" -o zlib-static-test
./zlib-static-test
cc source/src/test/example.c -I"$DESTDIR/include" -L"$DESTDIR/lib" -lz -o zlib-shared-test
LD_LIBRARY_PATH="$DESTDIR/lib" ./zlib-shared-test
