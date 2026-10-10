#!/bin/sh
set -eu
export LUA_CPATH="$DESTDIR/lib/lua/5.4/?.so"
export LUA_PATH="$DESTDIR/share/lua/5.4/?.lua"
lua source/test.lua
lua -e 'assert(require("lpeg").version=="LPeg 1.1.0"); assert(require("re").match("abc123", "{%a+}")=="abc")'
echo LPEG-UPSTREAM-PASS
