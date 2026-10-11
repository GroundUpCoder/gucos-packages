"""Stage a bounded PCG32 SDK from a successful fresh host preparation report.

Usage: python3 tools/stage-pcg32.py PREPARATION_DIRECTORY
No guest execution or publication is performed here.
"""
from pathlib import Path
import hashlib
import io
import json
import subprocess
import sys
import tarfile

if not __debug__:
    raise RuntimeError('Staging requires assertions; unset PYTHONOPTIMIZE and omit -O')

ROOT = Path(__file__).resolve().parents[1]
OLD = Path('/Users/jku/git/wasm-posix-old')
REV = '0b9b3245fe11a3bc677d81113cba90cd0ae80446'
sha = lambda b: hashlib.sha256(b).hexdigest()
run = Path(sys.argv[1]).resolve()
assert run.is_relative_to(ROOT / 'test-results')
report_bytes = (run / 'preparation.json').read_bytes()
report = json.loads(report_bytes)
assert report['historicalCommit'] == REV
assert report['execution']['status'] == 'not-run'
assert report['outputs_compared_per_mode'] == 488
assert report['native_optimizations'] == ['O0', 'O2']
work = Path(report['retainedWorkspace']).resolve()
assert work.is_relative_to(run)
required = {'joined/manifest.json', 'client.c', 'native-values.json'}
assert required <= report['retainedFiles'].keys(), 'Incomplete retained input inventory'
for name, digest in report['retainedFiles'].items():
    path = (work / name).resolve()
    assert path.is_relative_to(work) and sha(path.read_bytes()) == digest
manifest_bytes = (work / 'joined/manifest.json').read_bytes()
manifest = json.loads(manifest_bytes)
assert len(manifest['artifacts']) == 17
assert all('constructorPriority' not in r for r in manifest['artifacts'])
assert {'joined/'+r['path'] for r in manifest['artifacts']} <= report['retainedFiles'].keys(), 'Uninventoried definition input'
files = {}
for row in manifest['artifacts']:
    name = row['path']
    assert name.startswith('definitions/') and '..' not in Path(name).parts
    data = (work / 'joined' / name).read_bytes()
    assert sha(data) == row['sha256'] and name not in files
    files[name] = data
api = subprocess.check_output(['git', '-C', str(OLD), 'show', REV+':apps/pcg32/api.h'])
client = (work / 'client.c').read_bytes()
assert client.startswith(api+b'\n')
files['client.c'] = b'#include "api.h"\n'+client[len(api)+1:]
files['api.h'] = api
files['entry.c'] = b'#include <stdio.h>\nint run_tests(void);\nint main(void){int r=run_tests(); printf("PCG32-result=%d\\n",r); return r ? 1 : 0;}\n'
files['native-values.json'] = (work / 'native-values.json').read_bytes()
assert len(json.loads(files['native-values.json'])) == 488
files['host-preparation.json'] = report_bytes
files['project.json'] = (json.dumps({'sources': sorted(files.keys() & {r['path'] for r in manifest['artifacts']})+['client.c','entry.c'], 'includes': ['.']}, indent=2)+'\n').encode()
provenance_bytes = (json.dumps({'translationManifestSha256': sha(manifest_bytes),
    'files': {n: sha(b) for n,b in sorted(files.items())},
    'scope': 'Fresh pinned host translation and O0/O2 native oracle; guest acceptance pending'}, indent=2)+'\n').encode()
files['manifest.json'] = manifest_bytes
files['provenance.json'] = provenance_bytes
out = ROOT / 'apps/pcg32'
out.mkdir()
subprocess.run([sys.executable, str(ROOT/'tools/historical-archive.py'), str(OLD), REV,
                'apps/pcg32', str(out/'source.tar')], check=True, cwd=ROOT)
with tarfile.open(out/'prepared.tar', 'w', format=tarfile.USTAR_FORMAT) as archive:
    for name, data in sorted(files.items()):
        info=tarfile.TarInfo('generated/'+name); info.size=len(data); info.mode=0o644
        archive.addfile(info, io.BytesIO(data))
def write(name, value):
    (out/name).write_text(json.dumps(value, indent=2)+'\n')
