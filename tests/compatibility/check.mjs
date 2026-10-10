import {session} from './session.mjs';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import assert from 'node:assert/strict';
const run=process.env.COMPAT_RUN_DIR,baseline=JSON.parse(await readFile(resolve(run,'baseline.json')));
const s=await session();
async function integrity(){
 await s.command('true');
 for(const [name,expected] of Object.entries(baseline.packages)){
  const actual=await s.page.evaluate(async name=>JSON.parse(new TextDecoder().decode(await shell.busybox.read('/usr/local/lib/gucman/packages/'+name+'/current/manifest.json'))),name);
  assert.deepEqual(actual,expected,'Published manifest changed: '+name);
 }
 await s.page.evaluate(async text=>shell.busybox.write('/tmp/compatibility.sha256',new TextEncoder().encode(text)),await readFile(resolve(run,'installed.sha256'),'utf8'));
 await s.command('set -eu\nsha256sum -c /tmp/compatibility.sha256\necho BASELINE-ARTIFACT-INTEGRITY-PASS');
}
try{
 switch(process.argv[2]){
  case 'probe': {
   // Inspect public bytes through the browser; do not route or rewrite requests.
   const hash=await s.page.evaluate(async url=>{const r=await fetch(url);if(!r.ok)throw Error('Catalog HTTP '+r.status);const b=await r.arrayBuffer();return [...new Uint8Array(await crypto.subtle.digest('SHA-256',b))].map(v=>v.toString(16).padStart(2,'0')).join('');},baseline.catalogUrl);
   assert.equal(hash,baseline.catalogSha256);
   await s.command('set -eu\ngucman repo remove groundupcoder || true\ngucman repo add compatibility '+baseline.catalogUrl+'\necho COMPATIBILITY-BOOT-PASS');break;
  }
  case 'install':
   for(const name of process.argv.slice(3)){assert(Object.hasOwn(baseline.packages,name));await s.command('gucman install compatibility:'+name);}break;
  case 'integrity':await integrity();break;
  case 'libraries':await s.command(await readFile(new URL('libraries.sh',import.meta.url),'utf8'));break;
  case 'reload':
   await s.command('set -eu\nprintf retained > /home/user/compatibility-persistence\nsync');
   await s.page.reload();await s.page.waitForFunction(()=>window.shell?.ready);
   assert.equal(await s.page.evaluate(()=>shell.toolchain.systemBuild),s.runtime);
   await integrity();await s.command('set -eu\ntest "$(cat /home/user/compatibility-persistence)" = retained\njwm -v\nlua -e \'assert(6*7==42)\'\nzstd --version\necho COMPATIBILITY-RELOAD-PASS');break;
  default:throw Error('Unknown compatibility check');
 }
}finally{await s.close();}
