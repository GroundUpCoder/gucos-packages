#!/bin/sh
set -eu
cat > consumer.c <<'C'
#include <gtk/gtk.h>
#include <stdio.h>
int main(void) { if(gtk_get_major_version()!=3 || gtk_get_minor_version()!=24 || gtk_get_micro_version()!=43) return 1; puts("GTK-X11-LINK-VERSION-PASS"); return 0; }
C
export PKG_CONFIG_PATH="$DESTDIR/lib/gtk3-x11/pkgconfig:/usr/local/lib/pkgconfig"
cflags=$(pkg-config --cflags gtk+-3.0)
case "$cflags" in *-I/usr/local/include/gio-core-2.0*-I/usr/local/include/glib-2.0*) ;; *) echo "Full GIO must precede GLib headers: $cflags" >&2; exit 1;; esac
cc consumer.c -I"$DESTDIR/include/gtk3-x11" $cflags -L"$DESTDIR/lib/gtk3-x11" $(pkg-config --libs gtk+-3.0) -o consumer
LD_LIBRARY_PATH="$DESTDIR/lib/gtk3-x11:/usr/local/lib" ./consumer
