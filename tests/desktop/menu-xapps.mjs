// Observe live JWM geometry; all selection/input remains real browser events.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {visibleCanvas,canvasPosition} from '../migration/canvas.mjs';
const hash=b=>createHash('sha256').update(b).digest('hex');
export async function installObserver(s){
 const source=await readFile(new URL('./windows-xapps.c',import.meta.url));
 await s.page.evaluate(async text=>shell.busybox.write('/tmp/jwm-xapps-observe.c',new TextEncoder().encode(text)),source.toString());
 await s.command('cc /tmp/jwm-xapps-observe.c -I/usr/local/include -L/usr/local/lib -lX11 -lxcb -lXau -o /tmp/jwm-xapps-observe');
 return {observerSha256:hash(source),menuHelperSha256:hash(await readFile(new URL(import.meta.url)))};
}
export async function observe(s,mode,title,detail){
 assert(['wm','menu','window','absent','child','pixels','frame','mahjongg-tiles','puzzle-board','solo-board'].includes(mode));assert(!title||/^[A-Za-z0-9 ._-]+$/.test(title));
 let timer;
 if(['wm','menu'].includes(mode)){assert.equal(title,undefined);assert.equal(detail,undefined);}
 else assert(title,'Window title required');
 if(mode==='mahjongg-tiles')assert.equal(title,'XMahjongg');
 if(mode==='solo-board')assert.equal(title,'Solo');
 if(mode==='child'){assert(typeof detail==='string'&&/^\d+(\.\d+)*$/.test(detail)&&detail.length<128);const parts=detail.split('.');assert(parts.length<=16&&parts.every(p=>Number.isSafeInteger(Number(p))&&Number(p)<=4096));}
 else if(mode==='pixels'&&detail!==undefined)assert(/^\d+$/.test(String(detail))&&Number.isInteger(Number(detail))&&Number(detail)>0&&Number(detail)<=4096);
 else assert.equal(detail,undefined);
 const log=await Promise.race([s.command(`DISPLAY=:1 /tmp/jwm-xapps-observe ${mode}${title?` '${title}'`:''}${detail===undefined?'':` '${detail}'`}`),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('X observer exceeded 40 seconds; caller must close the session')),40000);})]).finally(()=>clearTimeout(timer));
 if(mode==='wm'||mode==='absent')return log;
 if(mode==='pixels'||mode==='mahjongg-tiles'||mode==='puzzle-board'||mode==='solo-board'){const m=log.match(/PIXELS (\d+) (\d+) (\d+) (\d+)/);assert(m,'Missing observed pixels');const [hash,different,width,height]=m.slice(1).map(Number);return {hash,different,width,height};}
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
