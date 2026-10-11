// Private B adaptation of original B ade6e96; independent A review required.
// No file operations. Rename is deliberately omitted without verified pane geometry.
import assert from 'node:assert/strict';
import {readFile, writeFile, access, mkdir, realpath} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
const sha = b => createHash('sha256').update(b).digest('hex');
assert(process.env.MACHINE_JOB_ID, 'Reserved machine-job required');
assert(process.env.COMPAT_RUN_DIR, 'Frozen binary fixture required');
const repo = resolve(process.env.MIGRATION_REPO_ROOT || process.cwd());
const run = resolve(process.env.COMPAT_RUN_DIR);
const attempt = process.env.MIGRATION_ATTEMPT;
assert(attempt && /^[A-Za-z0-9_-]{1,40}$/.test(attempt));
assert(process.env.MIGRATION_REPO_ROOT && process.env.PCMANFM_OLD_RUN_DIR);
const old=await realpath(process.env.PCMANFM_OLD_RUN_DIR),actualRun=await realpath(run);
assert(actualRun!==old && !actualRun.startsWith(old+'/'));
assert.notEqual(await realpath(resolve(run,'profile')),await realpath(resolve(old,'profile')));
const stem = 'pcmanfm-layout-v2-' + attempt;
const output=resolve(run,stem);await mkdir(output);
const guest='/home/user/'+stem,caseDir=guest+'/layout';
const reviewed={libfm:process.env.LIBFM_REVIEWED_BINARY_SHA256,pcmanfm:process.env.PCMANFM_REVIEWED_BINARY_SHA256};
for(const hash of Object.values(reviewed))assert(/^[a-f0-9]{64}$/.test(hash||''),'Independent binary review hash required');
const root = '/home/user/pcmanfm-layout';
const fixture = root + '/fixture';
const expectedBytes = Buffer.from('PCMANFM layout fixture\n');
for (const suffix of ['.json', '.log', '-main.png', '-fixture.png', '-new-folder.png', '-cancelled.png', '-failure.png'])
    await assert.rejects(access(resolve(output, stem + suffix)), {code: 'ENOENT'});
