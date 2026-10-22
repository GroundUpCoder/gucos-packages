#!/bin/sh
set -eu
export PATH="$DESTDIR/bin:$PATH"
export TERM=xterm-256color
export TERMINFO="$DESTDIR"/share/terminfo
tic -V
infocmp xterm-256color > /tmp/xterm.info
grep 'colors#0x100' /tmp/xterm.info
test "$(tput colors)" = 256
mkdir -p /tmp/terminfo-roundtrip
tic -x -o /tmp/terminfo-roundtrip /tmp/xterm.info
TERMINFO=/tmp/terminfo-roundtrip infocmp xterm-256color > /tmp/roundtrip.info
TERMINFO=/tmp/terminfo-roundtrip tput colors
cat > /tmp/curses-consumer.c <<'C'
#include <curses.h>
#include <term.h>
#include <assert.h>
#include <stdio.h>
#include <string.h>
int main(void){
 int err;assert(setupterm("xterm-256color",1,&err)==OK);assert(err==1);
 assert(tigetnum("colors")==256);assert(tigetstr("cup")!=(char*)-1);
 char *s=tparm(tigetstr("cup"),2,4);assert(s&&strstr(s,"3;5"));
 FILE *out=fopen("/tmp/curses-screen","w"),*in=fopen("/dev/null","r");assert(out&&in);
 SCREEN *screen=newterm("xterm-256color",out,in);assert(screen);
 assert(start_color()==OK);assert(init_pair(1,COLOR_GREEN,COLOR_BLACK)==OK);
 WINDOW *w=newwin(5,30,0,0);assert(w);assert(box(w,0,0)==OK);
 assert(mvwaddstr(w,1,1,"ncurses on wasm-posix")==OK);
 char text[32]={0};assert(mvwinnstr(w,1,1,text,20)!=ERR);assert(!strncmp(text,"ncurses on wasm-posix",20));
 assert(wrefresh(w)==OK);delwin(w);endwin();delscreen(screen);fclose(in);fclose(out);
 puts("NCURSES-CONSUMER-PASS");return 0;
}
C
cc -I"$DESTDIR"/include -I"$DESTDIR"/include/ncurses /tmp/curses-consumer.c -L"$DESTDIR"/lib -lncurses -ltinfo -o /tmp/curses-consumer
/tmp/curses-consumer
test -s /tmp/curses-screen
cat > /tmp/curses-wide.c <<'C'
#define _XOPEN_SOURCE_EXTENDED 1
#include <curses.h>
#include <assert.h>
#include <locale.h>
#include <stdio.h>
#include <wchar.h>
int main(void){
 assert(setlocale(LC_ALL,"C.UTF-8"));
 FILE *out=fopen("/tmp/curses-wide-screen","w"),*in=fopen("/dev/null","r");assert(out&&in);
 SCREEN *screen=newterm("xterm-256color",out,in);assert(screen);
 cchar_t ch,readback;wchar_t text[CCHARW_MAX];attr_t attrs;short pair;
 assert(move(0,0)==OK);
 assert(setcchar(&ch,L"中",0,0,NULL)==OK);assert(add_wch(&ch)==OK);assert(getcurx(stdscr)==2);
 assert(addwstr(L"文")==OK);assert(getcurx(stdscr)==4);
 assert(addwstr(L"é")==OK);assert(getcurx(stdscr)==5);
 assert(addwstr(L"😀")==OK);assert(getcurx(stdscr)==7);
 assert(mvin_wch(0,4,&readback)==OK);assert(getcchar(&readback,text,&attrs,&pair,NULL)==OK);
 assert(text[0]==L'e'&&text[1]==0x301&&text[2]==0);
 assert(mvin_wch(0,5,&readback)==OK);assert(getcchar(&readback,text,&attrs,&pair,NULL)==OK);assert(text[0]==0x1f600);
 assert(refresh()==OK);endwin();delscreen(screen);fclose(in);fclose(out);
 puts("NCURSESW-CONSUMER-PASS");return 0;
}
C
cc -I"$DESTDIR"/include -I"$DESTDIR"/include/ncursesw /tmp/curses-wide.c -L"$DESTDIR"/lib -lncursesw -ltinfow -o /tmp/curses-wide
/tmp/curses-wide
test -s /tmp/curses-wide-screen
echo NCURSES-PACKAGE-PASS

for text in 中 文 é 😀; do grep -F "$text" /tmp/curses-wide-screen >/dev/null; done
