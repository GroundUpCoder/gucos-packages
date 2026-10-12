#!/bin/sh
set -eu
# No DISPLAY required: this does not launch GTK Desk or assert GUI behavior.
test -x "$DESTDIR/bin/gtk-desk"
test -x "$DESTDIR/libexec/gtk-desk"
test -s "$DESTDIR/share/applications/gtk-desk.desktop"
test -s "$DESTDIR/share/doc/gtk-desk/PORT.md"
test -s "$DESTDIR/share/licenses/gtk-desk/LICENSE-STATUS.txt"
cat > /tmp/gtk-desk-link.c <<'C'
#include <gtk/gtk.h>
#include <stdio.h>
int main(void) {
  if (gtk_check_version(3, 24, 43)) return 1;
  if (gtk_get_major_version() != 3 || gtk_get_minor_version() != 24 || gtk_get_micro_version() != 43) return 2;
  puts("GTK-DESK-SDK-LINK-PASS");
  return 0;
}
C
export PKG_CONFIG_PATH=/usr/local/lib/gtk3-x11/pkgconfig:/usr/local/lib/pkgconfig
cc /tmp/gtk-desk-link.c $(pkgconf --cflags --libs gtk+-3.0) -L/usr/local/lib/gtk3-x11 -lintl -o /tmp/gtk-desk-link
gtk3-x11-run /tmp/gtk-desk-link
echo GTK-DESK-STAGED-LINK-PASS
