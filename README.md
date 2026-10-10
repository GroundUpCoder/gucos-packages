# wasm-posix packages

Runtime package sources for the standalone browser OS. Neither the OS build nor
its hosting deployment reads this checkout. Browser gucman discovers catalog.json,
verifies pinned manifests and inputs, and builds or installs explicitly requested
packages. Additional repositories can implement the same protocol.

Recipes are trusted shell programs with access to the user's guest filesystem.
Adding a source permits discovery; `gucman build` explicitly executes its recipe.
Host C++ preparation must publish declared prepared inputs; guest Clang is not implied.

Package inputs live under apps/. Catalog records refer to immutable Git commits
and SHA256/size-pinned manifests. Keep upstream URLs and license provenance with each
package. Binaries may live in release assets or another CORS-enabled object store.
Publishing recipes does not assert binary compatibility or independent acceptance.
The repository is currently private; anonymous access is not yet enabled.
