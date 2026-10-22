import {session} from './expansion-session.mjs';
import {writeFile,mkdir,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const s=await session();
try{
 for(const name of process.argv.slice(2)){
  if(!/^[a-z0-9-]+$/.test(name))throw Error('unsafe name');
  await s.command(`rm -f /home/user/export.tar\ngucman pack ${name} /home/user/export.tar`);
  const encoded=await s.page.evaluate(async()=>{const bytes=await shell.busybox.read('/home/user/export.tar');const chunks=[];for(let i=0;i<bytes.length;i+=16383)chunks.push(btoa(String.fromCharCode(...bytes.subarray(i,i+16383))));return chunks.join('');});
  const bytes=Buffer.from(encoded,'base64'),hash=createHash('sha256').update(bytes).digest('hex');
  const dir=s.root+'apps/'+name+'/binaries';await mkdir(dir,{recursive:true});await writeFile(dir+'/'+hash+'.tar',bytes);
  const manifest=await s.page.evaluate(async name=>new TextDecoder().decode(await shell.busybox.read('/usr/local/lib/gucman/packages/'+name+'/current/manifest.json')),name);
  await writeFile(dir+'/receipt.json',JSON.stringify({runtime:s.runtime,sha256:hash,size:bytes.length,guestManifest:JSON.parse(manifest),method:'gucman pack from installed guest output; no host compilation'},null,2)+'\n');
  console.log('EXPORTED',name,hash,bytes.length);
 }
}finally{await s.close();}
