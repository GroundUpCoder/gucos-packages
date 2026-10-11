import json,os,pathlib,subprocess,tempfile
if not __debug__: raise RuntimeError('Validation requires assertions enabled')
root=pathlib.Path('/Users/jku/git/gucos-packages-gucode-editing');os.chdir(root)
def git(*args,**kwargs):return subprocess.check_output(['git',*args],**kwargs)
report=json.loads((root/'docs/research/gucode-0.1.2/public.json').read_text());assert report['status']=='passed'
assert report['mode']=='public'
assert report['runtime']=='19609f47c28f9d81c12ad6525d65347057ad5ad2ddec5eb48f5762a922d72441'
assert report['binary']=={'sha256':'378a92440f3f0dee4e3fc5cc6d4d81cd1dba456094447545035c92910b04f5e3','size':179712}
assert report['sourceArchiveSha256']=='36a235f76a49c9f03c35d8bd6be7a8b5d2d0acb0dbca820f195748925c59a2f6'
assert {'public upgrade 0.1.1 to 0.1.2','reload payloads and default key','VT: 12 real keyboard editing cases, exact provider input','VT bracketed paste and terminal restoration after exit, Ctrl-C and Ctrl-D','X11 xterm: 12 real keyboard editing cases, exact provider input','X11 xterm termios restoration and desktop cleanup'} <= set(report['checks'])
old=json.loads((root/'tools/publication-baseline.json').read_text())['revision']
assert old=='c303f33d6aae5ed1ba0cf9598534e842cc21914f'
published='e659a47df2eef9756520bdc9d71b49602c821952'
base=json.loads(git('show',old+':catalog.json'));full=json.loads(git('show',published+':catalog.json'))
assert len(base['packages'])==91 and len(full['packages'])==98
before=json.loads(json.dumps(base));base['packages']['gucode']=full['packages']['gucode']
assert [n for n in before['packages'] if before['packages'][n]!=base['packages'][n]]==['gucode']
with tempfile.TemporaryDirectory() as tmp:
 env={**os.environ,'GIT_INDEX_FILE':tmp+'/index'}
 git('read-tree',old,env=env)
 data=(json.dumps(base,indent=2)+'\n').encode();blob=git('hash-object','-w','--stdin',input=data).decode().strip()
 git('update-index','--add','--cacheinfo','100644,'+blob+',catalog.json',env=env)
 paths=git('ls-files','-z','apps/gucode',env=env)
 git('update-index','--force-remove','-z','--stdin',input=paths,env=env)
 git('read-tree','--prefix=apps/gucode/',published+':apps/gucode',env=env)
 tree=git('write-tree',env=env).decode().strip()
 commit=git('commit-tree',tree,'-p',published,'-m','Preserve 91-entry baseline with accepted gucode 0.1.2').decode().strip()
assert git('show',commit+':apps/gucode/package.json')==git('show',published+':apps/gucode/package.json')
assert (root/'catalog.json').read_bytes()==git('show',published+':catalog.json')
assert git('rev-parse',commit+':apps/gucode')==git('rev-parse',published+':apps/gucode')
git('branch','acceptance/gucode-0.1.2',commit)
record={'status':'passed','previousBaseline':old,'baselineRevision':commit,'durableRef':'refs/heads/acceptance/gucode-0.1.2','preservedNames':91,'changedBaselineEntries':['gucode'],'mainCatalogEntries':98,'mainCatalogCommit':published,'note':'Preservation baseline, not the complete accepted-package inventory; five additional acceptances remain separately recorded and Imlib2/Feh are not newly accepted.'}
(root/'docs/research/gucode-0.1.2/baseline-preservation.json').write_text(json.dumps(record,indent=2)+'\n')
(root/'tools/publication-baseline.json').write_text(json.dumps({'revision':commit,'description':record['note']+' Retains the previous 91 names with gucode upgraded to 0.1.2 after reviewed source, native, candidate VT/X11, public upgrade/reload and payload-hash acceptance.'},indent=2)+'\n')
print(commit)
