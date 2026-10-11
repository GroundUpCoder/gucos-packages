# gucode 0.1.1 release evidence

Application source: https://github.com/josephkimgpt/gucode at
51384a2d9bc77f2f22af2166836ff4d8944119b9. Source archive correspondence is recorded
in apps/gucode/provenance.json. The application changes credential precedence,
adds the --yolo alias, and fixes malformed UTF-8 tool output and saved-session
recovery. The requested pull also adds upstream conversation/resource limits and session preservation.
A review follow-up rejects collisions between repaired tool IDs before execution.
No core or libcurl package changes.

Native release and ASan/UBSan binaries passed all 26 regression groups and nine resource-test groups under
machine-job. Six existing vendored cJSON deprecation warnings, no sanitizer
findings. Independent read-only review by agent /root/review cleared source,
upgrade plan and pin-upgrades.py; final artifact review remains pending.

The exact old entry and 0.1.0 to 0.1.1 transition are in upgrade-plan.json.
Its baseline is the complete pre-upgrade catalog, not a change to the historical
publication-baseline.json. All unrelated entries and output paths/modes must
remain unchanged.

The key-update.mjs acceptance harness uses a real guest and synthetic keys with
a deterministic DeepSeek-shaped SSE fixture. It builds from source, exports,
installs the binary in a fresh context, verifies installed payload hashes, tests
reload, key precedence/fallbacks, --yolo write/shell behavior, raw /bin/cc output,
and damaged-session recovery. Public mode installs 0.1.0, upgrades through the
public catalog, and repeats those execution checks. It makes no live provider
request and does not claim live DeepSeek acceptance for this revision.

Expected candidate runtime:
19609f47c28f9d81c12ad6525d65347057ad5ad2ddec5eb48f5762a922d72441,
explicit distribution /Users/jku/git/gucos/dist, copied to
agentone:/tmp/gucode-011-release/dist, platform 1.0.1. The remote machine uses
its existing machine-wide scheduler; no local browser job for this task runs
concurrently. Reports describe
actual executed scope; a queued job is not acceptance.
