# One-off host source transformation audit; not guest acceptance.
from pathlib import Path
import tempfile, subprocess, shutil, json, hashlib, os
assert os.environ.get('MACHINE_JOB_ID')
r=Path('/home/ubuntu/git/gucos-packages-ipc')
recipe=(r/'apps/tmux/build.sh').read_text()
subprocess.run(['sh','-n',str(r/'apps/tmux/build.sh')],check=True)
for name in ['integrated-compile.mjs','lifecycle-candidate.mjs']:
 subprocess.run(['node','--check',str(r/'docs/research/tmux-ipc'/name)],check=True)
with tempfile.TemporaryDirectory(prefix='tmux-source-audit-') as tmp:
 d=Path(tmp)
 shutil.copy2(r/'apps/tmux/source.tar',d/'source.tar')
 subprocess.run(['sh','-c',recipe[:recipe.index('CC=cc ')]],cwd=d,check=True)
 original=Path('/home/ubuntu/tmux-ipc-upstream/tmux-3.5a/compat/imsg.c').read_text()
 a=original.index('\tif (getdtablecount() + imsg_fd_overhead +')
 b=original.index('\n\t}\n',a)+len('\n\t}\n')
 expected=original[:a]+'\t/* gucOS: no finite descriptor quota; recvmsg reports actual failures. */\n'+original[b:]
 assert (d/'source/compat/imsg.c').read_text()==expected
 assert 'getdtablesize(' not in expected and 'getdtablecount(' not in expected
 result={'status':'passed','scope':'Remote host shell/JS syntax and exact imsg source transformation only; no guest build or lifecycle', 'recipeSha256':hashlib.sha256(recipe.encode()).hexdigest(),'machineJobId':os.environ['MACHINE_JOB_ID']}
 print(json.dumps(result,indent=2))
 (r/'docs/research/tmux-ipc/closefrom-preparation/result.json').write_text(json.dumps(result,indent=2)+'\n')
