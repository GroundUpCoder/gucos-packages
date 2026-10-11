#!/bin/sh
set -eu
tar -xf source.tar
cd source
# Release includes generated parser. Avoid requiring a guest parser generator.
touch cmd-parse.c
# Upstream generic POSIX PTY implementation uses /dev/ptmx, grantpt,
# unlockpt, ptsname, TIOCSCTTY and fork; gucOS has these but no forkpty.
cp compat/forkpty-haiku.c compat/forkpty-unknown.c
# BSD spelling aliases used by upstream; gucOS provides the standard C types.
cat > gucos-types.h <<'EOF'
#ifndef GUCOS_TMUX_TYPES_H
#define GUCOS_TMUX_TYPES_H
typedef unsigned char u_char;
typedef unsigned short u_short;
typedef unsigned int u_int;
typedef unsigned long u_long;
#include <sys/time.h>
#ifndef timerclear
#define timerclear(tv) ((tv)->tv_sec = (tv)->tv_usec = 0)
#endif
#ifndef timersub
#define timersub(a,b,r) do { (r)->tv_sec = (a)->tv_sec - (b)->tv_sec; (r)->tv_usec = (a)->tv_usec - (b)->tv_usec; if ((r)->tv_usec < 0) { --(r)->tv_sec; (r)->tv_usec += 1000000; } } while (0)
#endif
#endif
EOF
sed -i '1i#include "gucos-types.h"' compat.h
test -f Makefile
rm -f ./*.o compat/*.o
make -j1
mkdir -p "$DESTDIR/bin" "$DESTDIR/share/man/man1" "$DESTDIR/share/licenses/tmux"
cp tmux "$DESTDIR/bin/tmux"
cp tmux.1 "$DESTDIR/share/man/man1/tmux.1"
cp COPYING "$DESTDIR/share/licenses/tmux/COPYING"
# Preserve notices for bundled compatibility implementations in binary distribution.
cat compat/*.c compat/*.h > "$DESTDIR/share/licenses/tmux/compat-source-notices.txt"
