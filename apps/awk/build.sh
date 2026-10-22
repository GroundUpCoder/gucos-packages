#!/bin/sh
set -eu
tar -xf source.tar
cd source
while IFS= read -r script; do chmod +x "$script"; done < port/executables
# Bundled release-generated files must retain their dependency ordering after
# copying out of the browser source payload (which does not carry mtimes):
# the configure script, the Bison parsers and the Info manuals ship prebuilt.
touch aclocal.m4 configh.in configure
find . -name Makefile.in -exec touch '{}' +
touch awkgram.c command.c doc/*.info doc/*.1 pc/Makefile.tst
# The generic wasm compiler does not advertise an OS; gawk selects its Unix
# process, pipe and signal conventions on our POSIX runtime. Loadable
# extensions, MPFR arithmetic and readline are outside this port.
CC=cc LD=cc CPPFLAGS=-D__unix__ CFLAGS="-O2 --enable-fork" sh configure --build=wasm32-unknown-none --prefix=/usr/local --disable-nls --disable-extensions --disable-dependency-tracking --without-readline --without-mpfr
make -j1
# No expected-failure allowlist: every enabled upstream check must pass.
# Stream progress so a stuck upstream test is visible immediately.
PAGER=cat make check
mkdir -p "$DESTDIR/bin" "$DESTDIR/share/info" "$DESTDIR/share/man/man1" "$DESTDIR/share/licenses/awk"
cp gawk "$DESTDIR/bin/gawk"
cp gawk "$DESTDIR/bin/awk"
cp doc/gawk.info "$DESTDIR/share/info/"
cp doc/gawk.1 "$DESTDIR/share/man/man1/"
cp COPYING "$DESTDIR/share/licenses/awk/COPYING"
