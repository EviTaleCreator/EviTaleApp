import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readStories} from '../lib/content.mjs';

const site=process.env.PAGES_URL;
assert.ok(site,'PAGES_URL must point to the deployed website.');
const expected=(await readStories('content/stories','public')).filter(s=>s.status==='published').map(({status,...s})=>s);
const version=createHash('sha256').update(JSON.stringify(expected,null,2)+'\n').digest('hex').slice(0,16);
async function read(path){
 const url=new URL(path,site);
 assert.equal(url.origin,new URL(site).origin,'Verify only same-origin site assets.');
 const response=await fetch(url,{cache:'no-store'});
 assert.equal(response.status,200,`${url.pathname} returned HTTP ${response.status}`);
 return response;
}
async function check(){
 const pageUrl=new URL(site);pageUrl.searchParams.set('v',version);
 const html=await(await read(pageUrl.href)).text();
 const scripts=[...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map(m=>m[1]);
 assert.ok(scripts.some(s=>s.includes('/assets/')&&s.endsWith('.js')),'The live page must use compiled JavaScript assets.');
 assert.equal(html.includes('src="/src.js"'),false,'Live site is publishing repository source instead of the built artifact.');
 const source=await Promise.all(scripts.map(async s=>{const response=await read(s);assert.match(response.headers.get('content-type')||'',/javascript/,'JavaScript must be served with a JavaScript MIME type.');return response.text();}));
 assert.ok(source.some(text=>text.includes(version)),'The published JavaScript must match the current content version.');
 const css=[...html.matchAll(/<link[^>]+href="([^"]+\.css)"/g)].map(m=>m[1]);
 assert.ok(css.length,'Live page must load its stylesheet.');
 await Promise.all(css.map(s=>read(s)));
 const stories=await(await read(`stories.json?v=${version}`)).json();assert.deepEqual(stories,expected,'Published stories must exactly match the current repository content.');
 await Promise.all(stories.filter(s=>s.image).map(s=>read(s.image)));
 await read('illustrations/red-thread-bird.png');
 console.log(`::notice title=Live Pages verified::${site}?v=${version} serves the current content version, compiled JavaScript, CSS, illustrations and ${stories.length} stories: ${stories.map(s=>s.title).join('; ')}.`);
}
let error;
for(let attempt=0;attempt<6;attempt++){
 try{await check();error=null;break;}catch(e){error=e;if(attempt<5)await new Promise(r=>setTimeout(r,5000));}
}
if(error)throw error;
