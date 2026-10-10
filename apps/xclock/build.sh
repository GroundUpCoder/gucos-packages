#!/bin/sh
set -eu
tar -xf source.tar
cp config.h source/config.h
mkdir -p "$DESTDIR/bin" "$DESTDIR/share/licenses/xclock"
cd source
cc -O2 -DHAVE_CONFIG_H -D_CONST_X_STRING -Dfinite=isfinite -I. -I/usr/local/include Clock.c xclock.c -L/usr/local/lib -lXaw7 -lXmu -lXt -lXpm -lSM -lICE -lXrender -lXext -lX11 -lxcb -lXau -lm -o "$DESTDIR/bin/xclock"
cp COPYING "$DESTDIR/share/licenses/xclock/COPYING"
mkdir -p "$DESTDIR/share/X11/app-defaults"
cp app-defaults/XClock "$DESTDIR/share/X11/app-defaults/"
cp app-defaults/XClock-ampm "$DESTDIR/share/X11/app-defaults/"
cp app-defaults/XClock-color "$DESTDIR/share/X11/app-defaults/"
cp app-defaults/XClock-grandfather "$DESTDIR/share/X11/app-defaults/"
