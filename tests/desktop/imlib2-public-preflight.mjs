// Private B adaptation, independently reviewed before copying/execution.
// Host-only verification of public URL rebinding. No fetch, mutation or guest actions.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const sha=b=>createHash('sha256').update(b).digest('hex');
const prefix='https://raw.githubusercontent.com/GroundUpCoder/gucos-packages/';
const artifact='d7e0823581298bf91e5ce09cac79c1c95fab4ced';
const manifestCommit='13421d9c28b7b2b58d8184a0e9989b88a8076ac6';
const reviewedCatalog='a50ac305be3456843987c4ee02e4a6a10fecca90';
const pins={
 imlib2:{url:prefix+manifestCommit+'/apps/imlib2/package.json',sha256:'163a29eb8a9258dec73b72dd50a3b97822d36dff8f44e8f01cfeb10daf3d89d9',size:3425},
 feh:{url:prefix+manifestCommit+'/apps/feh/package.json',sha256:'fb693d96be7ec922e5f826b1ae6a47254ca4ee281c3635605744d3efe5510acc',size:3354},
};
export async function verifyPublicPreflight({repo,config,name,candidate,cachedBytes}){
 assert(Object.hasOwn(pins,name));assert(!config.dist&&typeof config.inputDist==='string'&&config.inputDist.startsWith('/'),'Explicit public inputDist required');
 assert.equal(config.url,'https://os.groundupcoder.com/');
 assert(/^[a-f0-9]{40}$/.test(config.catalogCommit||''));
 assert.equal(config.catalogUrl,prefix+config.catalogCommit+'/catalog.json');
 assert.equal(config.inputCommit,artifact,'Reviewed artifact revision required');
 assert.equal(config.expectedRuntime,'19609f47c28f9d81c12ad6525d65347057ad5ad2ddec5eb48f5762a922d72441');
 const git=(rev,path)=>execFileSync('git',['show',rev+':'+path],{cwd:repo,timeout:10000,maxBuffer:8*1024*1024,stdio:['ignore','pipe','pipe']});
 const catalogBytes=git(config.catalogCommit,'catalog.json'),catalog=JSON.parse(catalogBytes);
 const reviewed=JSON.parse(git(reviewedCatalog,'catalog.json'));
 // The final merged catalog may preserve other accepted upgrades. Bind these two exact entries only;
 // independent root/reviewer approval of the full merged catalog remains separately required.
 for(const app of ['imlib2','feh']){assert.deepEqual(reviewed.packages[app],pins[app]);assert.deepEqual(catalog.packages[app],pins[app]);}
 const manifestBytes=git(manifestCommit,'apps/'+name+'/package.json');
 assert.equal(manifestBytes.length,pins[name].size);assert.equal(sha(manifestBytes),pins[name].sha256);
 const manifest=JSON.parse(manifestBytes);assert.deepEqual(candidate,manifest,'Exact reviewed public manifest required');
 const cached=JSON.parse(cachedBytes);
 const match=/^(http:\/\/127\.0\.0\.1:[1-9][0-9]{0,4})\/migration\/(imlib2|feh)\/binary\.tar$/.exec(cached.binary?.url||'');
 assert(match&&match[2]===name,'Original local binary cache URL required');
 assert(Number(new URL(match[1]).port)<=65535);
 const cachePrefix=match[1]+'/migration/'+name+'/';
 const rebound=structuredClone(cached);
 assert(Array.isArray(rebound.files)&&rebound.files.length===manifest.files.length);
 for(let i=0;i<rebound.files.length;i++){
  const local=rebound.files[i],pub=manifest.files[i];
  assert.equal(local.path,pub.path);assert.equal(local.url,cachePrefix+pub.path);
  assert.equal(pub.url,prefix+artifact+'/apps/'+name+'/'+pub.path);
  local.url=pub.url; // Only these URL values may differ; all other fields remain exact.
 }
 assert.equal(manifest.binary.url,prefix+artifact+'/apps/'+name+'/binaries/'+manifest.binary.sha256+'.tar');
 rebound.binary.url=manifest.binary.url;
 assert.deepEqual(rebound,manifest,'Cached/public contracts differ beyond permitted URLs');
 // Read and verify every cached input; existing driver also verifies binary and exported payloads.
 const base=resolve(config.inputDist,'migration',name);
 for(const f of manifest.files){assert(/^[A-Za-z0-9_.-]+$/.test(f.path));const bytes=await readFile(resolve(base,f.path));assert.equal(bytes.length,f.size);assert.equal(sha(bytes),f.sha256);}
 return {catalogCommit:config.catalogCommit,catalogSha256:sha(catalogBytes),reviewedCatalog,manifestCommit,manifestSha256:sha(manifestBytes),manifestSize:manifestBytes.length,artifactCommit:artifact,cachedManifestSha256:sha(cachedBytes),allowedDifference:'files[].url and binary.url only',verifiedInputCount:manifest.files.length};
}