write('provenance.json', {'repository':'wasm-posix-old (preserved local historical repository)',
    'commit':REV, 'path':'apps/pcg32', 'archiveSha256':sha((out/'source.tar').read_bytes()),
    'preparedArchive':{'file':'prepared.tar','sha256':sha((out/'prepared.tar').read_bytes()),
        'provenanceSha256':sha(provenance_bytes),'manifestSha256':sha(manifest_bytes),'fileCount':len(files)},
    'scope':'PCG32 bounded scalar adapter SDK; host translation refreshed, guest execution pending'})
write('recipe.json', {'name':'pcg32','version':'0.1.0-1','dependencies':[], 'dependencyRequirements':{},
    'platform':{'target':'wasm32-wasm-posix','minVersion':'1.0.0','runtimeAbi':5,'objectAbi':3,'features':['posix-core']},
    'inputs':['source.tar','prepared.tar','build.sh','test.sh']})
outputs=['bin/pcg32-check','lib/libpcg32.a','include/pcg32/api.h',
         'share/pcg32/translation.json','share/pcg32/native-values.json','share/licenses/pcg32/LICENSE']
write('outputs.json',[{'path':p,'mode':493 if p.startswith('bin/') else 420} for p in sorted(outputs)])
(out/'build.sh').write_text('''#!/bin/sh
set -eu
tar -xf source.tar
tar -xf prepared.tar
mkdir -p objects "$DESTDIR/lib" "$DESTDIR/bin" "$DESTDIR/include/pcg32" "$DESTDIR/share/pcg32" "$DESTDIR/share/licenses/pcg32"
for file in generated/definitions/*.c; do
 name=${file##*/}
 cc -c "$file" -o "objects/${name%.c}.o"
done
ar qcs "$DESTDIR/lib/libpcg32.a" objects/*.o
cc generated/client.c generated/entry.c "$DESTDIR/lib/libpcg32.a" -o "$DESTDIR/bin/pcg32-check"
cp generated/api.h "$DESTDIR/include/pcg32/api.h"
cp generated/provenance.json "$DESTDIR/share/pcg32/translation.json"
cp generated/native-values.json "$DESTDIR/share/pcg32/native-values.json"
cp source/upstream/LICENSE "$DESTDIR/share/licenses/pcg32/LICENSE"
''')
(out/'test.sh').write_text('''#!/bin/sh
set -eu
tar -xf prepared.tar
cp "$DESTDIR/include/pcg32/api.h" generated/api.h
mkdir -p test-objects
for file in generated/definitions/*.c; do
 name=${file##*/}
 cc -c "$file" -o "test-objects/${name%.c}.o"
done
cc -c generated/client.c -o client.o
cc -c generated/entry.c -o entry.o
"$DESTDIR/bin/pcg32-check" > installed.log
test "$(cat installed.log)" = PCG32-result=0
for backend in native dispatch; do
 flag=
 if [ "$backend" = dispatch ]; then flag=--no-native-functions; fi
 cc $flag --project generated/project.json --rebuild -o "whole-$backend"
 cc $flag test-objects/*.o client.o entry.o -o "objects-$backend"
 cc $flag client.o entry.o "$DESTDIR/lib/libpcg32.a" -o "archive-$backend"
 for mode in whole objects archive; do
  "./$mode-$backend" > "$mode-$backend.log"
  test "$(cat "$mode-$backend.log")" = PCG32-result=0
  echo "PCG32-488-PASS $mode $backend"
 done
done
''')
(out/'README.md').write_text('''# PCG32 bounded scalar adapter SDK

Upstream70099ead is retained unchanged with Apache2.0 license and the original
samples/shuffle adapters. Version0.1.0-1 identifies this package adapter, not an
upstream release. It exports the two C adapter functions and a488-value checker;
it does not claim general guest C++ or SIMD support.

Fresh host preparation retains the pinned translator, real WASI SDK30 headers,
four seeds, O0/O2 agreement, published golden values and17 generated definitions.
Guest tests require all488 results under whole-program, object and installed
archive links with both compiler backends. The checker converts any failing
index to exit1 and prints the full index, avoiding exit-code truncation.
Source/binary/public acceptance is pending. This is a formerly noncatalog
workload, not a retroactive historical package publication.
''')
print(out)
