# gucos packages

This repository owns application recipes, source inputs, patches and publication.
Core lives in GroundUpCoder/gucos and is not an implicit build dependency.
Use an explicitly supplied core URL/distribution and expected runtime for tests.

Read docs/package-publication.md before publishing. Preserve immutable URL/hash
identities, upstream licensing and exact build provenance. Published runtime
inputs must not depend on wasm-posix or wasm-posix-packages repositories.
Historical evidence and checkpoint branches retain their original provenance.

Use machine-job (or node tools/machine-job.mjs) for builds and browser tests.
Only one browser job may run at a time. This scheduler shares the existing
machine-wide queue; do not create a separate scheduler to bypass it.

Documentation belongs under docs/. Historical import helpers require an explicit
WASM_POSIX_HISTORICAL_CHECKOUT; normal publication and guest builds do not.
Unfinished porting work was checkpointed during migration. Do not claim its
acceptance or publish it without completing its review and execution gates.
