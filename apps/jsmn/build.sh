set -eu
make -j2
make install DESTDIR="$DESTDIR"
mkdir -p "$DESTDIR/share/licenses/jsmn"
cp LICENSE "$DESTDIR/share/licenses/jsmn/LICENSE"
