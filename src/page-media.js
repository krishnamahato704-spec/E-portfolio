import {esc,safeUrl,img,imageUrl} from './view-helpers.js?v=editorial-20261004';
import {observationJournal,amityJournalResource} from './amity-journal.js?v=editorial-20261004';

// Media comes from the current published record, so removing it also removes
// its decorative use. Never substitute a hard-coded gallery photograph.
export const galleryRecord=(c,...ids)=>ids.map(id=>c.gallery.find(x=>x.id===id)).find(Boolean);
export function photoBackdrop(record,base,cls=''){
 return record?.image?`<div class="page-photo-backdrop ${cls}" aria-hidden="true">${img(record.image,'',base)}</div>`:'';
}
export function photoPlate(record,base,cls='',priority=false,deferred=false){
 if(!record?.image)return '';
 return `<figure class="photo-plate ${cls}"><a href="${esc(imageUrl(record.image,base))}" data-viewer data-original-url="${esc(safeUrl(record.url||record.image))}" data-title="${esc(record.title)}" aria-label="View ${esc(record.title)}">${img(record.image,record.description||record.title,base,'plate-image',priority,deferred)}</a><figcaption><strong>${esc(record.title)}</strong>${record.context?`<span>${esc(record.context)}</span>`:''}</figcaption></figure>`;
}

export function heroGallery(c,base){
 const practice=c.experiences.some(e=>e.id==='panchsheel'),community=c.experiences.some(e=>e.id==='pehchaan');
 const ids=[...(practice?['school-house-placards','independence-day','sports-day-artwork']:[]),'tlm-exhibition',...(community?['pehchaan-collage']:[])];
 const seen=new Set();
 const records=ids.map(id=>galleryRecord(c,id)).filter(r=>r?.image&&(!r.publicationStatus||r.publicationStatus==='Approved')&&!seen.has(r.image)&&seen.add(r.image));
 if(!records.length)return '';
 const rotating=records.length>1;
 // Before enhancement only the first published image appears. It retains a
 // normal original-file link when JavaScript or the gallery module is absent.
 const slides=records.map((r,i)=>`<div class="hero-gallery-slide" data-hero-slide role="group" aria-roledescription="slide" aria-label="${i+1} of ${records.length}" ${i?'hidden':''}>${photoPlate(r,base,'hero-practice-photo',i===0,i>0)}</div>`).join('');
 return `<aside class="hero-visual hero-gallery" data-hero-gallery role="region" aria-roledescription="carousel" aria-label="Photographs from my teaching practice">${rotating?`<div class="hero-gallery-controls" data-gallery-controls inert aria-hidden="true"><button type="button" data-gallery-rotation aria-controls="hero-photo-slides">Pause photos</button><span class="hero-gallery-count" data-gallery-count aria-hidden="true">1 / ${records.length}</span><button type="button" data-gallery-previous aria-controls="hero-photo-slides" aria-label="Previous photograph"><span aria-hidden="true">←</span></button><button type="button" data-gallery-next aria-controls="hero-photo-slides" aria-label="Next photograph"><span aria-hidden="true">→</span></button></div>`:''}<div class="hero-gallery-window"><div id="hero-photo-slides" class="hero-gallery-track" data-gallery-track aria-live="off">${slides}</div></div><p class="sr-only" role="status" data-gallery-status></p></aside>`;
}

// Subject illustrations are design assets, not uploaded teaching evidence.
const subjectFiles={history:'history-sources',economics:'economics-study',english:'english-pedagogy',teaching:'teaching-practice'};
const subjectUrl=subject=>'assets/theme/subject-art/'+subjectFiles[subject]+'-small.webp';
export function studyInterval(base,first='history',second='english',layout='shelf'){
 const subjects=[first,second].filter(subject=>Object.hasOwn(subjectFiles,subject));
 const style=['shelf','notes','arc'].includes(layout)?layout:'shelf';
 return `<div class="study-interval interval-${style}" aria-hidden="true">${subjects.map((subject,i)=>img(subjectUrl(subject),'',base,'study-illustration study-'+(i?'right':'left'))).join('')}<span class="study-trace"></span></div>`;
}

// Published photographs remain small accents. Subject artwork and colored
// washes occupy the margins; visible interludes sit in the gaps between sections.
export function pageAtmosphere(c,route,base){
 const gallery=id=>galleryRecord(c,id)?.image;
 const certificate=match=>c.certificates.find(match)?.image;
 const journal=observationJournal(c);
 const school=id=>journal?.url===amityJournalResource.url?'assets/evidence/amity-journal/'+id+'.webp':'';
 const media={
  home:[gallery('tlm-exhibition'),gallery('independence-day')],
  profile:[gallery('independence-day'),school('junior-library')],
  teaching:[gallery('school-house-placards'),school('classroom')],
  resources:[gallery('mock-election-activity'),gallery('tlm-documentation')],
  credentials:[certificate(x=>x.category==='Academic'),certificate(x=>x.category==='Teaching')],
  resume:[certificate(x=>x.category==='Academic'),school('campus')],
  contact:[gallery('independence-day'),school('campus')],
  gallery:[gallery('tlm-documentation'),gallery('school-house-placards')],
  democracy:[gallery('mock-election-class8'),gallery('mock-election-activity')],
  pehchaan:[gallery('pehchaan-collage'),certificate(x=>x.category==='Teaching')],
  observation:[school('campus'),school('junior-library')],
  admin:[], '404':[gallery('mock-election-activity')]
 };
 const orders={
  home:['teaching','history','economics','english'],
  profile:['history','economics','english','teaching'],
  teaching:['teaching','english','history','economics'],
  resources:['teaching','english','economics','history'],
  credentials:['history','teaching','economics','english'],
  resume:['history','economics','teaching','english'],
  contact:['english','teaching','economics','history'],
  gallery:['teaching','history','english','economics'],
  democracy:['history','economics','teaching','english'],
  pehchaan:['english','teaching','economics','history'],
  observation:['teaching','english','history','economics'],
  admin:['teaching','english'], '404':['history','english']
 };
 const subjects=(orders[route]||orders['404']).map((subject,i)=>({url:subjectUrl(subject),kind:'subject',subject,edge:i%2?'left':'right'}));
 const photos=(media[route]||[]).filter(url=>imageUrl(url,base)).map((url,i)=>({url,kind:'photo',subject:'personal',edge:i%2?'right':'left'}));
 const scenes=[subjects[0],photos[0],subjects[1],subjects[2]].filter(Boolean);
 return `<div class="page-atmosphere atmosphere-${esc(route)}" aria-hidden="true">${scenes.map(x=>`<div class="atmosphere-scene scene-${x.kind} subject-${x.subject} scene-${x.edge}">${img(x.url,'',base,'atmosphere-image')}</div>`).join('')}</div>`;
}
