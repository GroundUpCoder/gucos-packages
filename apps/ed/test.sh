#!/bin/sh
set -eu
export PATH="$DESTDIR/bin:$PATH"
root="$PWD"
mkdir upstream-check
ln -s "$DESTDIR/bin/ed" upstream-check/ed
(cd upstream-check && sh "$root/source/testsuite/check.sh" "$root/source/testsuite" 1.22.2)
printf 'alpha\nbeta\n' > edit.txt
printf '1s/alpha/ALPHA/\n$a\ngamma\n.\nw\nq\n' | ed edit.txt
printf 'ALPHA\nbeta\ngamma\n' > expected.txt
cmp expected.txt edit.txt
printf '1p\nq\n' | red edit.txt > restricted.txt
grep ALPHA restricted.txt
echo ED-ACCEPTANCE-PASS
