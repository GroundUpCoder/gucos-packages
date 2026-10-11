// Real production-origin install, reload and interactive DeepSeek tool approval.
import {browserSession} from '../../tools/browser.mjs';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
assert(process.env.MACHINE_JOB_ID&&process.env.DEEPSEEK_KEY_FILE&&process.env.GUCOS_EXPECTED_RUNTIME);
const s=await browserSession({url:'https://os.groundupcoder.com',allowedOrigins:['https://raw.githubusercontent.com','https://api.deepseek.com'],timeout:600000});
const report={startedAt:new Date().toISOString(),status:'running'};
const sha=b=>createHash('sha256').update(b).digest('hex');
async function write(path,bytes){await s.page.evaluate(async ({path,encoded})=>shell.busybox.write(path,Uint8Array.from(atob(encoded),c=>c.charCodeAt(0))),{path,encoded:Buffer.from(bytes).toString('base64')});}
try{
 report.runtime=await s.page.evaluate(()=>shell.toolchain.systemBuild);assert.equal(report.runtime,process.env.GUCOS_EXPECTED_RUNTIME);
 console.log(await s.command('set -eu\ngucman install groundupcoder:gucode\ngucode --version'));
 const expected=JSON.parse(await readFile('docs/research/gucode/binary.json'));
 for(const name of ['libcurl','gucode']){
  const local=JSON.parse(await readFile('apps/'+name+'/package.json'));
  const actual=await s.page.evaluate(async name=>JSON.parse(new TextDecoder().decode(await shell.busybox.read('/usr/local/lib/gucman/packages/'+name+'/current/manifest.json'))),name);
  assert.deepEqual(actual,local);
  for(const [path,hash] of Object.entries(expected[name].installedPayloads)){
   const bytes=Buffer.from(await s.page.evaluate(async path=>Array.from(await shell.busybox.read(path)),'/usr/local/'+path));assert.equal(sha(bytes),hash);
  }
 }
 report.publicBinaryInstall=true;
 await s.page.reload();await s.page.waitForFunction(()=>window.shell?.ready);await s.command('gucode --version\nmkdir -p /tmp/gucode-ui');
 await write('/tmp/gucode-key',await readFile(process.env.DEEPSEEK_KEY_FILE));
 console.log('Public payload verification and reload passed');
 const start=await s.page.evaluate(()=>shell.busybox.log.length);
 await s.page.evaluate(()=>shell.terminal.focus());
 await s.page.keyboard.type("sh -c 'exec gucode --key-file /tmp/gucode-key -C /tmp/gucode-ui'");await s.page.keyboard.press('Enter');
 await s.page.waitForFunction(start=>shell.busybox.log.slice(start).includes('gucode> '),start);
 console.log('Interactive gucode prompt reached');
 await s.page.keyboard.type('Use write_file to create greeting.txt containing exactly hello followed by a newline. Then say done.');await s.page.keyboard.press('Enter');
 await s.page.waitForFunction(start=>shell.busybox.log.slice(start).includes('Allow this action? [y/N]'),start);
 console.log('Permission prompt reached');
 await s.page.keyboard.type('y');await s.page.keyboard.press('Enter');
 await s.page.waitForFunction(start=>(shell.busybox.log.slice(start).match(/gucode> /g)||[]).length>=2,start);
 const content=await s.page.evaluate(async()=>new TextDecoder().decode(await shell.busybox.read('/tmp/gucode-ui/greeting.txt')));assert.equal(content,'hello\n');
 report.interactivePrompt=true;report.interactivePermission=true;report.deepseekWriteVerified=true;
 report.ansiColor=await s.page.evaluate(start=>shell.busybox.log.slice(start).includes('\x1b[36m'),start);
 await s.page.keyboard.type('/exit');await s.page.keyboard.press('Enter');
 await s.page.waitForFunction(()=>!shell.busybox.running);
 await s.command('rm -f /tmp/gucode-key');report.interactiveExit=true;report.reload=true;report.status='passed';
}catch(e){report.status='failed';report.error=String(e.stack||e);throw e;}
finally{report.finishedAt=new Date().toISOString();await writeFile('docs/research/gucode/public.json',JSON.stringify(report,null,2)+'\n');await s.close();}
