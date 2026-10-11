#!/bin/sh
set -eu
tar -xf source.tar
mkdir -p "$DESTDIR/bin" "$DESTDIR/share/licenses/pkgconf"
cd source
cc -O2 -I. -Ilibpkgconf -Icli libpkgconf/audit.c libpkgconf/cache.c libpkgconf/client.c libpkgconf/pkg.c libpkgconf/bsdstubs.c libpkgconf/fragment.c libpkgconf/argvsplit.c libpkgconf/fileio.c libpkgconf/tuple.c libpkgconf/dependency.c libpkgconf/queue.c libpkgconf/path.c libpkgconf/personality.c libpkgconf/parser.c cli/main.c cli/getopt_long.c cli/renderer-msvc.c -o "$DESTDIR/bin/pkgconf"
cp "$DESTDIR/bin/pkgconf" "$DESTDIR/bin/pkg-config"
cp COPYING "$DESTDIR/share/licenses/pkgconf/COPYING"
