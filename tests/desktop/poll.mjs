// Playwright 1.63 waitForFunction treats an async predicate's Promise as truthy
// before resolving it. Poll awaited page.evaluate results explicitly instead.
export async function poll(page,predicate,arg,timeout=45000){
 let timer;
 try{
  return await Promise.race([(async()=>{
   for(;;){const result=await page.evaluate(predicate,arg);if(result)return result;await page.waitForTimeout(100);}
  })(),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('Async browser predicate timed out')),timeout);})]);
 }finally{clearTimeout(timer);}
}
