#!/bin/sh
set -eu
export LUA_CPATH="$DESTDIR/lib/lua/5.5/?.so"
export LUA_PATH="$DESTDIR/share/lua/5.5/?.lua"
lua55 source/test.lua
lua55 -e 'assert(require("lpeg").version=="LPeg 1.1.0"); assert(require("re").match("abc123", "{%a+}")=="abc")'
echo LPEG-UPSTREAM-PASS
lua55 -e 'local a=require"lpeg"; assert(a==require"lpeg"); package.loaded.lpeg=nil; collectgarbage(); local b=require"lpeg"; assert(b.match(b.P"hello", "hello")==6); local f,e=package.loadlib(os.getenv("DESTDIR").."/lib/lua/5.5/lpeg.so", "missing_entry"); assert(f==nil and type(e)=="string"); assert(package.loadlib(os.getenv("DESTDIR").."/lib/lua/5.5/lpeg.so", "luaopen_lpeg")); print("LUA-PLUGIN-PASS")'
