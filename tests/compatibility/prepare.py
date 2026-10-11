"""Read the immutable published baseline; never rewrite package artifacts."""
import hashlib, io, json, subprocess, sys, tarfile
from pathlib import Path
root = Path(__file__).resolve().parents[2]
revision = 'fab65cba24c8c6dd59e11a63e096138e13835c42'
names = 'x11-server x11-toolkit x11-widgets jwm xterm xcalc xclock xeyes xlogo xlsfonts xkill xrefresh xmessage xprop xev lua zstd'.split()
def blob(rev, path):
    return subprocess.check_output(['git', 'show', rev + ':' + path], cwd=root)
def digest(data):
    return hashlib.sha256(data).hexdigest()
def pinned(entry):
    prefix = 'https://raw.githubusercontent.com/GroundUpCoder/gucos-packages/'
    assert entry['url'].startswith(prefix)
    rev, path = entry['url'][len(prefix):].split('/', 1)
    assert len(rev) == 40 and all(c in '0123456789abcdef' for c in rev)
    data = blob(rev, path)
    assert len(data) == entry['size'] and digest(data) == entry['sha256']
    return data
catalog_bytes = blob(revision, 'catalog.json')
catalog = json.loads(catalog_bytes)
packages = {}
checksums = []
for name in names:
    manifest = json.loads(pinned(catalog['packages'][name]))
    data = pinned(manifest['binary'])
    with tarfile.open(fileobj=io.BytesIO(data)) as archive:
        members = archive.getmembers()
        assert all(m.isfile() for m in members)
        assert {m.name for m in members} == {o['path'] for o in manifest['outputs']}
        for member in members:
            assert '\n' not in member.name and '..' not in member.name.split('/')
            checksums.append(digest(archive.extractfile(member).read()) + '  /usr/local/' + member.name)
    packages[name] = manifest
out = Path(sys.argv[1])
(out / 'baseline.json').write_text(json.dumps(dict(catalogCommit=revision, catalogSha256=digest(catalog_bytes), catalogUrl='https://raw.githubusercontent.com/GroundUpCoder/gucos-packages/'+revision+'/catalog.json', packages=packages), indent=2)+'\n')
(out / 'installed.sha256').write_text('\n'.join(checksums)+'\n')
print('Pinned baseline:', len(packages), 'packages,', len(checksums), 'output hashes')
