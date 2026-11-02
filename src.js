import './style.css';

import { escapeHtml as esc } from './shared.js';
const editorMode=import.meta.env.MODE==='editor';
const asset=path=>import.meta.env.BASE_URL+path.replace(/^\//,'');
let stories = [];
function cover(s) { return s.image ? `<img class="story-cover" src="${esc(editorMode?s.image:asset(s.image))}" alt="${esc(s.imageAlt || s.title)}" loading="lazy">` : art(s.color); }

let filter='Visos pasakos',query='';

function art(type, cls='') {return `<div class="art ${type} ${cls}" aria-hidden="true"><div class="moon"></div><div class="stars">✦ · ˚　 ✧<br>　 ·　 ✦　 ·</div><div class="hill back"></div><div class="hill front"></div><div class="tree t1"></div><div class="tree t2"></div><div class="animal"><i class="ear e1"></i><i class="ear e2"></i><i class="face"></i><i class="eye"></i><i class="nose"></i><i class="tail"></i></div><div class="sprigs">✧　╱　✧</div></div>`}
document.querySelector('#app').innerHTML=`
<header><a href="#" class="brand" aria-label="Evi Tale Creator pradžia"><span class="brand-icon">✳</span><span>Evi Tale<span class="brand-small">C R E A T O R</span></span></a><nav aria-label="Pagrindinis meniu"><a href="#lentyna" class="active">Pasakų lentyna</a><a href="#apie">Apie projektą</a><a href="#ateitis">Kas laukia toliau <span class="tiny-dot"></span></a></nav><a class="saved-nav" id="saved-nav" href="#lentyna"><span>Mano lentyna</span></a></header>
<main><section class="hero"><svg class="story-thread" viewBox="0 0 1200 120" fill="none" aria-hidden="true"><path d="M-20 70C130 10 195 118 350 65S575 35 640 70 720 116 770 69 803 10 840 41 812 111 860 89 1020 15 1220 52" stroke="currentColor" stroke-width="2"/></svg><div class="hero-copy"><div class="eyebrow"><span></span> MAŽIEMS SKAITYTOJAMS. DIDELIEMS ATRADIMAMS.</div><h1>Maža istorija.<br>Dideli <em>atradimai.</em></h1><p>Sek paskui istorijos siūlą – į pasaulį, kuriame<br>telpa vaizduotė, dideli jausmai ir truputis tavęs.</p><a class="primary" href="#lentyna">Atrasti savo pasaką <span aria-hidden="true">→</span></a><div class="hero-foot"><span>✧</span> 8–12 metų vaikams ir jų suaugusiesiems</div></div><div class="hero-visual"><img class="hero-illustration" src="${asset('illustrations/red-thread-bird.png')}" alt="Melsvas paukštelis ant gudobelės šakos, prie kurios pririštas raudonas siūlas" width="1536" height="1024"><div class="floating-note"><span>✦</span> Kiekvienas siūlas veda į istoriją.</div><span class="orbit">✧</span></div></section>
<div class="values"><span>❋ <b>Vaizduotę pažadinančios istorijos</b></span><span>♡ <b>Erdvė jausmams ir pokalbiams</b></span><span>✧ <b>Žmogaus kūryba, AI galimybės</b></span></div>
<section class="library" id="lentyna"><div class="section-heading"><div><div class="eyebrow">ATSIVERSK NAUJĄ PASAULĮ</div><h2>Pasakų lentyna<span>.</span></h2></div><p>Pasirink istoriją pagal tai,<br>kas šiandien gyvena širdyje.</p></div><div class="controls"><div class="filters" role="group" aria-label="Pasakų temos">${['Visos pasakos','Emocijos','Draugystė','Savęs pažinimas'].map((x,i)=>`<button class="filter ${i===0?'selected':''}" data-filter="${x}">${x}</button>`).join('')}</div><label class="search"><span>⌕</span><input id="search" type="search" placeholder="Ieškoti pasakos…" aria-label="Ieškoti pasakos"></label></div><div class="cards" id="cards"></div><p class="sample-note">Kiekviena istorija – naujas atradimas</p></section>
<section class="about" id="apie"><div class="about-symbol">❋<span>maža istorija.<br>didelis pasaulis.</span></div><div><div class="eyebrow">DAUGIAU NEI „GYVENO KARTĄ“</div><h2>Vaikams – nuotykis.<br>Suaugusiesiems – <em>proga išgirsti.</em></h2><p>„Evi Tale Creator“ – autorinių ir kartu su dirbtiniu intelektu kuriamų pasakų namai. Čia istorijos kviečia pažinti jausmus, priimti savo išskirtinumą ir atrasti ryšį.</p><p>Skaitykite kartu arba leiskite vaikui atrasti pačiam. Kartais vienas pasakos sakinys tampa gražaus pokalbio pradžia.</p><span class="signature">Su smalsumu ir šiluma, Evi <span>♡</span></span></div></section>
<section class="future" id="ateitis"><div><div class="eyebrow">LENTYNA AUGA KARTU SU JUMIS</div><h2>Dar daugiau magijos – pakeliui.</h2><p>Šiandien skaitome. Rytoj istorijos įgaus naujų balsų ir formų.</p></div><div class="future-grid"><article><span>♬</span><small>PLANUOJAMA</small><h3>Pasakos, kurios prabyla</h3><p>AI balsu įgarsintos istorijos ramiam vakarui ir klausymui kartu.</p></article><article><span>☀</span><small>ATEITIES MOKAMOS GALIMYBĖS</small><h3>Dar artimiau jūsų šeimai</h3><p>Adaptacijos jaunesniems, pokalbių gairės tėvams, vaiko paskyra ir gausesnė lentyna.</p></article><article><span>▷</span><small>PLANUOJAMA</small><h3>Atgyjančios iliustracijos</h3><p>Trumpi vaizdo pasakojimai, leidžiantys dar giliau pasinerti į istoriją.</p></article></div></section>
</main><footer><a class="brand" href="#"><span class="brand-icon">✳</span><span>Evi Tale<span class="brand-small">C R E A T O R</span></span></a><p>Istorijos, kurios augina. Kartu.</p><span>© ${new Date().getFullYear()} Evi Tale Creator · <a href="${editorMode?'/admin/':'https://github.com/EviTaleCreator/EviTaleApp/tree/main/content/stories'}">${editorMode?'Turinio redaktorius':'Redaguoti pasakas „GitHub“'}</a></span></footer><dialog id="reader"><div id="reader-content"></div></dialog>`;

function render(){
 const list=stories.filter(s=>(filter==='Visos pasakos'||s.topic===filter)&&(s.title+' '+s.topic).toLocaleLowerCase('lt').includes(query.toLocaleLowerCase('lt')));
 document.querySelector('#cards').innerHTML=list.length?list.map(s=>`<article class="card"><button class="cover-button" data-read="${esc(s.id)}" aria-label="Skaityti: ${esc(s.title)}">${cover(s)}<span class="cover-title">EVI TALE CREATOR<span>${esc(s.title)}</span><i>Mažos istorijos dideliems atradimams</i></span></button><div class="card-meta"><span>${esc(s.topic)}</span><span>◷ ${s.time} min. skaitymo</span></div><h3><button data-read="${esc(s.id)}">${esc(s.title)}</button></h3><p>${esc(s.desc)}</p><button class="read-link" data-read="${esc(s.id)}">Skaityti pasaką <span aria-hidden="true">→</span></button></article>`).join(''):'<div class="empty"><span>✧</span><h3>Čia dar tylu</h3><p>Pabandykite kitą paiešką arba pasirinkite kitą temą.</p><button class="primary" id="reset">Rodyti visas pasakas</button></div>';
}
document.addEventListener('click',e=>{
 const f=e.target.closest('[data-filter]');if(f){filter=f.dataset.filter;document.querySelectorAll('[data-filter]').forEach(b=>b.classList.toggle('selected',b===f));render();}
 const read=e.target.closest('[data-read]');if(read)openStory(read.dataset.read);
 if(e.target.closest('#close-reader'))document.querySelector('#reader').close();
 if(e.target.closest('#reset')){filter='Visos pasakos';query='';document.querySelector('#search').value='';document.querySelectorAll('[data-filter]').forEach(b=>b.classList.toggle('selected',b.dataset.filter===filter));render();}
});
document.querySelector('#search').addEventListener('input',e=>{query=e.target.value;render();});
const dialog=document.querySelector('#reader');dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
function openStory(id){const s=stories.find(s=>s.id===id);document.querySelector('#reader-content').innerHTML=`<button class="close" id="close-reader" aria-label="Uždaryti pasaką">×</button><div class="reader-heading">${cover(s)}<span class="eyebrow">${esc(s.topic)} · 8–12 metų · ${s.time} min.</span><h2>${esc(s.title)}</h2><p class="demo-label">${s.sample ? 'Pavyzdinė pasaka · Evi Tale Creator prototipas' : 'Evi Tale Creator · Pasaka jūsų šeimai'}</p></div><div class="story-text">${s.body.map(p=>`<p>${esc(p)}</p>`).join('')}<div class="story-end">✧</div>${s.note?`<details><summary>Suaugusiesiems: tarp pasakos eilučių</summary><p>${esc(s.note)}</p><p>Galite paklausti: „Kuri istorijos vieta tau įsiminė?“ Atsakymo skubinti nereikia.</p></details>`:''}<p class="audio-note">♬ Įgarsinimas planuojamas. Šiuo metu pasaką galima skaityti.</p></div>`;dialog.showModal();dialog.scrollTop=0;}
async function loadStories() {
 try {
  const response=await fetch(editorMode?'/api/stories':asset(`stories.json?v=${__CONTENT_VERSION__}`),{cache:'no-store'});
  if(!response.ok) throw new Error('Nepavyko įkelti pasakų');
  stories=await response.json(); render();
  const topics=['Visos pasakos',...new Set(stories.map(s=>s.topic))];
  document.querySelector('.filters').innerHTML=topics.map(x=>`<button class="filter ${x===filter?'selected':''}" data-filter="${esc(x)}">${esc(x)}</button>`).join('');
 } catch {
  document.querySelector('#cards').innerHTML='<div class="empty"><h3>Pasakų nepavyko įkelti</h3><p>Pabandykite atnaujinti puslapį po akimirkos.</p><button class="primary" id="retry-stories">Bandyti dar kartą</button></div>';
 }
}
document.addEventListener('click',e=>{if(e.target.closest('#retry-stories'))loadStories();});
loadStories();
