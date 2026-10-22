#!/bin/sh
set -eu
mkdir recovery
cp source/port/recovery-fixture/damaged.bz2 recovery/damaged.bz2
cp source/port/recovery-fixture/expected.bz2 recovery/expected.bz2
cd recovery
"$DESTDIR/bin/bzip2recover" damaged.bz2
cmp rec00001damaged.bz2 expected.bz2
echo BZIP2RECOVER-ACCEPTANCE-PASS
