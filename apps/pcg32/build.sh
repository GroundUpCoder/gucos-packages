#!/bin/sh
set -eu
tar -xf source.tar
tar -xf prepared.tar
mkdir -p objects "$DESTDIR/lib" "$DESTDIR/bin" "$DESTDIR/include/pcg32" "$DESTDIR/share/pcg32" "$DESTDIR/share/licenses/pcg32"
for file in generated/definitions/*.c; do
 name=${file##*/}
 cc -c "$file" -o "objects/${name%.c}.o"
done
ar qcs "$DESTDIR/lib/libpcg32.a" objects/*.o
cc generated/client.c generated/entry.c "$DESTDIR/lib/libpcg32.a" -o "$DESTDIR/bin/pcg32-check"
cp generated/api.h "$DESTDIR/include/pcg32/api.h"
cp generated/provenance.json "$DESTDIR/share/pcg32/translation.json"
cp generated/native-values.json "$DESTDIR/share/pcg32/native-values.json"
cp source/upstream/LICENSE "$DESTDIR/share/licenses/pcg32/LICENSE"
