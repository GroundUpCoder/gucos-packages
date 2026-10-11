#include <X11/Xlib.h>
#include <X11/Xutil.h>
#include <stdio.h>
#include <string.h>
#include <unistd.h>
static Display*d;static Window best;static unsigned area;
static void visit(Window w){Window r,p,*c=0;unsigned n=0;XWindowAttributes a;if(!XGetWindowAttributes(d,w,&a)||a.map_state!=IsViewable)return;XQueryTree(d,w,&r,&p,&c,&n);if(n==0&&(unsigned)(a.width*a.height)>area){area=a.width*a.height;best=w;}for(unsigned i=0;i<n;i++)visit(c[i]);if(c)XFree(c);}
int main(void){d=XOpenDisplay(0);if(!d)return 1;Window root=DefaultRootWindow(d);for(int t=0;t<100;t++){Window r,p,*c=0;unsigned n=0;XQueryTree(d,root,&r,&p,&c,&n);for(unsigned i=0;i<n;i++){XClassHint h={0};if(XGetClassHint(d,c[i],&h)){int match=h.res_class&&!strcmp(h.res_class,"Bitmap");if(h.res_name)XFree(h.res_name);if(h.res_class)XFree(h.res_class);if(match)visit(c[i]);}}if(c)XFree(c);if(best&&area>10000){XWindowAttributes a;XGetWindowAttributes(d,best,&a);int x,y;Window child;XTranslateCoordinates(d,best,root,a.width/2,a.height/2,&x,&y,&child);XSetInputFocus(d,best,RevertToPointerRoot,CurrentTime);XSync(d,False);printf("%d %d\n",x,y);XCloseDisplay(d);return 0;}usleep(100000);}return 2;}
