# HarfBuzz

Unpublished14.5.0 host-prepared C++ translation candidate. Tracked historical
sources retain commit provenance. prepared.tar.gz separately snapshots the
original generated C, headers, build script, translation manifest and original
provenance. Every40940 indexed file and the translation manifest SHA-256 were
checked before archiving. No new C++ translation or guest C++ compilation ran.

Guest build compiles retained generated C and the original FreeType ABI adapter.
The retained consumer checks golden shaping, subset creation and FreeType-backed
shaping with static/shared links. This is not a rerun of the full historical
upstream/translator suite. Fresh guest build/acceptance remains pending.
Original compiler/LLVM configuration and limitations remain in translation.json.

Provenance limitation: the recorded runtimeAdapterSha256 differs from the
pinned historical tools/cpp-translator/runtime_abi.py bytes. Retained generated
outputs verify against their original inventory, but translation reproducibility
from that pinned translator is not established. See the repository audit at
docs/research/package-migration/harfbuzz-provenance-audit.json.

The monolithic recipe passed source acceptance on61a; see batch-11/source.
Its153147392-byte raw artifact is retained locally and is not published.
The revised unpublished recipe depends on harfbuzz-static for both .a files,
links its DSO from those objects, and owns headers/pkgconfig/provenance/licenses.
This preserves all52 original payload paths across two components, with two
additional static-component license paths. Split source/binary/public execution
remains pending; monolithic acceptance is not acceptance of these new recipes.
