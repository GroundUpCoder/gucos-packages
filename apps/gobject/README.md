# gobject

GLib 2.84.4 historical wasm-posix configured profile. Original
source and port adaptations remain in source.tar with exact provenance.
Separate recipe adapts dependencies to installed public headers. Static/shared
consumer scripts use retained port tests; executed in source and installed consumer stages.

Library compilation retains bundled internal GLib headers from the historical
source tree. Installed consumer checks use staged/public headers and cover
object/value lifetime plus nested signals, generic libffi marshalling and wide
integer callback returns. These checks passed in source and installed consumer stages.

Published after independent approval of87ffa4f. Fresh public immutable installation,
static/shared retained consumers and reload output/parsed-manifest integrity passed
on runtime61a87f8861fa6ddaa6052eb25408036a2bcb238ad4b8e48dd91303beb36714d0.
Evidence: docs/research/package-migration/batch-03 at repository root.
