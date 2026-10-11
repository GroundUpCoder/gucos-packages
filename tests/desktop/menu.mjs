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
 let timer;
 const log=await Promise.race([s.command(`DISPLAY=:1 /tmp/jwm-observe ${mode}${title?` '${title}'`:''}`),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('X observer exceeded 40 seconds; caller must close the session')),40000);})]).finally(()=>clearTimeout(timer));
 if(mode==='wm'||mode==='absent')return log;
 const m=log.match(/WINDOW (\d+) (-?\d+) (-?\d+) (\d+) (\d+) (\d+)/);assert(m,'Live X window geometry missing');
 const [id,x,y,width,height,pid]=m.slice(1).map(Number);return {id,x,y,width,height,pid};
}
// JWM includes a historical Puzzles submenu before the owned desktop entries.
// Count it as one root row; its descendants are not rows of this popup.
export function rootMenuRows(xml){
 const rows=[];let depth=0;
 for(const token of xml.match(/<Menu\b[^>]*>|<\/Menu\s*>|<Program\b[^>]*>[\s\S]*?<\/Program\s*>|<Separator\s*\/>/g)||[]){
  if(/^<Menu\b/.test(token)){if(depth===0)rows.push(token);depth++;}
  else if(/^<\/Menu/.test(token)){assert(depth>0,'Unbalanced JWM menu');depth--;}
  else if(depth===0){assert(!token.startsWith('<Separator'),'Variable-height root separator needs explicit geometry');rows.push(token);}
 }
 assert.equal(depth,0,'Unbalanced JWM menu');return rows;
}
export async function clickMenuEntry(s,id){
 assert(/^[A-Za-z0-9._-]+\.desktop$/.test(id));
 const menu=await s.command('sh /usr/local/share/jwm/app-menu.sh');
 const items=rootMenuRows(menu);
 const index=items.findIndex(line=>line.includes(' launch '+id+'<'));
 assert(index>=0,'Installed owned entry missing from JWM menu: '+id);
 const canvas=await visibleCanvas(s.page);
 await canvas.click({position:await canvasPosition(canvas,{x:10,y:585})});
 const geometry=await observe(s,'menu');
 await canvas.click({position:await canvasPosition(canvas,{x:geometry.x+geometry.width/2,y:geometry.y+1+(index+0.5)*(geometry.height-2)/(items.length+2)})});
 return {id,index,geometry,menu};
}
