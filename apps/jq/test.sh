#!/bin/sh
set -eu
export PATH="$DESTDIR/bin:$PATH"
sed '/^gucman install /d;s@/tmp/input.json@input.json@g;s@/tmp/output.json@output.json@g' source/port/jq-accept.sh > retained-test.sh
sh retained-test.sh
jq -cn '"abc123" | capture("(?<letters>[a-z]+)(?<digits>[0-9]+)")' > regex.json
test "$(cat regex.json)" = '{"letters":"abc","digits":"123"}'
echo JQ-REGEX-PASS
