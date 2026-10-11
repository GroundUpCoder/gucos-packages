set -eu
output=$("$DESTDIR/bin/jsmn-example")
printf '%s\n' "$output"
printf '%s\n' "$output" | grep -F -- '- User: johndoe'
printf '%s\n' "$output" | grep -F -- '- UID: 1000'
test -s "$DESTDIR/include/jsmn.h"
