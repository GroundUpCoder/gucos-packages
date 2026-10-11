# libcurl subset and gucode 0.1.0

Implemented the user-requested HTTP-only libcurl package and separate portable C
coding agent. Application repository: https://github.com/josephkimgpt/gucode.
The repository is public. GitHub issued GroundUpCoder a write collaborator
invitation, pending acceptance at the time of publication. The native executable
was installed in the user's local bin directory after native validation.

## Provenance and review

Application source commit: 735423130bb65f1773c46446d9a8f7dc4bd0f0e7.
Native evidence update: 702e26a. Frozen package sources and guest exports:
0097b04d72151adb13c75a345691cbedbdc95580. Manifest commit:
ab2a7f6eed3bdf98b4477e707289f4be457c5e66. Initial catalog commit: b6a6f99.
Publication merge: d0221fb.

Primary agent authored the implementation and executed tests. External cc-meta
review thread 01a129d9-3bea-7c48-9000-5405f3012bcf used the Codex executor with
verified model gpt-6-astra. It independently reviewed sources, receipt hashes,
archive contents/modes/licenses, application-source correspondence, catalog output
ownership and publication logic. It did not author code or run our tests. Its
final artifact approval covered 0097b04 and corrected pin helper 5e95683.

The remote repository advanced during this work. The push was rejected, so a
normal merge preserved immutable artifact/manifest commits. The catalog conflict
was resolved by retaining all 87 entries at remote ec3fa8c and appending only
libcurl/gucode. check-catalog passed all 89 packages. No force push was used.
The other task's baseline updates remain intact; this work makes no acceptance
claim about unrelated packages.

## Executed scope

Native: release build, 22 deterministic regression groups, ASan/UBSan run, real
DeepSeek bugfix/build/regression/resume, and a larger C statistics implementation
checked independently against four valid and four malformed/overflow inputs.
Only DeepSeek was used for live model testing. Six upstream cJSON deprecation
warnings occurred in the sanitizer build; no sanitizer diagnostics were observed.

Browser candidate: real guest source builds of both packages, retained libcurl
archive relinking, binary POST/stream/status/header/error/timeout/cancel tests,
DeepSeek file editing/compilation/testing, browser reload and conversation resume.
Fresh binary installation verified each installed payload hash before/after reload.
Exact reports and earlier failures are under docs/research/gucode/.

Public delivery: both immutable manifests, every declared source input and both
binary archives were anonymously fetched and hash/size verified after push.
Production interactive acceptance is recorded separately in public.json when run;
public-delivery.json alone does not claim that browser gate.

## Limits

This is a documented curl source-API subset, not upstream libcurl or complete
compatibility. Core 1.0.1 always follows redirects and browser CORS applies. The
agent uses trusted configured API endpoints. Approved shell commands are not
sandboxed. Conversation compaction, OAuth, multimodal tools and subagents are not
part of this release. No application-specific changes were made to core.
