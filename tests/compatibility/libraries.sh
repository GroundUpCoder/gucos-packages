set -eu
# Execute original installed CLI bytes. Compile only probes, never packages.
lua -e 'local ok,e=pcall(function()error("retained")end);assert(not ok and e:match("retained"));local c=coroutine.create(function()coroutine.yield(42)end);local ok,v=coroutine.resume(c);assert(ok and v==42);print("LEGACY-LUA-RUN-PASS")'
printf 'assert(6*7==42);print("LEGACY-LUAC-PASS")\n' > /tmp/compatibility.lua
luac -o /tmp/compatibility.luac /tmp/compatibility.lua
lua /tmp/compatibility.luac
cat > /tmp/compatibility-lua.c <<'C'
#include <lua.h>
#include <lauxlib.h>
#include <lualib.h>
int main(void){lua_State *L=luaL_newstate();if(!L)return 1;luaL_openlibs(L);if(luaL_dostring(L,"return 6*7"))return 2;int bad=lua_tointeger(L,-1)!=42;lua_close(L);return bad;}
C
cc /tmp/compatibility-lua.c -I/usr/local/include -L/usr/local/lib -llua -lm -o /tmp/compatibility-lua
/tmp/compatibility-lua
echo RETAINED-LUA-RELINK-PASS
cat > /tmp/compatibility-zstd.c <<'C'
#include <zstd.h>
#include <string.h>
int main(void){char a[128],b[128];const char*s="retained archive round trip";size_t n=ZSTD_compress(a,sizeof a,s,strlen(s)+1,1);if(ZSTD_isError(n))return 1;size_t m=ZSTD_decompress(b,sizeof b,a,n);return ZSTD_isError(m)||strcmp(s,b);}
C
cc /tmp/compatibility-zstd.c -I/usr/local/include -L/usr/local/lib -lzstd -o /tmp/compatibility-zstd
/tmp/compatibility-zstd
dd if=/dev/zero of=/tmp/compatibility-input bs=1024 count=1024
zstd -q -T2 -f /tmp/compatibility-input -o /tmp/compatibility.zst
zstd -t /tmp/compatibility.zst
zstd -q -d -f /tmp/compatibility.zst -o /tmp/compatibility-output
cmp /tmp/compatibility-input /tmp/compatibility-output
printf invalid > /tmp/compatibility-invalid.zst
if zstd -q -d -f /tmp/compatibility-invalid.zst -o /tmp/compatibility-bad-output; then exit 1; fi
echo RETAINED-ZSTD-RUN-RELINK-PASS
cat > /tmp/compatibility-xaw.c <<'C'
#include <X11/Intrinsic.h>
#include <X11/StringDefs.h>
#include <X11/Xaw/Label.h>
#include <X11/xpm.h>
#include <stdio.h>
int main(int argc,char **argv){XtAppContext app;Widget top=XtVaAppInitialize(&app,"Compatibility",0,0,&argc,argv,0,NULL);if(!top)return 1;XtVaCreateManagedWidget("retained",labelWidgetClass,top,XtNlabel,"Retained Xaw archive",XtNwidth,240,XtNheight,80,NULL);XtRealizeWidget(top);Display*d=XtDisplay(top);char *data[]={"2 2 2 1",". c red","x c blue",".x","x."};Pixmap pix=None,mask=None;int r=XpmCreatePixmapFromData(d,XtWindow(top),data,&pix,&mask,0);if(r!=XpmSuccess)return 2;XWindowAttributes a;if(!XGetWindowAttributes(d,XtWindow(top),&a)||a.map_state!=IsViewable)return 3;XFreePixmap(d,pix);if(mask!=None)XFreePixmap(d,mask);XSync(d,False);XtDestroyWidget(top);XtDestroyApplicationContext(app);puts("RETAINED-XAW-XPM-RELINK-PASS");return 0;}
C
cc /tmp/compatibility-xaw.c -I/usr/local/include -L/usr/local/lib -lXaw7 -lXmu -lXt -lXpm -lSM -lICE -lXrender -lXext -lX11 -lxcb -lXau -lm -o /tmp/compatibility-xaw
rm -f /tmp/.X1-lock /tmp/.X11-unix/X1
export DISPLAY=:1
Xvfb :1 -screen 0 800x600x24 -fp built-ins -noreset -ac &
server=$!
trap 'kill "$server" 2>/dev/null; wait "$server" 2>/dev/null' EXIT
/usr/local/libexec/jwm/wait-display
/tmp/compatibility-xaw
kill "$server"
wait "$server"
trap - EXIT
echo LEGACY-LIBRARY-ACCEPTANCE-PASS
