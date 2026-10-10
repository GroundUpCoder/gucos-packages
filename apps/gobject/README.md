# gobject

Unpublished GLib 2.84.4 historical wasm-posix configured profile. Original
source and port adaptations remain in source.tar with exact provenance.
Separate recipe adapts dependencies to installed public headers. Static/shared
consumer scripts use retained port tests; no fresh build or acceptance yet.

Library compilation retains bundled internal GLib headers from the historical
source tree. Installed consumer checks use staged/public headers and cover
object/value lifetime plus nested signals, generic libffi marshalling and wide
integer callback returns. These scripts are not yet executed.
