/* Read-only X11 observations for real browser-driven JWM acceptance.
 * absent means no viewable matching window, not process termination.
 * Harness lifecycle checks and its outer deadline are separate obligations. */
#include <X11/Xlib.h>
#include <X11/Xutil.h>
#include <X11/Xatom.h>
#include <stdio.h>
#include <string.h>
#include <unistd.h>
static Window named(Display*d,Window w,const char*target,int depth){
 if(depth>16)return None;
 XWindowAttributes a;if(!XGetWindowAttributes(d,w,&a)||a.map_state!=IsViewable)return None;
 char*name=NULL;int match=0;
 if(XFetchName(d,w,&name)&&name){match=!strcmp(name,target);XFree(name);}
 XClassHint h={0};if(XGetClassHint(d,w,&h)){
  if(h.res_class&&!strcmp(h.res_class,target))match=1;
  if(h.res_name)XFree(h.res_name);if(h.res_class)XFree(h.res_class);
 }
 /* Prefer the client over a window-manager frame bearing the same title. */
 Window root,parent,*children=NULL,found=None;unsigned count=0;
 if(XQueryTree(d,w,&root,&parent,&children,&count))
  for(unsigned i=0;i<count&&!found;i++)found=named(d,children[i],target,depth+1);
 if(children)XFree(children);return found?found:match?w:None;
}
static int property(Display*d,Window w,const char*key,Atom type,Atom value){
 Atom actual;int format;unsigned long count,rest;unsigned char*bytes=NULL;
 int ok=XGetWindowProperty(d,w,XInternAtom(d,key,False),0,1,False,type,&actual,&format,&count,&rest,&bytes)==Success&&actual==type&&format==32&&count==1;
 if(ok&&value)ok=*(Atom*)bytes==value;if(bytes)XFree(bytes);return ok;
}
int main(int argc,char**argv){
 if(argc<2||argc>3)return 1;Display*d=XOpenDisplay(NULL);if(!d)return 2;
 Window root=DefaultRootWindow(d);
 for(int i=0;i<300;i++){
  if(!strcmp(argv[1],"wm")&&property(d,root,"_NET_SUPPORTING_WM_CHECK",XA_WINDOW,None)){
   puts("WM_READY");XCloseDisplay(d);return 0;
  }
  Window w=None;
  if(!strcmp(argv[1],"menu")){
   Window r,p,*children=NULL;unsigned count=0;
   if(XQueryTree(d,root,&r,&p,&children,&count))for(unsigned k=0;k<count;k++){
    XWindowAttributes a;
    if(property(d,children[k],"_NET_WM_WINDOW_TYPE",XA_ATOM,XInternAtom(d,"_NET_WM_WINDOW_TYPE_MENU",False))&&XGetWindowAttributes(d,children[k],&a)&&a.map_state==IsViewable){w=children[k];break;}
   }
   if(children)XFree(children);
  }else if(argc==3)w=named(d,root,argv[2],0);
  if(argc==3&&!strcmp(argv[1],"absent")&&!w){puts("WINDOW_ABSENT");XCloseDisplay(d);return 0;}
  if(w&&strcmp(argv[1],"absent")){
   XWindowAttributes a;int x,y;Window child;
   if(XGetWindowAttributes(d,w,&a)&&XTranslateCoordinates(d,w,root,0,0,&x,&y,&child)){
    Atom actual;int format;unsigned long count,rest,pid=0;unsigned char*bytes=NULL;
    if(XGetWindowProperty(d,w,XInternAtom(d,"_NET_WM_PID",False),0,1,False,XA_CARDINAL,&actual,&format,&count,&rest,&bytes)==Success&&actual==XA_CARDINAL&&format==32&&count==1)pid=*(unsigned long*)bytes;
    if(bytes)XFree(bytes);
    printf("WINDOW %lu %d %d %d %d %lu\n",w,x,y,a.width,a.height,pid);XCloseDisplay(d);return 0;
   }
  }
  usleep(100000);
 }
 XCloseDisplay(d);return 3;
}
