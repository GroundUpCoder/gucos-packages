#!/bin/sh
set -eu
tar -xf source.tar
mkdir -p "$DESTDIR/lib/sqlite3" "$DESTDIR/share/licenses/sqlite-series"
cc -shared -fPIC -Isource source/ext/misc/series.c -o "$DESTDIR/lib/sqlite3/series.so"
cp source/ext/misc/series.c "$DESTDIR/share/licenses/sqlite-series/"
