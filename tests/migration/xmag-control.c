/* Adapted from pinned apps/xmag/source/tests/control.c: require exact 6x area. */
#include <X11/Xlib.h>
#include <X11/Xutil.h>
#include <stdio.h>
#include <string.h>
#include <unistd.h>
int main(int argc,char **argv){
 Display*d=XOpenDisplay(NULL);if(!d)return 1;Window root=DefaultRootWindow(d);
 if(argc>1&&!strcmp(argv[1],"paint")){
  GC gc=XCreateGC(d,root,0,NULL);XSetForeground(d,gc,0xff0000);
  XFillRectangle(d,root,gc,0,0,40,40);XSync(d,False);XFreeGC(d,gc);XCloseDisplay(d);return 0;
 }
 for(int t=0;t<100;t++){
  Window r,p,*children=NULL;unsigned count=0;
  if(!XQueryTree(d,root,&r,&p,&children,&count))return 2;
  for(unsigned i=0;i<count;i++){
   XClassHint h={0};if(!XGetClassHint(d,children[i],&h))continue;
   int match=h.res_class&&!strcmp(h.res_class,"Xmag");
   if(h.res_name)XFree(h.res_name);if(h.res_class)XFree(h.res_class);if(!match)continue;
   XWindowAttributes a;if(!XGetWindowAttributes(d,children[i],&a)||a.map_state!=IsViewable)continue;
   XImage*im=XGetImage(d,children[i],0,0,a.width,a.height,AllPlanes,ZPixmap);
   unsigned red=0;int left=a.width,top=a.height,right=-1,bottom=-1;
   if(im){
    for(int y=0;y<a.height;y++)for(int x=0;x<a.width;x++)if((XGetPixel(im,x,y)&0xffffff)==0xff0000){
     red++;if(x<left)left=x;if(x>right)right=x;if(y<top)top=y;if(y>bottom)bottom=y;
    }
    XDestroyImage(im);
   }
   if(red==240u*240u&&right-left+1==240&&bottom-top+1==240){
    XSetInputFocus(d,children[i],RevertToPointerRoot,CurrentTime);XSync(d,False);
    printf("XMAG-6X-PIXELS %u 240 240\n",red);XFree(children);XCloseDisplay(d);return 0;
   }
  }
  if(children)XFree(children);usleep(100000);
 }
 fprintf(stderr,"exact 240x240 magnification of 40x40 source missing\n");XCloseDisplay(d);return 2;
}
