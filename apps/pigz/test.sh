#!/bin/sh
set -eu
export LD_LIBRARY_PATH="$DESTDIR/lib:/usr/local/lib"
cp source/port/fixtures/input.bin /tmp/pigz-input
for options in '-p 1' '-p 2 -b 32' '-p 2 -z' '-p 2 -K'; do
    "$DESTDIR/bin/pigz" $options -c /tmp/pigz-input > /tmp/compressed
    "$DESTDIR/bin/pigz" -t /tmp/compressed
    "$DESTDIR/bin/pigz" -dc /tmp/compressed > /tmp/restored
    cmp /tmp/pigz-input /tmp/restored
done
"$DESTDIR/bin/pigz" -d -c source/port/fixtures/native.gz > /tmp/restored
cmp /tmp/pigz-input /tmp/restored
for value in '' x xy xyz; do
    printf '%s' "$value" > /tmp/plain
    "$DESTDIR/bin/pigz" -cdf /tmp/plain > /tmp/restored
    cmp /tmp/plain /tmp/restored
done
printf 'invalid gzip stream' > /tmp/invalid
status=0
"$DESTDIR/bin/pigz" -t /tmp/invalid 2>/tmp/rejected.err || status=$?
[ "$status" -ne 0 ]
echo PIGZ-ACCEPTANCE-PASS

if [ "$DESTDIR" = /usr/local ]; then
 "$DESTDIR/bin/unpigz" -c source/port/fixtures/native.gz > /tmp/restored
 cmp source/port/fixtures/input.bin /tmp/restored
fi
