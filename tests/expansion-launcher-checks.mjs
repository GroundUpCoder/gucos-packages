import {session} from './expansion-session.mjs';
import {readFile} from 'node:fs/promises';
const s=await session();
try{
 await s.command(await readFile(new URL('expansion-launcher.sh',import.meta.url),'utf8'));
 await s.command(await readFile(new URL('expansion-readiness.sh',import.meta.url),'utf8'));
}finally{await s.close();}
