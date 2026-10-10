#!/bin/sh
set -eu
tar -xf source.tar
cp config.h source/config.h
mkdir -p "$DESTDIR/bin" "$DESTDIR/share/licenses/xlogo"
cd source
cc -O2 -DHAVE_CONFIG_H -D_CONST_X_STRING -Dfinite=isfinite -I. -I/usr/local/include Logo.c xlogo.c -L/usr/local/lib -lXaw7 -lXmu -lXt -lXpm -lSM -lICE -lXrender -lXext -lX11 -lxcb -lXau -lm -o "$DESTDIR/bin/xlogo"
cp COPYING "$DESTDIR/share/licenses/xlogo/COPYING"
mkdir -p "$DESTDIR/share/X11/app-defaults"
cp app-defaults/XLogo "$DESTDIR/share/X11/app-defaults/"
cp app-defaults/XLogo-color "$DESTDIR/share/X11/app-defaults/"
