#!/bin/sh
set -eu
tar -xf source.tar
stage="$DESTDIR"
src="$PWD/source"
up=$src/imlib2-1.6.1
build="$PWD/build"
mkdir -p "$build" "$stage/lib/imlib2/loaders" "$stage/include" "$stage/lib/pkgconfig" "$stage/share/doc/imlib2"
flags="-I/usr/local/include/jpeg-turbo -I/usr/local/include/libpng16 -I$src -I$up/src/lib -I/usr/local/include -I/usr/local/include/freetype2"
objects=
for file in api blend color color_helpers colormod context draw dynamic_filters ellipse file filter font_draw font_load font_main font_query grab grad image line modules polygon rectangle rend rgba rgbadraw rotate scale script span updates ximage; do
 input="$up/src/lib/$file.c"
 if test "$file" = ximage -o "$file" = grab; then input="$src/overlays/$file.c"; fi
 cc -O2 $flags -c "$input" -o "$build/$file.o"
 objects="$objects $build/$file.o"
done
cc -shared $objects -L/usr/local/lib -lXext -lX11 -lfreetype -lm -Wl,-soname,libImlib2.so -o "$stage/lib/libImlib2.so"
for loader in argb bmp ff ico lbm pnm xpm png jpeg; do
 extra=
 libs=
 case "$loader" in
 png) libs='-lpng16 -lz';;
 jpeg) libs='-ljpeg-turbo';;
 esac
 cc -O2 $flags -I"$up/src/modules/loaders" -shared "$up/src/modules/loaders/loader_$loader.c" $extra -L"$stage/lib" -L/usr/local/lib -lImlib2 $libs -lm -Wl,-soname,$loader.so -o "$stage/lib/imlib2/loaders/$loader.so"
done
cp "$up/src/lib/Imlib2.h" "$stage/include/"
printf 'prefix=/usr/local\nlibdir=${prefix}/lib\nincludedir=${prefix}/include\nName: imlib2\nDescription: Imlib2 image library\nVersion: 1.6.1\nLibs: -L${libdir} -lImlib2\nCflags: -I${includedir}\n' > "$stage/lib/pkgconfig/imlib2.pc"
cp "$up/COPYING" "$stage/share/doc/imlib2/"

mkdir -p "$stage/share/licenses/imlib2"
cp "$up/COPYING" "$up/COPYING-PLAIN" "$stage/share/licenses/imlib2/"
