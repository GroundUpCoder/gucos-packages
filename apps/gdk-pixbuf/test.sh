#!/bin/sh
set -eu
cc source/port/gdk-pixbuf-accept.c -I"$DESTDIR/include/gdk-pixbuf-2.0" -I/usr/local/include/gio-core-2.0 -I/usr/local/include/glib-2.0 -I/usr/local/include "$DESTDIR/lib/libgdk_pixbuf-2.0.a" -lgio-core -lgio-listmodel -lgobject-2.0 -lglib-2.0 -lpng16 -ljpeg-turbo -lz -lintl -lm -o static-test
./static-test
cc source/port/gdk-pixbuf-accept.c -I"$DESTDIR/include/gdk-pixbuf-2.0" -I/usr/local/include/gio-core-2.0 -I/usr/local/include/glib-2.0 -I/usr/local/include -L"$DESTDIR/lib" -lgdk_pixbuf-2.0 -lgio-core -lgio-listmodel -lgobject-2.0 -lglib-2.0 -lpng16 -ljpeg-turbo -lz -lintl -lm -o shared-test
LD_LIBRARY_PATH="$DESTDIR/lib" ./shared-test

cc jpeg-decode.c -I"$DESTDIR/include/gdk-pixbuf-2.0" -I/usr/local/include/gio-core-2.0 -I/usr/local/include/glib-2.0 -I/usr/local/include/jpeg-turbo -I/usr/local/include "$DESTDIR/lib/libgdk_pixbuf-2.0.a" -lgio-core -lgio-listmodel -lgobject-2.0 -lglib-2.0 -lpng16 -ljpeg-turbo -lz -lintl -lm -o static-test
./static-test
cc jpeg-decode.c -I"$DESTDIR/include/gdk-pixbuf-2.0" -I/usr/local/include/gio-core-2.0 -I/usr/local/include/glib-2.0 -I/usr/local/include/jpeg-turbo -I/usr/local/include -L"$DESTDIR/lib" -lgdk_pixbuf-2.0 -lgio-core -lgio-listmodel -lgobject-2.0 -lglib-2.0 -lpng16 -ljpeg-turbo -lz -lintl -lm -o shared-test
LD_LIBRARY_PATH="$DESTDIR/lib" ./shared-test
