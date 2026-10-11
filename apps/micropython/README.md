# MicroPython 1.28.0 retained port

All313 historical Git blobs are retained unchanged, including the123-unit
bin.json project and --gc-spill-locals configuration. The package preserves the
historical wasm manifest's micropython command and python alias. Current core
reserves lib/wasm-posix for its own state, so the executable moves to the allowed
libexec/micropython path. Relative shell wrappers resolve that path in the build
stage and after installation; they do not implement
command-alternative selection. CPython is a separate queued package.

The original acceptance script runs unchanged except its old gucman install
line is omitted while testing the staged binary. It exercises closures,26
hash-recorded upstream fixtures with retained expected output, JSON/struct/regex,
file persistence and nonzero exception status. The alias/version check is
additional. This is the retained MicroPython port, not general CPython
compatibility. Fresh guest, binary and public acceptance remain pending.
