#include <assert.h>
#include <stdio.h>
#include <X11/Xlib.h>
#include <X11/Xutil.h>
#include <X11/extensions/Xrender.h>
#include <X11/extensions/Xfixes.h>
#include <X11/extensions/XInput2.h>
#include <X11/extensions/XTest.h>
#include <fontconfig/fontconfig.h>
#include <cairo.h>
#include <cairo-xlib.h>
#include <cairo-ft.h>
int main(void) {
 Display *d=XOpenDisplay(NULL); assert(d);
 int major=0,minor=0,event=0,error=0;
 assert(XRenderQueryVersion(d,&major,&minor));
 assert(XFixesQueryVersion(d,&major,&minor));
 major=2;minor=0;assert(XIQueryVersion(d,&major,&minor)==Success);
 assert(XTestQueryExtension(d,&event,&error,&major,&minor));
 FcConfig *config=FcInitLoadConfigAndFonts();assert(config);
 FcFontSet *fonts=FcConfigGetFonts(config,FcSetSystem);assert(fonts && fonts->nfont>=2);
 FcPattern *pattern=FcNameParse((FcChar8*)"ABeeZee");assert(pattern);
 assert(FcConfigSubstitute(config,pattern,FcMatchPattern));FcDefaultSubstitute(pattern);
 FcResult result;FcPattern *match=FcFontMatch(config,pattern,&result);assert(match);
 FcChar8 *file=NULL;assert(FcPatternGetString(match,FC_FILE,0,&file)==FcResultMatch);
 printf("Installed font match: %s (%d system fonts)\n",file,fonts->nfont);
 cairo_font_face_t *face=cairo_ft_font_face_create_for_pattern(match);assert(cairo_font_face_status(face)==CAIRO_STATUS_SUCCESS);
 int screen=DefaultScreen(d);Pixmap p=XCreatePixmap(d,RootWindow(d,screen),160,60,DefaultDepth(d,screen));assert(p);
 cairo_surface_t *surface=cairo_xlib_surface_create(d,p,DefaultVisual(d,screen),160,60);
 cairo_t *c=cairo_create(surface);cairo_set_source_rgb(c,1,1,1);cairo_paint(c);
 cairo_set_source_rgb(c,0,0,0);cairo_set_font_face(c,face);cairo_set_font_size(c,24);cairo_move_to(c,8,40);cairo_show_text(c,"Cairo X11");
 assert(cairo_status(c)==CAIRO_STATUS_SUCCESS);cairo_surface_flush(surface);assert(cairo_surface_status(surface)==CAIRO_STATUS_SUCCESS);XSync(d,False);
 XImage *image=XGetImage(d,p,0,0,160,60,AllPlanes,ZPixmap);assert(image);unsigned long background=XGetPixel(image,0,0);unsigned changed=0;
 for(int y=0;y<60;y++)for(int x=0;x<160;x++)changed+=XGetPixel(image,x,y)!=background;
 assert(changed>50);printf("Rendered FreeType glyph pixels: %u\n",changed);
 XDestroyImage(image);cairo_destroy(c);cairo_surface_destroy(surface);cairo_font_face_destroy(face);XFreePixmap(d,p);
 FcPatternDestroy(match);FcPatternDestroy(pattern);FcConfigDestroy(config);XCloseDisplay(d);puts("GRAPHICS-CONSUMER-PASS");return 0;
}
