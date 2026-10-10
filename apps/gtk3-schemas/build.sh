#!/bin/sh
set -eu
tar -xf source.tar
mkdir gio-source
tar -xf gio-source.tar -C gio-source
stage="$PWD/stage"
mkdir -p "$stage/share/glib-2.0/schemas"
cc -Igio-source/source -Igio-source/source/gvdb -I/usr/local/include/glib-2.0/glib -I/usr/local/include/glib-2.0 gio-source/source/gio/glib-compile-schemas.c gio-source/source/port/gvdb-builder-sync.c $(pkg-config --cflags --libs gio-core) -lintl -o schema-compiler
cp source/*.gschema.xml "$stage/share/glib-2.0/schemas/"
./schema-compiler --strict "$stage/share/glib-2.0/schemas"
mkdir -p "$DESTDIR/share/glib-2.0/schemas" "$DESTDIR/share/licenses/gtk3-schemas" "$DESTDIR/share/doc/gtk3-schemas"
cp "$stage/share/glib-2.0/schemas/"* "$DESTDIR/share/glib-2.0/schemas/"
cp source/COPYING GLib-COPYING "$DESTDIR/share/licenses/gtk3-schemas/"
cp source/UPSTREAM.json source/PORT.md "$DESTDIR/share/doc/gtk3-schemas/"
