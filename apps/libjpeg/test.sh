#!/bin/sh
set -eu
cat > consumer.c <<'C'
#include <stdio.h>
#include <stdlib.h>
#include <assert.h>
#include <jpeglib.h>
int main(void){
 struct jpeg_compress_struct c;struct jpeg_error_mgr ce;
 unsigned char *data=0;unsigned long size=0;c.err=jpeg_std_error(&ce);jpeg_create_compress(&c);
 jpeg_mem_dest(&c,&data,&size);c.image_width=8;c.image_height=8;c.input_components=3;c.in_color_space=JCS_RGB;
 jpeg_set_defaults(&c);jpeg_set_quality(&c,100,1);jpeg_start_compress(&c,1);
 unsigned char pixels[24];for(int i=0;i<24;i++)pixels[i]=128;
 JSAMPROW row=pixels;while(c.next_scanline<c.image_height)assert(jpeg_write_scanlines(&c,&row,1)==1);
 jpeg_finish_compress(&c);jpeg_destroy_compress(&c);assert(size>100);
 struct jpeg_decompress_struct d;struct jpeg_error_mgr de;d.err=jpeg_std_error(&de);jpeg_create_decompress(&d);
 jpeg_mem_src(&d,data,size);assert(jpeg_read_header(&d,1)==JPEG_HEADER_OK);assert(jpeg_start_decompress(&d));
 assert(d.output_width==8&&d.output_height==8&&d.output_components==3);
 while(d.output_scanline<d.output_height){assert(jpeg_read_scanlines(&d,&row,1)==1);for(int i=0;i<24;i++)assert(pixels[i]>=127&&pixels[i]<=129);}
 assert(jpeg_finish_decompress(&d));jpeg_destroy_decompress(&d);free(data);return 0;
}
C
cc consumer.c -I"$DESTDIR/include" "$DESTDIR/lib/libjpeg.a" -o static-test
./static-test
cc consumer.c -I"$DESTDIR/include" -L"$DESTDIR/lib" -ljpeg -o shared-test
LD_LIBRARY_PATH="$DESTDIR/lib" ./shared-test
