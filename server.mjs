import http from 'node:http';
import { readFile, writeFile, mkdir, rename, stat } from 'node:fs/promises';
import { resolve, extname, dirname } from 'node:path';
import { randomBytes, createHash, timingSafeEqual } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root=dirname(fileURLToPath(import.meta.url));
try{process.loadEnvFile(resolve(root,'.env'));}catch(e){if(e.code!=='ENOENT')throw e;}
const data=resolve(process.env.DATA_DIR || resolve(root,'.data'));
await mkdir(resolve(data,'uploads'),{recursive:true,mode:0o700});
const contentFile=resolve(data,'stories.json');
try{await stat(contentFile);}catch(e){if(e.code!=='ENOENT')throw e;await writeFile(contentFile,await readFile(resolve(root,'content/stories.json')),{flag:'wx',mode:0o600});}
const password=process.env.ADMIN_PASSWORD || '';
if(password.length<12)console.warn('Redaktorius užrakintas: nustatykite ADMIN_PASSWORD (bent 12 simbolių). Vieša lentyna veikia.');
const sessions=new Map(), attempts=new Map();
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.ico':'image/x-icon'};
const digest=s=>createHash('sha256').update(s).digest();
let mutation=Promise.resolve();
async function exclusive(fn){const next=mutation.then(fn);mutation=next.catch(()=>{});return next;}
async function load(){return JSON.parse(await readFile(contentFile,'utf8'));}
async function save(stories){const tmp=contentFile+'.tmp';await writeFile(tmp,JSON.stringify(stories,null,2),{mode:0o600});await rename(tmp,contentFile);}
function fail(status,message){throw Object.assign(new Error(message),{status});}
function json(res,status,body){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(body));}
async function body(req,limit=600000){let size=0;const chunks=[];for await(const chunk of req){size+=chunk.length;if(size>limit)fail(413,'Failas arba tekstas per didelis.');chunks.push(chunk);}return Buffer.concat(chunks);}
async function input(req){try{const value=JSON.parse((await body(req)).toString());if(!value||typeof value!=='object'||Array.isArray(value))fail(400,'Netaisyklingi duomenys.');return value;}catch(e){if(e.status)throw e;fail(400,'Netaisyklingi duomenys.');}}
function session(req){const token=req.headers.cookie?.split(';').map(x=>x.trim()).find(x=>x.startsWith('evi_session='))?.slice(12);const s=sessions.get(token);if(!s||s.expires<Date.now()){sessions.delete(token);return null;}return {token,...s};}
function text(v,name,max,required=true){if(typeof v!=='string'||v.length>max||(required&&!v.trim()))fail(400,`Patikrinkite lauką „${name}“.`);return v.trim();}
function validate(v,id){
 const title=text(v.title,'Pavadinimas',180),topic=text(v.topic,'Tema',70),desc=text(v.desc,'Aprašymas',500),note=text(v.note??'','Pastaba suaugusiesiems',15000,false);
 if(!Array.isArray(v.body)||!v.body.length||v.body.length>1000)fail(400,'Įrašykite pasakos tekstą.');
 const paragraphs=v.body.map(p=>text(p,'Pasakos pastraipa',30000));if(paragraphs.join('').length>200000)fail(400,'Pasakos tekstas per ilgas.');
 if(!['draft','published'].includes(v.status))fail(400,'Pasirinkite būseną.');
 if(!['night','pink','garden'].includes(v.color))fail(400,'Pasirinkite viršelio spalvą.');
 const image=text(v.image??'','Iliustracija',200,false);if(image&&!/^\/uploads\/[a-f0-9]{32}\.(png|jpg|webp)$/.test(image))fail(400,'Įkelkite iliustraciją redaktoriuje.');
 return {id,title,topic,desc,body:paragraphs,note,status:v.status,color:v.color,image,imageAlt:text(v.imageAlt??'','Iliustracijos aprašymas',400,false),sample:!!v.sample,time:Math.max(1,Math.ceil(paragraphs.join(' ').split(/\s+/).length/150)),updatedAt:new Date().toISOString()};
}
const server=http.createServer(async(req,res)=>{
 res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','same-origin');res.setHeader('X-Frame-Options','DENY');
 try{
  const url=new URL(req.url,'http://localhost'), path=url.pathname, method=req.method;
  if(path.startsWith('/api/')){
   if(!['GET','HEAD'].includes(method)){
    const origin=req.headers.origin;
    if(origin){let host;try{host=new URL(origin).host;}catch{fail(403,'Neleistina užklausa.');}if(host!==req.headers.host)fail(403,'Neleistina užklausos kilmė.');}
    if(req.headers['sec-fetch-site']==='cross-site')fail(403,'Neleistina užklausa.');
   }
   if(path==='/api/stories'&&method==='GET')return json(res,200,(await load()).filter(s=>s.status==='published'));
   if(path==='/api/session'&&method==='GET')return json(res,200,{authenticated:!!session(req),configured:password.length>=12});
   if(path==='/api/login'&&method==='POST'){
    if(password.length<12)fail(503,'Redaktorius dar neaktyvuotas. Hostingo nustatymuose pridėkite ADMIN_PASSWORD (bent 12 simbolių) ir paleiskite serverį iš naujo.');
    const key=req.socket.remoteAddress,now=Date.now();let a=attempts.get(key);if(!a||a.until<now)a={count:0,until:now+15*60*1000};attempts.set(key,a);if(a.count>=10)fail(429,'Per daug bandymų. Palaukite 15 minučių.');
    const v=await input(req);if(typeof v.password!=='string'||!timingSafeEqual(digest(v.password),digest(password))){a.count++;fail(401,'Neteisingas slaptažodis.');}
    attempts.delete(key);for(const [key,value] of sessions)if(value.expires<now)sessions.delete(key);
    const token=randomBytes(32).toString('hex');sessions.set(token,{expires:now+8*60*60*1000});
    const secure=!!req.socket.encrypted||req.headers['x-forwarded-proto']==='https';
    res.setHeader('Set-Cookie',`evi_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800${secure?'; Secure':''}`);return json(res,200,{ok:true});
   }
   const auth=session(req);if(!auth)fail(401,'Prisijunkite prie redaktoriaus.');
   if(method!=='GET'&&req.headers['x-evi-editor']!=='1')fail(403,'Neleistina redaktoriaus užklausa.');
   if(path==='/api/logout'&&method==='POST'){sessions.delete(auth.token);res.setHeader('Set-Cookie','evi_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0');return json(res,200,{ok:true});}
   if(path==='/api/admin/stories'&&method==='GET')return json(res,200,await load());
   if(path==='/api/admin/uploads'&&method==='POST'){
    const b=await body(req,8*1024*1024);let ext;
    if(b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))ext='png';
    else if(b[0]===255&&b[1]===216&&b[2]===255)ext='jpg';
    else if(b.toString('ascii',0,4)==='RIFF'&&b.toString('ascii',8,12)==='WEBP')ext='webp';
    else fail(400,'Pasirinkite PNG, JPG arba WebP iliustraciją. SVG ir kiti formatai nepriimami.');
    const filename=randomBytes(16).toString('hex')+'.'+ext;await writeFile(resolve(data,'uploads',filename),b,{mode:0o600});return json(res,201,{url:'/uploads/'+filename});
   }
   if(path==='/api/admin/stories'&&method==='POST'){
    const v=await input(req);return await exclusive(async()=>{const stories=await load();const story=validate(v,randomBytes(12).toString('hex'));stories.push(story);await save(stories);json(res,201,story);});
   }
   const match=path.match(/^\/api\/admin\/stories\/([a-zA-Z0-9-]+)$/);
   if(match&&['PUT','DELETE'].includes(method)){
    const v=await input(req);return await exclusive(async()=>{const stories=await load(),i=stories.findIndex(s=>s.id===match[1]);if(i<0)fail(404,'Pasaka nerasta.');
     if((stories[i].updatedAt||null)!==(v.expectedUpdatedAt||null))fail(409,'Pasaka jau pakeista kitame lange. Atnaujinkite sąrašą prieš redaguodami.');
     if(method==='DELETE'){stories.splice(i,1);await save(stories);return json(res,200,{ok:true});}
     stories[i]=validate(v,match[1]);await save(stories);return json(res,200,stories[i]);});
   }
   fail(404,'Toks veiksmas nerastas.');
  }
  if(method!=='GET'&&method!=='HEAD')fail(405,'Neleistinas metodas.');
  let file;
  if(path.startsWith('/uploads/')){
   if(!/^\/uploads\/[a-f0-9]{32}\.(png|jpg|webp)$/.test(path))fail(404,'Failas nerastas.');
   // Draft illustrations remain private until used by a published story.
   if(!session(req)&&!(await load()).some(s=>s.status==='published'&&s.image===path))fail(404,'Failas nerastas.');
   file=resolve(data,path.slice(1));
  }else{
   const safe=decodeURIComponent(path);file=resolve(root,'dist','.'+safe);
   if(path==='/'||path==='/admin/'||path==='/admin')file=resolve(root,'dist',path.startsWith('/admin')?'admin/index.html':'index.html');
   if(!file.startsWith(resolve(root,'dist')+'/'))fail(404,'Puslapis nerastas.');
  }
  const buffer=await readFile(file);res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream','Cache-Control':'no-cache'});res.end(method==='HEAD'?undefined:buffer);
 }catch(e){if(!e.status&&e.code!=='ENOENT')console.error('Serverio klaida:',e.message);json(res,e.status||(e.code==='ENOENT'?404:500),{error:e.status?e.message:e.code==='ENOENT'?'Failas nerastas.':'Nepavyko išsaugoti arba perskaityti duomenų. Bandykite dar kartą.'});}
});
server.listen(Number(process.env.PORT||3001),'0.0.0.0',()=>console.log(`Evi Tale serveris paruoštas (port ${server.address().port}).`));
