# Package-only live desktop smoke

Run **after activation**, from the package repository. Do not run this against
old production while the candidate is pending. The expected runtime guard runs
before package installation and rejects any other core build.

For the frozen c4411d72 candidate after it is activated:

```sh
cd /Users/jku/git/wasm-posix-packages
COMPAT_CORE_URL=https://os.groundupcoder.net/ \
COMPAT_EXPECT_RUNTIME=c4411d720bede49ead5c1de69bfe7b1247656a146b72d991d209883606e300fb \
COMPAT_RUN_NAME=live-c4411d72 \
node tools/accept-live-desktop.mjs
```

Use a new run name for each attempt; existing directories are rejected. The
fresh profile lives under `test-results/live-desktop-smoke/<name>/profile` and
never reuses the full candidate runner's profile or a user browser disk.
Do not wrap the driver in machine-job: it acquires six separate browser
reservations, each capped at 300 seconds, with only one stage queued at a time.

The smoke checks the exact core identity and immutable public fab65cb catalog,
then installs only the original X11 server/toolkit/widgets, JWM and xterm binary
packages. It verifies their original manifest identities and all output hashes.
It starts Xvfb and JWM together, opens an actual xterm with a guest shell, verifies
JWM has reparented its window, and sends browser keyboard events through the
focused xterm PTY. The shell writes the typed text to a guest user file. JWM and
the server exit cleanly. A new browser session then reloads the page and checks
the user file, all five manifests, and every installed package output again.

Only a small focus/WM test controller is compiled, linked against retained X11
libraries. No package is rebuilt, no runtime tag or platform metadata is changed,
and no package source recipe is executed. There are no core or hosting edits.

A nonzero exit is a failure; inspect `report.json` and the named stage log in the
run directory. Failure stops later stages. A passing smoke is a narrow live
desktop check, not a substitute for the full pre-activation compatibility run or
the guarded live core/startup gates. Browser shell/DOM hooks used by this harness
are internal test interfaces; inspect a failure before attributing it to the ABI.

Preparation validation: JavaScript syntax, CLI help, and independent review.
The new joint JWM/xterm smoke has **not been executed before activation**. Existing
underlying install/session primitives were exercised by the full baseline runner;
that does not establish a pass for this new smoke or the activated candidate.
