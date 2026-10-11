import os
"""Read-only validation of explicitly selected, unpublished migration candidates.

Usage: python3 tools/check-migration.py NAME [NAME ...]
Does not build, publish, rewrite provenance, or infer runtime acceptance.
"""
import hashlib
import json
import re
import subprocess
import sys
import tarfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OLD = Path(os.environ['WASM_POSIX_HISTORICAL_CHECKOUT'])
BASELINE = '716bfe27a56357513abfc7213d542bda63129cd1'


def git(*args, cwd=ROOT):
    return subprocess.check_output(['git', *args], cwd=cwd)


def read(path):
    return json.loads(path.read_text())


names = sys.argv[1:]
assert names and len(names) == len(set(names)), 'Select distinct candidate names'
assert all(re.fullmatch('[a-z0-9][a-z0-9-]*', n) for n in names)
baseline = json.loads(git('show', BASELINE + ':catalog.json'))
current_catalog = read(ROOT / 'catalog.json')
for name, entry in baseline['packages'].items():
    assert current_catalog['packages'][name] == entry, (name, 'baseline catalog entry changed')
owned = {}
versions = {}
for name in baseline['packages']:
    path = 'apps/' + name + '/package.json'
    manifest = json.loads(git('show', BASELINE + ':' + path))
    versions[name] = manifest['version']
    # Preserve every tracked baseline package byte, not just manifest metadata.
    assert not git('diff', BASELINE, '--', 'apps/' + name), name + ': baseline changed'
    for output in manifest['outputs']:
        owned[output['path']] = name
for recipe in (ROOT / 'apps').glob('*/recipe.json'):
    if recipe.parent.name not in versions:
        versions[recipe.parent.name] = read(recipe)['version']

for name in names:
    assert name not in baseline['packages'], 'Do not mutate baseline packages'
    directory = ROOT / 'apps' / name
    recipe = read(directory / 'recipe.json')
    outputs = read(directory / 'outputs.json')
    provenance = read(directory / 'provenance.json')
    assert recipe['name'] == name
    platform = recipe['platform']
    assert platform['target'] == 'wasm32-wasm-posix'
    assert platform['minVersion'] == '1.0.0' and platform['runtimeAbi'] == 5
    features = read(ROOT / 'tools/platform.json')['features']
    assert set(platform['features']) <= set(features)
    if any(o['path'].endswith(('.a', '.o')) for o in outputs):
        assert platform['objectAbi'] == 3
    assert len(recipe['dependencies']) == len(set(recipe['dependencies']))
    assert set(recipe['dependencies']) == set(recipe['dependencyRequirements'])
    for dep, requirement in recipe['dependencyRequirements'].items():
        assert requirement == {'version': versions[dep]}, (name, dep, 'exact candidate requirement')
    assert len(recipe['inputs']) == len(set(recipe['inputs']))
    for path in recipe['inputs']:
        assert not Path(path).is_absolute() and '..' not in Path(path).parts
        assert (directory / path).is_file()
    assert any(o['path'].startswith('share/licenses/' + name + '/') for o in outputs)
    for output in outputs:
        path = output['path']
        assert not Path(path).is_absolute() and '..' not in Path(path).parts
        assert output['mode'] in (420, 493)
        assert path not in owned, (name, path, owned.get(path))
        owned[path] = name
    for file in ('build.sh', 'test.sh'):
        subprocess.run(['sh', '-n', str(directory / file)], check=True, cwd=ROOT)
    source = provenance['path']
    revision = provenance['commit']
    listing = git('ls-tree', '-r', revision, '--', source, cwd=OLD).decode().splitlines()
    expected = {}
    for line in listing:
        meta, path = line.split('\t')
        mode, kind, blob = meta.split()
        assert kind == 'blob'
        expected[path] = (mode, blob)
    seen = set()
    with tarfile.open(directory / 'source.tar') as archive:
        for member in archive:
            assert member.name.startswith('source/') and '..' not in Path(member.name).parts
            path = source + '/' + member.name.removeprefix('source/')
            assert path not in seen
            seen.add(path)
            mode, blob = expected[path]
            assert member.issym() == (mode == '120000')
            data = member.linkname.encode() if member.issym() else archive.extractfile(member).read()
            assert hashlib.sha1(b'blob ' + str(len(data)).encode() + b'\0' + data).hexdigest() == blob
    assert seen and seen == set(expected)
    assert hashlib.sha256((directory / 'source.tar').read_bytes()).hexdigest() == provenance['archiveSha256']
    for overlay in provenance.get('overlays', []):
        data = (directory / overlay['file']).read_bytes()
        assert data == git('show', revision + ':' + overlay['historicalPath'], cwd=OLD)
        assert hashlib.sha256(data).hexdigest() == overlay['sha256']
    for extra in provenance.get('additionalArchives', []):
        assert extra['file'] in recipe['inputs']
        extra_path = directory / extra['file']
        assert hashlib.sha256(extra_path.read_bytes()).hexdigest() == extra['archiveSha256']
        entries = git('ls-tree', '-r', revision, '--', extra['historicalPath'], cwd=OLD).decode().splitlines()
        expected_extra = {}
        for entry in entries:
            meta, path = entry.split('\t')
            mode, kind, blob = meta.split()
            assert kind == 'blob'
            expected_extra[path] = (mode, blob)
        seen_extra = set()
        with tarfile.open(extra_path) as archive:
            for member in archive:
                assert member.name.startswith('source/') and '..' not in Path(member.name).parts
                path = extra['historicalPath'] + '/' + member.name.removeprefix('source/')
                assert path not in seen_extra
                seen_extra.add(path)
                mode, blob = expected_extra[path]
                assert member.issym() == (mode == '120000')
                data = member.linkname.encode() if member.issym() else archive.extractfile(member).read()
                assert hashlib.sha1(b'blob ' + str(len(data)).encode() + b'\0' + data).hexdigest() == blob
        assert seen_extra and seen_extra == set(expected_extra)
    if 'preparedArchive' in provenance:
        prepared = provenance['preparedArchive']
        archive_path = directory / prepared['file']
        assert prepared['file'] in recipe['inputs']
        assert hashlib.sha256(archive_path.read_bytes()).hexdigest() == prepared['sha256']
        with tarfile.open(archive_path) as archive:
            members = archive.getmembers()
            assert len(members) == prepared['fileCount']
            assert all(m.isfile() and m.name.startswith('generated/') and '..' not in Path(m.name).parts for m in members)
            original_bytes = archive.extractfile('generated/provenance.json').read()
            assert hashlib.sha256(original_bytes).hexdigest() == prepared['provenanceSha256']
            original = json.loads(original_bytes)
            hashes = dict(original['files'])
            hashes['provenance.json'] = prepared['provenanceSha256']
            hashes['manifest.json'] = prepared['manifestSha256']
            assert original['translationManifestSha256'] == prepared['manifestSha256']
            assert len(members) == len(hashes)
            assert {m.name.removeprefix('generated/') for m in members} == set(hashes)
            for member in members:
                assert hashlib.sha256(archive.extractfile(member).read()).hexdigest() == hashes[member.name.removeprefix('generated/')]
    print(name, len(seen), 'historical blobs; platform/dependencies/outputs/shell syntax PASS')
for path in owned:
    for ancestor in Path(path).parents:
        assert str(ancestor) not in owned, (path, ancestor, 'ownership ancestor conflict')
print('PASS: baseline19 untouched; source-only checks, no execution/acceptance claim')
