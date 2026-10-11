#!/bin/sh
set -eu
printf 'guest zstandard roundtrip\n' > input
"$DESTDIR/bin/zstd" -q -f input -o packed.zst
"$DESTDIR/bin/zstd" -q -d packed.zst -o restored
cmp input restored
"$DESTDIR/bin/zstd" -t packed.zst
