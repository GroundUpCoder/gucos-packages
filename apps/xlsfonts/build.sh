#!/bin/sh
set -eu
tar -xf source.tar
cp config.h source/config.h
mkdir -p "$DESTDIR/bin" "$DESTDIR/share/licenses/xlsfonts"
cd source
cc -O2 -DHAVE_CONFIG_H -D_CONST_X_STRING -Dfinite=isfinite -I. -I/usr/local/include dsimple.c xlsfonts.c -L/usr/local/lib -lXaw7 -lXmu -lXt -lXpm -lSM -lICE -lXrender -lXext -lX11 -lxcb -lXau -lm -o "$DESTDIR/bin/xlsfonts"
cp COPYING "$DESTDIR/share/licenses/xlsfonts/COPYING"
