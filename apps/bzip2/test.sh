#!/bin/sh
set -eu
for n in 1 2 3; do
 "$DESTDIR/bin/bzip2" -$n -c "source/tests/sample$n.ref" > compressed
 cmp compressed "source/tests/sample$n.bz2"
 "$DESTDIR/bin/bzip2" -dc "source/tests/sample$n.bz2" > restored
 cmp restored "source/tests/sample$n.ref"
done
cat source/tests/sample1.bz2 source/tests/sample2.bz2 > concatenated.bz2
cat source/tests/sample1.ref source/tests/sample2.ref > expected
"$DESTDIR/bin/bzcat" concatenated.bz2 > restored
cmp expected restored
printf 'not a bzip2 stream' > invalid
if "$DESTDIR/bin/bzip2" -dc invalid > rejected 2> rejected.err; then exit 1; fi
echo BZIP2-ACCEPTANCE-PASS
