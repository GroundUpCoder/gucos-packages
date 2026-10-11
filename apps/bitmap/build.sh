#!/bin/sh
set -eu
tar -xf source.tar
stage="$DESTDIR"
src="$PWD/source"
up=$src/bitmap-1.1.1
build=/tmp/bitmap-build
mkdir -p "$build" "$stage/bin" "$stage/share/X11/app-defaults" "$stage/share/doc/bitmap"
export PKG_CONFIG_PATH=/usr/local/lib/pkgconfig
flags="-I/usr/local/include -D_CONST_X_STRING -DHAVE_MKSTEMP=1 -DHAVE_LRINT=1"
libs="-L/usr/local/lib -lXaw7 -lXmu -lXt -lXpm -lSM -lICE -lXrender -lXext -lX11 -lxcb -lXau -lm"
mkdir -p "$build/include/X11/bitmaps"
cp "$src/xbitmaps-1.1.3/xlogo16" "$build/include/X11/bitmaps/"
flags="$flags -I$build/include"
objects=
for file in BitEdit CutPaste Graphics ReqMach Bitmap Dialog Handlers; do
 cc -O2 '-DPACKAGE_STRING="bitmap 1.1.1"' $flags -c "$up/$file.c" -o "$build/$file.o"
 objects="$objects $build/$file.o"
done
cc $objects $libs -o "$stage/bin/bitmap"
for file in bmtoa atobm; do cc -O2 '-DPACKAGE_STRING="bitmap 1.1.1"' $flags "$up/$file.c" $libs -o "$stage/bin/$file"; done
cp "$up/app-defaults/Bitmap"* "$stage/share/X11/app-defaults/"
mkdir -p "$stage/share/bitmap/bitmaps"
cp "$up/bitmaps/"* "$stage/share/bitmap/bitmaps/"
cp "$src/xbitmaps-1.1.3/menu12" "$stage/share/bitmap/bitmaps/"
printf '\n*bitmapFilePath: /usr/local/share/bitmap/bitmaps\n' >> "$stage/share/X11/app-defaults/Bitmap"

cp "$up/COPYING" "$stage/share/doc/bitmap/"

mkdir -p "$stage/share/licenses/bitmap"
cp "$up/COPYING" "$stage/share/licenses/bitmap/COPYING"
cp "$src/xbitmaps-1.1.3/COPYING" "$stage/share/licenses/bitmap/XBITMAPS-COPYING"
