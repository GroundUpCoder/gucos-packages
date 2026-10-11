#include <X11/Xlib.h>
#include <X11/Xutil.h>
#include <assert.h>
#include <stdio.h>
#include <unistd.h>
static Window parent(Display *d,Window w){Window r,p,*c=0;unsigned n;assert(XQueryTree(d,w,&r,&p,&c,&n));if(c)XFree(c);return p;}
int main(void){
 Display *a=XOpenDisplay(0),*b=XOpenDisplay(0);assert(a&&b);Window root=DefaultRootWindow(a);
 Window wa=XCreateSimpleWindow(a,root,30,40,220,140,0,0,0x336699),wb=XCreateSimpleWindow(b,root,350,80,180,100,0,0,0x996633);
 XStoreName(a,wa,"VT Xlib client A");XStoreName(b,wb,"VT Xlib client B");XMapWindow(a,wa);XMapWindow(b,wb);XFlush(a);XFlush(b);
 for(int i=0;i<100&&(parent(a,wa)==root||parent(b,wb)==root);i++)usleep(100000);
 Window frame=parent(a,wa);assert(frame!=root&&parent(b,wb)!=root&&frame!=parent(b,wb));
 XWindowAttributes fa,ca;assert(XGetWindowAttributes(a,frame,&fa));assert(XGetWindowAttributes(a,wa,&ca));assert(ca.y>0&&fa.height>ca.height);
 FILE *f=fopen("/tmp/twm-geometry","w");assert(f);fprintf(f,"%d %d %d %d %d",fa.x,fa.y,fa.width,fa.height,ca.y);fclose(f);
 puts("TWM-DECORATED");fflush(stdout);
 XWindowAttributes now;int moved=0;for(int i=0;i<150;i++){XGetWindowAttributes(a,frame,&now);if(now.x>fa.x+30&&now.y>fa.y+15){moved=1;break;}usleep(100000);}assert(moved);
 puts("TWM-MOVED");fflush(stdout);
 for(int i=0;i<40;i++){XSetWindowBackground(a,wa,(i*10000)&0xffffff);XClearWindow(a,wa);XSync(a,False);XSync(b,False);usleep(100000);}
 puts("TWM-HIDDEN-PROGRESS-PASS");fflush(stdout);XCloseDisplay(b);XCloseDisplay(a);return 0;
}
