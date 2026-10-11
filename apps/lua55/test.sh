#!/bin/sh
set -eu
"$DESTDIR/bin/lua55" -e 'assert(_VERSION=="Lua 5.5"); local function counter(n) return function(d) n=n+d; return n end end; local c=counter(10); assert(c(2)==12 and c(30)==42); assert(string.match("abc123","%d+")=="123"); assert(load(string.dump(function() return 42 end))()==42); print("LUA55-CLOSURE-BYTECODE-PASS")'
cat > module.c <<'C'
#include <lua.h>
#include <lauxlib.h>
static int answer(lua_State *L){ lua_pushinteger(L,42); return 1; }
int luaopen_migrationprobe(lua_State *L){ lua_pushcfunction(L,answer); return 1; }
C
cc -shared -I"$DESTDIR/include/lua5.5" module.c -o migrationprobe.so
LUA_CPATH='./?.so' "$DESTDIR/bin/lua55" -e 'local f=require("migrationprobe"); assert(f()==42); assert(require("migrationprobe")==f); print("LUA55-DYNAMIC-MODULE-PASS")'
cat > embed.c <<'C'
#include <lua.h>
#include <lauxlib.h>
#include <lualib.h>
int main(void){lua_State *L=luaL_newstate(); if(!L)return 1; luaL_openlibs(L); int e=luaL_dostring(L,"assert(_VERSION=='Lua 5.5'); assert(6*7==42)"); lua_close(L); return e;}
C
cc -I"$DESTDIR/include/lua5.5" embed.c "$DESTDIR/lib/liblua5.5.a" -lm -o embed-test
./embed-test
