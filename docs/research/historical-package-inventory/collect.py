"""Read-only historical evidence collection; writes only this documentation directory.
Run from packages root: python3 docs/research/historical-package-inventory/collect.py
No build, browser, installation or artifact publication. Network receipts are separate.
"""
import collections, fnmatch, functools, hashlib, json, pathlib, re, subprocess
OUT = pathlib.Path(__file__).resolve().parent
OLD = pathlib.Path('/Users/jku/git/wasm-posix-old')
PKG = OUT.parents[2]
OLD_REV = '0b9b3245fe11a3bc677d81113cba90cd0ae80446'
PKG_REV = 'f256627a317a97c9950ac058b70ae5cda70b541e'
def git(root,*args): return subprocess.check_output(['git','-C',str(root),*args],text=True).strip()
@functools.lru_cache(maxsize=None)
def blob(root,rev,path):
    return subprocess.check_output(['git','-C',str(root),'show',rev+':'+path])
def content(p):
    root,rev = (OLD,OLD_REV) if p.is_relative_to(OLD) else (PKG,PKG_REV)
    return blob(root,rev,str(p.relative_to(root)))
def digest(p): return hashlib.sha256(content(p)).hexdigest()
def read(path): return json.loads(content(OLD/path))
old_files = git(OLD,'ls-tree','-r','--name-only',OLD_REV).splitlines()
pkg_files = git(PKG,'ls-tree','-r','--name-only',PKG_REV).splitlines()
evidence = collections.defaultdict(list)
def add(name,path,kind,selector,record=None):
    e={'path':path,'sha256':digest(OLD/path),'kind':kind,'selector':selector}
    if record:
        for k in ('revision','run','sourceCandidate','sourcePassed','binaryPassed','sha256','size','resultSha256','lockSha256'):
            if k in record:e['recordedArtifactSha256' if k=='sha256' else k]=record[k]
        a=record.get('artifact',record.get('selectedArtifact'))
        if isinstance(a,dict):e['artifact']={k:a[k] for k in ('sha256','size','compatibilityKey') if k in a}
    evidence[name].append(e)
# Actual phase results, not manifest status strings.
for f in [OLD/p for p in old_files if fnmatch.fnmatch(p,'docs/research/package-publication*/release-set.json')]:
    path=str(f.relative_to(OLD));d=read(path)
    for i,r in enumerate(d.get('reports',[])):
        if r.get('sourcePassed') is True and r.get('binaryPassed') is True:
            add(r['name'],path,'recorded source and binary acceptance',f'reports[{i}]',r)
    for i,r in enumerate(d.get('separateAcceptance',[])):
        if r.get('exactBinaryPassed') or (r.get('freshCanonicalBootBuildByteEqual') and r.get('passed') and r.get('binaryExit')==0):
            add(r['name'],path,'separate source and exact binary proofs',f'separateAcceptance[{i}]',r)
for f in [OLD/p for p in old_files if fnmatch.fnmatch(p,'docs/research/harfbuzz-gucman-integration/candidates/*.json')]:
    path=str(f.relative_to(OLD));r=read(path)
    if r.get('sourcePassed') is True and r.get('binaryPassed') is True:
        add(r['name'],path,'recorded source and binary acceptance (historical mixed baseline)','root',r)
for path in ['docs/logs/2026-10-03/desktop-ports-validation.json','docs/logs/2026-10-03/more-desktop-apps-validation.json']:
    d=read(path);rows=d['packages'] if isinstance(d,dict) else d
    for i,r in enumerate(rows):
        if r.get('sourcePassed') is True and r.get('binaryPassed') is True:
            add(r['name'],path,'recorded source and binary acceptance',f'package index {i}',r)
path='docs/research/platform-os2-transition-20261005/format1-inventory-v2.json'
for i,r in enumerate(read(path)['candidates']):
    if r['state']=='approved-promoted':add(r['name'],path,'retained approved artifact and result/lock hashes',f'candidates[{i}]',r)
path='docs/logs/2026-10-03/libc-07305461-sweep.md'
for line in content(OLD/path).decode().splitlines():
    m=re.match(r'- `([^`]+)`: promoted\. Source and binary passed\.',line)
    if m:add(m[1],path,'journal records source and binary pass',line)
