set -eu
gucman build expansion:lua
lua -e 'local f=assert(io.open("/home/user/lua-persistence.txt","w"));f:write("persisted");f:close();assert(os.execute("true"));print("LUA-RUNTIME-PASS")'
cat > /tmp/lua-embed.c <<'C'
#include <lua.h>
#include <lauxlib.h>
#include <lualib.h>
int main(void){lua_State *L=luaL_newstate();if(!L)return 1;luaL_openlibs(L);if(luaL_dostring(L,"return 6*7"))return 2;int bad=lua_tointeger(L,-1)!=42;lua_close(L);return bad;}
C
cc /tmp/lua-embed.c -I/usr/local/include -L/usr/local/lib -llua -lm -o /tmp/lua-embed
/tmp/lua-embed
echo LUA-EMBED-PASS
