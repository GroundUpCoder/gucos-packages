#include <X11/Xlib.h>
#include <X11/Xutil.h>
#include <X11/Xatom.h>
#include <X11/keysym.h>
#include <X11/extensions/XTest.h>
#include <assert.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
static Display *d; static Window root, requestor;
static void pause_ms(int ms){XSync(d,False);usleep(ms*1000);}
static Window find_class(const char *s){Window r,p,*c=0,result=0;unsigned n=0;assert(XQueryTree(d,root,&r,&p,&c,&n));for(unsigned i=0;i<n;i++){XClassHint h={0};if(XGetClassHint(d,c[i],&h)){if(h.res_class&&!strcmp(h.res_class,s))result=c[i];if(h.res_name)XFree(h.res_name);if(h.res_class)XFree(h.res_class);}if(result)break;}if(c)XFree(c);return result;}
static Window wait_class(const char *s){for(int i=0;i<150;i++){Window w=find_class(s);if(w){XWindowAttributes a;XGetWindowAttributes(d,w,&a);if(a.map_state==IsViewable)return w;}pause_ms(100);}fprintf(stderr,"Missing class %s\n",s);exit(1);}
static unsigned long pixels(Window w){XWindowAttributes a;assert(XGetWindowAttributes(d,w,&a));XImage *im=XGetImage(d,w,0,0,a.width,a.height,AllPlanes,ZPixmap);assert(im);unsigned long hash=2166136261UL,first=XGetPixel(im,0,0);int different=0;for(int y=0;y<a.height;y++)for(int x=0;x<a.width;x++){unsigned long v=XGetPixel(im,x,y);different+=v!=first;hash=(hash^v)*16777619UL;}XDestroyImage(im);assert(different>10);return hash;}
static void key(KeySym s){KeyCode k=XKeysymToKeycode(d,s);assert(k);XTestFakeKeyEvent(d,k,True,0);XTestFakeKeyEvent(d,k,False,0);pause_ms(40);}
static void modifier(KeySym s,int down){KeyCode k=XKeysymToKeycode(d,s);assert(k);XTestFakeKeyEvent(d,k,down,0);pause_ms(20);}
static void click(Window w,int x,int y){Window child;int rx,ry;assert(XTranslateCoordinates(d,w,root,x,y,&rx,&ry,&child));XTestFakeMotionEvent(d,-1,rx,ry,0);XTestFakeButtonEvent(d,1,True,0);XTestFakeButtonEvent(d,1,False,0);pause_ms(250);}
static Window child_at(Window w,unsigned index){Window r,p,*c=0;unsigned n=0;assert(XQueryTree(d,w,&r,&p,&c,&n));assert(index<n);for(unsigned i=0;i<n;i++)for(unsigned j=i+1;j<n;j++){XWindowAttributes a,b;assert(XGetWindowAttributes(d,c[i],&a));assert(XGetWindowAttributes(d,c[j],&b));if(b.y<a.y||(b.y==a.y&&b.x<a.x)){Window temp=c[i];c[i]=c[j];c[j]=temp;}}Window result=c[index];XFree(c);return result;}
static void center_click(Window w){XWindowAttributes a;assert(XGetWindowAttributes(d,w,&a));click(w,a.width/2,a.height/2);}
static void selection(Atom atom,char *output,size_t capacity){Atom prop=XInternAtom(d,"MIGRATION_SELECTION",False);XConvertSelection(d,atom,XA_STRING,prop,requestor,CurrentTime);XFlush(d);for(int i=0;i<100;i++){while(XPending(d)){XEvent e;XNextEvent(d,&e);if(e.type==SelectionNotify&&e.xselection.requestor==requestor){assert(e.xselection.property==prop);Atom type;int format;unsigned long n,left;unsigned char *data=0;assert(XGetWindowProperty(d,requestor,prop,0,1024,True,AnyPropertyType,&type,&format,&n,&left,&data)==Success);assert(format==8&&n<capacity&&!left);memcpy(output,data,n);output[n]=0;XFree(data);return;}}pause_ms(50);}assert(!"selection timed out");}
static void clipboard_roundtrip(void){Atom clip=XInternAtom(d,"CLIPBOARD",False);const char *text="migration clipboard retained";XSetSelectionOwner(d,clip,requestor,CurrentTime);XFlush(d);int served=0;for(int i=0;i<100;i++){while(XPending(d)){XEvent e;XNextEvent(d,&e);if(e.type==SelectionRequest){XSelectionRequestEvent *r=&e.xselectionrequest;Atom prop=r->property?r->property:r->target;XChangeProperty(d,r->requestor,prop,r->target,8,PropModeReplace,(const unsigned char *)text,(int)strlen(text));XEvent reply={0};reply.xselection.type=SelectionNotify;reply.xselection.display=d;reply.xselection.requestor=r->requestor;reply.xselection.selection=r->selection;reply.xselection.target=r->target;reply.xselection.property=prop;reply.xselection.time=r->time;XSendEvent(d,r->requestor,False,0,&reply);XFlush(d);served=1;}}
 if(served&&XGetSelectionOwner(d,clip)!=requestor){char result[256];selection(clip,result,sizeof result);assert(!strcmp(result,text));puts("CLIPBOARD-TRANSFER-PASS");return;}pause_ms(50);}assert(!"clipboard manager did not retain transfer");}