const report = {
    status: 'running', attempt, startedAt: new Date().toISOString(),
    scope: 'Instrumented private JWM command -> unchanged owned desktop-menu entry. Layout/navigation/cancel-only new-folder, exact unchanged fixture and supervised normal exit; no fileops, library, GUI functional, reload or public acceptance.',
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
const errors=[];
const fatal=/fatal:\s*wasm trap|\bpid \d+(?: thread \d+)? (?:crashed:|could not start:)|RuntimeError:|uncaught|unhandled.*rejection/i;
async function readGuest(path){return Buffer.from(await bounded(s.page.evaluate(async path=>{const b=await shell.busybox.read(path);if(!ArrayBuffer.isView(b))throw Error('Missing guest bytes '+path);return Array.from(b);},path),15000,'Guest read timeout'));}
async function put(path,bytes){await bounded(s.page.evaluate(async({path,bytes})=>shell.busybox.write(path,Uint8Array.from(bytes)),{path,bytes:Array.from(Buffer.from(bytes))}),15000,'Guest upload timeout');}
let previousLog='';
async function noCrash(){const raw=await bounded(s.page.evaluate(()=>shell.busybox.log),5000,'Runtime log timeout');assert.equal(typeof raw,'string');assert(raw.length<=16*1024*1024,'Runtime log cap');assert(raw.startsWith(previousLog),'Runtime log replaced/truncated');previousLog=raw;assert(!fatal.test(raw),'Runtime fatal evidence');assert.deepEqual(errors,[]);return raw;}
const save=(name,bytes)=>writeFile(resolve(output,name),bytes,{flag:'wx'});
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
// Exact e970787 inputs and declared output paths/modes; source archives unchanged.
const pins={"libfm":{"source.tar":"edcc6aad7bda75df1a73a7777974b638ac6362767d9b7880e10f4aeb6903dbe9","build.sh":"2bb78d227e7d0a9a6763063ac96cdeb56f0fdcbef6f9711825c3b6c70d81f077","test.sh":"2f8e4c05375e63ce6b9ddd25ff266bab1e9198abb33adde826120024d5e8c89e","consumer.c":"8d3019c9435f23d0db4331627f22f10256777bef5b429045b19421c1999e414c","outputs":[{"path":"bin/libfm-pref-apps","mode":493},{"path":"bin/lxshortcut","mode":493},{"path":"share/libfm/xdg/libfm/libfm.conf","mode":420},{"path":"include/libfm/fm-action.h","mode":420},{"path":"include/libfm/fm-app-chooser-combo-box.h","mode":420},{"path":"include/libfm/fm-app-chooser-dlg.h","mode":420},{"path":"include/libfm/fm-app-info.h","mode":420},{"path":"include/libfm/fm-app-menu-view.h","mode":420},{"path":"include/libfm/fm-archiver.h","mode":420},{"path":"include/libfm/fm-bookmarks.h","mode":420},{"path":"include/libfm/fm-cell-renderer-pixbuf.h","mode":420},{"path":"include/libfm/fm-cell-renderer-text.h","mode":420},{"path":"include/libfm/fm-clipboard.h","mode":420},{"path":"include/libfm/fm-config.h","mode":420},{"path":"include/libfm/fm-deep-count-job.h","mode":420},{"path":"include/libfm/fm-dir-list-job.h","mode":420},{"path":"include/libfm/fm-dir-tree-model.h","mode":420},{"path":"include/libfm/fm-dir-tree-view.h","mode":420},{"path":"include/libfm/fm-dnd-auto-scroll.h","mode":420},{"path":"include/libfm/fm-dnd-dest.h","mode":420},{"path":"include/libfm/fm-dnd-src.h","mode":420},{"path":"include/libfm/fm-dummy-monitor.h","mode":420},{"path":"include/libfm/fm-extra.h","mode":420},{"path":"include/libfm/fm-file-info-job.h","mode":420},{"path":"include/libfm/fm-file-info.h","mode":420},{"path":"include/libfm/fm-file-launcher.h","mode":420},{"path":"include/libfm/fm-file-menu.h","mode":420},{"path":"include/libfm/fm-file-ops-job-change-attr.h","mode":420},{"path":"include/libfm/fm-file-ops-job-delete.h","mode":420},{"path":"include/libfm/fm-file-ops-job-xfer.h","mode":420},{"path":"include/libfm/fm-file-ops-job.h","mode":420},{"path":"include/libfm/fm-file-properties.h","mode":420},{"path":"include/libfm/fm-file.h","mode":420},{"path":"include/libfm/fm-folder-config.h","mode":420},{"path":"include/libfm/fm-folder-model.h","mode":420},{"path":"include/libfm/fm-folder-view.h","mode":420},{"path":"include/libfm/fm-folder.h","mode":420},{"path":"include/libfm/fm-gtk-file-launcher.h","mode":420},{"path":"include/libfm/fm-gtk-marshal.h","mode":420},{"path":"include/libfm/fm-gtk-utils.h","mode":420},{"path":"include/libfm/fm-gtk.h","mode":420},{"path":"include/libfm/fm-icon-pixbuf.h","mode":420},{"path":"include/libfm/fm-icon.h","mode":420},{"path":"include/libfm/fm-job.h","mode":420},{"path":"include/libfm/fm-list.h","mode":420},{"path":"include/libfm/fm-marshal.h","mode":420},{"path":"include/libfm/fm-menu-tool-item.h","mode":420},{"path":"include/libfm/fm-mime-type.h","mode":420},{"path":"include/libfm/fm-module.h","mode":420},{"path":"include/libfm/fm-monitor.h","mode":420},{"path":"include/libfm/fm-nav-history.h","mode":420},{"path":"include/libfm/fm-path-bar.h","mode":420},{"path":"include/libfm/fm-path-entry.h","mode":420},{"path":"include/libfm/fm-path.h","mode":420},{"path":"include/libfm/fm-places-model.h","mode":420},{"path":"include/libfm/fm-places-view.h","mode":420},{"path":"include/libfm/fm-progress-dlg.h","mode":420},{"path":"include/libfm/fm-seal.h","mode":420},{"path":"include/libfm/fm-side-pane.h","mode":420},{"path":"include/libfm/fm-simple-job.h","mode":420},{"path":"include/libfm/fm-sortable.h","mode":420},{"path":"include/libfm/fm-standard-view.h","mode":420},{"path":"include/libfm/fm-tab-label.h","mode":420},{"path":"include/libfm/fm-templates.h","mode":420},{"path":"include/libfm/fm-terminal.h","mode":420},{"path":"include/libfm/fm-thumbnail-loader.h","mode":420},{"path":"include/libfm/fm-thumbnail.h","mode":420},{"path":"include/libfm/fm-thumbnailer.h","mode":420},{"path":"include/libfm/fm-utils.h","mode":420},{"path":"include/libfm/fm-version.h","mode":420},{"path":"include/libfm/fm-xml-file.h","mode":420},{"path":"include/libfm/fm.h","mode":420},{"path":"include/libfm/glib-compat.h","mode":420},{"path":"include/libfm/gtk-compat.h","mode":420},{"path":"include/menu-cache/menu-cache.h","mode":420},{"path":"lib/libfm-extra.so","mode":493},{"path":"lib/libfm-gtk3.so","mode":493},{"path":"lib/libfm.so","mode":493},{"path":"lib/libfm/modules/gtk-fileprop-x-desktop.so","mode":493},{"path":"lib/libfm/modules/gtk-fileprop-x-shortcut.so","mode":493},{"path":"lib/libfm/modules/gtk-menu-actions.so","mode":493},{"path":"lib/libfm/modules/gtk-menu-trash.so","mode":493},{"path":"lib/libfm/modules/vfs-menu.so","mode":493},{"path":"lib/libfm/modules/vfs-search.so","mode":493},{"path":"lib/libmenu-cache.so","mode":493},{"path":"lib/pkgconfig/libfm-extra.pc","mode":420},{"path":"lib/pkgconfig/libfm-gtk3.pc","mode":420},{"path":"lib/pkgconfig/libfm.pc","mode":420},{"path":"lib/pkgconfig/libmenu-cache.pc","mode":420},{"path":"libexec/libfm/libfm-pref-apps","mode":493},{"path":"libexec/libfm/lxshortcut","mode":493},{"path":"libexec/menu-cache/menu-cache-gen","mode":493},{"path":"libexec/menu-cache/menu-cached","mode":493},{"path":"share/doc/libfm/COPYING","mode":420},{"path":"share/doc/libfm/menu-cache-COPYING","mode":420},{"path":"share/libfm/archivers.list","mode":420},{"path":"share/libfm/images/folder.png","mode":420},{"path":"share/libfm/images/unknown.png","mode":420},{"path":"share/libfm/libfm.conf","mode":420},{"path":"share/libfm/terminals.list","mode":420},{"path":"share/libfm/ui/app-chooser.ui","mode":420},{"path":"share/libfm/ui/ask-rename.ui","mode":420},{"path":"share/libfm/ui/choose-icon.ui","mode":420},{"path":"share/libfm/ui/exec-file.ui","mode":420},{"path":"share/libfm/ui/file-prop.ui","mode":420},{"path":"share/libfm/ui/filesearch.ui","mode":420},{"path":"share/libfm/ui/preferred-apps.ui","mode":420},{"path":"share/libfm/ui/progress.ui","mode":420},{"path":"share/licenses/libfm/COPYING","mode":420},{"path":"share/licenses/libfm/menu-cache-COPYING","mode":420},{"path":"share/mime/packages/libfm.xml","mode":420}]},"pcmanfm":{"source.tar":"b50e4e1dbb185347e6e63a80f5bdbcac98b7ae34e3f9a2d7761eec379047cf37","build.sh":"7b545367eb6bf8408a19a4a00d72225e74550494e4ccdb21f5d42210589c8c6e","test.sh":"0e7f62632b86bd3d2d731b05c5ed251d65c91cb731f5579933bc91b9b779e9d0","consumer.c":"52b42d42b7f983d5f3df8113cb8a4d028af9e2349c7612327203b1dcdbd9b4f2","outputs":[{"path":"bin/pcmanfm","mode":493},{"path":"share/pcmanfm/xdg/menus/lxde-applications.menu","mode":420},{"path":"share/pcmanfm/xdg/pcmanfm/default/pcmanfm.conf","mode":420},{"path":"include/pcmanfm-modules.h","mode":420},{"path":"lib/pcmanfm/README","mode":420},{"path":"libexec/pcmanfm","mode":493},{"path":"share/applications/pcmanfm-desktop-pref.desktop","mode":420},{"path":"share/applications/pcmanfm.desktop","mode":420},{"path":"share/doc/pcmanfm/COPYING","mode":420},{"path":"share/licenses/pcmanfm/COPYING","mode":420},{"path":"share/pcmanfm/ui/about.ui","mode":420},{"path":"share/pcmanfm/ui/autorun.ui","mode":420},{"path":"share/pcmanfm/ui/connect.ui","mode":420},{"path":"share/pcmanfm/ui/desktop-pref.ui","mode":420},{"path":"share/pcmanfm/ui/pref.ui","mode":420}]}};
try {
    const configBytes = await readFile(resolve(run, 'config.json'));
    const config = JSON.parse(configBytes);
    const manifestsBytes = await readFile(resolve(run, 'candidate-manifests.json'));
    const candidates = JSON.parse(manifestsBytes);
    const inputDist = config.inputDist || config.dist;
    assert(inputDist && config.dist, 'Frozen local binary/core inputs required');
    assert.equal(config.expectedRuntime,'19609f47c28f9d81c12ad6525d65347057ad5ad2ddec5eb48f5762a922d72441');
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
        assert.equal(m.binary.sha256,reviewed[name]);
        assert.deepEqual(m.outputs,pins[name].outputs);
        assert.equal(m.outputs.length,name==='libfm'?111:15);
        assert.deepEqual(m.files.map(f=>f.path).sort(),['build.sh','consumer.c','source.tar','test.sh']);
        const base = resolve(inputDist, 'migration', name);
        assert.deepEqual(JSON.parse(await readFile(resolve(base, 'package.json'))), m);
        for(const f of m.files){const b=await readFile(resolve(base,f.path));assert.equal(f.sha256,pins[name][f.path]);assert.equal(sha(b),f.sha256);assert.equal(b.length,f.size);}
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
        const validation=execFileSync('python3',['-c',`import json,sys,tarfile,hashlib
v=json.load(sys.stdin)
with tarfile.open(sys.argv[1]) as t:
 ms=t.getmembers(); assert len(ms)==len(v['outputs'])
 assert len({m.name for m in ms})==len(ms)
 assert all(m.isfile() for m in ms)
 assert {m.name:m.mode for m in ms}=={o['path']:o['mode'] for o in v['outputs']}
 for m in ms: assert hashlib.sha256(t.extractfile(m).read()).hexdigest()==v['sums'][m.name]
print('BINARY-PAYLOAD-PASS')`,archivePath],{input:JSON.stringify({outputs:m.outputs,sums:Object.fromEntries(entries)}),timeout:30000,maxBuffer:1024*1024}).toString();
        assert.match(validation,/BINARY-PAYLOAD-PASS/);
        report.packages[name] = {manifest: m, checksumFileSha256: sha(sums[name]), checkedFiles: entries.size};
    }
    const {session} = await helper('tests/compatibility/session.mjs');
    const {poll} = await helper('tests/desktop/poll.mjs');
    const {desktopSession} = await import('./pcmanfm-layout-v2-session.mjs');
    const {installObserver, observe, rootMenuRows} = await helper('tests/desktop/menu-xapps.mjs');
    const {visibleCanvas, canvasPosition} = await helper('tests/migration/canvas.mjs');
    const {typeText} = await helper('tests/desktop/keyboard.mjs');
    for (const path of ['tests/desktop/windows-xapps.c', 'tests/desktop/menu.mjs', 'tests/desktop/poll.mjs'])
        report.helperHashes[path] = sha(await readFile(resolve(repo, path)));
    for(const name of ['pcmanfm-layout-v2.mjs','pcmanfm-layout-v2-session.mjs','pcmanfm-layout-v2-supervisor.c']){const b=await readFile(new URL(name,import.meta.url));report.helperHashes[name]=sha(b);await save(name,b);}
    // Resolve exact frozen transitive/desktop manifest pins before opening browser.
    const closure=new Map();
    function resolveManifest(name){
        if(closure.has(name))return;
        let m=candidates[name];
        if(!m){const pin=config.baselinePackages[name];assert(pin,'Missing frozen dependency '+name);
            const match=/^https:\/\/raw\.githubusercontent\.com\/GroundUpCoder\/gucos-packages\/([a-f0-9]{40})\/(apps\/[A-Za-z0-9_-]+\/package\.json)$/.exec(pin.url);assert(match,'Immutable manifest pin required');
            const b=execFileSync('git',['show',match[1]+':'+match[2]],{cwd:repo,timeout:10000,maxBuffer:4*1024*1024});assert.equal(sha(b),pin.sha256);assert.equal(b.length,pin.size);m=JSON.parse(b);
        }
        assert.equal(m.name,name);assert(m.binary);closure.set(name,m);
        for(const dep of m.dependencies){resolveManifest(dep);if(m.dependencyRequirements?.[dep])assert.equal(closure.get(dep).version,m.dependencyRequirements[dep].version);}
    }
    for(const name of ['pcmanfm','libfm','jwm','desktop-entries','xterm'])resolveManifest(name);
    report.dependencyManifests=Object.fromEntries(closure);
    s = await session(); report.runtime = s.runtime;s.page.on('pageerror',e=>errors.push(String(e))); await s.command('true');
    for(const [name,m] of closure)assert.deepEqual(JSON.parse((await readGuest('/usr/local/lib/gucman/packages/'+name+'/current/manifest.json')).toString()),m,'Installed dependency identity '+name);
    await s.command('set -eu; test "$HOME" = /home/user; test -z "${XDG_CONFIG_HOME+x}"; test ! -e /home/user/.config/pcmanfm; test ! -L /home/user/.config/pcmanfm; echo PCMANFM-FRESH-CONFIG-PASS');
    await noCrash();
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
    await s.command(`set -eu\ntest ! -e ${guest}\ntest ! -L ${guest}\nmkdir ${guest}\nmkdir ${caseDir}`);
    const entry=await readGuest('/usr/local/share/applications/pcmanfm.desktop');assert.match(entry.toString(),/^Exec=pcmanfm --no-desktop %U$/m);await save('owned-pcmanfm.desktop',entry);
    const originalConfig=(await readGuest('/usr/local/share/jwm/wasm.jwmrc')).toString(),originalMenu=await s.command('sh /usr/local/share/jwm/app-menu.sh');
    await save('original-jwmrc',originalConfig);await save('original-menu.xml',originalMenu);
    const launch='/usr/local/bin/desktop-menu launch pcmanfm.desktop',include='<Include>exec:/bin/sh /usr/local/share/jwm/app-menu.sh</Include>';
    assert.equal(originalMenu.split('>'+launch+'</Program>').length,2);assert.equal(originalConfig.split(include).length,2);
    const menu=originalMenu.replace('>'+launch+'</Program>','>'+guest+'/supervisor '+caseDir+'</Program>');
    const jwmrc=originalConfig.replace(include,'<Include>'+caseDir+'/menu.xml</Include>');
    await save('instrumented-menu.xml',menu);await save('instrumented-jwmrc',jwmrc);await put(caseDir+'/menu.xml',menu);await put(caseDir+'/jwmrc',jwmrc);
    const supervisor=await readFile(new URL('./pcmanfm-layout-v2-supervisor.c',import.meta.url));await put(guest+'/supervisor.c',supervisor);
    report.supervisorCompile=await s.command(`set -eu\nprintf '${sha(supervisor)}  ${guest}/supervisor.c\\n' | sha256sum -c -\ncc ${guest}/supervisor.c -o ${guest}/supervisor\nsha256sum ${guest}/supervisor`);
    report.launch={instrumented:true,delegates:launch,menuSha256:sha(menu),jwmrcSha256:sha(jwmrc)};
    d = await desktopSession(s, {workingDirectory: root,configPath:caseDir+'/jwmrc',controlPath:caseDir+'/control'}); report.desktopHelpers = d.helper;
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
                    await noCrash();
                    await writeFile(resolve(output, stem + '-' + label + '.png'), await canvas.screenshot(), {flag: 'wx'});
                    return geometry;
                }
                await s.page.waitForTimeout(500);
            }
            throw Error('Layout did not settle: ' + title);
        })(), 45000, 'Settled layout deadline: ' + title);
    }
    const rows=rootMenuRows(menu),index=rows.findIndex(r=>r.includes('>'+guest+'/supervisor '+caseDir+'</Program>'));assert(index>=0);
    await canvas.click({position:await canvasPosition(canvas,{x:10,y:585})});const popup=await observe(d,'menu');
    await canvas.click({position:await canvasPosition(canvas,{x:popup.x+popup.width/2,y:popup.y+1+(index+0.5)*(popup.height-2)/(rows.length+2)})});
    report.menu={index,popup,instrumented:true};
    report.main = await observe(d, 'window', 'pcmanfm-layout');
    assert(Number.isSafeInteger(report.main.pid) && report.main.pid > 0);
    const main = report.main;
    const child=Number((await readGuest(caseDir+'/child.pid')).toString().trim());assert.equal(main.pid,child);
    report.supervisorPid=Number((await readGuest(caseDir+'/supervisor.pid')).toString().trim());assert(Number.isSafeInteger(report.supervisorPid)&&report.supervisorPid>0&&report.supervisorPid!==child);
    report.processIdentity={stat:(await readGuest('/proc/'+child+'/stat')).toString(),cmdline:(await readGuest('/proc/'+child+'/cmdline')).toString()};
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
    assert.equal((await observe(d,'window','fixture')).pid,child);
    const beforeClose=(await readGuest('/proc/'+child+'/stat')).toString();
    const startTick=text=>{const end=text.lastIndexOf(')');assert(end>0);const fields=text.slice(end+2).trim().split(/\s+/);assert(fields.length>19);return fields[19];};
    assert.equal(startTick(beforeClose),startTick(report.processIdentity.stat),'PID identity changed');
    assert.equal((await readGuest('/proc/'+child+'/cmdline')).toString(),report.processIdentity.cmdline);
    await noCrash();
    await s.page.keyboard.press('Control+q');
    await bounded(poll(s.page,async path=>{const b=await shell.busybox.read(path);return ArrayBuffer.isView(b)&&new TextDecoder().decode(b)==='done\n';},caseDir+'/done',15000),18000,'Supervisor result timeout');
    const result=await readGuest(caseDir+'/result.json');await save('waitpid.json',result);report.exit=JSON.parse(result.toString());
    assert.deepEqual(report.exit,{pid:child,rawStatus:0,exited:1,exitCode:0,signaled:0,signal:0});
    await noCrash();
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
    for(const name of ['libfm','pcmanfm'])await s.command('sha256sum -c /tmp/pcmanfm-layout-'+name+'.sha256');
    await noCrash();report.status = 'completed-layout-and-supervised-normal-exit';
} catch (e) {
    report.status = 'failed'; report.error = String(e.stack || e);
    process.exitCode = 1;
} finally {
    if (s) {
        if (report.status === 'failed' && canvas) {
            try { await bounded(writeFile(resolve(output, stem + '-failure.png'), await bounded(canvas.screenshot(), 5000, 'Failure screenshot timeout'), {flag: 'wx'}), 5000, 'Screenshot write timeout'); }
            catch (e) { report.screenshotError = String(e); }
        }
        try { await bounded((async () => { await writeFile(resolve(output, stem + '.log'), await s.page.evaluate(() => {if(typeof shell.busybox?.log!=='string')throw Error('Missing runtime log');return shell.busybox.log;}), {flag: 'wx'}); })(), 5000, 'Log timeout'); }
        catch (e) { report.logError = String(e); report.status = 'failed'; }
        try { await noCrash(); } catch(e) {report.fatalError=String(e);report.status='failed';}
        try { await bounded(s.close(), 30000, 'Session close timeout'); }
        catch (e) { report.cleanupError = String(e); report.status = 'failed'; }
    }
    report.finishedAt = new Date().toISOString();
    await writeFile(resolve(output, stem + '.json'), JSON.stringify(report, null, 2) + '\n', {flag: 'wx'});
    if (report.status === 'failed') process.exitCode = 1;
}
