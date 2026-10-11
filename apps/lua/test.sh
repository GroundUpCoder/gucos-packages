#!/bin/sh
set -eu
"$DESTDIR/bin/lua" -e 'local ok,err=pcall(function()error("caught")end);assert(not ok and err:match("caught"));local t={3,1,2};table.sort(t);assert(table.concat(t,",")=="1,2,3");local co=coroutine.create(function()coroutine.yield(42)end);local ok,v=coroutine.resume(co);assert(ok and v==42)'
printf 'assert(6*7==42);print("LUA-BYTECODE-PASS")\n' > test.lua
"$DESTDIR/bin/luac" -o test.luac test.lua
"$DESTDIR/bin/lua" test.luac
