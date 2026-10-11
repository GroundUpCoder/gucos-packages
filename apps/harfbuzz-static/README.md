# HarfBuzz static component

Unpublished partition of the retained HarfBuzz14.5.0 generated-C build. Owns
libharfbuzz.a and libharfbuzz-runtime.a plus its licenses. The original complete
build script runs unmodified; its temporary DSO is removed from this component.
Golden shaping, subset and FreeType consumers use generated headers directly.
The main harfbuzz package provides installed headers, pkgconfig and the DSO,
which it links from this exact static dependency. No duplicate output ownership.

This split is required because the accepted monolithic guest export is153147392
bytes and the current binary installer only supports raw tar. The predicted
static artifact is below100MiB; exact guest exports and acceptance are pending.
Historical translator-adapter hash mismatch is unchanged; retained generated
C hashes verify but rebuilding the translation from the pinned translator is
not established. See ../harfbuzz/README.md and the provenance audit.
