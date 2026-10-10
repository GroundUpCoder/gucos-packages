#!/bin/sh
set -eu
# Build-stage extraction is cli/; installed consumers extract source/.
fixtures="$PWD/source/port/cli-fixtures"
if [ -d cli ]; then fixtures="$PWD/cli/port/cli-fixtures"; fi
mkdir -p upstream-run
cd upstream-run
export srcdir="$fixtures"
ln -sf "$DESTDIR/bin/pcre2grep" pcre2grep
ln -sf /usr/local/bin/pcre2test pcre2test
sh "$srcdir/RunGrepTest"
printf 'abc123\nxyz\ndef456\n' > regex-input
./pcre2grep -o '(?<=abc)[0-9]+' regex-input > regex-output
test "$(cat regex-output)" = 123
echo PCRE2GREP-ACCEPTANCE-PASS
