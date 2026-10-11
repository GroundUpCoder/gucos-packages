// Retained Imlib2 X11 consumer; independent review required before execution.
// Runs the retained consumer unchanged; owns one Xvfb and never starts JWM.
import assert from 'node:assert/strict';
import {readFile, writeFile, access} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';

const sha = b => createHash('sha256').update(b).digest('hex');
assert(process.env.MACHINE_JOB_ID, 'Reserved machine-job execution required');
assert(process.env.COMPAT_RUN_DIR, 'Frozen imlib2/feh binary fixture required');
const repo = resolve(process.env.MIGRATION_REPO_ROOT || process.cwd());
const run = resolve(process.env.COMPAT_RUN_DIR);
const attempt = process.env.MIGRATION_ATTEMPT || '';
assert(!attempt || /^[a-zA-Z0-9_-]{1,64}$/.test(attempt), 'Invalid attempt');
const stem = 'imlib2-x11' + (attempt ? '-' + attempt : '');
const outputs = ['.json', '.log', '-session.log', '-consumer.c', '-guest.sh'];
for (const suffix of outputs)
    await assert.rejects(access(resolve(run, stem + suffix)), {code: 'ENOENT'});

const sourceIdentity = {
    archiveSha256: 'e6b74f0375815f53c18ecca27165e41813b168def4311c525ca6761d01201715',
    archiveSize: 4321280,
    member: 'source/tests/consumer.c',
    sha256: '0a20280c434932cf94df31fb0270d7bb3e225e6b4e0691fa5bc575791ff9a95e',
    size: 1928,
};
const report = {
    status: 'running', attempt, startedAt: new Date().toISOString(),
    scope: 'Exact retained Imlib2 consumer: PNG/scaling, X11 rendered red pixels, JPEG, missing-file failure; standalone Xvfb lifecycle. No Feh GUI acceptance.',
    source: sourceIdentity,
    harnessSha256: sha(await readFile(new URL(import.meta.url))),
};
const sessionPath = resolve(repo, 'tests/compatibility/session.mjs');
report.sessionHelperSha256 = sha(await readFile(sessionPath));
const {session} = await import(pathToFileURL(sessionPath).href);
function bounded(promise, ms, label) {
    let timer;
    return Promise.race([promise, new Promise((_, reject) => {
        timer = setTimeout(() => reject(Error(label)), ms);
    })]).finally(() => clearTimeout(timer));
}
// tar is only a read-only host archive reader. No host compiler/build is used.
function member(archive, path) {
    return execFileSync('tar', ['-xOf', archive, path], {
        timeout: 10000, maxBuffer: 64 * 1024 * 1024,
        stdio: ['ignore', 'pipe', 'pipe'],
    });
}
let s;
let commandLog = '';
try {
    const configBytes = await readFile(resolve(run, 'config.json'));
    const config = JSON.parse(configBytes);
    const manifestBytes = await readFile(resolve(run, 'candidate-manifests.json'));
    const candidates = JSON.parse(manifestBytes);
    const inputDist = config.inputDist || config.dist;
    assert(inputDist, 'Local frozen source/binary inputs required');
    report.configSha256 = sha(configBytes);
    report.candidateManifestsSha256 = sha(manifestBytes);
    report.expectedRuntime = config.expectedRuntime;
    report.inputCommit = config.inputCommit;
    if (config.dist) {
        const snapshot = await readFile(resolve(run, 'dist-files.json'));
        assert.equal(sha(snapshot), config.distributionSnapshotSha256);
        report.distributionSnapshotSha256 = sha(snapshot);
    }
    report.packages = {};
    const checksums = {};
    for (const name of ['imlib2', 'feh']) {
        const m = candidates[name];
        assert(m && m.name === name && m.binary, 'Binary candidate required: ' + name);
        assert.equal(m.runtime, config.expectedRuntime);
        const base = resolve(inputDist, 'migration', name);
        assert.deepEqual(JSON.parse(await readFile(resolve(base, 'package.json'))), m);
        const archivePath = resolve(base, 'binary.tar');
        const archive = await readFile(archivePath);
        assert.equal(archive.length, m.binary.size);
        assert.equal(sha(archive), m.binary.sha256);
        const sums = await readFile(resolve(run, name + '.sha256'), 'utf8');
        const tuples = new Map();
        for (const line of sums.trimEnd().split('\n')) {
            const match = /^([a-f0-9]{64})  (\/usr\/local\/[A-Za-z0-9_./+@-]+)$/.exec(line);
            assert(match, 'Invalid checksum line');
            const path = match[2].slice('/usr/local/'.length);
            assert(!path.split('/').some(p => !p || p === '.' || p === '..'));
            assert(!tuples.has(path), 'Duplicate checksum path');
            tuples.set(path, match[1]);
        }
        assert.equal(new Set(m.outputs.map(o => o.path)).size, m.outputs.length);
        assert.deepEqual([...tuples.keys()].sort(), m.outputs.map(o => o.path).sort());
        for (const [path, hash] of tuples)
            assert.equal(sha(member(archivePath, path)), hash, name + '/' + path);
        checksums[name] = sums;
        report.packages[name] = {
            manifest: m, binary: m.binary, outputs: tuples.size,
            checksumsSha256: sha(Buffer.from(sums)),
        };
    }
    const input = candidates.imlib2.files.find(f => f.path === 'source.tar');
    assert(input);
    assert.equal(input.sha256, sourceIdentity.archiveSha256);
    assert.equal(input.size, sourceIdentity.archiveSize);
    const archivePath = resolve(inputDist, 'migration/imlib2/source.tar');
    const archive = await readFile(archivePath);
    assert.equal(sha(archive), input.sha256);
    assert.equal(archive.length, input.size);
    const consumer = member(archivePath, sourceIdentity.member);
    assert.equal(sha(consumer), sourceIdentity.sha256);
    assert.equal(consumer.length, sourceIdentity.size);
    await writeFile(resolve(run, stem + '-consumer.c'), consumer, {flag: 'wx'});

    s = await session();
    report.runtime = s.runtime;
    assert.equal(s.runtime, config.expectedRuntime);
    await s.command('true');
    assert.equal(await s.page.evaluate(() =>
        [...shell.busybox.windows.values()].filter(w => w.shown).length), 0,
        'No active graphical session may be shared');
    for (const name of ['imlib2', 'feh']) {
        const installed = await s.page.evaluate(async name => {
            const bytes = await shell.busybox.read('/usr/local/lib/gucman/packages/' + name + '/current/manifest.json');
            if (!ArrayBuffer.isView(bytes)) throw Error('Missing installed manifest');
            return JSON.parse(new TextDecoder().decode(bytes));
        }, name);
        assert.deepEqual(installed, candidates[name], 'Installed manifest: ' + name);
    }
    const guest = '/tmp/' + stem;
    await s.command('set -eu\nmkdir ' + guest);
    async function upload(path, bytes) {
        await s.page.evaluate(async ({path, encoded}) => {
            await shell.busybox.write(path, Uint8Array.from(atob(encoded), c => c.charCodeAt(0)));
        }, {path, encoded: Buffer.from(bytes).toString('base64')});
    }
    await upload(guest + '/consumer.c', consumer);
    for (const name of ['imlib2', 'feh'])
        await upload(guest + '/' + name + '.sha256', checksums[name]);

    const script = `set -eu
test ! -e /tmp/.X1-lock
test ! -e /tmp/.X11-unix/X1
test ! -e /tmp/no-such-image.png
test -x /usr/local/libexec/jwm/wait-display
sha256sum -c ${guest}/imlib2.sha256
sha256sum -c ${guest}/feh.sha256
printf '${sourceIdentity.sha256}  ${guest}/consumer.c\n' | sha256sum -c -
cc -I/usr/local/include ${guest}/consumer.c -L/usr/local/lib -lImlib2 -lX11 -o ${guest}/consumer
sha256sum ${guest}/consumer
export DISPLAY=:1
export IMLIB2_LOADER_PATH=/usr/local/lib/imlib2/loaders
export LD_LIBRARY_PATH=/usr/local/lib
server=
cleanup() {
 if [ -n "$server" ]; then
  kill "$server" 2>/dev/null || true
  wait "$server" 2>/dev/null || true
  if kill -0 "$server" 2>/dev/null; then return 1; fi
  server=
 fi
}
trap 'rc=$?; trap - EXIT; cleanup || rc=1; exit "$rc"' EXIT
trap 'exit 143' TERM
trap 'exit 130' INT
Xvfb :1 -screen 0 800x600x24 -fp built-ins -noreset -ac &
server=$!
/usr/local/libexec/jwm/wait-display
kill -0 "$server"
echo IMLIB2-X11-READY
${guest}/consumer
kill -0 "$server"
cleanup
trap - EXIT TERM INT
echo IMLIB2-X11-CLEANUP-PASS
`;
    report.guestScriptSha256 = sha(Buffer.from(script));
    await writeFile(resolve(run, stem + '-guest.sh'), script, {flag: 'wx'});
    commandLog = await bounded(s.command(script), 120000,
        'Imlib2 compile/X11 consumer exceeded 120 seconds; close session');
    assert.match(commandLog, /(?:^|\n)IMLIB2-PASS\r?\n/);
    assert.match(commandLog, /(?:^|\n)IMLIB2-X11-CLEANUP-PASS\r?\n/);
    const executable = commandLog.match(new RegExp('(?:^|\\n)([a-f0-9]{64})  ' + guest + '/consumer(?:\\r?\\n)'));
    assert(executable, 'Compiled consumer hash missing');
    report.consumerExecutableSha256 = executable[1];
    await s.page.waitForFunction(() =>
        [...shell.busybox.windows.values()].filter(w => w.shown).length === 0,
        null, {timeout: 15000});
    commandLog += await s.command('echo IMLIB2-X11-TERMINAL-RESTORED');
    report.status = 'passed';
} catch (error) {
    report.status = 'failed';
    report.error = String(error.stack || error);
} finally {
    if (s) {
        try {
            const raw = await bounded(s.page.evaluate(() => shell.busybox?.log || ''),
                5000, 'Session log retention timeout');
            await writeFile(resolve(run, stem + '-session.log'), raw, {flag: 'wx'});
            report.sessionLogSha256 = sha(Buffer.from(raw));
        } catch (e) { report.logError = String(e); report.status = 'failed'; }
        // Always close, even when raw evidence retention fails. Timeout does not
        // cancel a command; browser closure terminates that guest on failure.
        try { await bounded(s.close(), 30000, 'Session close timeout'); }
        catch (e) { report.cleanupError = String(e); report.status = 'failed'; }
    }
    report.finishedAt = new Date().toISOString();
    try {
        await writeFile(resolve(run, stem + '.log'), commandLog, {flag: 'wx'});
        report.commandLogSha256 = sha(Buffer.from(commandLog));
    }
    catch (e) { report.commandLogError = String(e); report.status = 'failed'; }
    await writeFile(resolve(run, stem + '.json'), JSON.stringify(report, null, 2) + '\n', {flag: 'wx'});
    if (report.status !== 'passed') process.exitCode = 1;
}
