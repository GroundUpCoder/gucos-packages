// Observe live JWM geometry; all selection/input remains real browser events.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {visibleCanvas,canvasPosition} from '../migration/canvas.mjs';
const hash=b=>createHash('sha256').update(b).digest('hex');
export async function installObserver(s){
 const source=await readFile(new URL('./windows.c',import.meta.url));
 await s.page.evaluate(async text=>shell.busybox.write('/tmp/jwm-observe.c',new TextEncoder().encode(text)),source.toString());
 await s.command('cc /tmp/jwm-observe.c -I/usr/local/include -L/usr/local/lib -lX11 -lxcb -lXau -o /tmp/jwm-observe');
 return {observerSha256:hash(source),menuHelperSha256:hash(await readFile(new URL(import.meta.url)))};
}
export async function observe(s,mode,title){
 assert(['wm','menu','window','absent'].includes(mode));assert(!title||/^[A-Za-z0-9 ._-]+$/.test(title));
 const log=await s.command(`DISPLAY=:1 /tmp/jwm-observe ${mode}${title?` '${title}'`:''}`);
 if(mode==='wm'||mode==='absent')return log;
 const m=log.match(/WINDOW (\d+) (-?\d+) (-?\d+) (\d+) (\d+)/);assert(m,'Live X window geometry missing');
 const [id,x,y,width,height]=m.slice(1).map(Number);return {id,x,y,width,height};
}
export async function clickMenuEntry(s,id){
 assert(/^[A-Za-z0-9._-]+\.desktop$/.test(id));
 const menu=await s.command('sh /usr/local/share/jwm/app-menu.sh');
 assert(!menu.includes('<Menu '),'Expected the accepted flat application menu');
 const items=menu.split('\n').filter(line=>line.includes('<Program '));
 const index=items.findIndex(line=>line.includes(' launch '+id+'<'));
 assert(index>=0,'Installed owned entry missing from JWM menu: '+id);
 const canvas=await visibleCanvas(s.page);
 await canvas.click({position:await canvasPosition(canvas,{x:10,y:585})});
 const geometry=await observe(s,'menu');
 await canvas.click({position:await canvasPosition(canvas,{x:geometry.x+geometry.width/2,y:geometry.y+1+(index+0.5)*(geometry.height-2)/(items.length+2)})});
 return {id,index,geometry,menu};
}
