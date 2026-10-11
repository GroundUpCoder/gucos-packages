#!/bin/sh
set -eu
cat > consumer.c <<'C'
#include <cairo.h>
#include <stdint.h>
int main(void) {
 cairo_surface_t *s=cairo_image_surface_create(CAIRO_FORMAT_ARGB32,8,8);
 cairo_t *c=cairo_create(s);
 cairo_set_source_rgb(c,1,0,0); cairo_paint(c); cairo_surface_flush(s);
 if(cairo_status(c)!=CAIRO_STATUS_SUCCESS || cairo_surface_status(s)!=CAIRO_STATUS_SUCCESS) return 1;
 if(*(uint32_t *)cairo_image_surface_get_data(s)!=0xffff0000u) return 2;
 if(cairo_surface_write_to_png(s,"cairo-test.png")!=CAIRO_STATUS_SUCCESS) return 3;
 cairo_destroy(c); cairo_surface_destroy(s); return 0;
}
C
cc consumer.c -I"$DESTDIR/include/cairo" "$DESTDIR/lib/libcairo.a" -lpixman-1 -lfreetype -lfontconfig -lpng16 -lXrender -lXext -lX11 -lxcb -lXau -lm -o cairo-static-test
./cairo-static-test
cc consumer.c -I"$DESTDIR/include/cairo" -L"$DESTDIR/lib" -lcairo -lm -o cairo-shared-test
LD_LIBRARY_PATH="$DESTDIR/lib" ./cairo-shared-test
