#!/bin/sh
set -eu
tar -xf source.tar
cp config.h source/config.h
mkdir -p "$DESTDIR/bin" "$DESTDIR/share/licenses/xclipboard"
cd source
cc -O2 -DHAVE_CONFIG_H -D_CONST_X_STRING -Dfinite=isfinite -I. -I/usr/local/include xclipboard.c -L/usr/local/lib -lXaw7 -lXmu -lXt -lXpm -lSM -lICE -lXrender -lXext -lX11 -lxcb -lXau -lm -o "$DESTDIR/bin/xclipboard"
cp COPYING "$DESTDIR/share/licenses/xclipboard/COPYING"
mkdir -p "$DESTDIR/share/X11/app-defaults"
cp app-defaults/XClipboard "$DESTDIR/share/X11/app-defaults/"
