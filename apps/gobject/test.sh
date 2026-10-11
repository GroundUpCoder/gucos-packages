#!/bin/sh
set -eu
for consumer in gobject-accept gobject-wide; do
cc "source/port/$consumer.c" -I"$DESTDIR/include/glib-2.0" -I/usr/local/include/glib-2.0 -I/usr/local/include "$DESTDIR/lib/libgobject-2.0.a" -lglib-2.0 -lffi -lm -o static-test
./static-test
cc "source/port/$consumer.c" -I"$DESTDIR/include/glib-2.0" -I/usr/local/include/glib-2.0 -I/usr/local/include -L"$DESTDIR/lib" -lgobject-2.0 -lglib-2.0 -lffi -lm -o shared-test
LD_LIBRARY_PATH="$DESTDIR/lib" ./shared-test
done
