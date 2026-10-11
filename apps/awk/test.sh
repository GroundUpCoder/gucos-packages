#!/bin/sh
set -eu
gawk() { "$DESTDIR/bin/gawk" "$@"; }
printf 'alpha 7\nbeta 14\ngamma 21\n' > /tmp/records
gawk '{sum += $2; a[$1]=$2} END {if(a["beta"]!=14)exit 1; print NR, sum}' /tmp/records > /tmp/awk-result
test "$(cat /tmp/awk-result)" = '3 42'

gawk 'BEGIN { a["b"]=2; a["a"]=1; n=asorti(a,k); if(n!=2 || k[1]!="a" || k[2]!="b")exit 1; if(gensub(/([0-9]+)/,"[\\1]","g","x42")!="x[42]")exit 2; print "GNU-AWK-FEATURES-PASS" }'
echo AWK-ACCEPTANCE-PASS
test "$("$DESTDIR/bin/awk" 'BEGIN {print 6 * 7}')" = 42
test -s "$DESTDIR/share/info/gawk.info"
