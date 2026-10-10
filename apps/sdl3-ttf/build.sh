#!/bin/sh
# Upstream SDL_ttf software-text port against installed SDL3, FreeType and HarfBuzz.
set -eu
tar -xf source.tar
stage="$DESTDIR"
cd source/upstream
mkdir -p "$stage/lib" "$stage/include/SDL3_ttf" "$stage/lib/pkgconfig" "$stage/objects"
objects=
for source in SDL_ttf SDL_hashtable SDL_hashtable_ttf SDL_surface_textengine; do
  cc -msse2 -Iinclude -I/usr/local/include/freetype2 -I/usr/local/include/harfbuzz \
    -DTTF_USE_HARFBUZZ=1 -DTTF_USE_MINIHB=0 -DTTF_USE_PLUTOSVG=0 \
    -c "src/$source.c" -o "$stage/objects/$source.o"
  objects="$objects $stage/objects/$source.o"
done
ar rcs "$stage/lib/libSDL3_ttf.a" $objects
cc -shared $objects -lSDL3 -lharfbuzz -lharfbuzz-runtime -lglib-2.0 -lpcre2-8 -lintl -liconv -lz -lfreetype -lm -lpthread \
  -Wl,-soname,libSDL3_ttf.so -o "$stage/lib/libSDL3_ttf.so"
cp include/SDL3_ttf/*.h "$stage/include/SDL3_ttf/"
cp ../port/sdl3-ttf.pc "$stage/lib/pkgconfig/"
rm -r "$stage/objects"

mkdir -p "$stage/share/licenses/sdl3-ttf"
cp LICENSE.txt "$stage/share/licenses/sdl3-ttf/LICENSE.txt"
cp ../port/fonts/OFL-NotoSans.txt "$stage/share/licenses/sdl3-ttf/OFL-NotoSans.txt"
