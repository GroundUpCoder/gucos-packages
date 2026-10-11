# Future package builds and publications

User direction, 2026-10-10, following completed platform 1.0 acceptance: use the
platform/minVersion/ABI/dependency contract for future builds and publications.
The authoritative specification is the core repository's `docs/PLATFORM.md`
(local checkout: `https://github.com/GroundUpCoder/gucos/blob/main/docs/PLATFORM.md`). Read its current
contract and `tools/platform.json` when preparing a release; do not infer
compatibility from compiler version or equality of core build hashes.

New binary manifests retain format 1 and declare `platform.target`,
`platform.minVersion`, `platform.runtimeAbi`, and the actual required `features`.
The accepted 1.0.0 baseline uses target `wasm32-wasm-posix`, runtime ABI 5 and
object ABI 3. Include `platform.objectAbi` for objects/static libraries; it is
optional for executable-only packages. Do not copy SDL requirements onto a
package that does not require SDL. Execution and retained-object relinking are
separate acceptance obligations.

Every declared dependency in a new platform-aware manifest needs an entry in
`dependencyRequirements`. Use exact package `version`, exact manifest `sha256`,
or supported stable SemVer `minVersion`/`maxExclusive` bounds. All supplied
conditions must match; upstream non-SemVer versions can be pinned exactly.
Resolution validates the selected dependency graph rather than searching for
alternative versions. Installed reverse dependencies are also checked; recorded
manifest-hash requirements can require dependent reinstallation in the same
transaction when dependency metadata bytes change.

Keep immutable catalog/object URLs, mandatory hashes and sizes, source/license
provenance, ownership/output-set rules, independent review and real guest
acceptance. A compatible compiler/core upgrade does not itself require rebuilding
unchanged application binaries. Do not rewrite provenance to pretend old binaries
were built on a newer core. Historical expansion tooling is not a substitute for
checking the current platform-aware publication contract.

The published fab65cb catalog and its original 2a9cca artifacts passed both
candidate and live platform 1.0 acceptance. They may remain on the verified legacy
mapping. This guidance changes no existing manifest, catalog or binary and does
not issue new platform metadata by itself. The package journal records the
[completed acceptance](logs/2026-10-10/platform-1.0-package-acceptance.md).
