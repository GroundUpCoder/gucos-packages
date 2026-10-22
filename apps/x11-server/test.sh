#!/bin/sh
set -eu
test -s "$DESTDIR/bin/Xvfb"
test -s "$DESTDIR/lib/libX11.a"
test -s "$DESTDIR/lib/libxcb.a"
test -s "$DESTDIR/include/X11/Xlib.h"
