# Lua 5.5 module profile

Retains the historical Lua5.5.0 profile: 32 library units with the original
LUA_USE_DLOPEN flag and interpreter main. Installs as lua55, liblua5.5.a and
include/lua5.5 to preserve every baseline Lua5.4.9 file and catalog reference.
Tests cover retained closure/string logic, bytecode, actual dynamic C-module
loading/caching and static SDK embedding. Fresh guest acceptance remains pending.
