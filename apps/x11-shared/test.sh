#!/bin/sh
set -eu
cat > consumer.c <<'C'
#include <X11/Xlib.h>
#include <X11/Xutil.h>
int main(void) {
 int x=0,y=0; unsigned w=0,h=0;
 int mask=XParseGeometry("80x24+3-4",&x,&y,&w,&h);
 return !(mask==(WidthValue|HeightValue|XValue|YValue|YNegative) && w==80 && h==24 && x==3 && y==-4);
}
C
cc consumer.c -I/usr/local/include -L"$DESTDIR/lib" -lX11 -lxcb -lXau -o x11-shared-consumer
LD_LIBRARY_PATH="$DESTDIR/lib" ./x11-shared-consumer
