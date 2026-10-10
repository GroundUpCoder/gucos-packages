#!/bin/sh
set -eu
cat > consumer.c <<'C'
#include <gtk/gtk.h>
#include <stdio.h>
int main(void) { if(gtk_get_major_version()!=3 || gtk_get_minor_version()!=24 || gtk_get_micro_version()!=43) return 1; puts("GTK-X11-LINK-VERSION-PASS"); return 0; }
C
cc consumer.c -I"$DESTDIR/include/gtk3-x11" -I/usr/local/include/glib-2.0 -I/usr/local/include/gio-core-2.0 -I/usr/local/include/pango-1.0 -I/usr/local/include/harfbuzz -I/usr/local/include/cairo -I/usr/local/include/gdk-pixbuf-2.0 -I/usr/local/include/atk-1.0 -I/usr/local/include/freetype2 -I/usr/local/include -L"$DESTDIR/lib/gtk3-x11" -lgtk-3 -lgdk-3 -o consumer
LD_LIBRARY_PATH="$DESTDIR/lib/gtk3-x11:/usr/local/lib" ./consumer
