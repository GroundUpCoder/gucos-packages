"""Execute the real recipe with a recording compiler; no host compilation."""
import os
from pathlib import Path
import shutil
import subprocess
import tempfile

repo = Path(__file__).resolve().parents[1]
with tempfile.TemporaryDirectory() as tmp:
    root = Path(tmp)
    for name in ('source.tar', 'build.sh'):
        shutil.copyfile(repo / 'apps/twm' / name, root / name)
    tools = root / 'tools'
    tools.mkdir()
    cc = tools / 'cc'
    cc.write_text('''#!/usr/bin/env python3
import pathlib, sys
args=sys.argv[1:]
for arg in args:
    if arg.endswith('.o') and arg != args[args.index('-o')+1]:
        p=pathlib.Path(arg)
        assert p.resolve().parent == pathlib.Path('objects').resolve(), arg
        assert p.read_text() == 'fresh', arg
out=pathlib.Path(args[args.index('-o')+1]);out.write_text('fresh')
''')
    cc.chmod(0o755)
    # A pre-existing unrelated object in the historical shared directory must
    # never enter the link. Avoid touching the machine's real /tmp/twm-build.
    archive = subprocess.check_output(['tar', '-xOf', str(root/'source.tar'), 'source/install.sh']).decode()
    assert '/tmp/twm-build/*.o' in archive
    env = dict(os.environ, PATH=str(tools)+os.pathsep+os.environ['PATH'], DESTDIR=str(root/'stage'))
    subprocess.run(['sh', 'build.sh'], cwd=root, env=env, check=True)
    assert (root/'stage/bin/twm').read_text() == 'fresh'
    assert '/tmp/twm-build' not in (root/'source/build-local.sh').read_text()
print('TWM-SCRATCH-PASS (recording compiler; browser test seeds actual stale object)')
