// Private proposal: independent B review required before reserved execution.
import assert from 'node:assert/strict';
import {readFile, writeFile, access} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';

const sha = b => createHash('sha256').update(b).digest('hex');
const mode = process.argv[2];
assert(['normal', 'reloaded'].includes(mode), 'Use normal or reloaded');
assert(process.env.MACHINE_JOB_ID, 'machine-job browser reservation required');
assert(process.env.COMPAT_RUN_DIR && process.env.MIGRATION_REPO_ROOT);
const attempt = process.env.MIGRATION_ATTEMPT;
assert(attempt && /^[A-Za-z0-9_-]{1,40}$/.test(attempt), 'Unique shared attempt required');
const run = resolve(process.env.COMPAT_RUN_DIR);
const repo = resolve(process.env.MIGRATION_REPO_ROOT);
const stem = 'cpython-retained-' + attempt;
const label = stem + '-' + mode;
const root = '/home/user/' + stem;
const inputs = '/tmp/' + stem + '-inputs';
const site = '/usr/local/lib/python3.14/site-packages';
const pth = site + '/' + stem + '.pth';
const normalPath = resolve(run, stem + '-normal.json');
const statePath = resolve(run, stem + '-state.json');
const python = '/usr/local/bin/python3.14';
const pinnedSource = '9ca67e57a8e850020cbbea4e3f6a1cbf03f19e75c3260f61e6b3d36395b67e17';
const pinnedConsumer = '5f45a610b5278038eab31660f50abeb961bfc6a5cd75ec44c6dfc6d4ccdb44af';
const pinnedExtensionSource = 'd584c544395df05500fd9c7e2c3bf5ef8f24a7a5fbb84026a4bf38d66355412b';
const report = {status: 'running', mode, attempt, startedAt: new Date().toISOString(),
    scope: 'Installed frozen CPython consumers; identical retained xxlimited extension and data across actual browser reload. No source-build, GUI, full conformance or publication acceptance.'};
let s, commandLog = '', timedOut = false, retained, consumer;
async function absent(path) { await assert.rejects(access(path), {code: 'ENOENT'}); }
for (const suffix of ['.json', '.log', '-session.log', '-guest.sh'])
    await absent(resolve(run, label + suffix));
if (mode === 'normal') await absent(statePath);
if (mode === 'normal') for (const suffix of ['-xxlimited.so', '-data.bin', '-compressed.bin'])
    await absent(resolve(run, label + suffix));
