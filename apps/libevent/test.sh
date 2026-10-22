#!/bin/sh
set -eu
cat > consumer.c <<'EOF'
#include <event2/event.h>
#include <event2/buffer.h>
#include <assert.h>
#include <string.h>
static int calls;
static void timer(evutil_socket_t fd,short flags,void *arg){assert(flags&EV_TIMEOUT);calls++;}
int main(void){
 struct event_base *base=event_base_new();assert(base);
 struct event *ev=evtimer_new(base,timer,0);assert(ev);
 struct timeval delay={0,1000};assert(evtimer_add(ev,&delay)==0);
 /* Upstream returns 1 when the one-shot timer leaves no events. */
 assert(event_base_dispatch(base)==1);assert(calls==1);
 struct evbuffer *buf=evbuffer_new();assert(buf);assert(evbuffer_add(buf,"hello",5)==0);
 char text[6]={0};assert(evbuffer_remove(buf,text,5)==5);assert(strcmp(text,"hello")==0);
 evbuffer_free(buf);event_free(ev);event_base_free(base);return 0;
}
EOF
cc -I"$DESTDIR/include" consumer.c "$DESTDIR/lib/libevent.a" -o static-test
./static-test
cc -I"$DESTDIR/include" consumer.c -L"$DESTDIR/lib" -levent -o shared-test
LD_LIBRARY_PATH="$DESTDIR/lib" ./shared-test
cc -I"$DESTDIR/include" source/port/test.c "$DESTDIR/lib/libevent.a" -o static-test
./static-test
cc -I"$DESTDIR/include" source/port/test.c -L"$DESTDIR/lib" -levent -o shared-test
LD_LIBRARY_PATH="$DESTDIR/lib" ./shared-test
