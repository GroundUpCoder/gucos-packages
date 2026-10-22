#!/bin/sh
set -eu
"$DESTDIR/bin/snake" --help | grep 'Snake:'
if "$DESTDIR/bin/snake" < /dev/null > /tmp/snake-nontty 2>&1; then
 echo 'snake accepted nonterminal input' >&2; exit 1
fi
grep 'interactive terminal required' /tmp/snake-nontty
cc -O2 logic-test.c -o snake-logic
./snake-logic > /dev/null
echo SNAKE-LOGIC-PASS
