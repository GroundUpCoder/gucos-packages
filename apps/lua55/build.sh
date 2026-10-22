#!/bin/sh
set -eu
tar -xf source.tar
cd source
mkdir -p objects "$DESTDIR/bin" "$DESTDIR/lib" "$DESTDIR/include/lua5.5" "$DESTDIR/share/licenses/lua55"
for unit in src/lapi.c src/lauxlib.c src/lbaselib.c src/lcode.c src/lcorolib.c src/lctype.c src/ldblib.c src/ldebug.c src/ldo.c src/ldump.c src/lfunc.c src/lgc.c src/linit.c src/liolib.c src/llex.c src/lmathlib.c src/lmem.c src/loadlib.c src/lobject.c src/lopcodes.c src/loslib.c src/lparser.c src/lstate.c src/lstring.c src/lstrlib.c src/ltable.c src/ltablib.c src/ltm.c src/lundump.c src/lutf8lib.c src/lvm.c src/lzio.c; do
 cc -DLUA_USE_DLOPEN -Isrc -c "$unit" -o "objects/${unit##*/}.o"
done
ar rcs "$DESTDIR/lib/liblua5.5.a" objects/*.o
cc -Isrc src/lua.c "$DESTDIR/lib/liblua5.5.a" -lm -o "$DESTDIR/bin/lua55"
cp src/lua.h src/luaconf.h src/lualib.h src/lauxlib.h "$DESTDIR/include/lua5.5/"
cp src/lua.h "$DESTDIR/share/licenses/lua55/"
