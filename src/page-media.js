import {esc,safeUrl,img,imageUrl} from './view-helpers.js?v=editorial-20261004';
import {observationJournal,amityJournalResource} from './amity-journal.js?v=editorial-20261004';

// Media comes from the current published record, so removing it also removes
// its decorative use. Never substitute a hard-coded gallery photograph.
export const galleryRecord=(c,...ids)=>ids.map(id=>c.gallery.find(x=>x.id===id)).find(Boolean);
export function photoBackdrop(record,base,cls=''){
 return record?.image?`<div class="page-photo-backdrop ${cls}" aria-hidden="true">${img(record.image,'',base)}</div>`:'';
}
export function photoPlate(record,base,cls='',priority=false){
 if(!record?.image)return '';
 return `<figure class="photo-plate ${cls}"><a href="${esc(imageUrl(record.image,base))}" data-viewer data-original-url="${esc(safeUrl(record.url||record.image))}" data-title="${esc(record.title)}" aria-label="View ${esc(record.title)}">${img(record.image,record.description||record.title,base,'plate-image',priority)}</a><figcaption><strong>${esc(record.title)}</strong>${record.context?`<span>${esc(record.context)}</span>`:''}</figcaption></figure>`;
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
 const scenes=[subjects[0],photos[0],subjects[1],subjects[2],photos[1],subjects[3]].filter(Boolean);
 return `<div class="page-atmosphere atmosphere-${esc(route)}" aria-hidden="true">${scenes.map(x=>`<div class="atmosphere-scene scene-${x.kind} subject-${x.subject} scene-${x.edge}">${img(x.url,'',base,'atmosphere-image')}</div>`).join('')}</div>`;
}
