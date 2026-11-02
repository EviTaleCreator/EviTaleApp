import assert from 'node:assert/strict';

const site=process.env.PAGES_URL;
assert.ok(site,'PAGES_URL must point to the deployed website.');
async function read(path){
 const url=new URL(path,site);
 assert.equal(url.origin,new URL(site).origin,'Verify only same-origin site assets.');
 const response=await fetch(url,{cache:'no-store'});
 assert.equal(response.status,200,`${url.pathname} returned HTTP ${response.status}`);
 return response;
}
async function check(){
 const html=await(await read(site)).text();
 const scripts=[...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map(m=>m[1]);
 assert.ok(scripts.some(s=>s.includes('/assets/')&&s.endsWith('.js')),'The live page must use compiled JavaScript assets.');
 assert.equal(html.includes('src="/src.js"'),false,'Live site is publishing repository source instead of the built artifact.');
 await Promise.all(scripts.map(async s=>{const response=await read(s);assert.match(response.headers.get('content-type')||'',/javascript/,'JavaScript must be served with a JavaScript MIME type.');}));
 const css=[...html.matchAll(/<link[^>]+href="([^"]+\.css)"/g)].map(m=>m[1]);
 assert.ok(css.length,'Live page must load its stylesheet.');
 await Promise.all(css.map(s=>read(s)));
 const stories=await(await read('stories.json')).json();assert.ok(Array.isArray(stories),'Live catalog must contain valid JSON.');
 await read('illustrations/red-thread-bird.png');
 console.log(`::notice title=Live Pages verified::${site} serves compiled JavaScript, CSS, illustration and ${stories.length} published stories.`);
}
let error;
for(let attempt=0;attempt<6;attempt++){
 try{await check();error=null;break;}catch(e){error=e;if(attempt<5)await new Promise(r=>setTimeout(r,5000));}
}
if(error)throw error;
