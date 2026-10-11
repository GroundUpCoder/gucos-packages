// Private B byte oracle. No guest/browser/app actions. No TAR parsing or claim.
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {readFile,lstat} from 'node:fs/promises';
export const fixture=Buffer.from('Xarchiver bzip2 fixture v1\n0123456789abcdef\n'.repeat(16));
export const fixtureSha256='d3bb834b4ecb3448ba96eb107faad279ee47bc647ca4a93bf68cb0b39f7788c4';
export const sha=b=>createHash('sha256').update(b).digest('hex');
assert.equal(fixture.length,704);assert.equal(sha(fixture),fixtureSha256);
export async function regularBytes(path,max){
 const a=await lstat(path);assert(a.isFile()&&!a.isSymbolicLink()&&a.size>0&&a.size<=max,'Bounded regular evidence file');
 const b=await readFile(path),z=await lstat(path);assert(z.isFile()&&!z.isSymbolicLink());
 assert.equal(z.dev,a.dev);assert.equal(z.ino,a.ino);assert.equal(z.size,a.size);assert.equal(z.mtimeMs,a.mtimeMs);assert.equal(z.ctimeMs,a.ctimeMs);assert.equal(b.length,a.size);
 return b;
}
export function verifyStream(bytes){
 assert(Buffer.isBuffer(bytes)&&bytes.length>0&&bytes.length<=65536,'Compressed fixture cap');
 assert.equal(bytes.subarray(0,4).toString(),'BZh9','Explicit level 9 stream');
 const result=JSON.parse(execFileSync('python3',['-c',`import sys,bz2,hashlib,json
b=sys.stdin.buffer.read(65537)
assert 0<len(b)<=65536
assert b[:4]==b'BZh9'
d=bz2.BZ2Decompressor()
out=d.decompress(b,max_length=705)
assert len(out)==704, 'wrong or excessive decompressed size'
assert d.eof, 'truncated or excessive stream'
assert not d.unused_data, 'concatenated stream or trailing data'
expected=b'Xarchiver bzip2 fixture v1\\n0123456789abcdef\\n'*16
assert out==expected, 'fixture bytes differ'
print(json.dumps({'size':len(b),'sha256':hashlib.sha256(b).hexdigest(),'decodedSize':len(out),'decodedSha256':hashlib.sha256(out).hexdigest(),'singleStream':True}))`],{input:bytes,timeout:5000,maxBuffer:8192,stdio:['pipe','pipe','pipe']}).toString());
 assert.equal(result.sha256,sha(bytes));assert.equal(result.decodedSha256,fixtureSha256);return result;
}
export function exactFixture(bytes){assert(bytes.equals(fixture),'Exact unchanged 704-byte fixture');}
