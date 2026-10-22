#!/bin/sh
set -eu
m4() { "$DESTDIR/bin/m4" "$@"; }
m4 --version
printf 'define(ANSWER, 42)ANSWER\n' | m4 > /tmp/m4-output
test "$(cat /tmp/m4-output)" = 42
printf 'define(ANSWER, 42)' | m4 -F /tmp/m4-state
printf 'ANSWER\n' | m4 -R /tmp/m4-state > /tmp/m4-output
test "$(cat /tmp/m4-output)" = 42
printf 'eval(6 * 7)\n' | m4 > /tmp/m4-output
test "$(cat /tmp/m4-output)" = 42
cat > /tmp/macros.m4 <<'M4'
define(`pair', `$2:$1')dnl
pair(`left', `right')
M4
m4 /tmp/macros.m4 > /tmp/macro-output
test "$(cat /tmp/macro-output)" = right:left
m4 -F /tmp/macros.freeze /tmp/macros.m4 > /dev/null
printf 'pair(one,two)\n' | m4 -R /tmp/macros.freeze > /tmp/frozen-output
test "$(cat /tmp/frozen-output)" = two:one
test -s "$DESTDIR/share/info/m4.info"
echo M4-PACKAGE-PASS
