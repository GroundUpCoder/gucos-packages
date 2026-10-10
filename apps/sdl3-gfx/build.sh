#!/bin/sh
set -eu
tar -xf source.tar
stage="$DESTDIR"
cd source
mkdir -p "$stage/lib/pkgconfig" "$stage/include/SDL3_gfx" "$stage/objects"
cc -O2 -fPIC -D__inline=inline -c src/SDL_gfxPrimitives.c -o "$stage/objects/gfx.o"
ar rcs "$stage/lib/libSDL3_gfx.a" "$stage/objects/gfx.o"
cc -shared "$stage/objects/gfx.o" -lSDL3 -lm -Wl,-soname,libSDL3_gfx.so -o "$stage/lib/libSDL3_gfx.so"
cp src/SDL_gfxPrimitives.h "$stage/include/SDL3_gfx/"
cp port/SDL3_gfx.pc "$stage/lib/pkgconfig/"
rm -r "$stage/objects"

mkdir -p "$stage/share/licenses/sdl3-gfx"
cp LICENSE "$stage/share/licenses/sdl3-gfx/LICENSE"
