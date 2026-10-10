set -eu
for name in xmessage xprop xev lua zstd; do gucman install "groundupcoder:$name"; done
lua -e 'assert(6*7==42);print("PUBLIC-LUA-PASS")'
printf public > /tmp/public-input
zstd -q -f /tmp/public-input -o /tmp/public.zst
zstd -q -d -f /tmp/public.zst -o /tmp/public-output
cmp /tmp/public-input /tmp/public-output
echo PUBLIC-BINARY-C-PASS
