#!/bin/sh
set -eu
tar -xf source.tar
cd source
stage="$DESTDIR"
mkdir -p "$stage/bin" "$stage/objects" "$stage/share/licenses/xprop"
cc -O2 -I./libXft/include -I/usr/local/include/freetype2 -I'./xprop' -I'./xprop/src' -I'./xprop/include' -I'./xprop/include/X11' -I'./include' -I'./include/X11/Xmu' -I'./include/X11/Xaw' -I'./include/X11/extensions' -D'HAVE_CONFIG_H' -D'HAVE_GETADDRINFO=1' -D'suseconds_t=long' -D'fd_mask=unsigned long' -D'_POSIX_THREAD_SAFE_FUNCTIONS=200809L' -c './xprop/clientwin.c' -o "$stage/objects/207.o"
cc -O2 -I./libXft/include -I/usr/local/include/freetype2 -I'./xprop' -I'./xprop/src' -I'./xprop/include' -I'./xprop/include/X11' -I'./include' -I'./include/X11/Xmu' -I'./include/X11/Xaw' -I'./include/X11/extensions' -D'HAVE_CONFIG_H' -D'HAVE_GETADDRINFO=1' -D'suseconds_t=long' -D'fd_mask=unsigned long' -D'_POSIX_THREAD_SAFE_FUNCTIONS=200809L' -c './xprop/dsimple.c' -o "$stage/objects/208.o"
cc -O2 -I./libXft/include -I/usr/local/include/freetype2 -I'./xprop' -I'./xprop/src' -I'./xprop/include' -I'./xprop/include/X11' -I'./include' -I'./include/X11/Xmu' -I'./include/X11/Xaw' -I'./include/X11/extensions' -D'HAVE_CONFIG_H' -D'HAVE_GETADDRINFO=1' -D'suseconds_t=long' -D'fd_mask=unsigned long' -D'_POSIX_THREAD_SAFE_FUNCTIONS=200809L' -c './xprop/xprop.c' -o "$stage/objects/209.o"
cc --enable-fork "$stage/objects/207.o" "$stage/objects/208.o" "$stage/objects/209.o" -L"$stage/lib" -L/usr/local/lib -lXaw7 -lXmu -lXt -lXpm -lSM -lICE -lXrandr -lXrender -lXext -lX11 -lxcb -lXau -o "$stage/bin/xprop"
cp -R licenses/. "$stage/share/licenses/xprop/"
rm -rf "$stage/objects"
