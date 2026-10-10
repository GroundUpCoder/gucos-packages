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
