#include <X11/Xlib.h>
#include <X11/Xutil.h>
#include <X11/Xatom.h>
#include <stdio.h>
#include <string.h>
#include <unistd.h>
static Window find(Display *d,Window w,int depth) {
 if(depth>16)return None;
 char *name=NULL;
 if(XFetchName(d,w,&name)&&name){int match=!strcmp(name,"Snake");XFree(name);if(match&&depth>=2)return w;}
 Window root,parent,*children=NULL,found=None;unsigned count=0;
 if(!XQueryTree(d,w,&root,&parent,&children,&count))return None;
 for(unsigned i=0;i<count&&found==None;i++)found=find(d,children[i],depth+1);
 if(children)XFree(children);return found;
}
int main(int argc,char **argv) {
 if(argc!=2)return 1;Display *d=XOpenDisplay(NULL);if(!d)return 2;
 Window root=DefaultRootWindow(d);int closed=!strcmp(argv[1],"closed");
 for(int i=0;i<250;i++){
  if(!strcmp(argv[1],"wm")){
   Atom type;int format;unsigned long count,rest;unsigned char *data=NULL;
   int ready=XGetWindowProperty(d,root,XInternAtom(d,"_NET_SUPPORTING_WM_CHECK",False),0,1,False,XA_WINDOW,&type,&format,&count,&rest,&data)==Success&&type==XA_WINDOW&&format==32&&count==1;
   if(data)XFree(data);if(ready){puts("DESKTOP-WM-READY");fflush(stdout);XCloseDisplay(d);return 0;}
  }else if(!strcmp(argv[1],"menu")){
   Window r,parent,*children=NULL;unsigned count=0;
   if(XQueryTree(d,root,&r,&parent,&children,&count))for(unsigned k=0;k<count;k++){
    Atom type;int format;unsigned long n,rest;unsigned char *data=NULL;
    int menu=XGetWindowProperty(d,children[k],XInternAtom(d,"_NET_WM_WINDOW_TYPE",False),0,1,False,XA_ATOM,&type,&format,&n,&rest,&data)==Success&&type==XA_ATOM&&format==32&&n==1&&*(Atom *)data==XInternAtom(d,"_NET_WM_WINDOW_TYPE_MENU",False);
    if(data)XFree(data);
    XWindowAttributes a;
    if(menu&&XGetWindowAttributes(d,children[k],&a)&&a.map_state==IsViewable){printf("DESKTOP-MENU %d %d %d %d\n",a.x,a.y,a.width,a.height);fflush(stdout);XFree(children);XCloseDisplay(d);return 0;}
   }
   if(children)XFree(children);
  }else{
   Window w=find(d,root,0);
   if(closed&&w==None){puts("DESKTOP-SNAKE-CLOSED");fflush(stdout);XCloseDisplay(d);return 0;}
   XWindowAttributes a;
   if(!closed&&w!=None&&XGetWindowAttributes(d,w,&a)&&a.map_state==IsViewable){
    XImage *im=XGetImage(d,w,0,0,a.width,a.height,AllPlanes,ZPixmap);
    unsigned green=0,red=0,cyan=0;
    if(im){for(int y=0;y<a.height;y++)for(int x=0;x<a.width;x++){
     /* Exact accepted xterm resource palette, not pure ANSI primaries. */
     unsigned p=XGetPixel(im,x,y)&0xffffff;
     if(p==0x98c379)green++;
     if(p==0xef6b73)red++;
     if(p==0x56b6c2)cyan++;
    }XDestroyImage(im);}
    if(i%25==0){printf("DESKTOP-SNAKE-PIXELS %lu %d %d %u %u %u\n",w,a.width,a.height,green,red,cyan);fflush(stdout);}
    if(green>20&&red>5&&cyan>100){XSetInputFocus(d,w,RevertToParent,CurrentTime);XSync(d,False);printf("DESKTOP-SNAKE-BOARD %u %u %u\n",green,red,cyan);fflush(stdout);XCloseDisplay(d);return 0;}
   }
  }
  usleep(100000);
 }
 XCloseDisplay(d);return 3;
}
