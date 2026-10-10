#!/bin/sh
set -eu
cat > consumer.c <<'C'
#include <png.h>
#include <string.h>
int main(void) {
 const unsigned char pixels[8]={255,0,0,255,0,255,0,255};
 png_image image; memset(&image,0,sizeof image); image.version=PNG_IMAGE_VERSION;
 image.width=2; image.height=1; image.format=PNG_FORMAT_RGBA;
 if(!png_image_write_to_file(&image,"roundtrip.png",0,pixels,0,0)) return 1;
 memset(&image,0,sizeof image); image.version=PNG_IMAGE_VERSION;
 if(!png_image_begin_read_from_file(&image,"roundtrip.png")) return 2;
 image.format=PNG_FORMAT_RGBA; unsigned char actual[8];
 if(image.width!=2 || image.height!=1 || !png_image_finish_read(&image,0,actual,0,0)) return 3;
 png_image_free(&image); return memcmp(actual,pixels,8)!=0;
}
C
cc consumer.c -I"$DESTDIR/include" "$DESTDIR/lib/libpng16.a" -lz -lm -o png-static-test
./png-static-test
cc consumer.c -I"$DESTDIR/include" -L"$DESTDIR/lib" -lpng16 -lz -lm -o png-shared-test
LD_LIBRARY_PATH="$DESTDIR/lib" ./png-shared-test
