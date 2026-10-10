#!/bin/sh
set -eu
tar -xf source.tar
mkdir -p "$DESTDIR/lib" "$DESTDIR/include/cjson" "$DESTDIR/share/licenses/cjson"
cc -O2 -Isource -c source/cJSON.c -o cJSON.o
ar rcs "$DESTDIR/lib/libcjson.a" cJSON.o
cc -shared cJSON.o -Wl,-soname,libcjson.so -o "$DESTDIR/lib/libcjson.so"
cp source/cJSON.h "$DESTDIR/include/cjson/cJSON.h"
cp source/LICENSE "$DESTDIR/share/licenses/cjson/LICENSE"
