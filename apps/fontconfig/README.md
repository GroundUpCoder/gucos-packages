# fontconfig

Unpublished 2.15.0-1 candidate from `vendor/fontconfig` at `0b9b3245fe11a3bc677d81113cba90cd0ae80446`.
Historical source/configuration is preserved; build.sh adapts the original install
recipe to the current prefix/output contract. Static and shared library outputs
require separate guest relink and execution acceptance. No new guest tests ran.

The adapter relocates fonts.conf and compiled lookup paths to
/usr/local/share/fontconfig because gucman excludes etc/ package outputs.
Original source/config bytes remain archived unchanged.
