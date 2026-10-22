/* Adapted from historical apps/x11-apps-more/source/tests/control.c. */
#include <X11/Xlib.h>
#include <X11/Xutil.h>
#include <X11/keysym.h>
#include <X11/extensions/XTest.h>
#include <assert.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
static Display *d;static Window root;
static void pause_ms(int ms){XSync(d,False);usleep(ms*1000);}
static Window find_class(const char *s){Window r,p,*c=NULL,result=0;unsigned n=0;assert(XQueryTree(d,root,&r,&p,&c,&n));for(unsigned i=0;i<n;i++){XClassHint h={0};if(XGetClassHint(d,c[i],&h)){if(h.res_class&&!strcmp(h.res_class,s))result=c[i];if(h.res_name)XFree(h.res_name);if(h.res_class)XFree(h.res_class);}if(result)break;}if(c)XFree(c);return result;}
static Window wait_class(const char *s){Window w;for(int i=0;i<200;i++){w=find_class(s);if(w){XWindowAttributes a;XGetWindowAttributes(d,w,&a);if(a.map_state==IsViewable)return w;}pause_ms(100);}fprintf(stderr,"Missing class %s\n",s);exit(1);}
static unsigned long pixels(Window w,int top){XWindowAttributes a;assert(XGetWindowAttributes(d,w,&a));int height=top&&a.height>65?65:a.height;XImage *im=XGetImage(d,w,0,0,a.width,height,AllPlanes,ZPixmap);assert(im);unsigned long h=2166136261UL,first=XGetPixel(im,0,0);int different=0;for(int y=0;y<height;y++)for(int x=0;x<a.width;x++){unsigned long v=XGetPixel(im,x,y);if(v!=first)different++;h=(h^v)*16777619UL;}XDestroyImage(im);assert(different>10);return h;}
static void key(KeySym s){KeyCode k=XKeysymToKeycode(d,s);assert(k);XTestFakeKeyEvent(d,k,True,0);XTestFakeKeyEvent(d,k,False,0);pause_ms(80);}
static void modifier(KeySym s,int down){KeyCode k=XKeysymToKeycode(d,s);assert(k);XTestFakeKeyEvent(d,k,down,0);pause_ms(20);}
static void marker(const char *s){FILE *f=fopen("/tmp/xapps-stage","w");assert(f);fputs(s,f);fclose(f);printf("XAPPS %s\n",s);fflush(stdout);}
int main(void){d=XOpenDisplay(NULL);assert(d);root=DefaultRootWindow(d);XTestGrabControl(d,True);
 const char *classes[]={"XClock","XCalc","XEyes","XLogo","Xmessage"};Window w[5];for(int i=0;i<5;i++){w[i]=wait_class(classes[i]);pause_ms(200);pixels(w[i],0);printf("MAPPED %s\n",classes[i]);fflush(stdout);}
 unsigned long a=pixels(w[0],0);pause_ms(2200);assert(pixels(w[0],0)!=a);marker("clock-ticks");
 XTestFakeMotionEvent(d,-1,540,30,0);pause_ms(800);a=pixels(w[2],0);XTestFakeMotionEvent(d,-1,710,110,0);pause_ms(800);assert(pixels(w[2],0)!=a);marker("eyes-follow");
 XSetInputFocus(d,w[1],RevertToParent,CurrentTime);pause_ms(100);key(XK_BackSpace);key(XK_1);modifier(XK_Shift_L,1);key(XK_equal);modifier(XK_Shift_L,0);key(XK_2);key(XK_equal);pause_ms(200);a=pixels(w[1],1);key(XK_BackSpace);pause_ms(100);unsigned long cleared=pixels(w[1],1);key(XK_3);pause_ms(100);unsigned long three=pixels(w[1],1);assert(a!=cleared&&a==three);marker("calculator-result-three");
 XSetInputFocus(d,w[4],RevertToParent,CurrentTime);key(XK_Return);marker("message-button");
 Window r,p,*children=0;unsigned count=0;assert(XQueryTree(d,root,&r,&p,&children,&count));Window event=0;for(unsigned i=0;i<count;i++){char *name=0;if(XFetchName(d,children[i],&name)&&name){if(!strcmp(name,"Event Tester"))event=children[i];XFree(name);}}if(children)XFree(children);assert(event);XSetInputFocus(d,event,RevertToParent,CurrentTime);key(XK_a);marker("event-key");
 FILE *f=fopen("/tmp/xapps-kill-id","w");assert(f);fprintf(f,"%lu",w[3]);fclose(f);
 puts("XCLIENTS-INTERACTION-PASS");fflush(stdout);XCloseDisplay(d);return 0;
}
