#include <stdio.h>
#include <stdlib.h>
#include <assert.h>
#include <jpeglib.h>
#include <gdk-pixbuf/gdk-pixbuf.h>
int main(void) {
 struct jpeg_compress_struct c;struct jpeg_error_mgr error;
 unsigned char *bytes=NULL;unsigned long size=0;c.err=jpeg_std_error(&error);jpeg_create_compress(&c);jpeg_mem_dest(&c,&bytes,&size);
 c.image_width=8;c.image_height=8;c.input_components=3;c.in_color_space=JCS_RGB;jpeg_set_defaults(&c);jpeg_set_quality(&c,100,TRUE);jpeg_start_compress(&c,TRUE);
 unsigned char pixels[24];for(int i=0;i<8;i++){pixels[3*i]=255;pixels[3*i+1]=0;pixels[3*i+2]=0;}JSAMPROW row=pixels;
 while(c.next_scanline<c.image_height)assert(jpeg_write_scanlines(&c,&row,1)==1);
 jpeg_finish_compress(&c);jpeg_destroy_compress(&c);assert(size>100);
 GError *e=NULL;GdkPixbufLoader *loader=gdk_pixbuf_loader_new_with_type("jpeg",&e);assert(loader && !e);
 assert(gdk_pixbuf_loader_write(loader,bytes,size,&e) && !e);assert(gdk_pixbuf_loader_close(loader,&e) && !e);
 GdkPixbuf *p=gdk_pixbuf_loader_get_pixbuf(loader);assert(p && gdk_pixbuf_get_width(p)==8 && gdk_pixbuf_get_height(p)==8 && gdk_pixbuf_get_n_channels(p)==3);
 unsigned char *data=gdk_pixbuf_get_pixels(p);int stride=gdk_pixbuf_get_rowstride(p);
 for(int y=0;y<8;y++)for(int x=0;x<8;x++){unsigned char *v=data+y*stride+x*3;assert(v[0]>245 && v[1]<10 && v[2]<10);}
 g_object_unref(loader);free(bytes);puts("GDK-PIXBUF-JPEG-DECODE-PASS");return 0;
}
