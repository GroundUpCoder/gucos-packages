// Fresh disk: consume the public pinned binary, then reload installed state.
import assert from 'node:assert/strict';
import {browserSession} from '../tools/browser.mjs';
const s=await browserSession({allowedOrigins:['https://raw.githubusercontent.com']});
try {
 const log=await s.command('set -eu\ngucman search jsmn\ngucman install groundupcoder:jsmn\n/usr/local/bin/jsmn-example');
 assert.match(log,/groundupcoder:jsmn/);assert.match(log,/User: johndoe/);
 await s.page.reload();await s.page.waitForFunction(()=>window.shell?.ready);
 assert.match(await s.command('/usr/local/bin/jsmn-example'),/UID: 1000/);
 console.log('PASS public pinned binary install and reload');
}finally{await s.close();}
