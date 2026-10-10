# Tcl

Unpublished Tcl8.6.16 historical source candidate, exact units and fork flags
retained. Installs the static library, headers, Tcl library scripts and two
regular executable files (the historical tclsh symlink becomes a byte-identical
copy for this package format). Embedded zlib remains part of historical build.
Tests retain arithmetic/bignum/collections/regex/files/zlib/timer/subprocess
checks and selected expr/list/string/dict upstream suites with zero-failure
assertions; an installed static-library embedding consumer is added.
Networking, dynamic Tcl extensions and the full upstream suite are not claimed.
Guest build, binary installation, relinking and reload acceptance pending.
