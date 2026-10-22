#!/bin/sh
set -eu
tar -xf source.tar
stage="$DESTDIR"
src="$PWD/source"
up=$src/xmag-1.0.8
build=/tmp/xmag-build
mkdir -p "$build" "$stage/bin" "$stage/share/X11/app-defaults" "$stage/share/doc/xmag"
export PKG_CONFIG_PATH=/usr/local/lib/pkgconfig
flags="-I/usr/local/include -D_CONST_X_STRING -DHAVE_NANOSLEEP=1 -DHAVE_LRINT=1"
libs="-L/usr/local/lib -lXaw7 -lXmu -lXt -lXpm -lSM -lICE -lXrender -lXext -lX11 -lxcb -lXau -lm"
objects=
for file in CutPaste RootWin Scale xmag; do
 cc -O2 '-DPACKAGE_STRING="xmag 1.0.8"' $flags -c "$up/$file.c" -o "$build/$file.o"
 objects="$objects $build/$file.o"
done
cc $objects $libs -o "$stage/bin/xmag"
cp "$up/app-defaults/Xmag" "$stage/share/X11/app-defaults/"
cp "$up/COPYING" "$stage/share/doc/xmag/"

mkdir -p "$stage/share/licenses/xmag"
cp "$up/COPYING" "$stage/share/licenses/xmag/COPYING"
