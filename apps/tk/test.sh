#!/bin/sh
set -eu
cat > tk-link.c <<'C'
#include <tcl.h>
#include <tk.h>
#include <string.h>
#include <stdio.h>
int main(int argc,char **argv){
 Tcl_FindExecutable(argv[0]);
 int a,b,c,d; Tcl_GetVersion(&a,&b,&c,&d);
 if(a!=8||b!=6||c!=16||strcmp(TK_VERSION,"8.6"))return 1;
 if(Tk_GetUid("alpha")!=Tk_GetUid("alpha"))return 2;
 if(strcmp(Tk_NameOfAnchor(TK_ANCHOR_CENTER),"center"))return 3;
 puts("TK-STATIC-LINK-PASS"); Tcl_Finalize();return 0;
}
C
cc --enable-fork -I/usr/local/include/tcl8.6 -I"$DESTDIR/include/tk8.6" -I/usr/local/include tk-link.c "$DESTDIR/lib/libtk8.6.a" -ltcl8.6 -lX11 -lxcb -lXau -o tk-link
./tk-link
test -x "$DESTDIR/bin/wish"
test -s "$DESTDIR/lib/tk8.6/tk.tcl"
