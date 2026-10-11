"""Retry only queue-full admission; all execution stays inside machine-job."""
from pathlib import Path
import subprocess,time
root=Path('/Users/jku/git/gucos-packages-snake')
run=root/'test-results/migration'
started=time.monotonic()
for attempt in range(121):
    log=run/f'snake-response-admission-{attempt}.log'
    with log.open('xb') as output:
        result=subprocess.run(['/Users/jku/.local/bin/machine-job','run','--kind','browser',
            '--timeout','1800','--','sh','/tmp/gucos-snake-accept.sh'],cwd=root,
            stdin=subprocess.DEVNULL,stdout=output,stderr=subprocess.STDOUT)
    # Never retry failed/partial acceptance automatically or overwrite its evidence.
    text=log.read_text()
    if 'Machine job queue is full' not in text:
        (run/'snake-response-exit.txt').write_text(str(result.returncode)+'\n')
        break
    if time.monotonic()-started>=3600:
        (run/'snake-response-admission-timeout.txt').write_text('Queue remained full for one hour.\n')
        break
    time.sleep(30)
