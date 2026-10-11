# Platform 1.0 package acceptance completed

The user/core author reports that guarded deployment completed and runtime
c4411d720bede49ead5c1de69bfe7b1247656a146b72d991d209883606e300fb is live at
https://os.groundupcoder.net/. Core documentation and the v1.0.0 tag were still
being finalized when this result was reported; this entry does not assert that
the tag has already been created.

The user/core author executed both acceptance runs, in this order:

- Before activation: `platform-1-0-c4411d72`, against the immutable candidate
  distribution. All 14 stages passed: 17 original public packages, 803 output
  hashes before/after, binary execution, retained-library relinking, graphics,
  xterm PTY input, launcher checks and reload persistence.
- After guarded activation: `platform-1-0-live-c4411d72`, against the live URL.
  All six stages passed: five original desktop packages, 722 output hashes,
  JWM and xterm together, actual browser keyboard input through the guest PTY,
  and persisted results/manifests/bytes after reopening and reload.

The package author inspected the existing reports, confirmed every stage exited
zero and both reports identify c4411d72, and recomputed all 20 stage-log hashes
against their reports. Exact report hashes, stage hashes and scheduler job IDs
are in platform-1.0-package-acceptance-evidence.json. This was evidence inspection,
not another browser run or an independent execution of acceptance. Guarded
activation itself is attributed to the user/core author, not performed here.

The immutable public catalog remains fab65cba24c8c6dd59e11a63e096138e13835c42.
Original binaries, archives and manifests retain their 2a9cca provenance and
verified legacy mapping. Nothing was rebuilt or retagged to pass compatibility.
No test was duplicated, and no core or hosting file was changed by this update.

For future builds/publications, follow the authoritative core docs/PLATFORM.md:
format 1 manifests declare platform target/minVersion/runtime ABI, object ABI
for retained objects/static libraries, actual required features, and requirements
for every dependency. The current baseline is platform 1.0.0, target
wasm32-wasm-posix, runtime ABI 5, object ABI 3. Source/binary integrity pins remain
mandatory. Existing verified legacy catalog entries may remain unchanged.
See docs/package-publication.md for the durable package-author guidance.
