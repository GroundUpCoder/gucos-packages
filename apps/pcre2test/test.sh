#!/bin/sh
set -eu
# Build-stage extraction is cli/; installed consumers extract source/.
fixtures="$PWD/source/port/cli-fixtures"
if [ -d cli ]; then fixtures="$PWD/cli/port/cli-fixtures"; fi
mkdir -p upstream-run
cd upstream-run
export srcdir="$fixtures"
ln -sf "$DESTDIR/bin/pcre2test" pcre2test
sh "$srcdir/RunTest" -8 -nojit
cat > regex-test <<'EOF'
/^(ab+)([0-9]+)$/
abb42
wrong

EOF
./pcre2test regex-test > regex-result
grep '1: abb' regex-result
grep '2: 42' regex-result
grep 'No match' regex-result
echo PCRE2TEST-ACCEPTANCE-PASS
