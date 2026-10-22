#!/bin/sh
set -eu
cc -I"$DESTDIR/include" test.c "$DESTDIR/lib/libcurl.a" -o curl-test
./curl-test
