#!/bin/sh
set -eu
export PATH="$DESTDIR/bin:$PATH"
mkdir -p /tmp/micropython-upstream
cp source/port/upstream-tests/* /tmp/micropython-upstream/
sed '/^gucman install micropython$/d' source/port/micropython-accept.sh > acceptance.sh
sh acceptance.sh
python -c 'import sys; assert sys.implementation.name == "micropython"; assert sys.implementation.version[:3] == (1,28,0); print("MICROPYTHON-ALIAS-VERSION-PASS")'
