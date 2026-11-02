import {readdir, readFile, stat, mkdir, writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';

const allowed=new Set(['id','title','topic','status','color','sample','image','imageAlt','desc']);
export function parseStory(source,filename='pasaka.md'){
 const fail=message=>{throw new Error(`${filename}: ${message}`);};
 const normalized=source.replace(/\r\n/g,'\n');
 const match=normalized.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
 if(!match)fail('Pradžioje turi būti metaduomenys tarp dviejų --- eilučių.');
 const meta={};
 for(const line of match[1].split('\n')){
  if(!line.trim()||line.trim().startsWith('#'))continue;
  const field=line.match(/^([a-zA-Z]+):\s*(.*)$/);if(!field||!allowed.has(field[1]))fail(`Neatpažintas metaduomenų laukas: ${line}`);
  if(Object.hasOwn(meta,field[1]))fail(`Laukas ${field[1]} pakartotas.`);
  meta[field[1]]=field[2].trim();
 }
 for(const key of ['id','title','topic','status','color','desc'])if(!meta[key])fail(`Užpildykite lauką ${key}.`);
 if(!/^[a-z0-9-]+$/.test(meta.id))fail('id naudokite mažąsias lotyniškas raides, skaitmenis ir brūkšnelius.');
 if(!['published','draft'].includes(meta.status))fail('status turi būti published arba draft.');
 if(!['night','pink','garden'].includes(meta.color))fail('color turi būti night, pink arba garden.');
 if(meta.sample&&!['true','false'].includes(meta.sample))fail('sample turi būti true arba false.');
 if(meta.title.length>180||meta.desc.length>500)fail('Pavadinimas arba aprašymas per ilgas.');
 if(meta.image&&!/^illustrations\/[a-zA-Z0-9_/-]+\.(png|jpe?g|webp)$/i.test(meta.image))fail('image nurodykite kaip illustrations/failas.png (PNG, JPG arba WebP).');
 if(meta.image?.includes('..'))fail('Neleistinas iliustracijos kelias.');
 const parts=match[2].split(/^## Suaugusiesiems\s*$/m);if(parts.length>2)fail('Skyrius Suaugusiesiems gali būti tik vienas.');
 const body=parts[0].trim().split(/\n\s*\n/).map(p=>p.trim()).filter(Boolean);
 if(!body.length)fail('Pasakos tekstas tuščias.');
 return {id:meta.id,title:meta.title,topic:meta.topic,desc:meta.desc,status:meta.status,color:meta.color,sample:meta.sample==='true',image:meta.image||'',imageAlt:meta.imageAlt||'',body,note:parts[1]?.trim()||'',time:Math.max(1,Math.ceil(body.join(' ').split(/\s+/).length/150))};
}
export async function readStories(directory,publicDirectory){
 const names=(await readdir(directory)).filter(n=>n.endsWith('.md')).sort();
 if(!names.length)throw new Error('content/stories kataloge nėra pasakų.');
 const stories=[],ids=new Set();
 for(const name of names){
  const story=parseStory(await readFile(resolve(directory,name),'utf8'),name);
  if(ids.has(story.id))throw new Error(`${name}: id ${story.id} jau naudojamas.`);ids.add(story.id);
  if(story.image){const image=await stat(resolve(publicDirectory,story.image)).catch(()=>null);if(!image?.isFile())throw new Error(`${name}: iliustracija ${story.image} nerasta public kataloge.`);}
  stories.push(story);
 }
 return stories;
}
export async function buildContent(directory='content/stories',publicDirectory='public'){
 const stories=await readStories(directory,publicDirectory);
 const published=stories.filter(s=>s.status==='published');
 await mkdir(publicDirectory,{recursive:true});
 await writeFile(resolve(publicDirectory,'stories.json'),JSON.stringify(published.map(({status,...s})=>s),null,2)+'\n');
 return {published:published.length,drafts:stories.length-published.length};
}
