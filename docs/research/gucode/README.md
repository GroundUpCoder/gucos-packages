# libcurl subset and gucode 0.1.0 acceptance

Application source: https://github.com/josephkimgpt/gucode, commit
735423130bb65f1773c46446d9a8f7dc4bd0f0e7 (use apps/gucode/provenance.json for the authoritative full revision).
Package implementation and browser tests were executed by the primary agent.
Independent source review was performed in external cc-meta thread
01a129d9-3bea-7c48-9000-5405f3012bcf, Codex executor, model gpt-6-astra verified
from thread metadata. The reviewer did not author the implementation or execute
our tests. Source-review clearance is distinct from frozen publication approval.

## Executed candidate checks

- guest.json: actual source package builds using guest cc on platform 1.0.1,
  runtime 19609f47c28f9d81c12ad6525d65347057ad5ad2ddec5eb48f5762a922d72441.
  The installed libcurl archive was relinked into an independent consumer and
  passed real browser fetch tests for binary POST, streaming, header callback
  fallback, effective URL/status, POST-to-GET reuse, HTTP failure, timeout and
  callback cancellation. The gucode binary used real DeepSeek to edit, compile,
  test, save, reload the browser, and resume/retest a C program.
- binary.json: a separate fresh browser context installed the exported binaries
  and checked every installed payload against the reviewed tar members, both
  before and after page reload. It did not rebuild the package.
- Native source/regression/sanitizer and real DeepSeek implementation-task
  evidence lives in the gucode source repository under docs/research/deepseek.
  Its larger task independently checks four valid and four invalid/overflow cases.

Credential bytes are not retained in these reports. Browser keys were uploaded to
an ephemeral context and removed; the context was closed after each test. The
application and package use no proxy. These tests do not prove arbitrary provider
support, complete curl compatibility, or containment of approved shell commands.

## Earlier iterations

Attempt 01 failed because the local test route allowlist blocked the default remote
catalog; local candidate tests now explicitly remove that source. Attempt 02 found
that gucOS lacks getline; interactive input now uses portable C stdio. Attempts 03
and 04 are successful earlier iterations before final source hardening. They are
not the release artifact acceptance. Their exported archives are retained, but the
final receipt identifies the sole selected binary for each package.

Binary attempt 01 passed initial install but its reload verifier tried to overwrite
an existing gucman pack destination. The verifier now removes only its own scratch
export before repacking; final binary.json records the successful retry.

## Publication preservation

The pre-addition catalog is b4507a9d9622dad0f48c13cae30fc8a6b5d539a8.
It already includes another task's JWM update and desktop-entries addition. This
work preserves every one of those entries exactly and does not assert their
pending public acceptance. tools/pin-additions.py refuses replacements, requires
an unchanged explicit pre-addition catalog, reconstructs manifests from frozen
source/receipts, and pins immutable artifact/manifest commits. It does not advance
or rewrite tools/publication-baseline.json. This avoids misrepresenting the older
migration baseline as covering somebody else's ongoing release.
