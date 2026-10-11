# gucode 0.1.2 interactive editing release

Application source: josephkimgpt/gucode at 0e76ca1579a7bb1af6a2c1a596bcfc8a3717d16a.
The application adds its own C terminal line editor, rather than depending on
canonical-mode echo for readline commands. It restores termios before tool/API
execution and exit. No core or libcurl changes. It works on the deployed 1.0.1
platform and does not require the unpublished IPC 1.0.2 core.

The exact source archive and per-file hashes are in apps/gucode/provenance.json.
The upgrade plan preserves output paths/modes and all unrelated catalog entries.
Native check/sanitize logs cover all 26 regression groups, nine resource groups,
and real PTY editing/approval/restoration tests. API traffic uses synthetic
credentials and an offline DeepSeek-shaped fixture; no live provider call claimed.

Author builds and tests used machine-job, with one browser reservation at a time.
Independent reviewer 01a12b64-c8e1-7753-a9e3-f4b2571f0c91 was created with the
explicit default account and performed read-only review, not test execution.

Candidate tests use the explicitly supplied /Users/jku/git/gucos/dist with
expected runtime 19609f47c28f9d81c12ad6525d65347057ad5ad2ddec5eb48f5762a922d72441.
Build mode performs gucman source build/test/export; binary mode uses a fresh
browser context. Both verify output payload hashes and reload before interactive
checks. VT checks start a real interactive BusyBox shell because sh -c deliberately
marks output noninteractive. A guest C termios probe replaces unavailable stty;
comparisons fail explicitly on mismatch. X11 checks use published Xvfb/JWM/xterm,
real browser keyboard events, exact provider input assertions and PTY restoration.
Unicode browser entry is exercised in the VT; X11 cases use ASCII equivalents.

Earlier failed attempts are retained: attempt 1 waited for literal backslash
characters instead of ESC; attempt 2 fixed escaping but still used noninteractive
sh -c and assumed stty existed. Neither is accepted interactive evidence. The
final harness captures logs and screenshots even on failure. Source-build export
identities from earlier attempts are not the selected release identity.

Selected candidate binary: 378a92440f3f0dee4e3fc5cc6d4d81cd1dba456094447545035c92910b04f5e3 (179712 bytes).
The receipt binds actual guest inputs, platform, output modes and runtime.

Limits: editing is a single horizontally scrolling line, not complete GNU Readline.
UTF-8 codepoints are edited individually; grapheme clusters are not promised.
History is memory-only, bounded to 32 entries of at most 8 KiB each. Bracketed
pasted newlines become spaces. Ctrl-C exits and can cancel an unfinished paste.
General core control-character echo behavior in other applications is unchanged.

Publication and production acceptance identities will be appended after review.

Attempt 3 exposed an X11 test-driver issue: punctuation must hold physical Shift,
so the driver now sends Shift+Digit1 for !. Attempt 4 was deliberately stopped
when review found unchecked snapshot statuses. Attempt 5 checks each termios
probe exit and retains the before/after values; these are the acceptance gates.
Frozen artifact commit: c7f06efced0513e9cd299a33460d0a3cdb516309.

## Candidate acceptance

Attempt 5 passed source-build and fresh-binary acceptance under browser job
43db7415-0efb-4566-8b0a-d1bad3258bda. Binary/X11 completed at
2026-10-11T14:57:38Z. build.json and binary.json plus corresponding logs retain
exact test scopes and matching termios snapshots. All 12 VT and 12 X11 keyboard
cases matched exact provider input; VT paste/exit/Ctrl-C/Ctrl-D and X11 exit
restoration passed. The final X11 screenshot shows the normal prompt after
Ctrl-L/edit/submit, with desktop cleanup also successful. Native tests separately
cover approval editing and denial, malformed paste, EOF and SIGTERM.

The immutable manifest is bbb0f815298b5da5af0481a05eb173f015d8da07.
Catalog preservation checks compare all98 entries against43b29ff and prove only
gucode changed; check-catalog.py validates all98 published entries.

## Public acceptance

Catalog commit e659a47df2eef9756520bdc9d71b49602c821952 was published after
independent final candidate approval. Application main0e76ca1 and annotated
v0.1.2 were pushed to josephkimgpt/gucode. Public delivery verification passed
catalog/manifest/source/binary hashes and sizes without authentication.

Production-origin browser job1ba9f1dc-bb63-4bd7-85e7-bca0047aaf3d passed from
2026-10-11T15:00:42Z to15:15:23Z. It installed0.1.1 from the retained old manifest,
removed that catalog interception, upgraded through the actual public catalog,
verified all payloads, reloaded, and passed VT and X11 editing/restoration checks.
public.json explicitly binds the selected binary/source hashes and runtime.
Provider responses remained deterministic fixtures; no live DeepSeek claim.

Desktop dependency installation was slow but progressing. Read-only Node
inspector queries sampled shell.busybox.log; no guest data or assertions were
changed. A planned timeout extension was never installed: the run completed
and the process exited before the extension command could attach. It passed
within the original15-minute browser and30-minute scheduler deadlines.

The preservation baseline retains exactly the previous91 package names, updating
only gucode; it is not a complete accepted-package inventory. Main's98-entry
catalog and the other97 package entries remain unchanged. Five separately
recorded later acceptances retain their scope; Imlib2/Feh are not newly accepted.
The exact side ref, commit and checks are in baseline-preservation.json.
