#!/bin/sh
set -eu
cc source/port/gtk3-schemas-accept.c $(pkg-config --cflags --libs gio-core) -o schema-consumer
GSETTINGS_SCHEMA_DIR="$DESTDIR/share/glib-2.0/schemas" GSETTINGS_BACKEND=memory ./schema-consumer
