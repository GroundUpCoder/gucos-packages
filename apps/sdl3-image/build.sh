#!/bin/sh
set -eu
tar -xf source.tar
stage="$DESTDIR"
cd source
mkdir -p "$stage/lib" "$stage/include/SDL3_image" "$stage/lib/pkgconfig" "$stage/objects"
objects=
for source in port/wrappers/*.c; do
 name=$(basename "$source" .c)
 cc -Iupstream/include -DUSE_STBIMAGE -DLOAD_PNG -DLOAD_JPG -DLOAD_BMP -D__inline=inline -c "$source" -o "$stage/objects/$name.o"
 objects="$objects $stage/objects/$name.o"
done
ar rcs "$stage/lib/libSDL3_image.a" $objects
cc -shared $objects -lm -Wl,-soname,libSDL3_image.so -o "$stage/lib/libSDL3_image.so"
cp upstream/include/SDL3_image/SDL_image.h "$stage/include/SDL3_image/"
sed '/^Requires: sdl3$/d' port/sdl3-image.pc > "$stage/lib/pkgconfig/sdl3-image.pc"
rm -r "$stage/objects"

mkdir -p "$stage/share/licenses/sdl3-image"
cp upstream/LICENSE.txt "$stage/share/licenses/sdl3-image/LICENSE.txt"
