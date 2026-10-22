# Zstandard 1.5.7

Guest-built compression CLI, static library and development headers. Prepared
historical source is preserved as raw Git blobs, including original line endings
and symlinks; provenance.json records the archive identity. Assembly and legacy
formats are disabled. No host compiler produces package outputs.

Final local acceptance passed CLI compression/decompression/integrity checking,
a separately compiled static-library round trip, a 1 MiB two-thread round trip
and invalid-input rejection. Publication checks are recorded in the expansion
journal.
