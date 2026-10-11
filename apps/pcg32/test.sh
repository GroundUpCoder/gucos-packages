#!/bin/sh
set -eu
tar -xf prepared.tar
cp "$DESTDIR/include/pcg32/api.h" generated/api.h
mkdir -p test-objects
for file in generated/definitions/*.c; do
 name=${file##*/}
 cc -c "$file" -o "test-objects/${name%.c}.o"
done
cc -c generated/client.c -o client.o
cc -c generated/entry.c -o entry.o
"$DESTDIR/bin/pcg32-check" > installed.log
test "$(cat installed.log)" = PCG32-result=0
for backend in native dispatch; do
 flag=
 if [ "$backend" = dispatch ]; then flag=--no-native-functions; fi
 cc $flag --project generated/project.json --rebuild -o "whole-$backend"
 cc $flag test-objects/*.o client.o entry.o -o "objects-$backend"
 cc $flag client.o entry.o "$DESTDIR/lib/libpcg32.a" -o "archive-$backend"
 for mode in whole objects archive; do
  "./$mode-$backend" > "$mode-$backend.log"
  test "$(cat "$mode-$backend.log")" = PCG32-result=0
  echo "PCG32-488-PASS $mode $backend"
 done
done
