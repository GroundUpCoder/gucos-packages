// Host input coordinates for the current core's letterboxed graphical VT.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
export const canvasHelperSha256=createHash('sha256').update(await readFile(new URL(import.meta.url))).digest('hex');
export async function visibleCanvas(page){
 const canvas=page.locator('.vt:visible canvas');
 await canvas.first().waitFor({state:'visible',timeout:10000});
 assert.equal(await canvas.count(),1,'Exactly one active graphical VT canvas');
 return canvas;
}
export async function canvasPosition(canvas,{x,y}){
 const g=await canvas.evaluate(element=>{
  const r=element.getBoundingClientRect();
  return {boxWidth:r.width,boxHeight:r.height,
   width:Number(element.dataset.logicalWidth)||element.width,
   height:Number(element.dataset.logicalHeight)||element.height,
   fit:getComputedStyle(element).objectFit};
 });
 assert.equal(g.fit,'contain');
 assert([g.boxWidth,g.boxHeight,g.width,g.height].every(n=>Number.isFinite(n)&&n>0));
 assert(Number.isFinite(x)&&Number.isFinite(y)&&x>=0&&y>=0&&x<g.width&&y<g.height,'Point outside logical canvas');
 const scale=Math.min(g.boxWidth/g.width,g.boxHeight/g.height);
 return {x:(g.boxWidth-g.width*scale)/2+x*scale,y:(g.boxHeight-g.height*scale)/2+y*scale};
}
