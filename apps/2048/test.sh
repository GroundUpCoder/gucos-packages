#!/bin/sh
set -eu
"$DESTDIR/bin/2048" test > /tmp/2048-result
grep 'All .* tests executed successfully' /tmp/2048-result
echo 2048-LOGIC-PASS
