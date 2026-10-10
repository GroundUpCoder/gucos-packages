#!/bin/sh
set -eu
mkdir -p /tmp/xfce-util-test
cat > consumer.c <<'C'
#include <libxfce4util/libxfce4util.h>
#include <string.h>
int main(void) {
  g_assert_cmpuint(libxfce4util_major_version, ==, 4);
  g_assert_cmpuint(libxfce4util_minor_version, ==, 20);
  gchar *replaced = xfce_str_replace("hello world world", "world", "desktop");
  g_assert_cmpstr(replaced, ==, "hello desktop desktop");
  g_free(replaced);
  gchar *large = g_malloc(65537);
  memset(large, 'x', 65536); large[65536] = 0;
  XfceRc *rc = xfce_rc_simple_open("/tmp/xfce-util-test/settings.rc", FALSE);
  g_assert_nonnull(rc);
  xfce_rc_set_group(rc, "Desktop");
  xfce_rc_write_entry(rc, "Name", "Browser desktop");
  xfce_rc_write_entry(rc, "Large", large);
  xfce_rc_write_int_entry(rc, "Workspaces", 4);
  xfce_rc_close(rc);
  rc = xfce_rc_simple_open("/tmp/xfce-util-test/settings.rc", TRUE);
  g_assert_nonnull(rc);
  xfce_rc_set_group(rc, "Desktop");
  g_assert_cmpstr(xfce_rc_read_entry(rc, "Name", NULL), ==, "Browser desktop");
  g_assert_cmpstr(xfce_rc_read_entry(rc, "Large", NULL), ==, large);
  g_assert_cmpint(xfce_rc_read_int_entry(rc, "Workspaces", 0), ==, 4);
  xfce_rc_close(rc); g_free(large);
  xfce_resource_push_path(XFCE_RESOURCE_CONFIG, "/tmp/xfce-util-test");
  gchar *found = xfce_resource_lookup(XFCE_RESOURCE_CONFIG, "settings.rc");
  g_assert_cmpstr(found, ==, "/tmp/xfce-util-test/settings.rc");
  g_free(found);
  return 0;
}
C
cc -I"$DESTDIR/include/xfce4" $(pkg-config --cflags gio-core) consumer.c "$DESTDIR/lib/libxfce4util.a" $(pkg-config --libs gio-core) -lintl -o static-test
./static-test
cc -I"$DESTDIR/include/xfce4" $(pkg-config --cflags gio-core) consumer.c -L"$DESTDIR/lib" -lxfce4util $(pkg-config --libs gio-core) -lintl -o shared-test
LD_LIBRARY_PATH="$DESTDIR/lib:/usr/local/lib" ./shared-test
echo XFCE-UTIL-PASS
