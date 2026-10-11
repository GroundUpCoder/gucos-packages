import os
"""Prepare missing PCG32 translations in an isolated package-local snapshot.

Run with the pinned translator Python under machine-job. This runs only host
preparation and native differential oracles; guest acceptance is separate.
Usage: PYTHON tools/prepare-pcg32.py NEW_OUTPUT_DIRECTORY
"""
import hashlib
import json
import os
from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
OLD = Path(os.environ['WASM_POSIX_HISTORICAL_CHECKOUT'])
REV = '0b9b3245fe11a3bc677d81113cba90cd0ae80446'
if not __debug__:
    raise RuntimeError('Preparation requires assertions; unset PYTHONOPTIMIZE and omit -O')
assert sys.version_info >= (3, 12)
assert os.environ.get('MACHINE_JOB_ID'), 'Host preparation requires machine-job'
out = Path(sys.argv[1]).resolve()
assert out.is_relative_to(ROOT / 'test-results')
out.mkdir(parents=True, exist_ok=False)
snapshot = out / 'snapshot'
hashes = {}
for tree in ('apps/pcg32', 'tools/cpp-translator'):
    listing = subprocess.check_output(
        ['git', '-C', str(OLD), 'ls-tree', '-r', REV, '--', tree], text=True)
    assert listing
    for line in listing.splitlines():
        meta, name = line.split('\t')
        mode, kind, blob = meta.split()
        assert kind == 'blob' and mode in ('100644', '100755')
        data = subprocess.check_output(['git', '-C', str(OLD), 'cat-file', 'blob', blob])
        path = snapshot / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(data)
        path.chmod(int(mode[-3:], 8))
        hashes[name] = hashlib.sha256(data).hexdigest()

# Retain all original native/translation assertions. Replace only the old-core
# guest runner and successful-workspace deletion, with checked exact anchors.
original = (snapshot / 'apps/pcg32/check.py').read_text()
replacements = {
    '        shutil.rmtree(work)': "        print('Retained host preparation: '+str(work), file=sys.stderr)",
    "        results = json.loads(run('node', ROOT/'tools/cpp-translator/tests/run-generated.mjs', joined, client))\n        assert len(results) == 6 and all(r['result'] == 0 for r in results), results":
    "        results = {'status': 'not-run', 'scope': 'Guest whole/object/archive acceptance remains pending'}",
}
driver = original
for before, after in replacements.items():
    assert driver.count(before) == 1
    driver = driver.replace(before, after)
driver_path = snapshot / 'apps/pcg32/prepare-driver.py'
driver_path.write_text(driver)
(out / 'tmp').mkdir()
env = dict(os.environ, PYTHONDONTWRITEBYTECODE='1', TMPDIR=str(out / 'tmp'))
result = subprocess.run([sys.executable, str(driver_path)], cwd=snapshot,
                        env=env, capture_output=True, text=True)
(out / 'host.stdout').write_text(result.stdout)
(out / 'host.stderr').write_text(result.stderr)
assert result.returncode == 0, result.stderr
report = json.loads(result.stdout)
assert report['execution']['status'] == 'not-run'
assert report['outputs_compared_per_mode'] == 488
workspaces = list((snapshot / 'test-results/cpp-translator').glob('pcg32-*'))
assert len(workspaces) == 1
work = workspaces[0]
generated = {str(p.relative_to(work)): hashlib.sha256(p.read_bytes()).hexdigest()
             for p in sorted(work.rglob('*')) if p.is_file()
             and p.relative_to(work).parts[0] != 'wasi-sysroot-30.0'}
for name, digest in hashes.items():
    assert hashlib.sha256((snapshot / name).read_bytes()).hexdigest() == digest
report.update(historicalCommit=REV, historicalInputs=hashes,
              preparationDriverSha256=hashlib.sha256(driver.encode()).hexdigest(),
              preparationToolSha256=hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
              retainedWorkspace=str(work), retainedFiles=generated)
(out / 'preparation.json').write_text(json.dumps(report, indent=2)+'\n')
print(out / 'preparation.json')
