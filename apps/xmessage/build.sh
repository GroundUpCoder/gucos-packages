#!/bin/sh
set -eu
tar -xf source.tar
cd source
stage="$DESTDIR"
mkdir -p "$stage/bin" "$stage/objects" "$stage/share/licenses/xmessage"
cc -O2 -I./libXft/include -I/usr/local/include/freetype2 -I'./xmessage' -I'./xmessage/src' -I'./xmessage/include' -I'./xmessage/include/X11' -I'./include' -I'./include/X11/Xmu' -I'./include/X11/Xaw' -I'./include/X11/extensions' -D'HAVE_CONFIG_H' -D'HAVE_GETADDRINFO=1' -D'suseconds_t=long' -D'fd_mask=unsigned long' -D'_POSIX_THREAD_SAFE_FUNCTIONS=200809L' -c './xmessage/makeform.c' -o "$stage/objects/210.o"
cc -O2 -I./libXft/include -I/usr/local/include/freetype2 -I'./xmessage' -I'./xmessage/src' -I'./xmessage/include' -I'./xmessage/include/X11' -I'./include' -I'./include/X11/Xmu' -I'./include/X11/Xaw' -I'./include/X11/extensions' -D'HAVE_CONFIG_H' -D'HAVE_GETADDRINFO=1' -D'suseconds_t=long' -D'fd_mask=unsigned long' -D'_POSIX_THREAD_SAFE_FUNCTIONS=200809L' -c './xmessage/readfile.c' -o "$stage/objects/211.o"
cc -O2 -I./libXft/include -I/usr/local/include/freetype2 -I'./xmessage' -I'./xmessage/src' -I'./xmessage/include' -I'./xmessage/include/X11' -I'./include' -I'./include/X11/Xmu' -I'./include/X11/Xaw' -I'./include/X11/extensions' -D'HAVE_CONFIG_H' -D'HAVE_GETADDRINFO=1' -D'suseconds_t=long' -D'fd_mask=unsigned long' -D'_POSIX_THREAD_SAFE_FUNCTIONS=200809L' -c './xmessage/xmessage.c' -o "$stage/objects/212.o"
cc --enable-fork "$stage/objects/210.o" "$stage/objects/211.o" "$stage/objects/212.o" -L"$stage/lib" -L/usr/local/lib -lXaw7 -lXmu -lXt -lXpm -lSM -lICE -lXrandr -lXrender -lXext -lX11 -lxcb -lXau -o "$stage/bin/xmessage"
cp -R licenses/. "$stage/share/licenses/xmessage/"
rm -rf "$stage/objects"
