# fontconfig

2.15.0-1 profile from `vendor/fontconfig` at `0b9b3245fe11a3bc677d81113cba90cd0ae80446`.
Historical source/configuration is preserved; build.sh adapts the original install
recipe to the current prefix/output contract. Static and shared library outputs
passed guest relink and execution acceptance.

The adapter relocates fonts.conf and compiled lookup paths to
/usr/local/share/fontconfig because gucman excludes etc/ package outputs.
Original source/config bytes remain archived unchanged.

Published after independent approval of85a890a. Fresh public installation,
installed consumers/rendering and reload output/parsed-manifest integrity passed
on runtime61a87f8861fa6ddaa6052eb25408036a2bcb238ad4b8e48dd91303beb36714d0.
Evidence: docs/research/package-migration/batch-04 at repository root.
