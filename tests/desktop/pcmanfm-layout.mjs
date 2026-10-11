// First-pass layout discovery; independent review before reserved execution.
// No file operations. Rename is deliberately omitted without verified pane geometry.
import assert from 'node:assert/strict';
import {readFile, writeFile, access} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
const sha = b => createHash('sha256').update(b).digest('hex');
assert(process.env.MACHINE_JOB_ID, 'Reserved machine-job required');
assert(process.env.COMPAT_RUN_DIR, 'Frozen binary fixture required');
const repo = resolve(process.env.MIGRATION_REPO_ROOT || process.cwd());
const run = resolve(process.env.COMPAT_RUN_DIR);
const attempt = process.env.MIGRATION_ATTEMPT || '';
assert(!attempt || /^[A-Za-z0-9_-]{1,64}$/.test(attempt));
const stem = 'pcmanfm-layout' + (attempt ? '-' + attempt : '');
const root = '/home/user/pcmanfm-layout';
const fixture = root + '/fixture';
const expectedBytes = Buffer.from('PCMANFM layout fixture\n');
for (const suffix of ['.json', '.log', '-main.png', '-fixture.png', '-new-folder.png', '-cancelled.png', '-failure.png'])
    await assert.rejects(access(resolve(run, stem + suffix)), {code: 'ENOENT'});
