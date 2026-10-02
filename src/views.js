import {academicHome,academicProfile,academicFooter,publications,certifications} from './academic.js';
import dimensions from './image-dimensions.json' with {type:'json'};
import {democracyView,evidenceFeature,democracyResource,documentUrl} from './evidence.js?v=2d-20260925';
import {studySummary,recruiterFacts} from './recruiter.js?v=2d-20260925';
import {defaultContent} from './content.js?v=2d-20260925';
export const routes={
  home:{path:'',title:'History, Social Science & English Educator',nav:'Home'},
  profile:{path:'profile/',title:'Profile & Education',nav:'Profile'},
  teaching:{path:'teaching/',title:'Teaching Journey',nav:'Teaching'},
  resources:{path:'resources/',title:'Teaching Artifacts',nav:'Teaching Artifacts'},
  credentials:{path:'credentials/',title:'Credentials & Presentations',nav:'Credentials'},
  contact:{path:'contact/',title:'Contact',nav:'Contact'},
  resume:{path:'resume/',title:'Résumé',nav:'Résumé'},
  pehchaan:{path:'teaching/pehchaan/',title:'Pehchaan Teaching Internship'},
  observation:{path:'teaching/observation/',title:'School Observation at Amity'},
  democracy:{path:'teaching/democracy/',title:'Democracy Lesson Plan · Class IX-B'},
  gallery:{path:'gallery/',title:'Gallery'},
  admin:{path:'admin/',title:'Portfolio Studio'},
  '404':{path:'404.html',title:'Page Not Found'},
};
export const esc=s=>String(s??'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
export const safeUrl=s=>{try{const u=new URL(s);return ['https:','http:'].includes(u.protocol)?u.href:''}catch{return ''}};
const arrow='<span aria-hidden="true">↗</span>';
const link=(base,route,label,cls='text-link')=>`<a class="${cls}" href="${base}${routes[route].path}">${label} ${arrow}</a>`;
const tag=s=>`<span class="tag">${esc(s)}</span>`;
const list=items=>`<ul class="plain-list">${items.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`;
const knownImages=Object.fromEntries(defaultContent.certificates.slice(0,4).map((x,i)=>[x.image,`certificate-${i+1}.webp`]));
knownImages[defaultContent.profile.portrait]='portrait.webp';
knownImages['assets/democracy-thumb.webp']='democracy-thumb.webp';
knownImages['./assets/democracy-thumb.webp']='democracy-thumb.webp';
knownImages['assets/democracy-plan-preview.webp']='democracy-plan-preview.webp';
knownImages['assets/mock-election-evm-activity.webp']='mock-election-evm-activity.webp';
knownImages['assets/mock-election-class8-poster.webp']='mock-election-class8-poster.webp';
knownImages['assets/pehchaan-classroom-mosaic.webp']='pehchaan-classroom-mosaic.webp';
knownImages['assets/roots-to-wings-preview.webp']='roots-to-wings-preview.webp';
knownImages['assets/notice-writing-preview.webp']='notice-writing-preview.webp';
knownImages['assets/ullas-adult-literacy-preview.webp']='ullas-adult-literacy-preview.webp';
knownImages['assets/ukg-assessment-preview.webp']='ukg-assessment-preview.webp';
knownImages['assets/ntcc-report-cover-preview.webp']='ntcc-report-cover-preview.webp';

const assetAliases = {
  'ullas-adult-literacy': 'ullas-adult-literacy-preview.webp',
  'ukg-assessment': 'ukg-assessment-preview.webp',
  'ntcc-report-cover': 'ntcc-report-cover-preview.webp',
  'mock-election-evm-activity': 'mock-election-evm-activity.webp',
  'mock-election-class8-poster': 'mock-election-class8-poster.webp',
  'pehchaan-classroom-mosaic': 'pehchaan-classroom-mosaic.webp',
  'roots-to-wings': 'roots-to-wings-preview.webp',
  'notice-writing': 'notice-writing-preview.webp',
  'democracy_plan': 'democracy-plan-preview.webp',
  'democracy-plan': 'democracy-plan-preview.webp',
  'democracy-thumb': 'democracy-thumb.webp',
  'cert_gemini_educator': 'certificate-8.webp',
  'cert_ncert_ai': 'certificate-5.webp',
  'cert_nptel_writing': 'certificate-6.webp',
  'cert_suraasa_linkedin': 'certificate-7.webp',
  'certWall1': 'certificate-1.webp',
  'certWall2': 'certificate-2.webp',
  'certWall3': 'certificate-3.webp',
  'certWall4': 'certificate-4.webp',
  'portrait': 'portrait.webp',
};

if (defaultContent.gallery?.[0]?.image) {
  knownImages[defaultContent.gallery[0].image]='democracy-plan-preview.webp';
}
defaultContent.gallery.forEach(g => {
  for (const [slug, file] of Object.entries(assetAliases)) {
    if (g.image.includes(slug)) knownImages[g.image] = file;
  }
});
defaultContent.resources.forEach(r => {
  if (r.thumbnail) {
    for (const [slug, file] of Object.entries(assetAliases)) {
      if (r.thumbnail.includes(slug)) knownImages[r.thumbnail] = file;
    }
  }
});

export function imageUrl(url,base){
  if(!url) return '';
  if(url.startsWith('https://krishnamahato704-spec.github.io/E-portfolio/')) return base+url.split('/E-portfolio/')[1];
  if(knownImages[url]) return base+'assets/'+knownImages[url];
  if(url.startsWith('./assets/')||url.startsWith('assets/')) return base + url.replace(/^\.?\//, '');
  for(const [slug, file] of Object.entries(assetAliases)){
    if(url.includes(slug)) return base+'assets/'+file;
  }
  return safeUrl(url);
}
function img(url,alt,base,cls='',priority=false){
 const src=imageUrl(url,base),key=src?.match(/assets\/[^?#]+/)?.[0],size=dimensions[key];
 const sources=size?.preview?`${src.replace(key,size.preview)} 640w, ${src} ${size.width}w`:'';
 return src?`<img class="${cls}" src="${esc(src)}" alt="${esc(alt)}" ${size?`width="${size.width}" height="${size.height}"`:''} ${sources?`srcset="${esc(sources)}" sizes="(max-width: 700px) 90vw, 45vw"`:''} ${priority?'fetchpriority="high"':'loading="lazy"'} decoding="async">`:'';
}
function heading(num,title,desc=''){
 const chapter=/^(0[1-6]) \/ (.+)$/.exec(num);
 const label=chapter?`<span class="chapter-number" aria-hidden="true">${chapter[1]}</span><span class="chapter-label">${chapter[2]}</span>`:num;
 return `<header class="page-heading${chapter?' chapter-heading':''}"><p class="eyebrow">${label}</p><h1>${title}</h1>${desc?`<p class="lead">${desc}</p>`:''}</header>`;
}
function sectionHead(num,title,aside=''){return `<div class="section-heading"><div><p class="eyebrow">${num}</p><h2>${title}</h2></div>${aside}</div>`}

export function header(route,base,c){
  const navItems = [
    {r:'profile',num:'01',label:'Profile'},
    {r:'teaching',num:'02',label:'Teaching'},
    {r:'resources',num:'03',label:'Artifacts'},
    {r:'credentials',num:'04',label:'Research'},
    {r:'gallery',num:'05',label:'Gallery'},
    {r:'resume',num:'—',label:'CV'}
  ];
  return `<a class="skip-link" href="#main">Skip to content</a><header class="site-header"><div class="container header-inner"><a class="brand" href="${base}" aria-label="${esc(c.profile.name)} — Home"><span class="monogram" aria-hidden="true">KM<span>.</span></span><span class="brand-caption">${esc(c.profile.name)}<small>Academic & teaching portfolio</small></span></a><details class="fallback-navigation"><summary>Menu</summary><nav aria-label="Main navigation">${[...navItems,{r:'contact',label:'Contact'}].map(it=>`<a href="${base}${routes[it.r].path}">${it.label}</a>`).join('')}</nav></details><button class="menu-toggle" aria-label="Open navigation menu" aria-expanded="false" aria-controls="navigation">Menu <span class="menu-lines" aria-hidden="true"></span></button><div id="navigation" class="navigation-panel"><div class="navigation-top"><p id="navigation-title" class="eyebrow">Explore the portfolio</p><button class="menu-close" aria-label="Close navigation">Close <span aria-hidden="true">×</span></button></div><nav class="navigation-links" aria-label="Main navigation">${navItems.map(it=>`<a ${route===it.r || (it.r==='teaching'&&['pehchaan','observation','democracy'].includes(route))?'aria-current="page"':''} href="${base}${routes[it.r].path}"><span class="nav-index" aria-hidden="true">${it.num}</span>${it.label}</a>`).join('')}<a class="nav-contact" ${route==='contact'?'aria-current="page"':''} href="${base}contact/"><span class="nav-index" aria-hidden="true">06</span>Contact ${arrow}</a></nav><p class="navigation-note">History. Inquiry. Possibility.</p></div></div></header>`;
}
export function footer(base,c){return academicFooter(base,c)}
function qualificationRows(c){return c.qualifications.map(q=>`<article class="qualification"><p class="period">${esc(q.period)}</p><div><h3>${esc(q.title)}</h3><p>${esc(q.place)}</p>${q.note?`<p class="small">${esc(q.note)}</p>`:''}${q.expected?`<p class="small">Expected completion: ${esc(q.expected)}</p>`:''}</div><span class="status ${/progress/i.test(q.status)?'progress':''}">${esc(q.status)}</span></article>`).join('')}
function practiceRows(c){return `<div class="practice-grid">${c.practice.map((p,i)=>`<article><span class="index-number">${String(i+1).padStart(2,'0')}</span><h3>${esc(p.title)}</h3><p>${esc(p.text)}</p></article>`).join('')}</div>`}

function experienceRows(c,base){


  return c.experiences.map((e,i)=>{
    const isOngoing = /ongoing|current/i.test(e.status) || /ongoing|current/i.test(e.period);
    const actions = [];
    if (e.id === 'panchsheel' && democracyResource(c)) {
      actions.push(link(base, 'democracy', 'Read the published lesson plan'));
    } else if (e.id === 'pehchaan') {
      actions.push(link(base, 'pehchaan', 'Explore the experience'));
      actions.push(link(base, 'credentials', 'View internship certificate'));
    } else if (e.id === 'observation') {
      actions.push(link(base, 'observation', 'Explore the observation'));

    } else if (['pehchaan','observation'].includes(e.id)) {
      actions.push(link(base, e.id, 'Explore the experience'));
    }

    const reflection = e.reflection
      ? { label: e.reflectionLabel || 'WHAT I LEARNT', text: e.reflection }
      : null;

    return `
 <article class="experience-row milestone-record ${isOngoing?'is-ongoing':'is-completed'}" data-category="${esc(e.category||'Teaching')}">
  <div class="milestone-rail" aria-hidden="true">
   <div class="milestone-node ${isOngoing?'node-ongoing':'node-completed'}">
    <span class="node-dot"></span>
   </div>
  </div>
  <div class="milestone-card">
   <header class="milestone-header">
    <div class="milestone-meta-bar">
     <div class="milestone-seq-date">
      <span class="milestone-seq" aria-hidden="true">STAGE ${String(i+1).padStart(2,'0')}</span>
      <span class="meta-sep" aria-hidden="true">·</span>
      <time class="milestone-period">${esc(e.period)}</time>
     </div>
     <span class="milestone-status-badge ${isOngoing?'status-ongoing':'status-completed'}">
      <span class="status-dot" aria-hidden="true"></span>
      <span>${esc(e.status||(isOngoing?'Ongoing':'Completed'))}</span>
     </span>
    </div>
    <div class="milestone-heading-group">
     <h3 class="milestone-title">${esc(e.title)}</h3>
     <div class="milestone-subheading">
      <span class="milestone-institution">${esc(e.institution||e.title)}</span>
      <span class="subhead-sep" aria-hidden="true">·</span>
      <span class="milestone-type">${esc(e.type)}</span>
     </div>
    </div>
   </header>
   ${e.summary?`<p class="milestone-summary">${esc(e.summary)}</p>`:''}
   ${reflection?`<div class="experience-reflection"><p class="reflection-label">${esc(reflection.label)}</p><p class="reflection-text">${esc(reflection.text)}</p></div>`:''}
   ${list(e.points||[])}<details class="experience-details"><summary>Experience details</summary><p>${esc(e.type)} · ${esc(e.period)}</p></details>
   ${actions.length?`<div class="experience-actions">${actions.join('')}</div>`:''}
  </div>
 </article>`;
  }).join('');
}

function certificateCard(c,base,index){
  const refNum = `ARCHIVE / CRED-0${index+1}`;
  let crosslink = '';
  if (/pehchaan/i.test(c.title + ' ' + (c.issuer||''))) {
    crosslink = `<a class="text-link cert-context-link" href="${base}teaching/pehchaan/">Explore Pehchaan case study ${arrow}</a>`;
  } else if (/rootedness/i.test(c.title) || /presentation/i.test(c.category)) {
    crosslink = `<a class="text-link cert-context-link" href="${base}teaching/">Connect with teaching journey ${arrow}</a>`;
  } else if (/bachelor/i.test(c.title)) {
    crosslink = `<a class="text-link cert-context-link" href="${base}profile/">View academic chronology ${arrow}</a>`;
  } else if (/ai|ncert/i.test(c.title + ' ' + (c.issuer||''))) {
    crosslink = `<a class="text-link cert-context-link" href="${base}resources/">Explore classroom technology &amp; TLM ${arrow}</a>`;
  } else if (/writing|nptel/i.test(c.title + ' ' + (c.issuer||''))) {
    crosslink = `<a class="text-link cert-context-link" href="${base}profile/">View disciplinary &amp; writing foundations ${arrow}</a>`;
  } else if (/linkedin|suraasa/i.test(c.title + ' ' + (c.issuer||''))) {
    crosslink = `<a class="text-link cert-context-link" href="${base}contact/">Connect for professional learning ${arrow}</a>`;
  } else if (/gemini|educator/i.test(c.title + ' ' + (c.issuer||''))) {
    crosslink = `<a class="text-link cert-context-link" href="${base}resources/">Explore classroom TLM &amp; lesson designs ${arrow}</a>`;
  }

  const certDocUrl = c.url ? documentUrl(c.url, base) : imageUrl(c.image, base) || safeUrl(c.image);

  return `
 <article class="certificate-card archive-record" data-category="${esc(c.category||'Other')}">
  <div class="certificate-media-wrap">
   <div class="cert-record-header">
    <span class="cert-archive-tag" aria-hidden="true">${refNum}</span>
    <span class="cert-badge">${esc(c.category||'Credential')}</span>
   </div>
   <a class="certificate-image archive-doc-frame" href="${esc(certDocUrl)}" target="_blank" rel="noopener noreferrer" aria-label="Open ${esc(c.title)} certificate document in a new tab">
    ${img(c.image,c.title+' — certificate',base,'archive-cert-img')}
    <span class="doc-view-hint" aria-hidden="true">Examine document ↗</span>
   </a>
  </div>
  <div class="certificate-body">
   <div class="record-label">
    <span class="record-number" aria-hidden="true">${String(index+1).padStart(2,'0')}</span>
    <p class="eyebrow">${esc(c.category||'Credential')}</p>
   </div>
   <h3 class="archive-record-title">${esc(c.title)}</h3>
   <dl class="record-meta archive-meta-grid">
    ${c.issuer?`<div><dt>Issued by</dt><dd>${esc(c.issuer)}</dd></div>`:''}
    ${c.date?`<div><dt>Date</dt><dd>${esc(c.date)}</dd></div>`:''}
   </dl>
   <p class="archive-record-desc">${esc(c.description||'')}</p>
   <div class="archive-actions">
    <a class="text-link cert-view-action" href="${esc(certDocUrl)}" target="_blank" rel="noopener noreferrer">View certificate ${arrow}<span class="sr-only">: ${esc(c.title)} (new tab)</span></a>
    ${crosslink}
   </div>
  </div>
 </article>`;
}

function resourceRows(c,base='./'){
  return c.resources.map((r,i)=>{
    const thumbSrc = r.image || r.thumbnail || (/\.(jpg|jpeg|png|webp)($|\?)/i.test(r.url) ? r.url : '');
    const typeLabel = r.type || r.category || 'Teaching material';
    const subjectLabel = r.subject || (r.category && r.category !== typeLabel ? r.category : '');
    const gradeLabel = r.grade || r.class || r.level;

    return `
 <article class="resource-row archive-resource-card" data-category="${esc(r.category||r.type||'Teaching material')}">
  <div class="resource-thumb-wrap">
    ${thumbSrc ? `
      ${img(thumbSrc,'Thumbnail preview for '+r.title,base,'resource-thumb')}
    ` : `
      <div class="resource-doc-preview-thumb" aria-hidden="true">
        <div class="doc-thumb-paper">
          <div class="doc-thumb-fold"></div>
          <span class="doc-thumb-badge">${esc(typeLabel.toUpperCase())}</span>
          <span class="doc-thumb-title-text">${esc(r.title)}</span>
          <div class="doc-thumb-lines"><span></span><span></span><span></span></div>
        </div>
      </div>
    `}
  </div>
  <div class="resource-body">
   <div class="resource-meta-line">
    <span class="resource-type-tag">${esc(typeLabel)}</span>
    ${subjectLabel ? `<span class="meta-sep" aria-hidden="true">·</span><span class="resource-subject-tag">${esc(subjectLabel)}</span>` : ''}
    ${gradeLabel ? `<span class="meta-sep" aria-hidden="true">·</span><span class="resource-grade-tag">${esc(gradeLabel)}</span>` : ''}
   </div>
   <h3 class="resource-title">${esc(r.title)}</h3>
   ${r.description ? `<p class="resource-desc">${esc(r.description)}</p>` : ''}
  </div>
  <div class="resource-action-wrap">
   ${r.url ? `<a class="text-link resource-link" href="${esc(documentUrl(r.url,base))}" target="_blank" rel="noopener noreferrer">Open file ${arrow}<span class="sr-only">: ${esc(r.title)} (new tab)</span></a>` : ''}
  </div>
 </article>`;
  }).join('');
}

function philosophySection(c,base){
  const implications = [
    'Plan example: questions about prior knowledge lead to discussion of elections and peaceful protest (pages 3–5).',
    'Plan example: a concept diagram, photographs, oral discussion and written responses support access (pages 3–5). Targeted adaptations are not specified.',
    'Plan example: diagnostic questions, guided practice and an independent accountability task provide checks for understanding (pages 3 and 5).'
  ];

  return `<section class="section philosophy-section" aria-labelledby="philosophy-title">
 <div class="philosophy-layout">
  <aside class="philosophy-intro-col">
   <div class="philosophy-intro-sticky">
    <div class="philosophy-title-block">
     <p class="eyebrow">Teaching philosophy</p>
     <h2 id="philosophy-title">Start with<br><em>the learner.</em></h2>
     <p class="philosophy-manifesto">A pedagogical approach shaped by classroom observation, foundational teaching, and the conviction that understanding is built through inquiry rather than memorisation.</p>
    </div>
    <div class="philosophy-influences" data-motion="fade-up">
     <p class="eyebrow influences-eyebrow">Intellectual Foundations</p>
     <div class="influence-citations">
      <article class="influence-citation">
       <span class="citation-tag" aria-hidden="true">ARCHIVE / REF-01</span>
       <div class="citation-body">
        <h3>Rabindranath Tagore</h3>
        <p class="citation-thesis">Room for curiosity &amp; creative expression.</p>
        <p class="citation-note">Holistic education and creative inquiry remind me to keep History connected to the whole learner, cultivating imagination alongside analytical critique.</p>
       </div>
      </article>
      <article class="influence-citation">
       <span class="citation-tag" aria-hidden="true">ARCHIVE / REF-02</span>
       <div class="citation-body">
        <h3>Lev Vygotsky</h3>
        <p class="citation-thesis">Support toward independent reasoning.</p>
        <p class="citation-note">Dialogue, guided source work, and the zone of proximal development help learners advance from scaffolded inquiry to autonomous historical explanation.</p>
       </div>
      </article>
     </div>
    </div>
   </div>
  </aside>
  <div class="philosophy-editorial-col">
   <div class="philosophy-sequence">${c.practice.map((p,i)=>`
    <article class="philosophy-principle" data-motion="fade-up">
     <div class="principle-number-col" aria-hidden="true">
      <span class="principle-number">${String(i+1).padStart(2,'0')}</span>
     </div>
     <div class="principle-body">
      <div class="principle-header">
       <span class="principle-seq">PRINCIPLE ${String(i+1).padStart(2,'0')}</span>
       <h3 class="principle-title">${esc(p.title)}</h3>
      </div>
      <p class="principle-core">${esc(p.text)}</p>
      <div class="principle-implication">
       <span class="implication-label">Classroom Implication · Planned example</span>
       <p class="implication-text">${esc(implications[i]||'An evidence example can be added when available.')}</p>${democracyResource(c)?link(base,'democracy','Evidence: Democracy lesson plan'):''}<p class="small">Reflection: the plan’s review fields are blank. A completed account of learner responses is the next evidence to add.</p>
      </div>
     </div>
    </article>`).join('')}
   </div>
   <div class="belief-transition" data-motion="fade-up">
    <div class="belief-bridge-header">
     <span class="bridge-tag">PEDAGOGICAL CONTINUUM</span>
     <p class="bridge-caption">From belief into the classroom</p>
    </div>
    <div class="belief-steps" role="list">
     <span class="b-step" role="listitem"><strong>Belief</strong><small>Inquiry &amp; Dialogue</small></span>
     <span class="b-arrow" aria-hidden="true">→</span>
     <span class="b-step" role="listitem"><strong>Design</strong><small>Flexible Pathways</small></span>
     <span class="b-arrow" aria-hidden="true">→</span>
     <span class="b-step" role="listitem"><strong>Classroom</strong><small>Evidence &amp; Voice</small></span>
     <span class="b-arrow" aria-hidden="true">→</span>
     <span class="b-step" role="listitem"><strong>Reflection</strong><small>Adaptive Teaching</small></span>
    </div>
    <div class="chapter-route">
     <div class="chapter-meta">
      <span class="chapter-label">NEXT CHAPTER / LESSON DESIGN</span>
      <h3>One concept. Different pathways.</h3>
      <p>Detailed lesson planning for Class IX-B exploring democracy through source work, discussion and visual interpretation.</p>
     </div>
     <a class="button light chapter-link" href="${base}teaching/democracy/">Explore the Democracy teaching design <span aria-hidden="true">↗</span></a>
    </div>
   </div>
  </div>
 </div>
</section>`;
}


function optionalProfileFacts(c){return recruiterFacts(c).filter(([key])=>['Based in','Work preferences','Target classes','Boards of interest'].includes(key)).map(([label,value])=>'<p><strong>'+esc(label)+':</strong> '+esc(value)+'</p>').join('');}

function evidenceLinks(base){return '<nav class="evidence-links" aria-label="Explore teaching evidence">'+link(base,'democracy','Published lesson plan')+link(base,'credentials','Certificates & presentation')+'</nav>';}

function stableContent(value) {
 if(Array.isArray(value))return value.map(stableContent);
 if(value&&typeof value==='object')return Object.fromEntries(Object.keys(value).sort().map(key=>[key,stableContent(value[key])]));
 return value;
}
function resumeDownload(c,base) {
 const custom=safeUrl(c.profile.cv);
 const matches=['profile','qualifications','experiences','competencies','certificates','resources'].every(key=>JSON.stringify(stableContent(c[key]))===JSON.stringify(stableContent(defaultContent[key])));
 if(!custom&&!matches)return '<p class="small">Use Print / save as PDF for the current résumé.</p>';
 return `<a class="button primary" href="${esc(custom||base+'assets/krishna-mahato-resume.pdf')}" download="krishna-mahato-resume.pdf">Download Résumé PDF <span aria-hidden="true">↓</span></a>`;
}
function pehchaanCaseStudy(pehchaan, base = './') {
  const body = `
<div class="dossier-callout">
  <p class="eyebrow">AMITY UNIVERSITY UTTAR PRADESH · AMITY INSTITUTE OF EDUCATION</p>
  <h2 class="course-title">Course EDCW100: Community Work &amp; Adult Literacy</h2>
  <div>
    <div><strong>Student:</strong> Krishna Mahato (A3410525022)</div>
    <div><strong>Faculty Guide:</strong> Dr. Neetu Mishra Shukla</div>
    <div><strong>Industry Guide:</strong> Mr. Akash Tandon (Founder)</div>
    <div><strong>Partner NGO:</strong> Pehchaan The Street School</div>
    <div><strong>Duration:</strong> 31 May – 06 July 2026 (5 Weeks)</div>
    <div><strong>Verified Hours:</strong> 130 Hours (80h NGO + 50h ULLAS)</div>
    <div><strong>Turnitin Score:</strong> 6% Plagiarism Similarity</div>
    <div><strong>Submission Date:</strong> 20 July 2026 · Noida, UP</div>
  </div>
  <div>
    <a class="button primary" href="${base}assets/evidence/ntcc-community-report.pdf" target="_blank" rel="noopener noreferrer">Read Full 27-Page NTCC Report (PDF) ↗</a>
    <a class="button secondary" href="${base}assets/ukg-assessment-test.pdf" target="_blank" rel="noopener noreferrer">Download UKG Assessment Tool (PDF) ↗</a>
  </div>
</div>

<h2>The Teaching &amp; Community Context</h2>
<p>As part of the B.Ed. curriculum (Course EDCW100) at Amity Institute of Education, Krishna Mahato completed an intensive five-week community engagement (1 June to 6 July 2026). The field practice addressed two distinct educational imperatives: providing foundational literacy and numeracy (FLN) to 4–6 year old kindergarten children at Pehchaan The Street School in the Morna Village slum area of Sector 35, Noida; and delivering 50 hours of adult literacy and life-skills instruction to five community sanitation and security workers under the Government of India’s ULLAS (Understanding Lifelong Learning for All in Society) initiative.</p>

<h2>Key Responsibilities &amp; Practicum Milestones</h2>
${list(pehchaan.points)}

<hr>

<h2>Chapter 1: Child Education at Pehchaan The Street School (80 Verified Hours)</h2>
<p>Pehchaan The Street School operates an informal learning centre in Morna Village (Sector 35, Noida), catering primarily to children of migrant construction laborers, sanitation workers, and informal daily-wage earners. Baseline testing during Week 1 revealed critical educational vulnerabilities: several children enrolled in Class 4 at local municipal schools could not construct basic sentences or recognize Hindi and English alphabets with stability. Consequently, instruction was restructured from rote memorization into tiered, competency-based, and multi-sensory learning.</p>

<div class="case-gallery-block">
  <a class="archive-doc-frame" href="${base}assets/pehchaan-classroom-mosaic.webp" target="_blank" rel="noopener noreferrer" aria-label="Open Pehchaan classroom documentary mosaic in full size">
    <img src="${base}assets/evidence/pehchaan-collage.webp" width="1920" height="1080" alt="Classroom learning and activities at Pehchaan The Street School" class="case-evidence-img" loading="lazy">
    <span class="doc-view-hint" aria-hidden="true">Examine 80-Hour Documentary Mosaic (Figure 1 of NTCC Report) ↗</span>
  </a>
  <p class="small">Figure 1: Archival classroom evidence: kindergarten visual-motor maze worksheets, letter formation on chalkboards, small-group reading circles, and peer numeracy practice.</p>
</div>

<h3>Weekly Pedagogical Trajectory (80 Hours Total)</h3>
<div class="table-scroll" tabindex="0" role="region" aria-label="NGO teaching weekly record">
  <table>
    <thead>
      <tr>
        <th>Week &amp; Duration</th>
        <th>Focus Competencies</th>
        <th>Pedagogical Methods &amp; Materials</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Week 1</strong><br>(1–6 June)<br>14 Hours</td>
        <td>Induction &amp; Baseline Assessment; Fine-motor grip; A–Z &amp; 1–100 recognition</td>
        <td>Orientation by Founder Akash Tandon; baseline diagnostic evaluation of 25+ children; ability grouping; straight and curved line tracing worksheets; daily 15-minute shape drawing.</td>
      </tr>
      <tr>
        <td><strong>Week 2</strong><br>(8–14 June)<br>18 Hours</td>
        <td>Visual-motor maze tracing; Numbers 1–50; Geometric shape integration</td>
        <td>Dotted line tracing for emergent writers; elimination alphabet recitation loop game; creative vehicle/doll drawing combining circles, squares and rectangles; robotics demonstration observation.</td>
      </tr>
      <tr>
        <td><strong>Week 3</strong><br>(15–21 June)<br>18 Hours</td>
        <td>Phonetic word association; Hindi Varnamala; Differentiated addition/subtraction</td>
        <td>English phonics (A for Axe, Apple; B for Ball); call-and-response Hindi akshar drills; differentiated maths groupings (1-digit addition/subtraction for advanced; counting for beginners).</td>
      </tr>
      <tr>
        <td><strong>Week 4</strong><br>(22–28 June)<br>12 Hours</td>
        <td>Vocabulary-to-illustration; 2-digit carry-over addition; Public speaking</td>
        <td>Bilingual word-to-picture matching worksheets; multi-step carry-over scaffolding on chalkboard; daily confidence-building student spoken presentations.</td>
      </tr>
      <tr>
        <td><strong>Week 5</strong><br>(29 June – 6 July)<br>18 Hours</td>
        <td>Experiential "Maths Market"; 40-mark diagnostic post-assessment; Vocabulary games</td>
        <td>Storytelling reading circles (rabbit-tortoise fable); simulated currency marketplace calculating fruit costs; comprehensive 40-mark UKG diagnostic evaluation (&gt;60% improvement demonstrated); "Mystery Bag" vocabulary mime and drawing game; farewell celebrations.</td>
      </tr>
    </tbody>
  </table>
</div>

<h3>Diagnostic Assessment Instrument (UKG Foundational Skills Test)</h3>
<p>To measure learning gains objectively across the 80 hours, Krishna developed and administered a structured 40-mark diagnostic evaluation sheet (documented in Annexure 2 of the NTCC Report). The instrument tested seven core foundational domains:</p>
<div>
  <div>
    <h4>Language &amp; Phonics (15 Marks)</h4>
    <p class="small">English alphabet missing letters (A–Z), Hindi Varnamala akshar completion (अ–ह, क–ण), and bilingual picture-word matching (Apple, Ball, Mango, Cat, Sun).</p>
  </div>
  <div>
    <h4>Numeracy &amp; Geometry (25 Marks)</h4>
    <p class="small">Number sequencing 1–100, concrete shape counting (triangles, circles, squares, stars), 8 single-digit addition problems, and 7 subtraction problems.</p>
  </div>
</div>

<div class="case-gallery-block">
  <a class="archive-doc-frame" href="${base}assets/ukg-assessment-preview.webp" target="_blank" rel="noopener noreferrer" aria-label="Open UKG Diagnostic Assessment preview in full size">
    <img src="${base}assets/ukg-assessment-preview.webp" width="800" height="600" alt="UKG Diagnostic Assessment test sheet designed by Krishna Mahato at Pehchaan The Street School" class="case-evidence-img" loading="lazy">
    <span class="doc-view-hint" aria-hidden="true">Examine UKG Assessment Instrument (Figure 3 / Annexure 2) ↗</span>
  </a>
</div>

<hr>

<h2>Chapter 2: ULLAS Adult Literacy &amp; Life Skills Initiative (50 Verified Hours)</h2>
<p>Parallel to kindergarten teaching, Krishna conducted 50 hours of instructional engagement under the Government of India’s centrally sponsored <strong>ULLAS (Understanding Lifelong Learning for All in Society)</strong> initiative, the flagship New India Literacy Programme (NILP) aligned with the National Education Policy (NEP 2020). Designed for non-literates and neo-literates aged 15 and above, the sessions were tailored to five adult community workers residing and working in Noida Sector 35.</p>

<div class="case-gallery-block">
  <a class="archive-doc-frame" href="${base}assets/ullas-adult-literacy-preview.webp" target="_blank" rel="noopener noreferrer" aria-label="Open ULLAS Adult Literacy preview in full size">
    <img src="${base}assets/ullas-adult-literacy-preview.webp" width="800" height="600" alt="ULLAS Adult Literacy Programme preview card showing learner profiles and curricular pillars" class="case-evidence-img" loading="lazy">
    <span class="doc-view-hint" aria-hidden="true">Examine ULLAS Adult Literacy Overview (Figure 2 of NTCC Report) ↗</span>
  </a>
  <p class="small">Figure 2: Adult community literacy sessions: signature practice, form-filling, reading excerpts from Paulo Coelho's The Alchemist and Bhagavad Gita, and digital bill literacy.</p>
</div>

<h3>Learner Profiles &amp; Differentiated Needs</h3>
<div class="table-scroll" tabindex="0" role="region" aria-label="Adult literacy weekly record">
  <table>
    <thead>
      <tr>
        <th>Learner</th>
        <th>Age &amp; Occupation</th>
        <th>Educational Background</th>
        <th>Curricular Goals &amp; Outcomes</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Anshul</strong></td>
        <td>30 Yrs · Security Guard</td>
        <td>Completed Class 8th</td>
        <td>Spoken English communication, formal letter drafting, bank slip completion, smartphone digital utility apps.</td>
      </tr>
      <tr>
        <td><strong>Ram Lakhan</strong></td>
        <td>20 Yrs · Security Guard</td>
        <td>Completed Class 8th</td>
        <td>Vocational communication; academic counseling provided to re-enroll and complete Class 10/12 through NIOS.</td>
      </tr>
      <tr>
        <td><strong>Gyashi Lal</strong></td>
        <td>45 Yrs · Sanitation Cleaner</td>
        <td>No prior schooling (Non-literate)</td>
        <td>Transitioned from thumbprint to proud, verifiable legal signature in Hindi; basic counting, currency identification and street sign reading.</td>
      </tr>
      <tr>
        <td><strong>Teeja</strong></td>
        <td>40 Yrs · Sanitation Cleaner</td>
        <td>No prior schooling (Non-literate)</td>
        <td>Official signature writing; reading electricity and water utility bills; mental math for grocery shopping and household accounting.</td>
      </tr>
      <tr>
        <td><strong>Jyothi</strong></td>
        <td>28 Yrs · Sanitation Cleaner</td>
        <td>Completed Class 8th</td>
        <td>Hindi reading fluency; domestic budget recording; basic conversational English phrases; reading notices and medical prescriptions.</td>
      </tr>
    </tbody>
  </table>
</div>

<h3>Curricular Progression (10 Hours per Week × 5 Weeks = 50 Hours)</h3>
<ul class="plain-list">
  <li><strong>Week 1 (Diagnostic Profiling &amp; Bifurcation):</strong> Evaluated prior schooling; split cohort into two dedicated pedagogical tracks (Track A: spoken communication &amp; formal forms for prior-schoolers; Track B: handwriting, alphabet tracing and sound-symbol association for non-literates).</li>
  <li><strong>Week 2 (Legal Signature &amp; Civic Form-Filling):</strong> Intensive guided practice in writing legal signatures to replace thumbprints on bank documents, ration cards, and government forms; basic marketplace arithmetic.</li>
  <li><strong>Week 3 (Literary &amp; Philosophical Exploration):</strong> Guided reading of selected shlokas and interpretations from the <em>Bhagavad Gita</em> in Hindi, alongside adapted passages from Paulo Coelho's <em>The Alchemist</em> in English, sparking reflective discussions on duty, self-worth, and perseverance.</li>
  <li><strong>Week 4 (Digital &amp; Financial Functional Literacy):</strong> Decoding electricity, water, and gas utility bills; practicing household budget logs; ATM card precautions; navigating smartphones and government welfare applications.</li>
  <li><strong>Week 5 (Summative Assessment &amp; Empowerment):</strong> Practical evaluation assessing reading comprehension passages, conversational English/Hindi confidence, and independent currency calculations. Celebrated individual growth and self-reliance.</li>
</ul>

<hr>

<h2>Chapter 3: Course Learning Outcomes (CLOs 1–6) &amp; Pedagogical Insights</h2>
<p>The internship synthesized theoretical B.Ed. coursework with complex on-ground reality, fulfilling all six prescribed Course Learning Outcomes across Bloom's Cognitive Taxonomy:</p>
<div>
  <div>
    <strong>CLO 1 (Remember):</strong> Internalized professional codes, ethical norms of community education, punctuality, and the responsibility of the educator in informal, non-traditional learning spaces.
  </div>
  <div>
    <strong>CLO 2 (Understand):</strong> Comprehended how socio-economic vulnerabilities, migrant life cycles, and systemic inequalities impede formal learning, recognizing literacy as a fundamental engine of dignity.
  </div>
  <div>
    <strong>CLO 3 (Apply):</strong> Implemented differentiated instruction, multi-sensory materials, play-based numeracy, and conflict-resolution tactics within lively, multi-age classroom environments.
  </div>
  <div>
    <strong>CLO 4 (Analyze):</strong> Diagnosed individual learner barriers; candidly evaluated initial teaching hesitancy and recognized that structured pre-planning is essential for classroom stability.
  </div>
  <div>
    <strong>CLO 5 (Evaluate):</strong> Appraised diverse pedagogical methods, concluding that combining structured repetition with experiential games (Maths Market, Mystery Bag) significantly outperforms rote drill.
  </div>
  <div>
    <strong>CLO 6 (Create):</strong> Authored comprehensive diagnostic evaluation instruments (40-mark UKG test sheet), visual-motor maze worksheets, and experiential marketplace simulations.
  </div>
</div>

<h3>Overcoming Field Challenges</h3>
<ul class="plain-list">
  <li><strong>Disparity in Baseline Abilities:</strong> Solved by grouping children by diagnosed ability rather than age, enabling targeted phonics for beginners and reading circles for advanced learners.</li>
  <li><strong>Short Attention Spans in Kindergarten:</strong> Regulated energy through kinetic games ("Hands Up / Hands Down", "Mystery Bag"), 15-minute shape-drawing intervals, and deep-breathing focus pauses.</li>
  <li><strong>Adult Learner Self-Consciousness:</strong> Mitigated fear of error through one-on-one positive reinforcement, celebrating small victories (like signing a name), and grounding examples in real daily expenses.</li>
  <li><strong>Scarcity of Physical Resources:</strong> Leveraged low-cost locally sourced items, reusable slate boards, and hand-drawn visual flashcards to maintain high engagement without expensive commercial kits.</li>
</ul>

<hr>

<h2>Chapter 4: Documentary &amp; Institutional Evidence</h2>
<p>All aspects of this internship are backed by verifiable primary documentation:</p>
<ul class="plain-list">
  <li><strong>Amity University NTCC Community Work Report (27 Pages):</strong> Submitted under Faculty Guide Dr. Neetu Mishra Shukla and HOD Prof. (Dr.) Alka; verified through Turnitin with a 6% similarity score.</li>
  <li><strong>Annexure 2 — UKG Diagnostic Assessment Instrument:</strong> Original 40-mark test paper testing language, numeracy, and operations.</li>
  <li><strong>Annexure 3 — Pehchaan The Street School Offer Letter:</strong> Issued by Founder Akash Tandon outlining internship scope.</li>
  <li><strong>Annexure 4 — Certificate of Completion (Reg: 36088115712633):</strong> Official trust certificate confirming 80 hours on-ground teaching.</li>
</ul>
  `;

  const aside = `
<aside class="evidence-aside">
  <p class="eyebrow">Academic Credentials</p>
  <h2>130 Hours</h2>
  <p>Pehchaan The Street School &amp; ULLAS<br><strong>Course EDCW100 · 6 July 2026</strong></p>
  
  <div>
    <div><strong>NGO Teaching:</strong> 80 Hours Verified</div>
    <div><strong>Adult Literacy:</strong> 50 Hours (ULLAS)</div>
    <div><strong>Registration:</strong> #36088115712633</div>
    <div><strong>Academic Credit:</strong> Amity B.Ed. EDCW100</div>
    <div><strong>Turnitin Certified:</strong> 6% Similarity</div>
  </div>

  <a class="archive-doc-frame" href="${base}assets/certificate-2.webp" target="_blank" rel="noopener noreferrer">
    ${img(defaultContent.certificates[1].image,'Pehchaan certificate confirming 80 hours as an on-ground intern / teacher',base,'case-evidence-img')}
    <span class="doc-view-hint" aria-hidden="true">Examine completion certificate ↗</span>
  </a>

  <div>
    <a class="button primary" href="${base}assets/evidence/ntcc-community-report.pdf" target="_blank" rel="noopener noreferrer">Read 27-Page NTCC Report (PDF) ↗</a>
    <a class="button secondary" href="${base}assets/ukg-assessment-test.pdf" target="_blank" rel="noopener noreferrer">Download UKG Assessment (PDF) ↗</a>
    ${link(base,'credentials','View supporting credentials')}
  </div>
</aside>
  `;

  return caseStudy(base, 'Community teaching', 'Foundational literacy<br><em>and numeracy.</em>', pehchaan, body, aside);
}

export function view(route,c,base='./') {
 const p=c.profile;
 const pehchaan=c.experiences.find(e=>e.id==='pehchaan');
 const observation=c.experiences.find(e=>e.id==='observation');
  if((route==='pehchaan'&&!pehchaan)||(route==='observation'&&!observation))return view('404',c,base);
  switch(route){
  case 'home': return academicHome(c,base);
  case 'profile': return academicProfile(c,base);
  case 'teaching': return `<div class="container teaching-page">${heading('02 / Teaching Journey','Learning to teach.<br><em>Teaching to understand.</em>','School internships, community teaching, observation and the ideas I am developing through them.')}<div class="journey-flow-strip" aria-label="Educator development continuum"><div class="flow-strip-intro"><span class="flow-strip-tag">FRAMEWORK</span><span class="flow-strip-desc">Pedagogical Continuum</span></div><div class="flow-sequence" role="list"><span class="flow-step" role="listitem">OBSERVE</span><span class="flow-sep" aria-hidden="true">→</span><span class="flow-step" role="listitem">QUESTION</span><span class="flow-sep" aria-hidden="true">→</span><span class="flow-step" role="listitem">PLAN</span><span class="flow-sep" aria-hidden="true">→</span><span class="flow-step" role="listitem">TEACH</span><span class="flow-sep" aria-hidden="true">→</span><span class="flow-step" role="listitem">ASSESS</span><span class="flow-sep" aria-hidden="true">→</span><span class="flow-step" role="listitem">REFLECT</span><span class="flow-sep" aria-hidden="true">→</span><span class="flow-step" role="listitem">GROW</span></div></div>${evidenceLinks(base)}<div class="collection-tools" data-enhancement hidden><label>Find teaching experience<input id="experience-search" type="search" placeholder="Search school, activity or date" aria-controls="experience-list"></label><div class="filters" role="group" aria-label="Filter teaching experience">${['All','Teaching','Observation'].map((s,i)=>`<button class="filter" data-experience-filter="${s}" aria-pressed="${i===0}">${s}</button>`).join('')}</div></div><p id="experience-count" class="collection-count" role="status" data-enhancement hidden></p><div class="timeline-container"><div class="timeline-track" aria-hidden="true"><div class="timeline-fill"></div></div><h2 class="sr-only">Teaching and observation experience</h2><section id="experience-list" class="experience-timeline" aria-label="Teaching and observation record">${experienceRows(c,base)}</section></div><p id="experience-empty" class="empty-note" ${c.experiences.length?'hidden':''}>No experiences match this search.</p>${philosophySection(c,base)}</div>`;
  case 'pehchaan': return pehchaanCaseStudy(pehchaan, base);
  case 'observation': return caseStudy(base,'School observation','Learning through<br><em>classroom observation.</em>',observation,`<h2>Observation context</h2><p>This five-day observation placement at Amity International School, Mayur Vihar took place on 24–28 November 2025. The record concerns observation of teaching.</p><h2>What I paid attention to</h2>${list(observation.points)}<h2>From observation to planning</h2><p>The account identifies questioning, participation and classroom routines as areas of attention. A dated observation note linking a specific teaching choice to a planning decision would make this learning easier to assess.</p>`,`<aside class="note-panel"><p class="eyebrow">Evidence status</p><h2>Observation record</h2><p>The dates are confirmed by the candidate. A school observation certificate or mentor record is not currently published.</p><p>The women’s-safety webinar certificate belongs to professional learning.</p>${link(base,'credentials','View published credentials')}</aside>`);
  case 'democracy': return democracyView(c,base);
  case 'resources': return `<div class="container resources-page">${heading('04 / Teaching Resources','Teacher’s Resource Library.<br><em>Ideas into practice.</em>','Published teaching files, with context and links to the original evidence.')}${evidenceFeature(c,base)}<section class="section resource-library">${sectionHead('Teacher’s Resource Library','Curated teaching files.')}<div class="resource-collection-tools ${c.resources.length===0?'is-catalog-empty':''}" data-enhancement hidden><label class="collection-search">Search teaching files<input id="resource-search" type="search" placeholder="Search title, category or description" aria-controls="resource-list"></label><div class="filters" role="group" aria-label="Filter resources">${['All',...new Set(c.resources.map(r=>r.category||r.type||'Teaching material'))].map((s,i)=>`<button class="filter" data-filter="${esc(s)}" aria-pressed="${i===0}">${esc(s)}</button>`).join('')}</div></div><p class="collection-count" id="resource-count" role="status">${c.resources.length} ${c.resources.length===1?'file':'files'} in the library</p><div id="resource-list">${resourceRows(c,base)}</div><p class="empty-note" id="resource-empty" ${c.resources.length?'hidden':''}>No teaching files match this search.</p><p class="small">Completed student responses, marked feedback and lesson reflections have not yet been published.</p></section></div>`;
  case 'credentials': return '<div class="container credentials-page">'+heading('Research & credentials','Publications and continued learning.','Seminar presentations, academic records, and professional development.')+'<section id="publications" class="section compact"><h2>Publications & research</h2>'+publications(c,base)+'</section><section class="section"><h2>Certifications & upskilling</h2>'+certifications(c,base)+'</section><section class="section"><h2>Supporting documents</h2><div class="collection-tools" data-enhancement hidden><label>Find a credential<input id="credential-search" type="search" placeholder="Search title, issuer or date" aria-controls="credential-list"></label><div class="filters" role="group" aria-label="Filter credentials">'+['All',...new Set(c.certificates.map(x=>x.category||'Other'))].map((s,i)=>'<button class="filter" data-credential-filter="'+esc(s)+'" aria-pressed="'+(i===0)+'">'+esc(s)+'</button>').join('')+'</div></div><p id="credential-count" class="collection-count" role="status" data-enhancement hidden></p><p id="credential-empty" class="empty-note" hidden>No credentials match this search.</p><div class="certificate-grid" id="credential-list">'+c.certificates.map((x,i)=>certificateCard(x,base,i)).join('')+'</div></section></div>';
  case 'resume': return `<div class="container resume-page">${heading('Résumé / Professional overview',esc(p.name),'History, Social Science & English · Developing Educator')}<div class="actions print-actions">${resumeDownload(c,base)}<button class="button secondary" id="print-resume">Print / save as PDF <span aria-hidden="true">↗</span></button>${link(base,'contact','Contact')}</div><p class="resume-contact-bar"><a href="mailto:${esc(p.email)}">${esc(p.email)}</a> · ${p.languages.map(esc).join(' · ')}</p><section class="resume-section"><h2>Professional profile</h2><p>${esc(p.summary)}</p><p>Roles of interest: ${p.roles.map(esc).join('; ')}. ${esc(studySummary(c))}.</p><p><strong>${esc(p.eligibility)}</strong> · Available to join full-time from <strong>${esc(p.availability)}</strong>.</p></section><section class="resume-section"><h2>Location & teaching interests</h2>${optionalProfileFacts(c)}</section><section class="resume-section"><h2>Education</h2>${qualificationRows(c)}</section><section class="resume-section"><h2>Teaching & observation experience</h2>${c.experiences.map(e=>`<article class="resume-exp-entry"><h3>${esc(e.title)}</h3><p class="small"><strong>${esc(e.period)}</strong> · ${esc(e.type)}</p>${list(e.points||[])}</article>`).join('')}</section><section class="resume-section"><h2>Skills & competencies</h2><p>${c.competencies.map(esc).join(' · ')}</p></section><section class="resume-section"><h2>Professional learning & seminar presentations</h2>${c.certificates.filter(x=>['Presentation','Professional learning'].includes(x.category)).map(x=>`<p><strong>${esc(x.title)}</strong><br>${esc(x.description)}<br><span class="small">${esc(x.issuer)} · ${esc(x.date)}</span></p>`).join('')}</section></div>`;
  case 'contact': return `<div class="container contact-page"><header class="page-heading chapter-heading contact-hero-header" data-motion="fade-up"><p class="eyebrow"><span class="chapter-number" aria-hidden="true">05</span><span class="chapter-label">LET'S CONNECT</span></p><h1 class="contact-closing-title">Good teaching starts<br>with a good <em>question.</em></h1><p class="lead contact-closing-sub">Let’s start a conversation. Open for school teaching positions, internships, and educational collaboration.</p></header><div class="contact-layout"><section class="contact-dossier" data-motion="fade-right"><div class="contact-section-inner"><div class="contact-channel-block"><h2 class="eyebrow">Email me directly</h2><a class="contact-email" href="mailto:${esc(p.email)}">${esc(p.email)} ${arrow}</a><div class="contact-actions"><button class="text-link copy-email" data-email="${esc(p.email)}">Copy email address</button><p id="copy-status" role="status"></p></div></div><div class="contact-note"><div class="recruiter-highlight-badge"><span class="status-dot" aria-hidden="true"></span><span>Available from ${esc(p.availability)}</span></div><p class="contact-eligibility"><strong>${esc(p.eligibility)}</strong> · ${esc(studySummary(c))}.</p>${optionalProfileFacts(c)}<div class="recruiter-prompt"><h3 class="eyebrow">For schools &amp; recruiters</h3><p class="small">Please include the school name, subject, classes to be taught, location and proposed joining timeline.</p></div></div></div></section><section class="contact-form-section" data-motion="fade-left"><form id="contact-form" class="contact-form"><h2>Prepare an introduction.</h2><p>This opens your email app with a draft. You can review it before sending.</p><input type="text" name="website_url" class="sr-only" tabindex="-1" autocomplete="off" aria-hidden="true"><label>Your name<input name="name" autocomplete="name" required maxlength="100"></label><label>Your email<input type="email" name="email" autocomplete="email" required maxlength="200"></label><label>School / organisation<input name="school" autocomplete="organization" maxlength="150"></label><label>Your message<textarea name="message" rows="5" required maxlength="3000"></textarea></label><button class="button primary" type="submit">Open email draft ${arrow}</button><p id="contact-status" role="status"></p></form><div class="contact-resume-card"><div class="resume-card-body"><span class="card-tag">DOCUMENTATION</span><h3 class="resume-card-title">Academic &amp; Teaching Résumé</h3><p class="small">Formal education chronology, documented school internships, and teaching competencies formatted for academic review.</p></div><a class="button secondary resume-card-btn" href="${base}resume/">View Résumé / Save PDF ${arrow}</a></div></section></div></div>`;
  case 'gallery':return `<div class="container gallery-page">${heading('06 / Gallery','Teaching &amp; Classroom Gallery.','Visual documentation of school internships, seminar presentations, classroom planning, and academic milestones.')}<div class="tlm-gallery-grid">${c.gallery.map(x=>`<article class="tlm-card"><div class="tlm-image-frame"><a class="archive-doc-frame" href="${esc(imageUrl(x.image,base)||safeUrl(x.image))}" target="_blank" rel="noopener noreferrer" data-title="${esc(x.title)}" data-category="${esc(x.category||'GALLERY')}" data-caption="${esc(x.description||'')}">${img(x.image,x.title,base,'tlm-img')}<span class="doc-view-hint" aria-hidden="true">Examine record ↗</span></a></div><div class="tlm-body"><div class="tlm-meta-line"><span class="tlm-category-badge">${esc(x.category||'Document')}</span>${x.context?`<span class="meta-sep" aria-hidden="true">·</span><span class="tlm-context">${esc(x.context)}</span>`:''}</div><h2 class="tlm-title">${esc(x.title)}</h2>${x.description?`<p class="tlm-description">${esc(x.description)}</p>`:''}<div class="tlm-pedagogy"><strong>Inquiry context:</strong> Verified archival evidence connecting teacher education to classroom practice.</div></div></article>`).join('')}</div>${c.gallery.length?'':'<p class="empty-note">No gallery images are currently published. The teaching artifacts contain the available lesson evidence.</p>'}${link(base,'resources','View teaching artifacts')}</div>`;
  case 'admin':return `<div class="container admin-page">${heading('Owner workspace','Portfolio Studio.','Update your profile, teaching experience and files. Changes go live only when you publish.')}<div id="studio"><form id="login-form" class="contact-form"><h2>Owner sign in</h2><label>Email<input name="email" type="email" autocomplete="username" required></label><label>Password<input name="password" type="password" autocomplete="current-password" required></label><button class="button primary" type="submit">Sign in</button><p id="login-status" role="status"></p></form></div></div>`;
  default:return `<div class="container not-found">${heading('404 / Page not found','A page out of place.','The link may have changed. Return to the portfolio to find the right chapter.')}${link(base,'home','Back to the portfolio','button primary')}</div>`;
  }
}
function caseStudy(base,label,title,exp,body,aside){return `<div class="container"><div class="breadcrumb">${link(base,'teaching','Teaching journey')}</div>${heading(label,title,esc(exp?.title||''))}<div class="case-meta"><span>${esc(exp?.period||'')}</span><span>${esc(exp?.type||'')}</span></div><div class="case-layout"><article class="prose">${body}</article>${aside}</div></div>`}
