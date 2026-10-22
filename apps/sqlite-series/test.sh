#!/bin/sh
set -eu
sqlite3 :memory: > /tmp/sqlite-series.out <<SQL
.bail on
.load $DESTDIR/lib/sqlite3/series.so
select 'SERIES', sum(value), count(*) from generate_series(1,100);
select 'STEP', group_concat(value) from generate_series(3,12,3);
.load $DESTDIR/lib/sqlite3/series.so
select 'RELOAD', value from generate_series(42,42);
select 'DESC', group_concat(value) from generate_series(5,-1,-2);
select 'EMPTY', count(*) from generate_series(3,1,1);
SQL
cat /tmp/sqlite-series.out
grep -qx 'SERIES|5050|100' /tmp/sqlite-series.out
grep -qx 'STEP|3,6,9,12' /tmp/sqlite-series.out
grep -qx 'RELOAD|42' /tmp/sqlite-series.out
grep -qx 'DESC|5,3,1,-1' /tmp/sqlite-series.out
grep -qx 'EMPTY|0' /tmp/sqlite-series.out
echo SQLITE-PLUGIN-PASS
