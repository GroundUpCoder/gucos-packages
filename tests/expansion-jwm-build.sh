set -eu
gucman build expansion:jwm
jwm -v
jwm -p -f /usr/local/share/jwm/wasm.jwmrc
echo JWM-BUILD-PASS
