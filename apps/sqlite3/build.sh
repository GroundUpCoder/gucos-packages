#!/bin/sh
set -eu
tar -xf source.tar
cd source
mkdir -p "$DESTDIR/bin" "$DESTDIR/share/licenses/sqlite3"
cc -I. -DSQLITE_OMIT_WAL -c sqlite3.c -o sqlite3.o
cc -I. -DSQLITE_THREADSAFE=0 -DSQLITE_MAX_MMAP_SIZE=0 -DSQLITE_DEFAULT_MEMSTATUS=0 -DSQLITE_OMIT_DEPRECATED -DHAVE_USLEEP=1 -DSQLITE_OMIT_WAL shell.c sqlite3.o -lm -o "$DESTDIR/bin/sqlite3"
cat > "$DESTDIR/share/licenses/sqlite3/PUBLIC-DOMAIN" <<'EOF'
SQLite is dedicated to the public domain. Original notice is in sqlite3.c:
https://sqlite.org/copyright.html
EOF
