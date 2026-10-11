#!/usr/bin/env python3
"""Durable parent for the ordinary machine-job production browser gate.

Launch with stdin/stdout/stderr redirected and a new session. This parent never
launches a browser itself, changes scheduler policy, or retries an executed gate.
"""
import datetime
import fcntl
import hashlib
import json
import os
from pathlib import Path
import subprocess
import sys
import time

ROOT = Path(__file__).resolve().parents[2]
RUN = Path(sys.argv[1]).resolve()
SCHEDULER = Path.home() / '.local/bin/machine-job'
RUN.mkdir(parents=True, exist_ok=True)
lock = (ROOT / 'test-results/gucode-public-parent.lock').open('a')
fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
assert os.environ.get('DEEPSEEK_KEY_FILE')
assert os.environ.get('GUCOS_EXPECTED_RUNTIME')
assert not (RUN / 'status.json').exists(), 'Use a fresh run directory'

def now():
    return datetime.datetime.now(datetime.timezone.utc).isoformat()

def jobs():
    return json.loads(subprocess.check_output([str(SCHEDULER), 'status'], text=True))['jobs']

existing = jobs()
assert not any('tests/gucode/public.mjs' in j['name'] for j in existing), 'Existing gucode gate: refusing duplicate'
state = {'startedAt': now(), 'parentPid': os.getpid(), 'status': 'waiting',
         'preservedExistingJobIds': [j['id'] for j in existing],
         'harnessSha256': hashlib.sha256((ROOT / 'tests/gucode/public.mjs').read_bytes()).hexdigest(),
         'attempts': []}

def save():
    tmp = RUN / 'status.tmp'
    tmp.write_text(json.dumps(state, indent=2) + '\n')
    tmp.replace(RUN / 'status.json')

for number in range(1, 1001):
    log_path = RUN / ('scheduler-%03d.log' % number)
    attempt = {'number': number, 'startedAt': now(), 'log': log_path.name}
    state['attempts'].append(attempt)
    with log_path.open('xb') as output:
        proc = subprocess.Popen([str(SCHEDULER), 'run', '--kind', 'browser', '--timeout', '600', '--', 'node', 'tests/gucode/public.mjs'], cwd=ROOT, stdin=subprocess.DEVNULL, stdout=output, stderr=subprocess.STDOUT)
        attempt['schedulerPid'] = proc.pid
        save()
        time.sleep(2)
        matches = [j for j in jobs() if j['pid'] == proc.pid]
        if matches:
            attempt['schedulerJobId'] = matches[0]['id']
            save()
        code = proc.wait()
    output_text = log_path.read_text()
    ran = '[machine-job] running:' in output_text
    attempt.update(finishedAt=now(), returncode=code, browserGateStarted=ran)
    admission_retry = not ran and ((code == 75 and 'queue is full' in output_text) or (code == 1 and 'Scheduler deadline exceeded' in output_text))
    if admission_retry:
        attempt['admissionRetry'] = True
        save()
        time.sleep(30)
        continue
    state.update(finishedAt=now(), status='passed' if code == 0 else 'failed', returncode=code)
    save()
    sys.exit(code if code >= 0 else 128 - code)
state.update(finishedAt=now(), status='admission-retries-exhausted', returncode=75)
save()
sys.exit(75)
