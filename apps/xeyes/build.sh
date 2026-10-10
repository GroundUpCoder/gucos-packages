#!/bin/sh
set -eu
tar -xf source.tar
cp config.h source/config.h
cp Eyes.c source/Eyes.c
mkdir -p "$DESTDIR/bin" "$DESTDIR/share/licenses/xeyes"
cd source
cc -O2 -DHAVE_CONFIG_H -D_CONST_X_STRING -Dfinite=isfinite -I. -I/usr/local/include Eyes.c transform.c xeyes.c -L/usr/local/lib -lXaw7 -lXmu -lXt -lXpm -lSM -lICE -lXrender -lXi -lXext -lX11 -lxcb -lXau -lm -o "$DESTDIR/bin/xeyes"
cp COPYING "$DESTDIR/share/licenses/xeyes/COPYING"
