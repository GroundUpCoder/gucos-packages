// Installed Vim acceptance adapted from its retained historical keyboard test.
import assert from 'node:assert/strict';
import {readFile,writeFile,access} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {session} from '../compatibility/session.mjs';
assert(process.env.MACHINE_JOB_ID);
const run=process.env.COMPAT_RUN_DIR;
await assert.rejects(access(resolve(run,'vim-functional.json')),{code:'ENOENT'});
const report={status:'running',startedAt:new Date().toISOString(),scope:'Real keyboard editing, C syntax colors, split, resize, save and terminal restoration'};
let s,pending;
try {
 s=await session();const page=s.page;report.runtime=s.runtime;await s.command('true');
 const expected=JSON.parse(await readFile(resolve(run,'candidate-manifests.json'))).vim;
 const installed=await page.evaluate(async()=>JSON.parse(new TextDecoder().decode(await shell.busybox.read('/usr/local/lib/gucman/packages/vim/current/manifest.json'))));
 assert.deepEqual(installed,expected);report.binary=installed.binary;
 await page.evaluate(async text=>shell.busybox.write('/tmp/vim.sha256',new TextEncoder().encode(text)),await readFile(resolve(run,'vim.sha256'),'utf8'));
 await s.command('sha256sum -c /tmp/vim.sha256');
 report.harnessSha256=createHash('sha256').update(await readFile(new URL(import.meta.url))).digest('hex');
 const line=async text=>{await page.keyboard.type(text);await page.keyboard.press('Enter');};
 const start=await page.evaluate(()=>shell.busybox.log.length);
 await page.evaluate(()=>shell.terminal.focus());await line('sh');
 await page.waitForFunction(()=>shell.busybox.running&&shell.ui.busy);
 pending=page.evaluate(()=>shell.busybox.done);pending.catch(()=>{});
 await page.waitForFunction(start=>/[$#] /.test(shell.busybox.log.slice(start)),start);
 page.setDefaultTimeout(45000);
 await line('stty -g > /tmp/vim-term-before; vim /home/user/interactive.c; stty -g > /tmp/vim-term-after; cmp /tmp/vim-term-before /tmp/vim-term-after');
 await page.waitForFunction(()=>shell.terminal.buffer.active.type==='alternate');
 // Switching buffers happens before Vim finishes terminal initialization;
 // typing at that point can be consumed by its startup input flush.
 await page.waitForFunction(()=>{
  const b=shell.terminal.buffer.active;
  return Array.from({length:b.length},(_,i)=>b.getLine(i)?.translateToString(true)).some(s=>s.includes('interactive.c')&&s.includes('[New]'))&&shell.busybox.log.includes('\x1b[?4m');
 });
 await page.waitForTimeout(200);
 await page.keyboard.type('iint main(void) { return 42; }');await page.keyboard.press('Enter');await page.keyboard.type('second line');await page.keyboard.press('Escape');
 await page.waitForFunction(()=>{const b=shell.terminal.buffer.active;return Array.from({length:b.length},(_,i)=>b.getLine(i)?.translateToString(true)).join('\n').includes('second line');});
 // Assert actual rendered C token colors, not merely loaded highlight definitions.
 await page.waitForFunction(()=>{
  const row=shell.terminal.buffer.active.getLine(0);
  return row?.translateToString(true).startsWith('int main(void) { return 42; }');
 });
 const colors=await page.evaluate(()=>[0,4,17,24].map(i=>{
  const cell=shell.terminal.buffer.active.getLine(0).getCell(i);
  return {text:cell.getChars(),mode:cell.getFgColorMode(),color:cell.getFgColor()};
 }));
 report.colors=colors;
 assert.deepEqual(colors.map(c=>c.text),['i','m','r','4']);
 for(const i of [0,2,3])assert.notEqual(colors[i].mode,0,'C syntax token must have a foreground color');
 assert.ok(new Set(colors.map(c=>`${c.mode}:${c.color}`)).size>=3,'C types, statements and literals render distinct colors');
 await line(':call writefile([&filetype, get(b:, "current_syntax", "missing"), synIDattr(synIDtrans(hlID("Statement")), "fg", "cterm")], "/home/user/vim-syntax")');
 await line(':set number');await line(':vsplit');
 await page.setViewportSize({width:1100,height:750});
 await page.waitForTimeout(300);
 await line(':call writefile([string(&lines), string(&columns), string(winnr("$"))], "/home/user/vim-size")');
 const size=await page.evaluate(()=>({rows:shell.terminal.rows,cols:shell.terminal.cols}));
 report.terminalSize=size;
 await line(':call writefile([$VIMRUNTIME], "/home/user/vim-runtime")');
 await page.screenshot({path:resolve(run,'vim-editing.png')});
 await line(':wqa');await page.waitForFunction(()=>shell.terminal.buffer.active.type==='normal');
 // Read the diagnostic files through the shell after Vim has finished writing,
 // rather than racing owner-side reads against the active editor's filesystem.
 await line('cat /home/user/interactive.c; cat /home/user/vim-size; cat /home/user/vim-syntax; echo VIM-INTERACTIVE-PASS');
 await page.waitForFunction(()=>shell.busybox.log.includes('\nVIM-INTERACTIVE-PASS\n'));
 const log=await page.evaluate(()=>shell.busybox.log);assert.match(log,/int main\(void\) \{ return 42; \}\nsecond line/);assert.ok(log.includes(`\n${size.rows}\n${size.cols}\n2\n`),log);
 assert.match(log,/\nc\nc\n[^\n]+\n/,'default startup enables C syntax and colors');

 await line('exit');const result=await pending;pending=undefined;assert.equal(result.code,0);
 await s.command('cmp /tmp/vim-term-before /tmp/vim-term-after; echo VIM-TERMINAL-RESTORED');
 report.vimRuntime=(await page.evaluate(async()=>new TextDecoder().decode(await shell.busybox.read('/home/user/vim-runtime')))).trim();
 assert.equal(report.vimRuntime,'/usr/local/share/vim/vim91');
 report.status='passed';
}catch(error){report.status='failed';report.error=String(error.stack||error);throw error;}
finally{
 report.finishedAt=new Date().toISOString();
 if(s){await writeFile(resolve(run,'vim-functional.log'),await s.page.evaluate(()=>shell.busybox?.log||'').catch(()=>''),{flag:'wx'});await s.close();}
 await writeFile(resolve(run,'vim-functional.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});
}
