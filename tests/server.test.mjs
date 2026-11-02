import {test} from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {randomBytes} from 'node:crypto';

async function start(data,password){
 const process=spawn(globalThis.process.execPath,['server.mjs'],{env:{...globalThis.process.env,DATA_DIR:data,ADMIN_PASSWORD:password,PORT:'0'},stdio:['ignore','pipe','pipe']});
 const port=await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Server startup timeout')),10000);process.once('error',reject);process.stdout.on('data',chunk=>{const m=chunk.toString().match(/port (\d+)/);if(m){clearTimeout(timer);resolve(m[1]);}});process.once('exit',code=>{clearTimeout(timer);reject(new Error('Server stopped: '+code));});});
 return {process,url:'http://127.0.0.1:'+port};
}
async function stop(p){const done=new Promise(r=>p.once('exit',r));p.kill();await done;}
test('authenticated story publishing, image privacy and persistence',async t=>{
 const data=await mkdtemp(join(tmpdir(),'evitale-test-')),password=randomBytes(24).toString('hex');let server=await start(data,password),cookie='';
 const request=(path,method='GET',body,auth=true,headers={})=>fetch(server.url+path,{method,headers:{...(auth&&cookie?{Cookie:cookie}:{}),'X-Evi-Editor':'1',...(body?{'Content-Type':'application/json'}:{}),...headers},body:body===undefined?undefined:JSON.stringify(body)});
 try{
  await t.test('public stories work; anonymous visitors cannot access drafts or mutate',async()=>{
   const r=await request('/api/stories');assert.equal((await r.json()).length,3);
   assert.equal((await request('/api/admin/stories','GET',undefined,false)).status,401);
   assert.equal((await request('/api/admin/stories','POST',{},false)).status,401);
  });
  await t.test('login rejects wrong password and sets HttpOnly SameSite cookie',async()=>{
   assert.equal((await request('/api/login','POST',{password:'wrong'},false)).status,401);
   const r=await request('/api/login','POST',{password},false);assert.equal(r.status,200);const c=r.headers.get('set-cookie');assert.match(c,/HttpOnly/);assert.match(c,/SameSite=Strict/);cookie=c.split(';')[0];
  });
  let story,image;
  await t.test('upload validates file format; drafts and draft images stay private',async()=>{
   assert.equal((await fetch(server.url+'/api/admin/uploads',{method:'POST',headers:{Cookie:cookie,'X-Evi-Editor':'1'},body:'<svg/>'})).status,400);
   const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aV1cAAAAASUVORK5CYII=','base64');
   const upload=await fetch(server.url+'/api/admin/uploads',{method:'POST',headers:{Cookie:cookie,'X-Evi-Editor':'1'},body:png});assert.equal(upload.status,201);image=(await upload.json()).url;
   const r=await request('/api/admin/stories','POST',{title:'Testinė pasaka',topic:'Smalsumas',desc:'Aprašymas',body:['Pirma pastraipa.','Antra pastraipa.'],note:'Pastaba',status:'draft',color:'garden',image,imageAlt:'Daigelis',sample:false});assert.equal(r.status,201);story=await r.json();
   assert.equal((await(await request('/api/stories')).json()).some(s=>s.id===story.id),false);
   assert.equal((await fetch(server.url+image)).status,404);assert.equal((await fetch(server.url+image,{headers:{Cookie:cookie}})).status,200);
  });
  await t.test('publishing makes saved text and illustration visible to visitors',async()=>{
   const r=await request('/api/admin/stories/'+story.id,'PUT',{...story,status:'published',expectedUpdatedAt:story.updatedAt});assert.equal(r.status,200);story=await r.json();
   const published=(await(await request('/api/stories')).json()).find(s=>s.id===story.id);assert.equal(published.title,'Testinė pasaka');assert.equal(published.body.length,2);assert.equal((await fetch(server.url+image)).status,200);
  });
  await t.test('stale updates and cross-site writes are rejected',async()=>{
   assert.equal((await request('/api/admin/stories/'+story.id,'PUT',{...story,expectedUpdatedAt:null})).status,409);
   assert.equal((await request('/api/admin/stories/'+story.id,'PUT',story,true,{Origin:'https://other.example'})).status,403);
   assert.equal((await request('/api/admin/stories/'+story.id,'PUT',{...story,title:''})).status,409);
   assert.equal((await request('/api/admin/stories/'+story.id,'PUT',{...story,title:'',expectedUpdatedAt:story.updatedAt})).status,400);
  });
  await t.test('server restart preserves content; logout revokes editing access',async()=>{
   await stop(server.process);server=await start(data,password);
   assert.equal((await(await request('/api/stories')).json()).find(s=>s.id===story.id).title,'Testinė pasaka');
   const login=await request('/api/login','POST',{password},false);cookie=login.headers.get('set-cookie').split(';')[0];
   assert.equal((await request('/api/logout','POST')).status,200);assert.equal((await request('/api/admin/stories')).status,401);
  });
 }finally{await stop(server.process);await rm(data,{recursive:true,force:true});}
});