async function bounded(promise, ms, what) {
    let timer;
    try { return await Promise.race([promise, new Promise((_, reject) => {
        timer = setTimeout(() => { timedOut = true; reject(Error(what + ' timed out; guest must not be reused')); }, ms);
    })]); } finally { clearTimeout(timer); }
}
async function command(script, ms = 60000) {
    const result = await bounded(s.command(script), ms, 'Guest command');
    commandLog += result;
    return result;
}
async function upload(path, bytes) {
    await bounded(s.page.evaluate(async ({path, encoded}) => {
        await shell.busybox.write(path, Uint8Array.from(atob(encoded), c => c.charCodeAt(0)));
    }, {path, encoded: Buffer.from(bytes).toString('base64')}), 60000, 'Guest upload');
}
async function guestBytes(path) {
    const bytes = await bounded(s.page.evaluate(async path => {
        const b = await shell.busybox.read(path);
        if (!ArrayBuffer.isView(b)) throw Error('Missing guest file: ' + path);
        let encoded = '';
        for (let i = 0; i < b.length; i += 16383)
            encoded += btoa(String.fromCharCode(...b.subarray(i, i + 16383)));
        return encoded;
    }, path), 15000, 'Guest read');
    return Buffer.from(bytes, 'base64');
}
async function identity(path) {
    const bytes = await guestBytes(path);
    return {path, size: bytes.length, sha256: sha(bytes)};
}
// One read-only archive pass, rather than extracting the large interpreter once
// per stdlib output. Host Python reads archives only; it never builds CPython.
function verifyArchive(path, outputs, checksums) {
    const result = execFileSync('python3', ['-c', `
import json,sys,tarfile,hashlib
x=json.load(sys.stdin)
expected={o['path']:o['mode'] for o in x['outputs']}
assert len(expected)==len(x['outputs'])
with tarfile.open(x['archive']) as t:
 members=t.getmembers()
 assert len(members)==len(expected)
 assert len({m.name for m in members})==len(members)
 for m in members:
  assert m.isfile() and m.name in expected and m.mode==expected[m.name]
  assert hashlib.sha256(t.extractfile(m).read()).hexdigest()==x['checksums'][m.name]
print(json.dumps({'verifiedFiles':len(expected)}))
`], {input: JSON.stringify({archive: path, outputs, checksums}), timeout: 60000,
        maxBuffer: 1024 * 1024, stdio: ['pipe', 'pipe', 'pipe']});
    return JSON.parse(result);
}
const probe = `import importlib.util,json,os,pathlib,sys,sysconfig,zlib
root=pathlib.Path(sys.argv[1]); phase=sys.argv[2]
expected=b'CPython retained browser reload\\n'+bytes([0,1,127,128,255])
assert sys.implementation.name=='cpython' and sys.version_info[:3]==(3,14,7)
assert sys.prefix==sys.exec_prefix
assert os.path.isfile(sysconfig.get_makefile_filename())
assert '--enable-fork' not in sysconfig.get_config_var('LDSHARED')
assert zlib.decompress(zlib.compress(expected))==expected
if phase=='seed':
    with (root/'data.bin').open('xb') as f: f.write(expected)
    with (root/'compressed.bin').open('xb') as f: f.write(zlib.compress(expected))
    print('CPYTHON-RETAINED-SEEDED')
elif phase=='excluded':
    assert importlib.util.find_spec('cpython_reload_probe') is None
    assert importlib.util.find_spec('xxlimited') is None
    if sys.flags.no_site:
        assert not any('site-packages' in p for p in sys.path)
    print('CPYTHON-RETAINED-EXCLUDED')
else:
    assert phase in ('normal','reloaded')
    import cpython_reload_probe,xxlimited
    assert cpython_reload_probe.answer==42
    assert pathlib.Path(cpython_reload_probe.__file__).resolve()==root/'site/cpython_reload_probe.py'
    assert pathlib.Path(xxlimited.__file__).resolve()==root/'site/xxlimited.so'
    assert pathlib.Path(xxlimited.__spec__.origin).resolve()==root/'site/xxlimited.so'
    assert xxlimited.foo(20,22)==42
    x=xxlimited.new(); x.answer=42
    assert x.answer==42 and len(memoryview(x))==10
    assert (root/'data.bin').read_bytes()==expected
    assert zlib.decompress((root/'compressed.bin').read_bytes())==expected
    print('CPYTHON-RETAINED-RESULT '+json.dumps({'phase':phase,'extension':xxlimited.__file__,
        'probe':cpython_reload_probe.__file__,'executable':sys.executable,'prefix':sys.prefix,
        'makefile':sysconfig.get_makefile_filename(),'dataBytes':len(expected)},sort_keys=True))
`;
try {
    report.harnessSha256 = sha(await readFile(new URL(import.meta.url)));
    const configBytes = await readFile(resolve(run, 'config.json'));
    const config = JSON.parse(configBytes);
    const candidateBytes = await readFile(resolve(run, 'candidate-manifests.json'));
    const candidates = JSON.parse(candidateBytes), m = candidates.cpython;
    assert(m?.name === 'cpython' && m.binary, 'Source fixture is not a binary fixture');
    assert.equal(m.runtime, config.expectedRuntime);
    const inputDist = config.inputDist || config.dist;
    assert(inputDist && config.dist, 'Frozen local binary/core distribution required');
    const snapshot = await readFile(resolve(run, 'dist-files.json'));
    assert.equal(sha(snapshot), config.distributionSnapshotSha256);
    const base = resolve(inputDist, 'migration/cpython');
    assert.deepEqual(JSON.parse(await readFile(resolve(base, 'package.json'))), m);
    const archivePath = resolve(base, 'binary.tar'), archive = await readFile(archivePath);
    assert.equal(sha(archive), m.binary.sha256); assert.equal(archive.length, m.binary.size);
    const sums = await readFile(resolve(run, 'cpython.sha256'), 'utf8'), checksums = {};
    for (const line of sums.trimEnd().split('\n')) {
        const match = /^([a-f0-9]{64})  \/usr\/local\/([A-Za-z0-9_./+-]+)$/.exec(line);
        assert(match && match[2].split('/').every(p => p && p !== '.' && p !== '..'));
        assert(!Object.hasOwn(checksums, match[2])); checksums[match[2]] = match[1];
    }
    assert.deepEqual(Object.keys(checksums).sort(), m.outputs.map(o => o.path).sort());
    report.archiveVerification = verifyArchive(archivePath, m.outputs, checksums);
    assert.equal(m.files.find(f => f.path === 'source.tar')?.sha256, pinnedSource);
    assert.equal(m.files.find(f => f.path === 'test.sh')?.sha256, pinnedConsumer);
    const inputBytes = new Map();
    for (const file of m.files) {
        assert(/^[A-Za-z0-9_.-]+$/.test(file.path));
        assert(!inputBytes.has(file.path));
        const b = await readFile(resolve(base, file.path));
        assert.equal(b.length, file.size); assert.equal(sha(b), file.sha256);
        inputBytes.set(file.path, b);
    }
    const extensionSource = execFileSync('tar', ['-xOf', resolve(base, 'source.tar'), 'source/Modules/xxlimited.c'],
        {timeout: 15000, maxBuffer: 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe']});
    assert.equal(sha(extensionSource), pinnedExtensionSource); assert.equal(extensionSource.length, 13447);
    report.source = {archiveSha256: pinnedSource, consumerSha256: pinnedConsumer, extensionSourceSha256: pinnedExtensionSource};
    const helperPath = resolve(repo, 'tests/compatibility/session.mjs');
    report.bindings = {configSha256: sha(configBytes), candidateManifestsSha256: sha(candidateBytes),
        distributionSnapshotSha256: sha(snapshot), runtime: config.expectedRuntime,
        inputCommit: config.inputCommit, binary: m.binary, checksumsSha256: sha(sums),
        sessionHelperSha256: sha(await readFile(helperPath)), harnessSha256: report.harnessSha256};
    // Standard stage install/reload must precede the corresponding invocation.
    const stageAction = mode === 'normal' ? 'install' : 'reload';
    const stageLabel = stageAction + '-' + attempt;
    const stageBytes = await readFile(resolve(run, stageLabel + '-cpython.json'));
    const stage = JSON.parse(stageBytes);
    assert.equal(stage.action, stageAction); assert.equal(stage.status, 'passed');
    assert.deepEqual(stage.names, ['cpython']); assert.equal(stage.runtime, config.expectedRuntime);
    assert.equal(stage.inputCommit, config.inputCommit);
    const receiptBytes = await readFile(resolve(run, 'exports/cpython/' + stageLabel + '-receipt.json'));
    const receipt = JSON.parse(receiptBytes);
    assert.deepEqual(receipt.guestManifest, m); assert.equal(receipt.runtime, config.expectedRuntime);
    assert(/^[a-f0-9]{64}$/.test(receipt.sha256));
    const packedPath = resolve(run, 'exports/cpython/' + receipt.sha256 + '.tar');
    const packed = await readFile(packedPath);
    assert.equal(sha(packed), receipt.sha256); assert.equal(packed.length, receipt.size);
    verifyArchive(packedPath, m.outputs, checksums);
    report.stage = {reportSha256: sha(stageBytes), receiptSha256: sha(receiptBytes), action: stageAction};
    let state;
    if (mode === 'reloaded') {
        state = JSON.parse(await readFile(statePath));
        const normalBytes = await readFile(normalPath), normal = JSON.parse(normalBytes);
        assert.equal(sha(normalBytes), state.normalReportSha256);
        assert.equal(normal.status, 'passed'); assert.equal(normal.mode, 'normal');
        assert.equal(state.attempt, attempt); assert.equal(state.guestRoot, root);
        assert.deepEqual(state.bindings, report.bindings);
        assert.deepEqual(state.retained, normal.retained);
        assert.deepEqual(state.consumer, normal.consumer);
        assert(Number.isFinite(Date.parse(stage.startedAt)) && Date.parse(stage.startedAt) > Date.parse(normal.finishedAt),
            'Stage reload must follow completed normal phase');
        retained = state.retained; consumer = state.consumer;
        for (const [suffix, relative] of [['-xxlimited.so', 'site/xxlimited.so'], ['-data.bin', 'data.bin'], ['-compressed.bin', 'compressed.bin']]) {
            const saved = await readFile(resolve(run, stem + '-normal' + suffix));
            const expected = retained.find(f => f.path === root + '/' + relative);
            assert(expected); assert.equal(sha(saved), expected.sha256); assert.equal(saved.length, expected.size);
        }
        report.normalReportSha256 = sha(normalBytes);
    }
    const {session} = await import(pathToFileURL(helperPath).href);
    // session() owns browser/server startup and its failure cleanup. The outer
    // machine-job deadline also bounds helper startup and descendant teardown.
    s = await session(); report.runtime = s.runtime;
    if (mode === 'reloaded') {
        await bounded(s.page.reload(), 120000, 'Browser reload');
        await s.page.waitForFunction(() => window.shell?.ready, null, {timeout: 120000});
        assert.equal(await s.page.evaluate(() => shell.toolchain.systemBuild), config.expectedRuntime);
        report.browserReloadObserved = true;
    }
    await command('true');
    assert.equal(await s.page.evaluate(() => [...shell.busybox.windows.values()].filter(w => w.shown).length), 0);
    assert.deepEqual(JSON.parse((await guestBytes('/usr/local/lib/gucman/packages/cpython/current/manifest.json')).toString()), m);
    const dep = JSON.parse((await guestBytes('/usr/local/lib/gucman/packages/zlib/current/manifest.json')).toString());
    assert.equal(dep.name, 'zlib'); assert.equal(dep.version, m.dependencyRequirements.zlib.version);
    await upload('/tmp/' + label + '.sha256', sums);
    await command('sha256sum -c /tmp/' + label + '.sha256');
    await command(`set -eu\ntest ! -e '${pth}'\ntest ! -L '${pth}'`);
    if (mode === 'normal') {
        await command(`set -eu\ntest ! -e '${root}'\ntest ! -L '${root}'\nmkdir '${root}'\nmkdir '${root}/site'\nmkdir '${inputs}'`);
        for (const [path, bytes] of inputBytes) await upload(inputs + '/' + path, bytes);
        const inputSums = m.files.map(f => f.sha256 + '  ' + inputs + '/' + f.path + '\n').join('');
        await upload('/tmp/' + label + '-inputs.sha256', inputSums);
        const installedLog = await command(`set -eu\nsha256sum -c '/tmp/${label}-inputs.sha256'\ncd '${inputs}'\ntar -xf source.tar\nprintf '${pinnedExtensionSource}  source/Modules/xxlimited.c\\n' | sha256sum -c -\nDESTDIR=/usr/local sh test.sh`, 900000);
        const paths = [...installedLog.matchAll(/(?:^|\n)CPYTHON-CONSUMER-PASS evidence=(\/tmp\/cpython-consumer\.[A-Za-z0-9]+)\r?(?:\n|$)/g)];
        assert.equal(paths.length, 1, 'One installed consumer evidence path required');
        const work = paths[0][1], oldPth = site + '/' + work.split('/').at(-1) + '.pth';
        await command(`set -eu\ntest ! -e '${oldPth}'\ntest ! -L '${oldPth}'\ntest -f '${work}/xxlimited.so'\ntest ! -L '${work}/xxlimited.so'\ntest ! -L '${work}/site/xxlimited.so'\ncp '${work}/xxlimited.so' '${root}/site/xxlimited.so'`);
        const original = await identity(work + '/xxlimited.so'), siteCopy = await identity(work + '/site/xxlimited.so');
        assert.equal(original.sha256, siteCopy.sha256); assert.equal(original.size, siteCopy.size);
        consumer = {work, original, siteCopy, cleanedPth: oldPth, logSha256: sha(installedLog)};
        await upload(root + '/site/cpython_reload_probe.py', 'answer = 42\n');
        await upload(root + '/probe.py', probe);
        await command(`${python} -I -B '${root}/probe.py' '${root}' seed`);
        retained = [];
        for (const path of ['site/xxlimited.so', 'site/cpython_reload_probe.py', 'probe.py', 'data.bin', 'compressed.bin'])
            retained.push(await identity(root + '/' + path));
        assert.equal(retained[0].sha256, original.sha256); assert.equal(retained[0].size, original.size);
        for (const [suffix, relative] of [['-xxlimited.so', 'site/xxlimited.so'], ['-data.bin', 'data.bin'], ['-compressed.bin', 'compressed.bin']])
            await writeFile(resolve(run, label + suffix), await guestBytes(root + '/' + relative), {flag: 'wx'});
    }
    assert.equal(retained.length, 5);
    assert.deepEqual(retained.map(x => x.path), ['site/xxlimited.so', 'site/cpython_reload_probe.py', 'probe.py', 'data.bin', 'compressed.bin'].map(p => root + '/' + p));
    for (const f of retained) assert.deepEqual(await identity(f.path), f);
    assert.equal(retained.find(f => f.path === root + '/probe.py').sha256, sha(probe));
    await command(`set -eu\ntest ! -e '${consumer.cleanedPth}'\ntest ! -L '${consumer.cleanedPth}'`);
    report.pthBytesSha256 = sha(root + '/site\n');
    const script = `set -eu
cd /
test ! -e '${pth}'
test ! -L '${pth}'
${python} -I -B '${root}/probe.py' '${root}' excluded
# Only the attempt-owned .pth is temporary. Retained binary/data never change.
owned_pth=
cleanup() { if test "$owned_pth" = yes; then rm -f '${pth}'; fi; }
trap cleanup EXIT
trap 'exit 1' HUP INT TERM
set -C
printf '%s\\n' '${root}/site' > '${pth}'
owned_pth=yes
set +C
printf '${report.pthBytesSha256}  ${pth}\\n' | sha256sum -c -
${python} -I -B '${root}/probe.py' '${root}' '${mode}'
${python} -I -B -S '${root}/probe.py' '${root}' excluded
rm '${pth}'
owned_pth=
trap - EXIT HUP INT TERM
test ! -e '${pth}'
test ! -L '${pth}'
${python} -I -B '${root}/probe.py' '${root}' excluded
echo CPYTHON-RETAINED-PTH-CLEANUP-PASS
`;
    await writeFile(resolve(run, label + '-guest.sh'), script, {flag: 'wx'});
    report.guestScriptSha256 = sha(script);
    const phaseLog = await command(script);
    assert.match(phaseLog, /(?:^|\n)CPYTHON-RETAINED-PTH-CLEANUP-PASS\r?\n/);
    const results = [...phaseLog.matchAll(/(?:^|\n)CPYTHON-RETAINED-RESULT (\{[^\n]+\})\r?(?:\n|$)/g)];
    assert.equal(results.length, 1);
    report.result = JSON.parse(results[0][1]); assert.equal(report.result.phase, mode);
    assert.equal(report.result.extension, root + '/site/xxlimited.so');
    for (const f of retained) assert.deepEqual(await identity(f.path), f, 'Retained bytes changed');
    await command('sha256sum -c /tmp/' + label + '.sha256');
    report.retained = retained; report.consumer = consumer;
    report.pthCleanupVerified = true; report.status = 'passed';
} catch (e) {
    report.status = 'failed'; report.error = String(e.stack || e);
} finally {
    report.commandTimedOut = timedOut;
    if (s) {
        // A timeout does not cancel a running guest command. Never send another
        // command into that shell; close its browser and report cleanup unknown.
        if (report.status !== 'passed') report.pthCleanupVerified = false;
        try {
            const raw = await bounded(s.page.evaluate(() => shell.busybox?.log || ''), 5000, 'Log read');
            await writeFile(resolve(run, label + '-session.log'), raw, {flag: 'wx'});
            report.sessionLogSha256 = sha(raw);
        } catch (e) { report.logError = String(e); report.status = 'failed'; }
        try { await bounded(s.close(), 30000, 'Session close'); }
        catch (e) { report.cleanupError = String(e); report.status = 'failed'; }
    }
    report.finishedAt = new Date().toISOString();
    try {
        await writeFile(resolve(run, label + '.log'), commandLog, {flag: 'wx'});
        report.commandLogSha256 = sha(commandLog);
    } catch (e) { report.commandLogError = String(e); report.status = 'failed'; }
    let bytes = JSON.stringify(report, null, 2) + '\n';
    if (mode === 'normal' && report.status === 'passed') {
        try {
            await writeFile(statePath, JSON.stringify({format: 1, attempt, guestRoot: root,
                bindings: report.bindings, retained, consumer, normalReportSha256: sha(bytes)}, null, 2) + '\n', {flag: 'wx'});
        } catch (e) {
            report.stateError = String(e); report.status = 'failed';
            bytes = JSON.stringify(report, null, 2) + '\n';
        }
    }
    // A state file alone is never enough: reloaded requires this exact successful
    // normal report too, so interrupted evidence writes fail closed.
    await writeFile(resolve(run, label + '.json'), bytes, {flag: 'wx'});
    if (report.status !== 'passed') process.exitCode = 1;
}
