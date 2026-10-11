// One-off interactive acceptance. Requires installed tmux and integrated IPC candidate.
// COMPAT_RUN_DIR must select the explicit frozen candidate and retained guest profile.
import {session} from '../../../tests/compatibility/session.mjs';
import {writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import assert from 'node:assert/strict';
assert(process.env.MACHINE_JOB_ID);
assert.equal(process.env.TMUX_INTEGRATED_IPC,'1','Do not run against bootstrap-only candidate');
const s=await session(), steps=[];
const report={runtime:s.runtime,steps,status:'running'};
const quote=s=>"'"+s.replaceAll("'","'\\''")+"'";
const prefix='TERM=xterm-256color TERMINFO=/usr/local/share/terminfo /usr/local/bin/tmux -L flagship';
async function cmd(text){const log=await s.command(text);return log;}
async function input(text){await s.page.locator('.xterm-helper-textarea').focus();await s.page.keyboard.type(text);await s.page.keyboard.press('Enter');}
async function file(path){return s.page.evaluate(async path=>{try{return new TextDecoder().decode(await shell.busybox.read(path));}catch{return null;}},path);}
async function waitFile(path,pattern){for(let i=0;i<100;i++){const text=await file(path);if(text&&pattern.test(text))return text;await s.page.waitForTimeout(100);}throw Error('Missing expected file: '+path);}
async function attach(){
 await s.page.evaluate(command=>{window.tmuxAttachResult=null;window.tmuxAttachPromise=shell.command(command).then(x=>window.tmuxAttachResult=x);},'sh -c '+quote('export TERM=xterm-256color TERMINFO=/usr/local/share/terminfo; exec /usr/local/bin/tmux -L flagship attach-session -t flagship'));
 await s.page.waitForTimeout(1500);
 assert.equal(await s.page.evaluate(()=>window.tmuxAttachResult),null,'Attach exited early');
}
async function detach(){
 await s.page.locator('.xterm-helper-textarea').focus();await s.page.keyboard.press('Control+b');await s.page.keyboard.press('d');
 await s.page.waitForFunction(()=>window.tmuxAttachResult!==null);
 assert.equal(await s.page.evaluate(()=>window.tmuxAttachResult.code),0);
}
try {
 await cmd('set -eu\nexport PATH=/usr/local/bin:$PATH TERM=xterm-256color TERMINFO=/usr/local/share/terminfo\ntmux -V\ntmux -L flagship -f /dev/null new-session -d -s flagship -x 80 -y 24 /bin/sh\ntmux -L flagship split-window -h -t flagship:0 /bin/sh\ntmux -L flagship list-panes -t flagship -F "#{pane_id} #{pane_pid}" > /tmp/tmux-initial-panes');
 const before=await file('/tmp/tmux-initial-panes');assert.equal(before.trim().split('\n').length,2);steps.push({step:'create-two-panes',panes:before});
 await attach();
 await input('echo TMUX-INTERACTIVE-ONE > /tmp/tmux-input-one');
 await waitFile('/tmp/tmux-input-one',/TMUX-INTERACTIVE-ONE/);
 await s.page.keyboard.type('echo TMUX-ERASX');await s.page.keyboard.press('Backspace');await s.page.keyboard.type('E > /tmp/tmux-erase');await s.page.keyboard.press('Enter');
 assert.equal((await waitFile('/tmp/tmux-erase',/TMUX-ERASE/)).trim(),'TMUX-ERASE');steps.push({step:'terminal-erase',status:'passed'});steps.push({step:'attach-and-real-terminal-input',status:'passed'});
 await input('echo $$ > /tmp/tmux-shell-pid; (while :; do echo tick >> /tmp/tmux-ticks; sleep 1; done) &');
 await waitFile('/tmp/tmux-ticks',/tick/);
 await s.page.evaluate(()=>shell.terminal.resize(110,34));await s.page.waitForTimeout(1000);
 await detach();steps.push({step:'detach',status:'passed'});
 const ticksBefore=await file('/tmp/tmux-ticks');await s.page.waitForTimeout(2300);const ticksAfter=await file('/tmp/tmux-ticks');assert(ticksAfter.length>ticksBefore.length);steps.push({step:'continued-process-after-detach',before:ticksBefore.length,after:ticksAfter.length});
 const dims=await cmd(prefix+' display-message -p -t flagship "#{window_width} #{window_height}"');assert.match(dims,/110 33/);steps.push({step:'terminal-resize',observed:dims});
 await attach();await input('echo TMUX-RECONNECTED > /tmp/tmux-input-two');await waitFile('/tmp/tmux-input-two',/TMUX-RECONNECTED/);
 await s.page.locator('.xterm-helper-textarea').focus();await s.page.keyboard.press('Control+b');await s.page.keyboard.press('ArrowLeft');
 await input('echo TMUX-OTHER-PANE > /tmp/tmux-other-pane');await waitFile('/tmp/tmux-other-pane',/TMUX-OTHER-PANE/);
 await detach();
 await cmd(prefix+' list-panes -t flagship -F "#{pane_id} #{pane_pid}" > /tmp/tmux-final-panes');
 assert.equal(await file('/tmp/tmux-final-panes'),before);steps.push({step:'reconnect-other-pane-same-shell-pids',status:'passed'});
 await attach();await input('exit');await s.page.waitForTimeout(700);
 assert.equal(await s.page.evaluate(()=>window.tmuxAttachResult),null,'One pane exiting must leave the other attached');
 await input('echo TMUX-SURVIVOR > /tmp/tmux-survivor');await waitFile('/tmp/tmux-survivor',/TMUX-SURVIVOR/);
 await input('exit');await s.page.waitForFunction(()=>window.tmuxAttachResult!==null);
 assert.equal(await s.page.evaluate(()=>window.tmuxAttachResult.code),0);
 await cmd('if '+prefix+' has-session -t flagship; then exit 1; fi');
 steps.push({step:'pane-exit-survivor-and-final-session-exit',status:'passed'});report.status='passed';
} catch(error){report.status='failed';report.error=String(error.stack||error);throw error;}
finally {
 report.finishedAt=new Date().toISOString();
 await writeFile(resolve(process.env.COMPAT_RUN_DIR,'tmux-lifecycle.json'),JSON.stringify(report,null,2)+'\n');
 await s.close();
}
