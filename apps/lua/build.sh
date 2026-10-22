#!/bin/sh
set -eu
tar -xzf source.tar.gz
cd lua-5.4.9/src
mkdir -p objects "$DESTDIR/bin" "$DESTDIR/lib" "$DESTDIR/include" "$DESTDIR/share/licenses/lua"
for file in *.c; do
 case "$file" in lua.c|luac.c) continue;; esac
 cc -O2 -c "$file" -o "objects/${file%.c}.o"
done
ar rcs "$DESTDIR/lib/liblua.a" objects/*.o
cc -O2 lua.c "$DESTDIR/lib/liblua.a" -lm -o "$DESTDIR/bin/lua"
cc -O2 luac.c "$DESTDIR/lib/liblua.a" -lm -o "$DESTDIR/bin/luac"
cp lua.h luaconf.h lualib.h lauxlib.h lua.hpp "$DESTDIR/include/"
cp lua.h "$DESTDIR/share/licenses/lua/lua.h"
