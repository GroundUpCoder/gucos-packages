import {session} from './expansion-session.mjs';
import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
assert.equal(process.env.EXPANSION_PUBLIC,'1','requires actual public origin');
const s=await session();
const names=['jwm','x11-server','x11-toolkit','x11-widgets','xterm','xcalc','xclock','xeyes','xlogo','xlsfonts','xkill','xrefresh','xmessage','xprop','xev','lua','zstd'];
try{
 await s.command('set -eu\nprintf package-persistence > /home/user/expansion-persistence\nsync');
 await s.page.reload();await s.page.waitForFunction(()=>window.shell?.ready);
 await s.command('true');
 for(const name of names){
  const installed=await s.page.evaluate(async name=>JSON.parse(new TextDecoder().decode(await shell.busybox.read('/usr/local/lib/gucman/packages/'+name+'/current/manifest.json'))),name);
  const expected=JSON.parse(await readFile(s.root+'apps/'+name+'/package.json','utf8'));
  assert.deepEqual(installed,expected,name+' persisted public manifest');
 }
 await s.command('set -eu\ntest "$(cat /home/user/expansion-persistence)" = package-persistence\njwm -v\nlua -e \'assert(6*7==42)\'\nzstd --version\necho PUBLIC-RELOAD-PASS');
 console.log('PASS reload: all 17 public installed manifests match published identities');
}finally{await s.close();}
