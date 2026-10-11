# Candidate-core acceptance entry point

User requested package-repository-only acceptance for a supplied frozen core,
retaining all published baseline artifacts and reporting compatibility failures
instead of rebuilding packages. Core docs/PLATFORM.md was read: the legacy 2a9cca
build is a supported provenance baseline, while execution and retained-object
relinking are separate contracts. No core or hosting files were modified.

Implementation commit b9171d57844e3b846bbdd4e732a632987e7aba7b adds
`tools/accept-core-compat.mjs`, its package-local harness and instructions in
`docs/core-compatibility-acceptance.md`. The public fab65cb catalog, all package
manifests and archives remain unchanged. The author is actual Codex gpt-6-astra
thread 01a12401-30cf-7004-a932-af576a939e08 (metadata rechecked).

External independent reviewer 01a123e0-2fb3-7521-9fa3-e936e0997405 approved the
implementation at b9171d5 against 34ff817 with no blocking findings. The reviewer
verified 17 packages/803 distinct outputs, separate candidate identity checks,
fresh profiles, sequential 300-second browser stages, preserved artifacts and
compilation limited to new test probes/controllers against existing libraries.
The reviewer did not run browsers or modify files. Publication approval remains
conditional on baseline self-test and URL-probe evidence at this point.

The driver accepts COMPAT_CORE_DIST or COMPAT_CORE_URL and a separately supplied
COMPAT_EXPECT_RUNTIME. Local serving is read-only and hash-bound to the initial
file snapshot; URL mode requires the supplied origin to remain frozen. Each
full run begins with a new profile and pinned public catalog. Final integrity
checks include all installed manifests and every output byte, after executing
old binaries, relinking small probes, running graphics/PTY tests, and reloading.
No new platform metadata is authored or published. Candidate-core acceptance remains a separate gate; baseline validation only
proves that the entry point operates on the preserved compatible core.

## Executed harness validation

Full run baseline-runner-v1 passed all 14 stages on the preserved local 2a9cca
release. It installed all 17 unchanged public packages, checked 803 output hashes,
passed retained-library relinking and old-binary execution, all graphical/PTY and
launcher tests, then reloaded and rechecked all manifest identities and output
hashes. Its longest stage wall time was 110,253 ms. This is a baseline self-test,
not acceptance of the separately developed platform candidate.

URL-mode baseline-url-probe-v1 passed boot, isolation, expected runtime identity
and pinned public catalog transport at https://os.groundupcoder.net/. It is
explicitly a probe, not a second full compatibility run. The negative
wrong-identity-v1 probe deliberately expected an all-zero runtime hash; it exited
1 with the expected candidate-identity assertion, and report.json recorded failed.
This expected negative result is not a package compatibility failure. No package
installation or rebuild occurred in either probe-only run.

Exact scheduler job IDs, log hashes, statuses and timings are committed in
core-compatibility-harness-evidence.json. The author executed these browser jobs;
independent review audits their evidence. Shared browser jobs were allowed to
finish normally while the URL probes waited. No unrelated jobs were interrupted.
`git diff 34ff817 -- apps catalog.json` remained empty after validation.
