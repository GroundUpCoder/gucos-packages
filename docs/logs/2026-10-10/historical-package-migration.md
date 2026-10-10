# Historical package migration implementation

Owner: cc thread `01a12509-9373-77dd-b1be-e5935164809b`. Live thread metadata
verified executor `codex`, model `gpt-6-astra`. Initiating thread
`01a12401-30cf-7004-a932-af576a939e08`; independent reviewer
`01a123e0-2fb3-7521-9fa3-e936e0997405` also verified Codex/Astra, initially idle.
Starting package HEAD: `716bfe27a56357513abfc7213d542bda63129cd1`, clean.

Read the inventory README, all catalog rows, machine-readable inventory,
inventory journal, package README/publication instructions, current core
`docs/PLATFORM.md` and `tools/platform.json`. Only this package checkout is writable.
The historical checkout is read through immutable Git blobs at
`0b9b3245fe11a3bc677d81113cba90cd0ae80446`; core is read-only.

The queue is `docs/research/package-migration/queue.json`: all 110 canonical
historical rows retain their evidence and hashes, plus six separately accounted
noncatalog workloads/support profiles. Six core bootstrap entries are excluded
from duplicate packaging. Partial mappings and Lua's missing module profile stay
open. Source-only failed experiments are outside this queue.

Prepared initial source candidates for zlib, cJSON, xfontsel, xclipboard,
xcutsel and oclock. Xcutsel uses the upstream xclipboard source tree and has its
own executable/license output ownership. Historical source tarballs preserve
Git blob bytes; installation adapters/configuration remain separate. Candidate
recipes declare platform 1.0.0/runtime ABI 5 and exact requirements for every
dependency; static libraries additionally declare object ABI 3. No baseline
package manifest, catalog entry, artifact or provenance has been changed.

No new guest execution, browser job, build job, installation, binary publication
or compatibility approval has occurred. Browser hold remains active. Source
preparation is not migration completion. Static and shared consumer scripts
are prepared but have not executed. Core owner's first cc-meta send was refused
because the thread was running; no hold-release confirmation has been received.
Reviewer acknowledged upcoming serial review and the distinction between source
preparation and acceptance. Initiator received kickoff.

## Source review and second preparation increment

Independent reviewer examined exact `7e17011ebc024e40f0e543c3c8ec64fc3b4bd25f`,
confirmed all 156 source blobs and baseline19 preservation, and found cJSON's
historical automatic source hook incompatible with a library-only installation.
Corrected library compilation to define CJSON_NO_REQUIRE_SOURCES and strip the
hook from the installed header. This is a recipe correction, not executed proof.
Reviewer requires functional X/font/selection/clock checks and installed-library
consumers before acceptance. Source review does not approve publication.

Prepared xedit with four exact historical source overlays, Lisp modules, regex
test executable and fork-enabled recipe; also pkgconf 2.3.0, bzip2/bzip2recover
1.0.8 and Expat 2.7.1. Their guest test scripts preserve upstream bzip2 fixtures
and add package-specific consumers. These are all unexecuted candidates.
Added tools/check-migration.py for explicit candidate platform/dependency/output,
source blob/overlay and baseline preservation checks; it never rewrites provenance.
All eleven candidates pass these lightweight checks. No browser/build jobs ran.

## Reviewed source checkpoint and graphics foundations

Reviewer approved source-only scope at `7da0b4a334986858685f930ef50af2352d33b714`
with no further blocking findings, independently running the eleven-candidate
checker. Exact commit pushed to origin/main. This publishes source preparation,
not installable catalog entries or supported binaries. Two historical xedit
overlay whitespace lines were deliberately retained byte-for-byte.

Prepared six more candidates: pixman, libpng, FreeType, Fontconfig, x11-shared
and Cairo. The public Cairo uses the old GTK X11 130-unit Cairo source list and
three exact overlays, replacing the intended duplicate provider in the future
GTK closure. x11-shared prepares eight new DSOs from accepted static archives
without altering the baseline package. Fontconfig retains its two historical
font inputs and their licenses. All are unbuilt and unaccepted. The provider
design explicitly keeps the old GTK blocker open until complete closure tests.
