import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import {resolve} from 'node:path';

const base=process.env.PAGES_BASE_PATH||'/EviTaleApp/';
const html=await readFile('dist/index.html','utf8');
const references=[...html.matchAll(/(?:src|href)="([^"]+)"/g)].map(m=>m[1]);
assert.ok(references.some(path=>path.endsWith('.js')),'Built HTML must load JavaScript.');
assert.equal(html.includes('/src.js'),false,'Deploy the compiled dist directory, not repository source.');
for(const path of references){
 if(!path.startsWith('/')||path.startsWith('//'))continue;
 assert.ok(path.startsWith(base),`Asset must use the Pages base path: ${path}`);
 await access(resolve('dist',path.slice(base.length)));
}
const stories=JSON.parse(await readFile('dist/stories.json','utf8'));
assert.ok(Array.isArray(stories),'The deployed story catalog must be JSON.');
for(const story of stories){
 assert.ok(story.title&&Array.isArray(story.body)&&story.body.length,'Published stories must contain readable text.');
 if(story.image)await access(resolve('dist',story.image));
}
await access('dist/illustrations/red-thread-bird.png');
try{await access('dist/admin/index.html');assert.fail('The server-only editor must not be deployed to Pages.');}catch(e){if(e.code!=='ENOENT')throw e;}
console.log(`PASS Pages artifact: ${references.length} asset references, ${stories.length} stories, correct base path, no source entry point or server editor.`);