int main(void){setvbuf(stdout,NULL,_IOLBF,0);d=XOpenDisplay(0);assert(d);root=DefaultRootWindow(d);requestor=XCreateSimpleWindow(d,root,0,0,1,1,0,0,0);XTestGrabControl(d,True);
 const char *classes[]={"Xedit","XFontSel","XClipboard","XCutsel","Clock"};Window windows[5];for(int i=0;i<5;i++){windows[i]=wait_class(classes[i]);pause_ms(200);pixels(windows[i]);printf("MAPPED %s\n",classes[i]);fflush(stdout);}
 unsigned long clock_before=pixels(windows[4]);
 XSetInputFocus(d,windows[0],RevertToParent,CurrentTime);pause_ms(100);const char *text="hello migrated editor";for(const char *p=text;*p;p++)key((KeySym)*p);key(XK_Return);modifier(XK_Control_L,1);key(XK_x);key(XK_s);modifier(XK_Control_L,0);pause_ms(500);FILE *f=fopen("/home/user/migration-xedit.txt","r");assert(f);char data[512]={0};fread(data,1,511,f);fclose(f);assert(!strcmp(data,"hello migrated editor\n"));puts("XEDIT-SAVE-PASS");
 Atom primary_font=XInternAtom(d,"PRIMARY_FONT",False);selection(primary_font,data,sizeof data);assert(data[0]=='-');XFontStruct *font=XLoadQueryFont(d,data);assert(font);XFreeFont(d,font);puts("FONT-SELECTION-LOAD-PASS");
 XStoreBuffer(d,"cut buffer migrated",19,0);XFlush(d);Window box=child_at(windows[3],0);center_click(child_at(box,2));selection(XA_PRIMARY,data,sizeof data);assert(!strcmp(data,"cut buffer migrated"));XStoreBuffer(d,"changed",7,0);center_click(child_at(box,1));int len;char *buffer=XFetchBuffer(d,&len,0);assert(len==19&&!memcmp(buffer,"cut buffer migrated",19));XFree(buffer);puts("CUTSEL-BIDIRECTIONAL-PASS");
 clipboard_roundtrip();
 int changed=0;for(int i=0;i<70;i++){pause_ms(1000);if(pixels(windows[4])!=clock_before){changed=1;break;}}assert(changed);puts("OCLOCK-UPDATE-PASS");
 puts("MIGRATED-XCLIENTS-PASS");fflush(stdout);XDestroyWindow(d,requestor);XCloseDisplay(d);return 0;}
