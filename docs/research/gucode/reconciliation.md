# Production acceptance reconciliation — 2026-10-11

## Lost queue reservation

The corrected production gate was queued as
`ebb2ba07-9ed8-43f2-8009-70ceabb7e700` under foreground exec session 5898.
Its last captured output was the scheduler's queued message; it never emitted a
running message in the captured output. The coordinator reported it absent at
08:39 UTC. At 08:40 UTC this session independently found no matching scheduler
job or process, no `public.json`, and an unavailable exec session 5898. The
scheduler database contains current state only, with no historical exit record.
**Its exact exit code and signal are unknown and cannot be recovered from these
records.** Turn cleanup is consistent with the timing, but is not established as
the cause. Disappearance is not successful execution or acceptance.

The original executed browser failure remains in `public-attempt-01.json`:
08:00:18–08:04:04 UTC, exit 1, timeout waiting for the first gucode prompt. The
harness launched the installed command through the bootstrap shell's generic
command path instead of BusyBox. The corrected keyboard launch is
`sh -c 'exec gucode ...'`. No published product bytes changed.

## Exact accepted and pending scope

| Package | Executed and passed | Production scope still pending |
| --- | --- | --- |
| libcurl 0.1.0 | Local-origin browser with exact production runtime: guest source build, installed static archive relink into a new C consumer, real binary POST/stream/header/status/error/timeout/cancel/reuse tests (`guest.json`). Separate fresh binary install and each payload hash checked before/after reload (`binary.json`). Anonymous public HTTP download/hash/size verification of manifest, all sources and archive (`public-delivery.json`). Production-origin public installation with installed manifest and every payload hash verified before reload (`public-attempt-01.json`, partially passed harness). | No separately executed production-origin installed-libcurl consumer/relink test is claimed. Production interactive gucode exercise of the shim embedded in its binary remains pending. Full upstream curl compatibility is not claimed. |
| gucode 0.1.0 | Native 22 regression groups, ASan/UBSan, two real DeepSeek coding tasks including independent output checks. Local-origin exact-runtime guest source build, real DeepSeek bugfix/compile/test and reload/resume (`guest.json`). Fresh binary payload verification before/after reload (`binary.json`). Public anonymous source/archive/manifest delivery checks. Production public install, manifest/payload verification, version execution, page reload, and version execution after reload. | Corrected production keyboard prompt, user approval, real DeepSeek file write, ANSI output and interactive exit gate. App tag `v0.1.0` remains uncreated. |

The production attempt verifies file hashes **before** reload and gucode version
execution after reload; it does not rehash every public-installed file after
reload. Full before/after payload hashes were checked in the separate candidate
binary test. The saved failure report sets `publicBinaryInstall`; reaching its
line-29 timeout establishes the intervening reload/version commands completed.

Exact runtime for these guest/public runs:
`19609f47c28f9d81c12ad6525d65347057ad5ad2ddec5eb48f5762a922d72441`
(platform 1.0.1).

## Provenance and review

- Application reviewed code: `735423130bb65f1773c46446d9a8f7dc4bd0f0e7`.
- Frozen package sources/artifacts and final guest/binary reports:
  `0097b04d72151adb13c75a345691cbedbdc95580`.
- Corrected immutable-pin helper reviewed: `5e95683576c9927c593344621b6493deb9252aeb`.
- Immutable manifests: `ab2a7f6eed3bdf98b4477e707289f4be457c5e66`.
- Reviewed publication merge: `d0221fb6125bfbf2c1af5ea126c2c35f1b0cb905`.
- Public HTTP evidence and publication journal: `775ab62`.
- Independent external review: cc-meta thread
  `01a129d9-3bea-7c48-9000-5405f3012bcf`, Codex executor, verified gpt-6-astra.
  Read-only source/artifact/pin/merge review; reviewer did not execute tests.
  Primary session implemented and executed the tests above.

libcurl archive SHA-256:
`58d69c1ae6263d60f0c7224cb06c76281c089134c5ce2b4778bba8caf0e0956b`.
gucode archive SHA-256:
`49a02810e72eba20db9714253aa2e70567cc734631d0023dae4b03a0d5853e13`.

## Durable continuation

User explicitly requested a durable scheduler parent after the lost reservation.
`tests/gucode/durable_public.py` records each scheduler PID, job ID when observed,
stdout/stderr, start/end time and return code under its run directory. A local
parent-only lock prevents duplicate launch; the normal shared scheduler remains
the sole browser admission mechanism. Admission queue-full/deadline errors can
retry; any executed browser gate result stops the parent and is not auto-retried.

At 08:41:40 UTC parent PID 75903 (verified reparented to PID 1) started scheduler
PID 75909, job `e1b34150-3ab1-4a89-b9de-4e22897213e3`, queued behind all existing
jobs. Run directory: `test-results/gucode-public-20261011T084140Z`. The parent
has no browser; its sole child uses ordinary `machine-job --kind browser`.
Existing Galculator, Untangle, imlib2/feh and Xarchiver reservations were preserved.
This is a queue registration, not a production pass. Whole-catalog acceptance
must not be advanced on the basis of the missing job or publication alone.

## Executed durable attempt 02

The durable parent survived the turn boundary and recorded an executed gate:
08:55:41–08:59:37 UTC, scheduler exit 1 at 08:59:38. See
`public-attempt-02.json`, `public-attempt-02-scheduler.json`, and
`public-attempt-02.log`. Public install/payload verification/reload passed;
console milestones establish that the interactive gucode prompt and permission
prompt were reached. After keyboard approval, the harness timed out waiting for
the second gucode prompt. It did not retain the terminal transcript, so the cause
is unresolved: an additional tool approval is one hypothesis, not an observed
fact. No successful file write or completed interactive task is claimed.

The next harness records a redacted terminal transcript and progress flags, and
handles up to six real keyboard approval prompts before requiring return to the
agent prompt. This is test instrumentation, not a product fix. The durable parent
again uses only the ordinary shared scheduler and retries only admission errors.
Tag v0.1.0 and full public interactive acceptance remain pending.
