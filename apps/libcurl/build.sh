#!/bin/sh
set -eu
mkdir -p "$DESTDIR/lib" "$DESTDIR/include/curl" "$DESTDIR/share/licenses/libcurl"
cc -O2 -Iinclude -c curl.c -o curl.o
ar rcs "$DESTDIR/lib/libcurl.a" curl.o
cp include/curl/curl.h "$DESTDIR/include/curl/curl.h"
cp LICENSE "$DESTDIR/share/licenses/libcurl/LICENSE"
