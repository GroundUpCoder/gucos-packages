#!/bin/sh
set -eu
tar -xf source.tar
cd source
mkdir -p "$DESTDIR/bin" "$DESTDIR/share/licenses/qjs"
objects=
cc -I. -D_GNU_SOURCE -DEMSCRIPTEN '-DCONFIG_VERSION="2025-09-13"' --allow-zero-length-arrays --enable-fork -c cutils.c -o 0.o
objects="$objects 0.o"
cc -I. -D_GNU_SOURCE -DEMSCRIPTEN '-DCONFIG_VERSION="2025-09-13"' --allow-zero-length-arrays --enable-fork -c dtoa.c -o 1.o
objects="$objects 1.o"
cc -I. -D_GNU_SOURCE -DEMSCRIPTEN '-DCONFIG_VERSION="2025-09-13"' --allow-zero-length-arrays --enable-fork -c libregexp.c -o 2.o
objects="$objects 2.o"
cc -I. -D_GNU_SOURCE -DEMSCRIPTEN '-DCONFIG_VERSION="2025-09-13"' --allow-zero-length-arrays --enable-fork -c libunicode.c -o 3.o
objects="$objects 3.o"
cc -I. -D_GNU_SOURCE -DEMSCRIPTEN '-DCONFIG_VERSION="2025-09-13"' --allow-zero-length-arrays --enable-fork -c quickjs.c -o 4.o
objects="$objects 4.o"
cc -I. -D_GNU_SOURCE -DEMSCRIPTEN '-DCONFIG_VERSION="2025-09-13"' --allow-zero-length-arrays --enable-fork -c quickjs-libc.c -o 5.o
objects="$objects 5.o"
cc -I. -D_GNU_SOURCE -DEMSCRIPTEN '-DCONFIG_VERSION="2025-09-13"' --allow-zero-length-arrays --enable-fork -c qjs.c -o 6.o
objects="$objects 6.o"
cc -I. -D_GNU_SOURCE -DEMSCRIPTEN '-DCONFIG_VERSION="2025-09-13"' --allow-zero-length-arrays --enable-fork -c repl_stub.c -o 7.o
objects="$objects 7.o"
cc --enable-fork $objects -lm -o "$DESTDIR/bin/qjs"
cp LICENSE "$DESTDIR/share/licenses/qjs/LICENSE"
