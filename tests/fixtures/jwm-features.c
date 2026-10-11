/* Adapted from preserved JWM test; no xedit package in this scope. */
#include <X11/Xlib.h>
#include <X11/Xutil.h>
#include <X11/Xatom.h>
#include <X11/extensions/XTest.h>
#include <assert.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
static Display *d;
static Window root;
static Window find(Window w,const char *name){
 char *s=NULL;Window r,p,*children=NULL,result=0;unsigned count=0;
 if(XFetchName(d,w,&s)&&s){int same=!strcmp(s,name);XFree(s);if(same)return w;}
 if(XQueryTree(d,w,&r,&p,&children,&count)){for(unsigned i=0;i<count&&!result;i++)result=find(children[i],name);if(children)XFree(children);}
 return result;
}
static void pause_ms(int n);
static Window find_class(Window w,const char *name){
 XClassHint h={0};Window r,p,*c=NULL,result=0;unsigned n=0;
 if(XGetClassHint(d,w,&h)){if(h.res_class&&!strcmp(h.res_class,name))result=w;if(h.res_name)XFree(h.res_name);if(h.res_class)XFree(h.res_class);}
 if(!result&&XQueryTree(d,w,&r,&p,&c,&n)){for(unsigned i=0;i<n&&!result;i++)result=find_class(c[i],name);if(c)XFree(c);}
 return result;
}
static Window wait_class(const char *name){Window w;for(int i=0;i<200;i++){w=find_class(root,name);if(w)return w;pause_ms(100);}fprintf(stderr,"Missing class %s\n",name);exit(1);}
static Window parent(Window w){Window r,p,*c=NULL;unsigned n;assert(XQueryTree(d,w,&r,&p,&c,&n));if(c)XFree(c);return p;}
static XWindowAttributes attr(Window w){XWindowAttributes a;assert(XGetWindowAttributes(d,w,&a));return a;}
static void pause_ms(int n){XSync(d,False);usleep(n*1000);}
static void motion(int x,int y){XTestFakeMotionEvent(d,-1,x,y,0);pause_ms(100);}
static void button(int b,int down){XTestFakeButtonEvent(d,b,down,0);pause_ms(150);}
static void click(int x,int y,int b){motion(x,y);button(b,1);button(b,0);}
/* Bundled height=24 plus upstream BASE_ICON_OFFSET=3 on each side. */
static void menu_item(int index){click(650,10,3);click(670,26+30*index,1);}
static Window wait_name(const char *name){Window w;for(int i=0;i<200;i++){w=find(root,name);if(w)return w;pause_ms(100);}fprintf(stderr,"Missing %s\n",name);exit(1);}
static void marker(const char *s){FILE *f=fopen("/tmp/jwm-stage","w");assert(f);fputs(s,f);fclose(f);printf("JWM %s\n",s);fflush(stdout);}
static long state(Window w,Window *icon){Atom actual;int format;unsigned long n,left;unsigned char *v=NULL;long result=-1;XGetWindowProperty(d,w,XInternAtom(d,"WM_STATE",False),0,2,False,AnyPropertyType,&actual,&format,&n,&left,&v);if(n>=2){result=((long*)v)[0];if(icon)*icon=((long*)v)[1];}if(v)XFree(v);return result;}
static unsigned long prop(Window w,const char *name){Atom type;int format;unsigned long n,left,value=~0UL;unsigned char *data=NULL;XGetWindowProperty(d,w,XInternAtom(d,name,False),0,1024,False,AnyPropertyType,&type,&format,&n,&left,&data);if(n&&format==32)value=((unsigned long*)data)[0];if(data)XFree(data);return value;}
static int clients(void){Atom type;int format;unsigned long n,left;unsigned char *data=NULL;XGetWindowProperty(d,root,XInternAtom(d,"_NET_CLIENT_LIST",False),0,1024,False,AnyPropertyType,&type,&format,&n,&left,&data);if(data)XFree(data);return n;}
int main(int argc,char **argv){
 d=XOpenDisplay(NULL);assert(d);root=DefaultRootWindow(d);XTestGrabControl(d,True);assert(DisplayWidth(d,DefaultScreen(d))==800);assert(DisplayHeight(d,DefaultScreen(d))==600);
 if(argc>1){Window w=wait_name("JWM_TERMINAL");for(int i=0;i<100&&parent(w)==root;i++)pause_ms(100);assert(parent(w)!=root);XCloseDisplay(d);return 0;}
 Window a=wait_name("JWM_TERMINAL"),b=wait_name("JWM_WIDGETS");
 for(int i=0;i<100&&(parent(a)==root||parent(b)==root);i++)pause_ms(100);
 Window frame=parent(a);assert(frame!=root&&parent(b)!=root&&frame!=parent(b));
 XWindowAttributes ca=attr(a),fa=attr(frame);assert(fa.height>ca.height&&ca.y>0);assert(state(a,NULL)==NormalState);assert(clients()==2);marker("decorated");
 motion(fa.x+100,fa.y+ca.y/2);button(1,1);motion(fa.x+180,fa.y+ca.y/2+50);button(1,0);
 XWindowAttributes moved=attr(frame);printf("MOVE %d %d -> %d %d\n",fa.x,fa.y,moved.x,moved.y);assert(moved.x>fa.x+40&&moved.y>fa.y+20);marker("moved");
 motion(moved.x+moved.width-2,moved.y+moved.height-2);button(1,1);motion(moved.x+moved.width+90,moved.y+moved.height+55);button(1,0);
 XWindowAttributes resized=attr(a);printf("RESIZED %dx%d -> %dx%d\n",ca.width,ca.height,resized.width,resized.height);assert(resized.width>ca.width&&resized.height>ca.height);marker("resized");
 fa=attr(frame);click(fa.x+fa.width-60,fa.y+ca.y/2,1);
 for(int i=0;i<100&&state(a,NULL)!=IconicState;i++)pause_ms(100);
 assert(state(a,NULL)==IconicState);assert(attr(frame).map_state==IsUnmapped);assert(clients()==2);marker("minimized");
 click(240,585,1);
 for(int i=0;i<100&&state(a,NULL)!=NormalState;i++)pause_ms(100);
 assert(state(a,NULL)==NormalState&&attr(frame).map_state==IsViewable);marker("restored");
 for(int i=0;i<300&&access("/tmp/jwm-pager-ready",F_OK);i++)pause_ms(100);
 click(82,585,1);for(int i=0;i<100&&prop(root,"_NET_CURRENT_DESKTOP")!=1;i++)pause_ms(100);
 assert(prop(root,"_NET_CURRENT_DESKTOP")==1);assert(attr(frame).map_state==IsUnmapped);marker("desktop-two");
 click(42,585,1);for(int i=0;i<100&&prop(root,"_NET_CURRENT_DESKTOP")!=0;i++)pause_ms(100);
 assert(prop(root,"_NET_CURRENT_DESKTOP")==0);assert(attr(frame).map_state==IsViewable);marker("desktop-one");
 menu_item(0);
 Window menu=wait_name("Terminal");for(int i=0;i<100&&parent(menu)==root;i++)pause_ms(100);assert(parent(menu)!=root);assert(clients()==3);XWindowAttributes mf=attr(parent(menu));assert(mf.x>=0&&mf.y>=0&&mf.x+mf.width+2*mf.border_width<=800&&mf.y+mf.height+2*mf.border_width<=570);
 menu_item(1);
 Window calculator=wait_class("XCalc");for(int i=0;i<100&&parent(calculator)==root;i++)pause_ms(100);
 assert(parent(calculator)!=root&&attr(calculator).map_state==IsViewable);assert(clients()==4);marker("menu-calculator");
 marker("screenshot");
 for(int i=0;i<300&&access("/tmp/jwm-captured",F_OK);i++)pause_ms(100);assert(access("/tmp/jwm-captured",F_OK)==0);
 menu_item(5);
 for(int i=0;i<100&&parent(a)!=root;i++)pause_ms(100);
 assert(parent(a)==root&&parent(b)==root&&parent(calculator)==root);assert(attr(a).map_state==IsViewable);marker("quit");
 XCloseDisplay(d);return 0;
}
