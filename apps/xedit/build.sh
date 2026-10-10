#!/bin/sh
set -eu
tar -xf source.tar
cp config.h source/config.h
cp util.c source/util.c
cp lisp-format.c source/lisp/format.c
cp lisp-io.c source/lisp/io.c
cp lisp-lisp.c source/lisp/lisp.c
mkdir -p "$DESTDIR/bin" "$DESTDIR/libexec/xedit" "$DESTDIR/share/xedit/tests" "$DESTDIR/share/licenses/xedit" "$DESTDIR/share/X11/app-defaults" "$DESTDIR/share/xedit/lisp/progmodes"
cd source
flags='-O2 --enable-fork -DHAVE_CONFIG_H -Dfinite=isfinite -D_BSD_SOURCE -I. -Ilisp/re -Ilisp/mp -I/usr/local/include'
objects=
for file in bytecode core debugger format hash helper io lisp math package pathname read regex require stream string struct time write xedit; do
 cc $flags -DLISP '-DLISPDIR="/usr/local/share/xedit/lisp"' -c "lisp/$file.c" -o "lisp/$file.o"
 objects="$objects lisp/$file.o"
done
ar rcs liblisp.a $objects
cc $flags -c lisp/mp/mp.c -o mp.o
cc $flags -c lisp/mp/mpi.c -o mpi.o
cc $flags -c lisp/mp/mpr.c -o mpr.o
ar rcs libmp.a mp.o mpi.o mpr.o
cc $flags -c lisp/re/re.c -o re.o
cc $flags -c lisp/re/rec.c -o rec.o
cc $flags -c lisp/re/reo.c -o reo.o
ar rcs libre.a re.o rec.o reo.o
cc $flags -DXEDIT commands.c hash.c hook.c ispell.c lisp.c options.c tags.c util.c xedit.c libre.a liblisp.a libmp.a -L/usr/local/lib -lXaw7 -lXmu -lXt -lXpm -lSM -lICE -lXrender -lXext -lX11 -lxcb -lXau -lm -o "$DESTDIR/bin/xedit"
cc $flags -DLISP '-DLISPDIR="/usr/local/share/xedit/lisp"' hash.c lisp/lsp.c liblisp.a libre.a libmp.a -lm -o "$DESTDIR/libexec/xedit/lsp"
cc $flags lisp/re/tests.c libre.a -o "$DESTDIR/libexec/xedit/regex-tests"
cp lisp/re/tests.txt "$DESTDIR/share/xedit/tests/"
cp lisp/modules/*.lsp "$DESTDIR/share/xedit/lisp/"
cp lisp/modules/progmodes/*.lsp "$DESTDIR/share/xedit/lisp/progmodes/"
cp app-defaults/Xedit app-defaults/Xedit-color "$DESTDIR/share/X11/app-defaults/"
cp COPYING "$DESTDIR/share/licenses/xedit/COPYING"
