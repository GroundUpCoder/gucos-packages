#!/bin/sh
# Upstream release build; gucman publishes the staged tree after success.
set -eu
tar -xf source.tar
cd source
while IFS= read -r script; do chmod +x "$script"; done < port/executables
# Bundled release-generated files must retain their dependency ordering after
# copying out of the browser source payload (which does not carry mtimes).
touch aclocal.m4 configure lib/config.hin
find . -name Makefile.in -exec touch '{}' +
touch .version doc/stamp-vti doc/version.texi doc/m4.1 doc/m4.info* checks/stamp-checks
# libc strstr is quadratic; select gnulib's replacement without running its
# alarm-limited million-byte probe, which cannot interrupt native pure loops.
# The generic wasm compiler does not advertise an OS; m4 uses Unix shell
# and signal status conventions on our POSIX runtime.
gl_cv_func_strstr_linear=no CC=cc LD=cc CPPFLAGS=-D__unix__ CFLAGS=-O2 sh configure --build=wasm32-unknown-none --prefix=/usr/local --disable-nls --disable-dependency-tracking
make -j1
# ash reports the deliberately SIGKILLed child. Keep strict output checking,
# with this one documented platform-specific stderr expectation.
printf 'dnl @error{}Killed\n' >> checks/198.sysval
make -C checks check
mkdir -p "$DESTDIR/bin" "$DESTDIR/share/info" "$DESTDIR/share/man/man1" "$DESTDIR/share/licenses/m4"
cp src/m4 "$DESTDIR/bin/m4"
cp doc/m4.info doc/m4.info-1 doc/m4.info-2 "$DESTDIR/share/info/"
cp doc/m4.1 "$DESTDIR/share/man/man1/m4.1"
cp COPYING "$DESTDIR/share/licenses/m4/COPYING"
