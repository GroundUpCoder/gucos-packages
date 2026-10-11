# CPython foundation source candidate

This is source preparation of canonical historical package `cpython` version
`3.14.7-5`, not a guest execution or acceptance result. Tkinter, IDLE, pygame and
games remain separate packages. No desktop launcher is introduced.

## Source and adaptations

`source.tar` contains all 5,149 exact Git blobs and their modes from
`0b9b3245fe11a3bc677d81113cba90cd0ae80446:apps/cpython` in the preserved historical
repository. It is a **gzip-compressed USTAR archive** with zero timestamps. Its
filename is retained for the existing migration consumer harness; the current
BusyBox build enables gzip and tar autodetection. The build explicitly uses
`tar -xzf`. Compression avoids a repository file larger than 100 MiB without
discarding historical source or test inputs. `source-inventory.json` records
every Git identity, mode, size and SHA256. `sources.lock.json` preserves the
upstream archive identity recorded in historical `PORT.md`; it is not a claim
that the upstream archive was downloaded again during preparation.

The retained port includes the GIL, width-safe Wasm atomics, scalar hash
implementations, spawn-only subprocess backend, socket/mmap/ioctl adaptations,
asyncio fallback and private interpreter layout. Configure disables fork/vfork,
forkpty, JIT, mimalloc, remote debugging, computed gotos and test modules. The
original `port/probe-build.sh` still builds with at most two make workers.

The sole Python-source change is `site-gucman.py`, with exact preimage and patch
recorded in `provenance.json` and `site-store.patch`. It changes the private-store
prefix test from `/usr/local/lib/wasm-posix/packages/cpython/` to
`/usr/local/lib/gucman/packages/cpython/`, retaining public `/usr/local` site
processing, `.pth` files and the existing `-S`/venv behavior. The build verifies
the preimage and applies this file **before** configure or module freezing.

Build configuration, bootstrap interpreters, frozen-module headers, `pyconfig.h`,
`Makefile` and sysconfig data are generated inside the guest. No generated files
from another run are imported. Historical source acceptance logs record
`_sysconfigdata__wasm1_.py`; the build asserts that the newly generated basename
matches the declared output and fails on a mismatch rather than renaming it.
The fixed runtime uname yields `wasm1`; configure's historical double-dash
multiarch query remains unchanged. No host Python builds or configures CPython.

The historical `PORT.md` remains verbatim and includes historical results only.
Its September 30 build-date fallback description is stale: the actual pinned
`Modules/getbuildinfo.c` fallback is January 1, 1970, 00:00:00. This preparation
preserves the source rather than changing it to match that prose.

## Package and outputs

Core supplies make and the compiler/libc; the only package dependency is exact
`zlib 1.3.2-1`. The platform contract is runtime ABI 5 with POSIX, Unix streams
and pthreads. This package does not install static archives or retained objects.

`outputs.json` derives from the historical `Lib` and `Include` trees plus the
explicit generated files, interpreter, launchers, documentation and licenses.
It excludes `Lib/test`, `Lib/ensurepip` and bytecode caches from the installed
payload, while retaining them in the source archive. `lib-dynload/README` keeps
the exec-prefix landmark. The generated Makefile and sysconfig data remain
installed for native-extension consumers. `python3.14` is the interpreter;
regular shell launchers named `python3` and `cpython` replace historical symlinks
because current gucman rejects nonregular output files. They exec the installed
versioned interpreter without changing arguments. Stage tests call the staged
versioned executable directly.

Owned licenses include CPython's full `LICENSE`, `Doc/license.rst`, Expat's
`COPYING`, and the complete pinned HACL source directory containing its notices.
Keeping notices for disabled HACL variants does not advertise those features.
The migration summary is installed separately from unchanged historical docs.

## Test boundaries and pending gates

`build.sh` retains the historical source smoke and zlib roundtrip. `test.sh`
checks atomic widths/CAS/neighbour preservation, arithmetic/Unicode/threads/
asyncio, real spawn behavior and rejected subprocess options, zlib, installed
sysconfig/Makefile paths, and the upstream `xxlimited` shared extension's methods,
attributes and buffer interface. The two historical benchmark scripts remain
checked diagnostics, not comparative performance claims.

Installed consumers additionally check both public launchers and `-I` processing
of a public `.pth` pointing at a unique retained consumer fixture, followed by
`-I -S` exclusion. The `.pth` is removed on success or failure; temporary evidence
and extension files remain under the printed consumer directory. Staged tests
explicitly leave the public-site check pending.

Independent source review, a scheduled guest build/export, exact artifact review,
fresh binary installation, repeated installed consumers and browser reload are
still required. Generic reload hash checks alone do not prove Python or extension
execution after reload: a later reviewed driver must import the **same retained
extension**, check interpreter/zlib behavior, and exercise persisted data without
rebuilding. This source preparation does not provide that browser driver or claim
those results. Public publication and acceptance remain separate gates.

No pip/ensurepip, HTTPS/OpenSSL, ctypes, bz2/lzma, Tk, free-threading, unrestricted
subprocess modes or full CPython conformance is claimed. Pure Python files for
optional modules in the stdlib do not imply their native backends are supplied.