manual={
 'x11-apps-more':('2026-10-03/x11-apps-more.md','x11-apps-more-AU8pxm passed source and binary phases; artifact SHA-256 7439b50773470adedf8d001aec4cd4e7ee5354de125b0fc670b216c218a07234'),
 'flex':('2026-10-04/cpp-project-sequence.md','Flex-LVE6z3 likewise passed both phases; unreviewed/unpublished at this checkpoint'),
 'fltk':('2026-10-05/fltk-publication.md','Shared FLTK exact publication and fresh HTTP interaction/consumer acceptance'),
 'tinyxml2':('2026-10-04/tinyxml2-execution.md','tinyxml2-nGVU0f; source/binary 517 checks and completed publication'),
 'twm':('2026-10-01/twm.md','twm-uQgB50 passed both isolated source and binary acceptance'),
 'x11-shared':('2026-10-04/fltk-execution.md','x11-shared-v6TPAf passed source and fresh binary acceptance'),
 'xmahjongg':('2026-10-04/cpp-project-sequence.md','XMahjongg and TinyXML2 are published; subsequent os2 completion recorded in coverage'),
}
for n,(p,s) in manual.items():add(n,'docs/logs/'+p,'explicit historical execution journal',s)
coverage=read('docs/research/m4-release-20261010/coverage/coverage.json')['rows']
# Enumerate actual tracked manifests independently of the historical coverage list.
manifest_names={}
manifest_records={}
for path in old_files:
    if not path.endswith('/wasm-package.json'):continue
    for r in read(path).get('packages',[]):
        manifest_names[r['name']]=path
        manifest_records[r['name']]=r
assert set(manifest_names)=={r['name'] for r in coverage}
assert all(r['name'] in evidence for r in coverage), [r['name'] for r in coverage if r['name'] not in evidence]
current={path.split('/')[1]:json.loads(content(PKG/path)) for path in pkg_files if re.fullmatch(r'apps/[^/]+/package.json',path)}
core={'ar','ash','busybox','cc','libc','make'}
same={'jwm','lua','twm','x11-server','zstd'}
partial={
 'x11-apps':'Split into x11-toolkit, x11-widgets, xterm, xev, xprop, xmessage. Missing libXft SDK and historical Xft/ncurses xterm profile.',
 'x11-apps-more':'Seven clients published separately; missing xedit, xfontsel, xclipboard, oclock, xcutsel.',
 'jwm-desktop':'start-jwm and helper now supplied by jwm; former desktop bundle/menu/dependency closure not reproduced.',
 'sdl3':'Core owns SDL3-compatible VT shim; not a migration of the full historical package/profile.',
 'sdk':'Core supplies C compiler/libc/bootstrap; historical SDK bundle and host C++ preparation not a current package.',
}
rows=[]
for r in sorted(coverage,key=lambda r:r['name']):
    n=r['name'];status='absent'
    if n in core:status='core bootstrap'
    if n in same:status='current package (profile may differ)'
    if n in partial:status='partial or reorganized'
    ev=evidence[n]
    # Retain one strongest primary record and a distinct corroborating source where available.
    ev=sorted(ev,key=lambda e:('journal' in e['kind'], 'retained' in e['kind'],e['path']))
    selected=[ev[0]]
    if ev[-1]['path']!=ev[0]['path']:selected.append(ev[-1])
    rows.append({'name':n,'historicalManifest':manifest_names[n],'historicalManifestSha256':digest(OLD/manifest_names[n]),'historicalVersionAtHead':manifest_records[n]['version'],'buildDependencies':manifest_records[n].get('buildDependencies',[]),'runtimeDependencies':manifest_records[n].get('runtimeDependencies',[]),'historicalEvidence':selected,'currentStatus':status,'currentMapping':partial.get(n,n if n in same else ('fixed core bootstrap' if n in core else None)),'scope':'Historical success at recorded version/baseline, not proof for every version or current platform.'})
result={'format':1,'oldCommit':OLD_REV,'packagesBaseline':PKG_REV,'catalogSha256':digest(PKG/'catalog.json'),'counts':dict(collections.Counter(r['currentStatus'] for r in rows)),'currentPackages':[{'name':n,'version':r['version'],'binary':bool(r.get('binary')),'outputs':[o['path'] for o in r['outputs']]} for n,r in sorted(current.items())],'rows':rows}
(OUT/'inventory.json').write_text(json.dumps(result,indent=2)+'\n')
lines=['# Historical catalog rows','', 'All historical paths below are relative to `wasm-posix-old` at `'+result['oldCommit']+'`.','Evidence means inspected historical execution records, not a rerun or present-day compatibility approval.','Versions are manifest versions at that commit; acceptance records can concern earlier versions.','Bundles/data packages are included; 110 rows do not mean 110 separately compiled programs.','', '| Historical name | Current disposition | Manifest | Historical success evidence |','| --- | --- | --- | --- |']
for r in rows:
    e=r['historicalEvidence'][0]
    lines.append('| '+r['name']+' | '+r['currentStatus']+' | `'+r['historicalManifest']+'` | `'+e['path']+'` ('+e['kind']+') |')
(OUT/'catalog-rows.md').write_text('\n'.join(lines)+'\n')
print(result['counts']);print('Missing:',', '.join(r['name'] for r in rows if r['currentStatus']=='absent'))