const report = {
    status: 'running', attempt, startedAt: new Date().toISOString(),
    scope: 'Layout discovery only: owned menu, navigation, cancelled new-folder dialog, unchanged fixture and normal close. No file operations or functional/reload acceptance.',
    rename: {status: 'omitted', reason: 'Top-level X geometry does not identify the GTK file pane. No guessed click or Ctrl+A selection.'},
    fixture: {root, directory: fixture, path: fixture + '/probe.txt', bytes: expectedBytes.length, sha256: sha(expectedBytes)},
    harnessSha256: sha(await readFile(new URL(import.meta.url))),
    helperHashes: {}, layouts: {},
};
function bounded(p, ms, label) {
    let timer;
    return Promise.race([p, new Promise((_, reject) => {
        timer = setTimeout(() => reject(Error(label)), ms);
    })]).finally(() => clearTimeout(timer));
}
async function helper(path) {
    const file = resolve(repo, path);
    report.helperHashes[path] = sha(await readFile(file));
    return import(pathToFileURL(file).href);
}
let s, d, canvas;
async function verifyFixture(command, label) {
    // Exact three-entry tree; never creates, rewrites or repairs the fixture.
    await command(`set -eu
[ -d '${root}' ] && [ ! -L '${root}' ]
[ -d '${fixture}' ] && [ ! -L '${fixture}' ]
[ -f '${fixture}/probe.txt' ] && [ ! -L '${fixture}/probe.txt' ]
[ "$(find '${root}' | wc -l)" -eq 3 ]
[ "$(find '${root}' -type d | wc -l)" -eq 2 ]
[ "$(find '${root}' -type f | wc -l)" -eq 1 ]
echo PCMANFM-LAYOUT-FIXTURE-TREE-PASS`);
    const bytes = await s.page.evaluate(async path => {
        const b = await shell.busybox.read(path);
        if (!ArrayBuffer.isView(b)) throw Error('Fixture missing or unreadable');
        return Array.from(b);
    }, fixture + '/probe.txt');
    assert.deepEqual(Buffer.from(bytes), expectedBytes, 'Fixture bytes changed: ' + label);
    report.fixture[label] = {bytes: bytes.length, sha256: sha(Buffer.from(bytes))};
}
try {
    const configBytes = await readFile(resolve(run, 'config.json'));
    const config = JSON.parse(configBytes);
    const manifestsBytes = await readFile(resolve(run, 'candidate-manifests.json'));
    const candidates = JSON.parse(manifestsBytes);
    const inputDist = config.inputDist || config.dist;
    assert(inputDist, 'Frozen local binary inputs required');
    report.configSha256 = sha(configBytes);
    report.candidateManifestsSha256 = sha(manifestsBytes);
    report.inputCommit = config.inputCommit;
    report.expectedRuntime = config.expectedRuntime;
    if (config.dist) {
        const snapshot = await readFile(resolve(run, 'dist-files.json'));
        assert.equal(sha(snapshot), config.distributionSnapshotSha256);
        report.distributionSnapshotSha256 = sha(snapshot);
    }
    report.packages = {};
    const sums = {};
    for (const name of ['libfm', 'pcmanfm']) {
        const m = candidates[name];
        assert(m && m.name === name && m.binary, 'Frozen binary candidate required: ' + name);
        assert.equal(m.runtime, config.expectedRuntime);
        const base = resolve(inputDist, 'migration', name);
        assert.deepEqual(JSON.parse(await readFile(resolve(base, 'package.json'))), m);
        const archivePath = resolve(base, 'binary.tar');
        const archive = await readFile(archivePath);
        assert.equal(archive.length, m.binary.size);
        assert.equal(sha(archive), m.binary.sha256);
        sums[name] = await readFile(resolve(run, name + '.sha256'), 'utf8');
        const entries = new Map();
        for (const line of sums[name].trimEnd().split('\n')) {
            const match = /^([a-f0-9]{64})  (\/usr\/local\/[A-Za-z0-9_./+@-]+)$/.exec(line);
            assert(match, 'Invalid checksum record');
            const path = match[2].slice('/usr/local/'.length);
            assert(path.split('/').every(p => p && p !== '.' && p !== '..'));
            assert(!entries.has(path)); entries.set(path, match[1]);
        }
        assert.equal(new Set(m.outputs.map(o => o.path)).size, m.outputs.length);
        assert.deepEqual([...entries.keys()].sort(), m.outputs.map(o => o.path).sort());
        for (const [path, hash] of entries) {
            const bytes = execFileSync('tar', ['-xOf', archivePath, path], {timeout: 10000, maxBuffer: 64 * 1024 * 1024});
            assert.equal(sha(bytes), hash, name + '/' + path);
        }
        report.packages[name] = {manifest: m, checksumFileSha256: sha(sums[name]), checkedFiles: entries.size};
    }
    const {session} = await helper('tests/compatibility/session.mjs');
    const {desktopSession} = await helper('tests/desktop/session.mjs');
    const {installObserver, observe, clickMenuEntry} = await helper('tests/desktop/menu-xapps.mjs');
    const {visibleCanvas, canvasPosition} = await helper('tests/migration/canvas.mjs');
    const {typeText} = await helper('tests/desktop/keyboard.mjs');
    for (const path of ['tests/desktop/windows-xapps.c', 'tests/desktop/menu.mjs', 'tests/desktop/poll.mjs'])
        report.helperHashes[path] = sha(await readFile(resolve(repo, path)));
    s = await session(); report.runtime = s.runtime; await s.command('true');
    for (const name of ['libfm', 'pcmanfm']) {
        const installed = await s.page.evaluate(async name => {
            const bytes = await shell.busybox.read('/usr/local/lib/gucman/packages/' + name + '/current/manifest.json');
            if (!ArrayBuffer.isView(bytes)) throw Error('Installed manifest missing');
            return JSON.parse(new TextDecoder().decode(bytes));
        }, name);
        assert.deepEqual(installed, candidates[name]);
        const path = '/tmp/pcmanfm-layout-' + name + '.sha256';
        await s.page.evaluate(async ({path, text}) => shell.busybox.write(path, new TextEncoder().encode(text)), {path, text: sums[name]});
        report.packages[name].installedChecks = await s.command('sha256sum -c ' + path);
    }
    await verifyFixture(s.command, 'before');
    // Fresh-session prerequisite: avoid accidentally attaching to an old IPC owner.
    await s.command('set -eu; for p in /proc/[0-9]*/comm; do [ -r "$p" ] || continue; name=; read -r name < "$p" || true; [ "$name" != pcmanfm ] || exit 1; done');
    report.observer = await installObserver(s);
    d = await desktopSession(s, {workingDirectory: root}); report.desktopHelpers = d.helper;
    canvas = await visibleCanvas(s.page);
    async function settled(title, label) {
        return bounded((async () => {
            let prior, stable = 0;
            const pixelSamples = [];
            for (let i = 0; i < 24; i++) {
                const geometry = await observe(d, 'window', title);
                assert(geometry.pid > 0 && geometry.width > 0 && geometry.height > 0);
                assert(geometry.width <= 800 && geometry.height <= 600);
                assert(geometry.x >= 0 && geometry.y >= 0 && geometry.x + geometry.width <= 800 && geometry.y + geometry.height <= 600);
                if (report.main) assert.equal(geometry.pid, report.main.pid);
                const pixels = await observe(d, 'pixels', title);
                pixelSamples.push(pixels);
                const key = JSON.stringify(geometry);
                stable = key === prior ? stable + 1 : 0; prior = key;
                if (stable >= 3) {
                    report.layouts[label] = {geometry, pixels, pixelSamples, matchingGeometrySamples: 4, note: "Geometry settled; pixels retained for review, not an equality oracle (GTK entry caret may blink)."};
                    await writeFile(resolve(run, stem + '-' + label + '.png'), await canvas.screenshot(), {flag: 'wx'});
                    return geometry;
                }
                await s.page.waitForTimeout(500);
            }
            throw Error('Layout did not settle: ' + title);
        })(), 45000, 'Settled layout deadline: ' + title);
    }
    report.menu = await clickMenuEntry(d, 'pcmanfm.desktop');
    report.main = await observe(d, 'window', 'pcmanfm-layout');
    assert(Number.isSafeInteger(report.main.pid) && report.main.pid > 0);
    const main = report.main;
    assert(main.y >= 16 && main.x >= 0 && main.x + main.width <= 800);
    await canvas.click({position: await canvasPosition(canvas, {x: main.x + main.width / 2, y: main.y - 12})});
    await canvas.hover({position: await canvasPosition(canvas, {x: 790, y: 590})});
    await settled('pcmanfm-layout', 'main');
    await s.page.keyboard.press('Control+l');
    await s.page.waitForTimeout(200);
    await s.page.keyboard.press('Control+a');
    await typeText(s.page, fixture);
    await s.page.keyboard.press('Enter');
    await settled('fixture', 'fixture');
    // NewFolder is a main-window action and does not need a guessed pane click.
    await s.page.keyboard.press('Control+Shift+n');
    await settled('Creating New Folder', 'new-folder');
    await s.page.keyboard.press('Escape');
    await observe(d, 'absent', 'Creating New Folder');
    await settled('fixture', 'cancelled');
    await verifyFixture(d.command, 'afterCancel');
    await s.page.keyboard.press('Control+q');
    await observe(d, 'absent', 'fixture');
    report.pidExit = await d.command(`set -eu
n=0
while kill -0 ${main.pid} 2>/dev/null; do n=$((n+1)); [ "$n" -lt 100 ]; sleep 0.1; done
for p in /proc/[0-9]*/comm; do [ -r "$p" ] || continue; name=; read -r name < "$p" || true; [ "$name" != pcmanfm ] || exit 1; done
echo PCMANFM-LAYOUT-PID-ABSENT`);
    await verifyFixture(d.command, 'afterClose');
    await d.finish();
    report.terminal = await s.command('echo PCMANFM-LAYOUT-TERMINAL-RESTORED');
    assert.match(report.terminal, /PCMANFM-LAYOUT-TERMINAL-RESTORED/);
    report.status = 'completed-layout-discovery';
} catch (e) {
    report.status = 'failed'; report.error = String(e.stack || e);
    process.exitCode = 1;
} finally {
    if (s) {
        if (report.status === 'failed' && canvas) {
            try { await bounded(writeFile(resolve(run, stem + '-failure.png'), await bounded(canvas.screenshot(), 5000, 'Failure screenshot timeout'), {flag: 'wx'}), 5000, 'Screenshot write timeout'); }
            catch (e) { report.screenshotError = String(e); }
        }
        try { await bounded((async () => { await writeFile(resolve(run, stem + '.log'), await s.page.evaluate(() => shell.busybox?.log || ''), {flag: 'wx'}); })(), 5000, 'Log timeout'); }
        catch (e) { report.logError = String(e); report.status = 'failed'; }
        try { await bounded(s.close(), 30000, 'Session close timeout'); }
        catch (e) { report.cleanupError = String(e); report.status = 'failed'; }
    }
    report.finishedAt = new Date().toISOString();
    await writeFile(resolve(run, stem + '.json'), JSON.stringify(report, null, 2) + '\n', {flag: 'wx'});
    if (report.status === 'failed') process.exitCode = 1;
}
