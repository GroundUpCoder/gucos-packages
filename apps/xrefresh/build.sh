#!/bin/sh
set -eu
tar -xf source.tar
cp config.h source/config.h
mkdir -p "$DESTDIR/bin" "$DESTDIR/share/licenses/xrefresh"
cd source
cc -O2 -DHAVE_CONFIG_H -D_CONST_X_STRING -Dfinite=isfinite -I. -I/usr/local/include xrefresh.c -L/usr/local/lib -lXaw7 -lXmu -lXt -lXpm -lSM -lICE -lXrender -lXext -lX11 -lxcb -lXau -lm -o "$DESTDIR/bin/xrefresh"
cp COPYING "$DESTDIR/share/licenses/xrefresh/COPYING"
