#!/bin/sh
set -eu
# galculator calls gtk_init before argument parsing. Do not assume --help
# is display-independent. This checks staged payloads and dependency linking;
# real callback arithmetic and GUI lifecycle remain separate required gates.
test -s "$DESTDIR/libexec/galculator"
test -s "$DESTDIR/share/galculator/ui/about.ui"
test -s "$DESTDIR/share/licenses/galculator/COPYING"
cat > /tmp/galculator-link.c <<'C'
#include <gtk/gtk.h>
int main(void) { return gtk_get_major_version() == 3 && gtk_get_minor_version() == 24 ? 0 : 1; }
C
export PKG_CONFIG_PATH=/usr/local/lib/gtk3-x11/pkgconfig:/usr/local/lib/pkgconfig
cc /tmp/galculator-link.c $(pkgconf --cflags --libs gtk+-3.0) -L/usr/local/lib/gtk3-x11 -lgmodule-2.0 -lintl -lm -o /tmp/galculator-link
gtk3-x11-run /tmp/galculator-link
echo GALCULATOR-STAGED-LINK-PASS
