#!/bin/sh
set -eu
# The application initializes GTK before handling its CLI options.
# Payload/link checks are not GUI or archive-operation acceptance.
test -s "$DESTDIR/libexec/xarchiver"
test -s "$DESTDIR/share/licenses/xarchiver/COPYING"
test -s "$DESTDIR/share/licenses/xarchiver/LGPL-2.1.txt"
cat > /tmp/xarchiver-link.c <<'C'
#include <gtk/gtk.h>
int main(void) { return gtk_get_major_version() == 3 && gtk_get_minor_version() == 24 ? 0 : 1; }
C
export PKG_CONFIG_PATH=/usr/local/lib/gtk3-x11/pkgconfig:/usr/local/lib/pkgconfig
cc /tmp/xarchiver-link.c $(pkgconf --cflags --libs gtk+-3.0) -L/usr/local/lib/gtk3-x11 -lgmodule-2.0 -lintl -o /tmp/xarchiver-link
/tmp/xarchiver-link
echo XARCHIVER-STAGED-LINK-PASS
