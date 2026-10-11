#!/bin/sh
set -eu
tar -xf source.tar
cp config.h source/config.h
mkdir -p "$DESTDIR/bin" "$DESTDIR/share/licenses/xfontsel"
cd source
cc -O2 -DHAVE_CONFIG_H -D_CONST_X_STRING -Dfinite=isfinite -I. -I/usr/local/include ULabel.c xfontsel.c -L/usr/local/lib -lXaw7 -lXmu -lXt -lXpm -lSM -lICE -lXrender -lXext -lX11 -lxcb -lXau -lm -o "$DESTDIR/bin/xfontsel"
cp COPYING "$DESTDIR/share/licenses/xfontsel/COPYING"
mkdir -p "$DESTDIR/share/X11/app-defaults"
cp app-defaults/XFontSel "$DESTDIR/share/X11/app-defaults/"
