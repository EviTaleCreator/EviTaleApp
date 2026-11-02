import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {parseStory,readStories,buildContent} from '../lib/content.mjs';

const fixture=`---
id: bandymas
title: Pasaka: apie drąsą
topic: Drąsa
status: draft
color: garden
sample: false
image:
imageAlt:
desc: Istorija skaitytojams.
---

Pirma pastraipa.

Antra pastraipa.

## Suaugusiesiems

Mintys tėvams.`;
test('text files retain paragraphs, metadata and adult notes',()=>{const s=parseStory(fixture);assert.equal(s.title,'Pasaka: apie drąsą');assert.equal(s.status,'draft');assert.equal(s.body.length,2);assert.equal(s.note,'Mintys tėvams.');assert.equal(s.sample,false);assert.equal(s.time,1);});
test('invalid content is rejected before publishing',()=>{
 for(const [from,to] of [['status: draft','status: hidden'],['id: bandymas','id: ../../secret'],['color: garden','color: unknown'],['image:','image: https://example.com/file.png'],['sample: false','sample: yes'],['desc: Istorija skaitytojams.','desc:']])assert.throws(()=>parseStory(fixture.replace(from,to)));
});
test('story IDs must be unique and illustrations must exist',async()=>{const dir=await mkdtemp(join(tmpdir(),'evi-content-'));try{await mkdir(join(dir,'stories'));await mkdir(join(dir,'public'));await writeFile(join(dir,'stories/a.md'),fixture);await writeFile(join(dir,'stories/b.md'),fixture);await assert.rejects(()=>readStories(join(dir,'stories'),join(dir,'public')),/jau naudojamas/);await rm(join(dir,'stories/b.md'));await writeFile(join(dir,'stories/a.md'),fixture.replace('image:','image: illustrations/missing.png'));await assert.rejects(()=>readStories(join(dir,'stories'),join(dir,'public')),/nerasta/);}finally{await rm(dir,{recursive:true,force:true});}});
test('repository stories are valid and ready for static publication',async()=>{const stories=await readStories('content/stories','public');assert.ok(stories.length>=3);assert.ok(stories.some(s=>s.status==='published'));});
test('static build output includes published text and omits drafts completely',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'evi-publish-'));try{
  await mkdir(join(dir,'stories'));await mkdir(join(dir,'public'));
  await writeFile(join(dir,'stories/private.md'),fixture.replace('Pirma pastraipa.','JUODRASTIS-NETURI-PATEKTI-I-SVETAINE'));
  await writeFile(join(dir,'stories/public.md'),fixture.replace('id: bandymas','id: viesas').replace('status: draft','status: published'));
  assert.deepEqual(await buildContent(join(dir,'stories'),join(dir,'public')),{published:1,drafts:1});
  const output=await readFile(join(dir,'public/stories.json'),'utf8');assert.equal(output.includes('JUODRASTIS-NETURI-PATEKTI-I-SVETAINE'),false);
  const stories=JSON.parse(output);assert.equal(stories.length,1);assert.equal(stories[0].id,'viesas');assert.equal(stories[0].body.length,2);assert.equal(stories[0].note,'Mintys tėvams.');
 }finally{await rm(dir,{recursive:true,force:true});}
});
