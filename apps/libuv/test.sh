#!/bin/sh
set -eu
cat > consumer.c <<'EOF'
#include <uv.h>
#include <assert.h>
static int calls;
static void timer(uv_timer_t *t){calls++;uv_close((uv_handle_t*)t,0);}
int main(void){uv_loop_t loop;uv_timer_t t;assert(uv_loop_init(&loop)==0);
 assert(uv_timer_init(&loop,&t)==0);assert(uv_timer_start(&t,timer,1,0)==0);
 assert(uv_run(&loop,UV_RUN_DEFAULT)==0);assert(calls==1);assert(uv_loop_close(&loop)==0);return 0;}
EOF
cc --enable-fork -I"$DESTDIR/include" -I"$DESTDIR/include/wasm-posix-libuv" consumer.c "$DESTDIR/lib/libuv.a" -o static-test
./static-test
cc --enable-fork -I"$DESTDIR/include" -I"$DESTDIR/include/wasm-posix-libuv" consumer.c -L"$DESTDIR/lib" -luv -o shared-test
LD_LIBRARY_PATH="$DESTDIR/lib" ./shared-test
cc --enable-fork -I"$DESTDIR/include" -I"$DESTDIR/include/wasm-posix-libuv" source/port/test.c "$DESTDIR/lib/libuv.a" -o static-test
./static-test
cc --enable-fork -I"$DESTDIR/include" -I"$DESTDIR/include/wasm-posix-libuv" source/port/test.c -L"$DESTDIR/lib" -luv -o shared-test
LD_LIBRARY_PATH="$DESTDIR/lib" ./shared-test
