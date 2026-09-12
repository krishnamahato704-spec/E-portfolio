import {studySummary,recruiterFacts} from './recruiter.js?v=recruiter-20260912';
import {defaultContent} from './content.js?v=recruiter-20260912';
export const routes={
  home:{path:'',title:'History & Social Science Educator',nav:'Home'},
  profile:{path:'profile/',title:'Profile & Education',nav:'Profile'},
  teaching:{path:'teaching/',title:'Teaching Journey',nav:'Teaching'},
  resources:{path:'resources/',title:'Teaching Resources',nav:'Resources'},
  credentials:{path:'credentials/',title:'Credentials & Presentations',nav:'Credentials'},
  contact:{path:'contact/',title:'Contact',nav:'Contact'},
  resume:{path:'resume/',title:'Résumé',nav:'Résumé'},
  pehchaan:{path:'teaching/pehchaan/',title:'Pehchaan Teaching Internship'},
  observation:{path:'teaching/observation/',title:'School Observation at Amity'},
  democracy:{path:'teaching/democracy/',title:'Teaching Democracy: A Design Example'},
  admin:{path:'admin/',title:'Portfolio Studio'},
  '404':{path:'404.html',title:'Page Not Found'},
};
export const esc=s=>String(s??'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
export const safeUrl=s=>{try{const u=new URL(s);return ['https:','http:'].includes(u.protocol)?u.href:''}catch{return ''}};
const arrow='<span aria-hidden="true">↗</span>';
const link=(base,route,label,cls='text-link')=>`<a class="${cls}" href="${base}${routes[route].path}">${label} ${arrow}</a>`;
const tag=s=>`<span class="tag">${esc(s)}</span>`;
const list=items=>`<ul class="plain-list">${items.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`;
const knownImages=Object.fromEntries(defaultContent.certificates.map((x,i)=>[x.image,`certificate-${i+1}.webp`]));
knownImages[defaultContent.profile.portrait]='portrait.webp';
export function imageUrl(url,base){return knownImages[url]?base+'assets/'+knownImages[url]:safeUrl(url)}
function img(url,alt,base,cls='',priority=false){const src=imageUrl(url,base);return src?`<img class="${cls}" src="${esc(src)}" alt="${esc(alt)}" width="${cls==='portrait'?1154:1400}" height="1400" ${priority?'fetchpriority="high"':'loading="lazy"'} decoding="async">`:''}
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
    {r:'resources',num:'04',label:'Resources'},
    {r:'credentials',num:'05',label:'Credentials'},
    {r:'resume',num:'—',label:'Résumé'}
  ];
  return `<a class="skip-link" href="#main">Skip to content</a><header class="site-header"><div class="container header-inner"><a class="brand" href="${base}" aria-label="${esc(c.profile.name)} — Home"><span class="monogram" aria-hidden="true">KM<span>.</span></span><span class="brand-caption">${esc(c.profile.name)}<small>History & Social Science</small></span></a><button class="menu-toggle" aria-expanded="false" aria-controls="navigation">Menu <span class="menu-lines" aria-hidden="true"></span></button><div id="navigation" class="navigation-panel"><div class="navigation-top"><p id="navigation-title" class="eyebrow">Explore the portfolio</p><button class="menu-close" aria-label="Close navigation">Close <span aria-hidden="true">×</span></button></div><nav class="navigation-links" aria-label="Main navigation">${navItems.map(it=>`<a ${route===it.r || (it.r==='teaching'&&['pehchaan','observation','democracy'].includes(route))?'aria-current="page"':''} href="${base}${routes[it.r].path}"><span class="nav-index" aria-hidden="true">${it.num}</span>${it.label}</a>`).join('')}<a class="nav-contact" ${route==='contact'?'aria-current="page"':''} href="${base}contact/"><span class="nav-index" aria-hidden="true">06</span>Let’s Connect ${arrow}</a></nav><p class="navigation-note">History. Inquiry. Possibility.</p></div></div></header>`;
}
export function footer(base,c){return `<footer class="site-footer"><div class="container footer-top"><div><a class="footer-name" href="${base}">${esc(c.profile.name)}</a><p>History. Inquiry. Possibility.</p></div><div><p class="eyebrow">Start a conversation</p><a class="email-link" href="mailto:${esc(c.profile.email)}">${esc(c.profile.email)} ${arrow}</a></div></div><div class="container footer-bottom"><span>© ${new Date().getFullYear()} ${esc(c.profile.name)} · Teaching portfolio</span><div>${link(base,'resume','Résumé')}${link(base,'admin','Owner sign in')}</div></div></footer>`}
function qualificationRows(c){return c.qualifications.map(q=>`<article class="qualification"><p class="period">${esc(q.period)}</p><div><h3>${esc(q.title)}</h3><p>${esc(q.place)}</p>${q.note?`<p class="small">${esc(q.note)}</p>`:''}${q.expected?`<p class="small">Expected completion: ${esc(q.expected)}</p>`:''}</div><span class="status ${/progress/i.test(q.status)?'progress':''}">${esc(q.status)}</span></article>`).join('')}
function practiceRows(c){return `<div class="practice-grid">${c.practice.map((p,i)=>`<article><span class="index-number">${String(i+1).padStart(2,'0')}</span><h3>${esc(p.title)}</h3><p>${esc(p.text)}</p></article>`).join('')}</div>`}

function experienceRows(c,base){
  const defaultReflections = {
    pehchaan: {
      label: 'WHAT I LEARNT',
      text: 'Activity-based foundational literacy and numeracy, connecting letters to tangible games, and adapting to diverse learning paces.'
    },
    observation: {
      label: 'WHAT I NOTICED',
      text: 'Structured teacher questioning that makes historical thinking visible, and the routines that build classroom trust and participation.'
    }
  };

  return c.experiences.map((e,i)=>{
    const isOngoing = /ongoing|current/i.test(e.status) || /ongoing|current/i.test(e.period);
    const actions = [];
    if (e.id === 'panchsheel') {
      actions.push(link(base, 'democracy', 'Explore illustrative lesson design'));
    } else if (e.id === 'pehchaan') {
      actions.push(link(base, 'pehchaan', 'Explore the experience'));
      actions.push(link(base, 'credentials', 'View internship certificate'));
    } else if (e.id === 'observation') {
      actions.push(link(base, 'observation', 'Explore the observation'));
      actions.push(link(base, 'credentials', 'View related credentials'));
    } else if (['pehchaan','observation'].includes(e.id)) {
      actions.push(link(base, e.id, 'Explore the experience'));
    }

    const reflection = e.reflection
      ? { label: e.reflectionLabel || 'WHAT I LEARNT', text: e.reflection }
      : defaultReflections[e.id];

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
   <details class="experience-details"><summary>Activities & learning</summary>${list(e.points||[])}</details>
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
  }

  return `
 <article class="certificate-card archive-record" data-category="${esc(c.category||'Other')}">
  <div class="certificate-media-wrap">
   <div class="cert-record-header">
    <span class="cert-archive-tag" aria-hidden="true">${refNum}</span>
    <span class="cert-badge">${esc(c.category||'Credential')}</span>
   </div>
   <a class="certificate-image archive-doc-frame" href="${esc(safeUrl(c.image))}" target="_blank" rel="noopener noreferrer" aria-label="Open ${esc(c.title)} certificate document in a new tab">
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
    <a class="text-link cert-view-action" href="${esc(safeUrl(c.image))}" target="_blank" rel="noopener noreferrer">View certificate ${arrow}<span class="sr-only">: ${esc(c.title)} (new tab)</span></a>
    ${crosslink}
   </div>
  </div>
 </article>`;
}

function resourceRows(c,base='./'){
  return c.resources.map((r,i)=>{
    const thumbSrc = r.thumbnail || r.image;
    const typeLabel = r.type || r.category || 'Teaching material';
    const subjectLabel = r.subject || (r.category && r.category !== typeLabel ? r.category : '');
    const gradeLabel = r.grade || r.class || r.level;

    return `
 <article class="resource-row archive-resource-card" data-category="${esc(r.category||r.type||'Teaching material')}">
  ${thumbSrc ? `<div class="resource-thumb-wrap"><img class="resource-thumb" src="${esc(imageUrl(thumbSrc,base))}" alt="${esc(r.title)}" loading="lazy" decoding="async"></div>` : `<span class="resource-number" aria-hidden="true">${String(i+1).padStart(2,'0')}</span>`}
  <div class="resource-body">
   <div class="resource-meta-line">
    <span class="resource-type-tag">${esc(typeLabel)}</span>
    ${subjectLabel ? `<span class="meta-sep" aria-hidden="true">·</span><span class="resource-subject-tag">${esc(subjectLabel)}</span>` : ''}
    ${gradeLabel ? `<span class="meta-sep" aria-hidden="true">·</span><span class="resource-grade-tag">${esc(gradeLabel)}</span>` : ''}
   </div>
   <h3 class="resource-title">${esc(r.title)}</h3>
   ${r.description ? `<p class="resource-desc">${esc(r.description)}</p>` : ''}
  </div>
  ${r.url ? `<a class="text-link resource-link" href="${esc(safeUrl(r.url))}" target="_blank" rel="noopener noreferrer">Open file ${arrow}<span class="sr-only">: ${esc(r.title)} (new tab)</span></a>` : ''}
 </article>`;
  }).join('');
}

function philosophySection(c,base){
  const implications = [
    'Students examine primary sources, maps, and contradictory accounts before dates and timelines, framing facts as evidence in an ongoing inquiry.',
    'Learning outcomes remain shared and rigorous, while comprehension routes flex between textual sources, visual interpretations, and guided dialogue.',
    'Checks for understanding directly determine whether to reteach with fresh scaffolding, deepen source analysis, or advance to synthesis.'
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
        <h4>Rabindranath Tagore</h4>
        <p class="citation-thesis">Room for curiosity &amp; creative expression.</p>
        <p class="citation-note">Holistic education and creative inquiry remind me to keep History connected to the whole learner, cultivating imagination alongside analytical critique.</p>
       </div>
      </article>
      <article class="influence-citation">
       <span class="citation-tag" aria-hidden="true">ARCHIVE / REF-02</span>
       <div class="citation-body">
        <h4>Lev Vygotsky</h4>
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
       <span class="implication-label">Classroom Implication</span>
       <p class="implication-text">${implications[i]}</p>
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
      <p>How I would approach democracy through source work, discussion and visual interpretation.</p>
     </div>
     <a class="button light chapter-link" href="${base}teaching/democracy/">Explore the Democracy teaching design <span aria-hidden="true">↗</span></a>
    </div>
   </div>
  </div>
 </div>
</section>`;
}


function schoolProgression(c,base) {
 if(!c.experiences.length)return '';
 return '<section class="container section school-experience" aria-labelledby="school-experience-title"><div class="section-heading"><div><p class="eyebrow">Teaching in practice</p><h2 id="school-experience-title">Growing through the classroom.</h2></div>'+link(base,'teaching','Explore the teaching record')+'</div><p class="experience-lead">Teaching, observation and reflection from my developing practice.</p><ol class="school-stages" role="list">'+c.experiences.map(e=>'<li class="school-stage '+(e.status==='Ongoing'?'current-stage':'')+'"><p class="stage-duration">'+esc(e.duration||'—')+' <span>'+esc(e.durationUnit||'Experience')+'</span></p><h3>'+esc(e.type||e.category)+'<span class="stage-status">'+esc(e.status||'')+'</span></h3><p class="stage-school">'+esc(e.institution||e.title)+'</p><p class="small">'+esc(e.summary||e.period)+'</p>'+(['pehchaan','observation'].includes(e.id)?link(base,e.id,'Read the experience'):link(base,'teaching','View the record'))+'</li>').join('')+'</ol></section>';
}
function hiringSummary(c,base){return '<section class="container hiring-summary" aria-labelledby="hiring-title"><div class="hiring-intro"><p class="eyebrow">For schools & recruiters</p><h2 id="hiring-title">The essentials,<br> <em>at a glance.</em></h2><p>'+esc(studySummary(c))+'.</p><div class="hiring-links">'+link(base,'resume','Résumé / save PDF')+link(base,'credentials','Supporting credentials')+'</div></div><dl class="hiring-facts">'+recruiterFacts(c).map(([label,value])=>'<div><dt>'+esc(label)+'</dt><dd>'+esc(value)+'</dd></div>').join('')+'</dl><p class="hiring-note">Classes and boards describe my teaching interests; the records below document my experience and qualifications.</p></section>';}
function optionalProfileFacts(c){return recruiterFacts(c).filter(([key])=>['Based in','Work preferences','Target classes','Boards of interest'].includes(key)).map(([label,value])=>'<p><strong>'+esc(label)+':</strong> '+esc(value)+'</p>').join('');}

function profileRecruiterSystem(c) {
  const p = c.profile;
  const inProgress = studySummary(c).includes('in progress');

  const col1 = [
    {
      label: 'TEACHING FOCUS',
      value: 'History &amp; Social Science',
      note: 'Economics through academic study; English as second B.Ed. pedagogy with internship teaching exposure.'
    },
    {
      label: 'ROLE INTEREST',
      value: (p.roles && p.roles.length) ? p.roles.map(esc).join(' · ') : 'TGT History / Social Science · PGT History',
      note: 'Secondary (Classes 6–10) and Senior Secondary (Classes 11–12) teaching interests.'
    },
    {
      label: 'CURRENT STUDY',
      value: esc(studySummary(c)),
      note: inProgress
        ? 'Amity University (B.Ed.) and IGNOU (M.A. History · First year cleared). Expected completion May 2027.'
        : 'Formal academic qualifications documented in the education record below.'
    },
    {
      label: 'CLASSES',
      value: esc(p.targetClasses || 'Classes 6–12'),
      note: 'Middle school, secondary, and senior secondary stages.'
    },
    {
      label: 'AVAILABILITY',
      value: p.availability ? `Available from ${esc(p.availability)}` : 'Available from May 2027',
      note: 'Open to school visits, demonstration classes, and early discussions.'
    }
  ];

  const col2 = [
    {
      label: 'LOCATION',
      value: p.location ? `Based in ${esc(p.location)}` : 'Based in Noida',
      note: 'National Capital Region (NCR).'
    },
    {
      label: 'RELOCATION',
      value: esc(p.workPreferences || 'Open to relocation anywhere'),
      note: 'Open to relocation across India and international curricula schools.'
    },
    {
      label: 'ELIGIBILITY',
      value: esc(p.eligibility || 'CTET applied · Exam postponed'),
      note: 'Applied for Central Teacher Eligibility Test; exam postponed by conducting body. Not yet appeared.'
    },
    {
      label: 'BOARDS OF INTEREST',
      value: esc(p.targetBoards || 'CBSE, ICSE, Cambridge, IB'),
      note: 'Curricular interests for future teaching; pedagogical familiarity through teacher education.'
    },
    {
      label: 'LANGUAGES',
      value: (p.languages && p.languages.length) ? p.languages.map(esc).join(' · ') : 'English · Hindi · Nepali · Maithili',
      note: 'English and Hindi (medium of instruction); Nepali and Maithili (conversational &amp; cultural proficiency).'
    }
  ];

  const renderCol = (items) => `<dl class="recruiter-fact-list">` + items.map(item => `
    <div class="fact-unit">
      <dt class="fact-label">${item.label}</dt>
      <dd class="fact-content">
        <div class="fact-value">${item.value}</div>
        <p class="fact-clarification">${item.note}</p>
      </dd>
    </div>`).join('') + `</dl>`;

  return `<section class="section compact recruiter-fact-section" aria-labelledby="recruiter-facts-title">
    <div class="recruiter-system-inner">
      <header class="recruiter-system-header" data-motion="fade-up" data-motion-index="1">
        <div class="recruiter-header-badge">
          <span class="badge-code">DOSSIER / KM-REC</span>
          <span class="badge-dot" aria-hidden="true">·</span>
          <span class="badge-label">CANDIDATE ESSENTIALS</span>
        </div>
        <h2 id="recruiter-facts-title" class="recruiter-system-heading">Recruiter essentials,<br><em>at a glance.</em></h2>
        <p class="recruiter-system-lead">Direct pedagogical specialisations, qualification timelines, and hiring parameters for school leadership and department heads.</p>
      </header>
      <div class="recruiter-columns-grid">
        <div class="recruiter-fact-col" data-motion="fade-up" data-motion-index="2">
          <div class="recruiter-col-label">
            <span class="col-dot" aria-hidden="true"></span>
            <span>CORE PEDAGOGY &amp; READINESS</span>
          </div>
          ${renderCol(col1)}
        </div>
        <div class="recruiter-fact-col" data-motion="fade-up" data-motion-index="3">
          <div class="recruiter-col-label">
            <span class="col-dot" aria-hidden="true"></span>
            <span>LOGISTICS, ELIGIBILITY &amp; CONTEXT</span>
          </div>
          ${renderCol(col2)}
        </div>
      </div>
    </div>
  </section>`;
}

function profileAcademicChronology(c) {
  return `<section class="section compact profile-academic-section" aria-labelledby="academic-title">
    <div class="academic-system-inner">
      <header class="academic-system-header" data-motion="fade-up" data-motion-index="1">
        <div class="academic-header-badge">
          <span class="badge-code">ARCHIVE / KM-EDU</span>
          <span class="badge-dot" aria-hidden="true">·</span>
          <span class="badge-label">ACADEMIC JOURNEY</span>
        </div>
        <h2 id="academic-title" class="academic-system-heading">Academic journey,<br><em>an ongoing chronology.</em></h2>
        <p class="academic-system-lead">Formal qualifications in teacher education, postgraduate historical study, and undergraduate humanities foundations.</p>
      </header>
      <div class="academic-chronology" role="list">
        ${c.qualifications.map((q, i) => {
          const notes = [];
          if (q.note) notes.push(esc(q.note));
          if (q.expected) notes.push(`Expected completion ${esc(q.expected)}`);
          const isProgress = /progress/i.test(q.status);
          return `
          <article class="chrono-record" role="listitem" data-motion="fade-up" data-motion-index="${Math.min(i + 2, 6)}">
            <div class="chrono-sidebar">
              <time class="chrono-period">${esc(q.period)}</time>
              <span class="chrono-status ${isProgress ? 'status-progress' : 'status-completed'}">
                <span class="status-dot" aria-hidden="true"></span>
                <span>${esc(q.status)}</span>
              </span>
            </div>
            <div class="chrono-main">
              <h3 class="chrono-qualification">${esc(q.title)}</h3>
              <p class="chrono-institution">${esc(q.place)}</p>
              ${notes.length ? `<p class="chrono-notes">${notes.join(' · ')}</p>` : ''}
            </div>
          </article>`;
        }).join('')}
      </div>
    </div>
  </section>`;
}

function profileSkillsSection(c) {
  const groupDefs = [
    {
      id: 'historical-thinking',
      label: 'HISTORICAL THINKING',
      sublabel: 'Evidence & Historiography',
      tier: 'pedagogy',
      desc: 'Critical source analysis, evidentiary inquiry, and historiographical perspective.',
      skills: ['Historical thinking', 'Source analysis']
    },
    {
      id: 'teaching-practice',
      label: 'TEACHING PRACTICE',
      sublabel: 'Instructional Design & Environment',
      tier: 'pedagogy',
      desc: 'Inquiry-driven lesson structuring, purposeful classroom questioning, and active learning management.',
      skills: ['Lesson planning', 'Question design', 'Classroom management']
    },
    {
      id: 'assessment-support',
      label: 'ASSESSMENT & SUPPORT',
      sublabel: 'Formative Diagnostics & Scaffolding',
      tier: 'pedagogy',
      desc: 'Formative diagnostic checks, adaptive feedback loops, and differentiated learning pathways.',
      skills: ['Formative assessment', 'Differentiated support']
    },
    {
      id: 'digital-tools',
      label: 'DIGITAL TOOLS',
      sublabel: 'Productivity & Virtual Learning',
      tier: 'software',
      desc: 'Instructional design tools, documentation workflows, and blended learning environments.',
      skills: ['Canva', 'MS Office', 'Online Classroom']
    }
  ];

  return `<section class="section compact profile-skills-section" aria-labelledby="skills-title">
    <div class="skills-system-inner">
      <header class="skills-system-header" data-motion="fade-up" data-motion-index="1">
        <div class="skills-header-badge">
          <span class="badge-code">DOSSIER / KM-SKILL</span>
          <span class="badge-dot" aria-hidden="true">·</span>
          <span class="badge-label">COMPETENCY MATRIX</span>
        </div>
        <h2 id="skills-title" class="skills-system-heading">Skills &amp; competencies,<br><em>grounded in pedagogy.</em></h2>
        <p class="skills-system-lead">Disciplinary historical inquiry and classroom pedagogy take precedence, supported by practical digital tools.</p>
      </header>
      <div class="skills-groups-grid">
        ${groupDefs.map((g, i) => {
          const matchedSkills = g.skills.filter(s => c.competencies.includes(s));
          if (!matchedSkills.length) return '';
          const isPedagogy = g.tier === 'pedagogy';
          return `
          <div class="skill-group-card ${isPedagogy ? 'tier-pedagogy' : 'tier-software'}" data-motion="fade-up" data-motion-index="${i + 2}">
            <div class="skill-group-header">
              <div class="skill-group-meta">
                <span class="skill-group-tier">${isPedagogy ? 'CORE PEDAGOGY' : 'SUPPORTING TOOLS'}</span>
                <span class="skill-group-dot" aria-hidden="true">·</span>
                <span class="skill-group-sublabel">${esc(g.sublabel)}</span>
              </div>
              <h3 class="skill-group-title">${esc(g.label)}</h3>
              <p class="skill-group-desc">${esc(g.desc)}</p>
            </div>
            <ul class="skill-pill-list" aria-label="${esc(g.label)} competencies">
              ${matchedSkills.map(skill => `
                <li class="skill-pill">
                  <span class="skill-bullet" aria-hidden="true">✦</span>
                  <span>${esc(skill)}</span>
                </li>
              `).join('')}
            </ul>
          </div>`;
        }).join('')}
      </div>
    </div>
  </section>`;
}

function profileExitPath(base) {
  return `<section class="section compact profile-exit-path" aria-labelledby="profile-exit-title" data-motion="fade-up" data-motion-index="1">
    <div class="exit-path-inner">
      <div class="exit-path-copy">
        <div class="exit-continuity-tag">
          <span class="continuity-label">NEXT / TEACHING JOURNEY</span>
          <span class="continuity-dot" aria-hidden="true">·</span>
          <span class="continuity-chapter">CHAPTER 02</span>
        </div>
        <h2 id="profile-exit-title" class="exit-path-heading">See the pedagogy in practice.</h2>
        <p class="exit-path-lead">From teacher-education inquiry to on-ground classroom practice: school internships, community teaching, and lesson design.</p>
      </div>
      <div class="exit-path-actions">
        <a class="button primary exit-btn-primary" href="${base}teaching/">VIEW TEACHING JOURNEY <span class="exit-arrow" aria-hidden="true">→</span></a>
        <a class="button secondary exit-btn-secondary" href="${base}resume/">VIEW RESUME</a>
      </div>
    </div>
  </section>`;
}
function evidenceLinks(base){return '<nav class="evidence-links" aria-label="Explore teaching evidence">'+link(base,'democracy','Illustrative lesson design')+link(base,'credentials','Certificates & presentation')+'</nav>';}

function opening(c,base) {
 const p=c.profile;
 const ongoing=c.experiences.find(e=>e.status==='Ongoing' && /internship/i.test(e.type+' '+e.title));
 const status=ongoing?'Currently developing through school internship':c.qualifications.some(q=>q.title==='B.Ed.' && /progress/i.test(q.status))?'Currently developing through teacher education':'';
 return `<section class="hero opening-hero" aria-labelledby="opening-name"><div class="opening-traces" aria-hidden="true"><span></span><span></span><span></span></div><div class="container opening-inner"><div class="hero-copy"><p class="eyebrow opening-label" data-hero-step="1">History & Social Science · Educator</p><h1 id="opening-name" data-hero-step="2"><span>${esc(p.name.split(' ')[0])}</span><em>${esc(p.name.split(' ').slice(1).join(' '))}</em></h1><p class="hero-statement" data-hero-step="3">${esc(p.headline)}</p><div class="actions" data-hero-step="6">${link(base,'teaching','Explore My Teaching','button primary')}${link(base,'resume','View Résumé','button secondary')}</div><p class="hero-detail">${esc(studySummary(c))}<span>Available to join from ${esc(p.availability)}</span></p></div><div class="opening-visual"><span class="visual-reference" aria-hidden="true">01 / THE EDUCATOR</span><figure class="portrait-frame" data-hero-step="4"><div class="portrait-window">${img(p.portrait,'Portrait of '+p.name,base,'portrait',true)||'<div class="portrait-placeholder">Portrait<br>forthcoming</div>'}</div><figcaption><span>Curiosity is where<br><strong>understanding begins.</strong></span><span class="portrait-mark" aria-hidden="true">↗</span></figcaption></figure><p class="visual-annotation" data-hero-step="7" aria-hidden="true">Question · Explore · Reflect</p></div><div class="opening-bottom">${status?`<p class="opening-status" data-hero-step="5"><span class="status-dot" aria-hidden="true"></span>${esc(status)}</p>`:'<p class="opening-status" data-hero-step="5">History. Inquiry. Possibility.</p>'}<a class="opening-continue" href="#portfolio-start">Continue to the portfolio <span aria-hidden="true">↓</span></a></div></div></section><div id="portfolio-start" class="opening-transition" tabindex="-1"><span aria-hidden="true">The portfolio / Inquiry into practice</span></div>`;
}

export function view(route,c,base='./') {
 const p=c.profile;
 const pehchaan=c.experiences.find(e=>e.id==='pehchaan');
 const observation=c.experiences.find(e=>e.id==='observation');
 if((route==='pehchaan'&&!pehchaan)||(route==='observation'&&!observation))return view('404',c,base);
 switch(route){
 case 'home': return `${opening(c,base)}${hiringSummary(c,base)}${schoolProgression(c,base)}<section class="approach-section"><div class="container section">${sectionHead('02 / My approach','Less recall. More reasoning.')}${practiceRows(c)}${link(base,'democracy','See a teaching design example')}</div></section><section class="container closing-section"><p class="eyebrow">A developing educator, a considered approach</p><h2>Good teaching starts<br>with a good <em>question.</em></h2>${link(base,'contact','Let’s start a conversation','button primary')}</section>`;
  case 'profile': return `<div class="container profile-page"><header class="educator-opening" aria-labelledby="educator-title"><div class="educator-opening-grid"><div class="educator-col-left"><p class="eyebrow educator-chapter" data-motion="fade-up" data-motion-index="1"><span class="chapter-number" aria-hidden="true">01</span><span class="chapter-label">The Educator</span></p><h1 id="educator-title" class="educator-mantra" data-motion="fade-up" data-motion-index="2">HISTORY.<br>INQUIRY.<br>POSSIBILITY.</h1></div><div class="educator-col-right"><p class="educator-lead" data-motion="fade-up" data-motion-index="3">A developing History and Social Science educator academically grounded in History and Economics. Developing pedagogical practice and classroom inquiry through formal teacher education and on-ground school experience.</p><div class="educator-meta-badge" data-motion="fade-up" data-motion-index="4"><span class="meta-code">EDUCATOR RECORD / KM-01</span><span class="meta-sep" aria-hidden="true">·</span><span class="meta-field">FIELD / HISTORY &amp; SOCIAL SCIENCE</span></div></div></div><div class="educator-divider" data-motion="fade-up" data-motion-index="5" aria-hidden="true"><span class="divider-line"></span><span class="divider-notch"></span></div></header><section class="profile-narrative-section section compact"><div class="profile-editorial-composition"><div class="profile-portrait-col"><figure class="portrait-archival-frame"><div class="portrait-window" data-motion="image">${img(p.portrait,'Portrait of '+p.name,base,'portrait-img',false)||'<div class="portrait-placeholder">Portrait<br>forthcoming</div>'}</div><figcaption class="portrait-caption" data-motion="fade-up" data-motion-index="4"><div class="portrait-meta-line"><span class="meta-code">PORTRAIT / KM-01</span><span class="meta-dot" aria-hidden="true">·</span><span class="meta-field">ARCHIVAL RECORD</span></div><p class="caption-text"><strong>${esc(p.name)}</strong> · History &amp; Social Science Educator</p></figcaption></figure></div><div class="profile-narrative-col"><header class="narrative-header" data-motion="fade-up" data-motion-index="2"><p class="eyebrow narrative-eyebrow">Educator Narrative</p><h2 class="narrative-heading">Connecting the past<br>with the classroom.</h2></header><div class="narrative-blocks" data-motion="fade-up" data-motion-index="3"><div class="narrative-block"><p class="narrative-block-label">WHY HISTORY</p><p class="narrative-emphasis">History moved from memorising events to asking why they happened, how we know, and what they mean to different people.</p><p class="narrative-text">${c.about.includes('Partition')?'Studying historical sources and accounts of Partition shaped my commitment to teach through evidence, inquiry, and diverse perspectives.':esc(c.about)}</p></div><div class="narrative-block"><p class="narrative-block-label">WIDER HUMANITIES CONTEXT</p><p class="narrative-text">${esc(c.preparation)}</p></div><div class="narrative-block"><p class="narrative-block-label">CURRENT DEVELOPMENT</p><p class="narrative-text">${esc(studySummary(c))}. The education record below lists institutions, progress and expected completion.</p></div></div></div></div></section>${profileRecruiterSystem(c)}${profileAcademicChronology(c)}${profileSkillsSection(c)}${profileExitPath(base)}</div>`;
  case 'teaching': return `<div class="container teaching-page">${heading('02 / Teaching Journey','Learning to teach.<br><em>Teaching to understand.</em>','School internships, community teaching, observation and the ideas I am developing through them.')}<div class="journey-flow-strip" aria-label="Educator development continuum"><div class="flow-strip-intro"><span class="flow-strip-tag">FRAMEWORK</span><span class="flow-strip-desc">Pedagogical Continuum</span></div><div class="flow-sequence" role="list"><span class="flow-step" role="listitem">OBSERVE</span><span class="flow-sep" aria-hidden="true">→</span><span class="flow-step" role="listitem">QUESTION</span><span class="flow-sep" aria-hidden="true">→</span><span class="flow-step" role="listitem">PLAN</span><span class="flow-sep" aria-hidden="true">→</span><span class="flow-step" role="listitem">TEACH</span><span class="flow-sep" aria-hidden="true">→</span><span class="flow-step" role="listitem">ASSESS</span><span class="flow-sep" aria-hidden="true">→</span><span class="flow-step" role="listitem">REFLECT</span><span class="flow-sep" aria-hidden="true">→</span><span class="flow-step" role="listitem">GROW</span></div></div>${evidenceLinks(base)}<div class="collection-tools" data-enhancement hidden><label>Find teaching experience<input id="experience-search" type="search" placeholder="Search school, activity or date" aria-controls="experience-list"></label><div class="filters" role="group" aria-label="Filter teaching experience">${['All','Teaching','Observation'].map((s,i)=>`<button class="filter" data-experience-filter="${s}" aria-pressed="${i===0}">${s}</button>`).join('')}</div></div><p id="experience-count" class="collection-count" role="status" data-enhancement hidden></p><div class="timeline-container"><div class="timeline-track" aria-hidden="true"><div class="timeline-fill"></div></div><section id="experience-list" class="experience-timeline" aria-label="Teaching and observation record">${experienceRows(c,base)}</section></div><p id="experience-empty" class="empty-note" ${c.experiences.length?'hidden':''}>No experiences match this search.</p>${philosophySection(c,base)}</div>`;
  case 'pehchaan': return caseStudy(base,'Community teaching','Foundations first.<br><em>Confidence follows.</em>',pehchaan,`<h2>The teaching context</h2><p>The five-week NTCC internship at Pehchaan The Street School involved foundational literacy and numeracy with Nursery, LKG and UKG learners. Adult-literacy sessions through ULLAS extended the experience to five adult learners.</p><h2>What I contributed</h2>${list(pehchaan?.points||[])}<h2>What the experience developed</h2><p>Working with early learners gave me practical experience in activity-based methods, classroom management and community engagement. It connected teacher-education theory with the everyday work of explaining, practising and checking understanding.</p><h2>My next teaching step</h2><p>I want to carry a clear cycle into future lessons: notice what learners can already do, make the next idea visible, invite practice and use responses to plan the next step.</p>`, `<div class="evidence-aside" data-motion="fade"><p class="eyebrow">Documented experience</p><p>80 hours of community engagement at Pehchaan The Street School.</p><p>Certified as an on-ground intern / teacher.</p>${img(c.certificates.find(x=>x.image.includes('1787898375320'))?.image||defaultContent.certificates[1].image,'Pehchaan internship certificate',base)}${link(base,'credentials','View supporting credentials')}</div>`);
  case 'observation': return caseStudy(base,'School observation','The classroom<br><em>as a place to learn.</em>',observation,`<h2>Observation, with purpose</h2><p>The one-week observation internship at Amity International School, Mayur Vihar focused on History and Social Science classrooms. This was an observation placement, with attention to how lessons work in practice.</p><h2>What I paid attention to</h2>${list(observation?.points||[])}<h2>Beyond the lesson</h2><p>School culture, infrastructure and co-curricular integration offered a wider view of the learning environment. Classroom practice sits within that larger context.</p><h2>How it informs my practice</h2><p>I use reflection to connect what I observe with teacher-education theory: what happened, what supported participation and what I would consider when planning my own lesson.</p>`,`<aside class="note-panel"><p class="eyebrow">An observation lens</p><ol><li><strong>Questions</strong><p>How is thinking made visible?</p></li><li><strong>Participation</strong><p>Who is engaging, and how?</p></li><li><strong>Routines</strong><p>What gives the lesson structure?</p></li></ol></aside>`);
   case 'democracy': return `<div class="container democracy-page">${heading('Teaching design / Illustrative approach','Democracy.<br><em>More than a definition.</em>','A proposed classroom approach adapted from my teaching philosophy. This is a design example, not a report of a delivered lesson.')}<div class="democracy-layout"><aside class="democracy-sticky-col"><div class="planning-lens-card"><p class="eyebrow">Planning Lens</p><h3>Same intention.<br>Flexible support.</h3><p>Scaffold vocabulary and source reading. Offer spoken, written and visual ways to explain. Extend with a deeper comparison.</p><hr><div class="truth-notice"><p class="small">A full lesson plan and student assessment evidence have not yet been published.</p></div><nav class="democracy-stage-nav" aria-label="Lesson design stages"><ol><li><a href="#stage-question"><span class="st-num">01</span><span class="st-name">Question</span></a></li><li><a href="#stage-explore"><span class="st-num">02</span><span class="st-name">Explore</span></a></li><li><a href="#stage-discuss"><span class="st-num">03</span><span class="st-name">Discuss</span></a></li><li><a href="#stage-explain"><span class="st-num">04</span><span class="st-name">Explain</span></a></li><li><a href="#stage-assess"><span class="st-num">05</span><span class="st-name">Assess</span></a></li><li><a href="#stage-reflect"><span class="st-num">06</span><span class="st-name">Reflect</span></a></li></ol></nav><div class="planning-lens-link">${link(base,'resources','Browse available resources')}</div></div></aside><article class="democracy-story-col prose"><section id="stage-question" class="democracy-stage" data-motion="fade-up"><div class="stage-header"><span class="stage-badge">STAGE 01</span><p class="eyebrow">The Shared Intention &amp; Opening Inquiry</p></div><h2>The shared learning intention</h2><p>Help learners explain democracy, consider different perspectives and support their understanding with evidence.</p><p class="pull-quote" data-motion="fade-right">“How do people get a voice in the decisions that affect them?”</p><p>Begin by inviting initial ideas and everyday dilemmas—such as how household or classroom decisions are resolved. Clarify essential vocabulary (representation, consensus, accountability) to ensure no learner is held back by terminology before entering the concept.</p></section><section id="stage-explore" class="democracy-stage" data-motion="fade-up"><div class="stage-header"><span class="stage-badge">STAGE 02</span><p class="eyebrow">Source Investigation</p></div><h2>Explore through historical evidence</h2><p>Provide primary and secondary source extracts showing different historical forms of governance. Offer tiered reading prompts: basic guiding questions for vocabulary support, alongside comparison prompts asking how ancient assemblies contrast with modern universal adult suffrage.</p></section><section id="stage-discuss" class="democracy-stage" data-motion="fade-up"><div class="stage-header"><span class="stage-badge">STAGE 03</span><p class="eyebrow">Visual Dialogue</p></div><h2>Discuss and interpret</h2><p>Use visual artifacts—such as historic voting queues, committee photographs, and protest prints—to make abstract democratic rights tangible. In structured pairs, students explain what the visual evidence reveals about citizen agency and power.</p></section><section id="stage-explain" class="democracy-stage" data-motion="fade-up"><div class="stage-header"><span class="stage-badge">STAGE 04</span><p class="eyebrow">Differentiated Pathways</p></div><h2>Offer different pathways</h2><div class="pathway"><span class="index-number">01</span><h3>Read, compare, discuss.</h3><p>Use reference materials, contrasting perspectives and primary sources. Offer guided prompts and extend the task through comparison and debate.</p></div><div class="pathway"><span class="index-number">02</span><h3>Look, interpret, explain.</h3><p>Use paintings, photographs or video to make an abstract idea tangible. Ask learners to explain what a visual source suggests and support their interpretation.</p></div></section><section id="stage-assess" class="democracy-stage" data-motion="fade-up"><div class="stage-header"><span class="stage-badge">STAGE 05</span><p class="eyebrow">Formative Checking</p></div><h2>Check for understanding</h2><p>Ask learners to explain the concept with an example and a reason. Use their responses to identify where a new explanation, further scaffolding or extension is needed.</p><div class="assessment-callout"><p class="callout-title">Adaptive Feedback Loop</p><p class="small">Responses that confuse election mechanics with democratic culture prompt targeted small-group clarification; strong grasp opens the floor to discussions on institutional checks and balances.</p></div></section><section id="stage-reflect" class="democracy-stage" data-motion="fade-up"><div class="stage-header"><span class="stage-badge">STAGE 06</span><p class="eyebrow">Pedagogical Review</p></div><h2>Reflect and adjust</h2><p>Consider whether both routes supported the same depth of understanding, and what should change in the next lesson.</p><p>A lesson design is not a static script; it is a hypothesis. Reflection asks: Did quieter voices participate? Did visual learners articulate reasoning as deeply as textual readers? The answers shape tomorrow’s questions.</p></section></article></div><section class="democracy-continuation-bridge" data-motion="fade-up"><div class="continuation-meta"><span class="continuation-tag">NEXT CHAPTER / 04</span><h3>Teacher’s Resource Library</h3><p>Curated lesson designs, classroom frameworks, and teaching materials from on-ground practice.</p></div><a class="button secondary" href="${base}resources/">Explore Teaching Resources <span aria-hidden="true">→</span></a></section></div>`;
   case 'resources': return `<div class="container resources-page">${heading('04 / Teaching Resources','Teacher’s Resource Library.<br><em>Ideas into practice.</em>','Curated lesson designs, classroom frameworks, and teaching materials from on-ground practice.')}<section class="resource-feature" data-motion="fade-up" aria-labelledby="featured-design-title"><div class="feature-copy"><div class="feature-meta-line"><span class="feature-tag">FEATURED TEACHING ARTEFACT</span><span class="meta-sep" aria-hidden="true">·</span><span class="feature-field">Social Science &amp; History · Middle &amp; Secondary School</span></div><h2 id="featured-design-title" class="feature-title">Teaching Democracy: More than a definition</h2><p class="feature-purpose">A structured classroom design planning for a single shared learning intention through differentiated comprehension routes: primary source evidence, structured dialogue, and visual interpretation.</p><div class="feature-pathways-block"><span class="pathways-label">ONE CONCEPT · DIFFERENT PATHWAYS</span><div class="feature-sequence" role="list"><span class="seq-step" role="listitem">01 Question</span><span class="seq-sep" aria-hidden="true">→</span><span class="seq-step" role="listitem">02 Explore</span><span class="seq-sep" aria-hidden="true">→</span><span class="seq-step" role="listitem">03 Discuss</span><span class="seq-sep" aria-hidden="true">→</span><span class="seq-step" role="listitem">04 Explain</span><span class="seq-sep" aria-hidden="true">→</span><span class="seq-step" role="listitem">05 Assess</span><span class="seq-sep" aria-hidden="true">→</span><span class="seq-step" role="listitem">06 Reflect</span></div></div><div class="feature-actions"><a class="button primary feature-cta" href="${base}teaching/democracy/">View teaching design <span class="cta-arrow" aria-hidden="true">→</span></a><span class="feature-note">Full web-readable lesson approach</span></div></div><div class="feature-archival-side" aria-hidden="true"><span class="archival-code">ARTEFACT / DEM-01</span><p class="archival-mantra">INQUIRY<br>EVIDENCE<br>PERSPECTIVE<br>REASONING</p></div></section><section class="section resource-library">${sectionHead('Teacher’s Resource Library','Curated teaching files.')}<div class="resource-collection-tools ${c.resources.length===0?'is-catalog-empty':''}" data-enhancement hidden><label class="collection-search">Search teaching files<input id="resource-search" type="search" placeholder="Search title, category or description" aria-controls="resource-list"></label><div class="filters" role="group" aria-label="Filter resources">${['All','Lesson plan','Teaching material','Assessment','Presentation'].map((s,i)=>`<button class="filter" data-filter="${esc(s)}" aria-pressed="${i===0}">${esc(s)}</button>`).join('')}</div></div><p class="collection-count" id="resource-count" role="status">${c.resources.length} ${c.resources.length===1?'file':'files'} in the library</p><div id="resource-list">${resourceRows(c,base)}</div><div id="resource-empty" class="empty-note archival-empty-state" ${c.resources.length?'hidden':''}><div class="empty-state-badge">ARCHIVE RECORD / STATUS: PENDING PUBLICATION</div><h3 class="empty-state-title">Curated Teaching Files</h3><p class="empty-state-lead">Lesson plans, unit plans, and student assessment tasks have not yet been published. Selected teaching files and classroom artefacts will appear here as they are published from on-ground school practice.</p><div class="empty-state-pathways"><p class="pathways-heading">In the meantime, explore verified work and pedagogical approaches:</p><div class="empty-pathway-links"><a class="text-link" href="${base}teaching/democracy/">Democracy teaching design ${arrow}</a><a class="text-link" href="${base}teaching/">Teaching journey &amp; observations ${arrow}</a><a class="text-link" href="${base}credentials/">Credentials &amp; presentations ${arrow}</a></div></div></div></section>${c.gallery.length?`<section class="section">${sectionHead('Gallery','Moments from practice.')}<div class="gallery-grid">${c.gallery.map(g=>`<figure>${img(g.image,g.title,base)}<figcaption>${esc(g.title)}</figcaption></figure>`).join('')}</div></section>`:''}<section class="resource-continuation-bridge" data-motion="fade-up"><div class="continuation-meta"><span class="continuation-tag">NEXT CHAPTER / 05</span><h3>Evidence &amp; Credentials</h3><p>Academic degrees, verified teaching internships, and seminar presentations.</p></div><a class="button secondary" href="${base}credentials/">Explore Credentials &amp; Evidence <span aria-hidden="true">→</span></a></section></div>`;
   case 'credentials': return `<div class="container credentials-page">${heading('05 / Evidence &amp; Credentials','The work.<br><em>The record.</em>','Academic qualifications, teaching internships, and seminar presentation records.')}<section class="presentation-callout" data-motion="fade-up"><div class="callout-header"><span class="callout-badge">RESEARCH &amp; PRESENTATION</span><span class="meta-sep" aria-hidden="true">·</span><span class="callout-date">March 2026</span></div><h2>Rootedness in India: NEP 2020 &amp; Teacher Education</h2><p class="callout-lead">Co-author and presenter on NEP 2020 and Indian Knowledge Systems in teacher education, at the international seminar organised by Amity Institute of Education.</p><div class="callout-link">${link(base,'teaching','Connect with teaching journey')}</div></section><section class="section credentials-archive-section"><div class="collection-tools" data-enhancement hidden><label>Find a credential<input id="credential-search" type="search" placeholder="Search title, issuer or date" aria-controls="credential-list"></label><div class="filters" role="group" aria-label="Filter credentials">${['All',...new Set(c.certificates.map(x=>x.category||'Other'))].map((s,i)=>`<button class="filter" data-credential-filter="${esc(s)}" aria-pressed="${i===0}">${esc(s)}</button>`).join('')}</div></div><p id="credential-count" class="collection-count" role="status" data-enhancement hidden></p><p id="credential-empty" class="empty-note" hidden>No credentials match this search.</p><div class="certificate-grid" id="credential-list">${c.certificates.map((x,i)=>certificateCard(x,base,i)).join('')}</div>${c.certificates.length?'':'<p class="empty-note">No credentials are currently published.</p>'}</section><section class="credentials-continuation-bridge" data-motion="fade-up"><div class="continuation-meta"><span class="continuation-tag">NEXT CHAPTER / 06</span><h3>Let’s Connect</h3><p>For school teaching opportunities, internships, and conversations on History and Social Science education.</p></div><a class="button secondary" href="${base}contact/">Start a Conversation <span aria-hidden="true">→</span></a></section></div>`;
   case 'resume': return `<div class="container resume-page">${heading('Résumé / Professional overview',esc(p.name),'History & Social Science · Emerging educator')}<div class="actions print-actions"><button class="button primary" id="print-resume">Print / save as PDF <span aria-hidden="true">↓</span></button>${p.cv&&safeUrl(p.cv)?`<a class="button secondary" href="${esc(safeUrl(p.cv))}" target="_blank" rel="noopener noreferrer">Download CV ${arrow}</a>`:''}${link(base,'contact','Contact')}</div><p><a href="mailto:${esc(p.email)}">${esc(p.email)}</a> · ${p.languages.map(esc).join(' · ')}</p><section class="resume-section"><h2>Professional profile</h2><p>${esc(p.summary)}</p><p>Roles of interest: ${p.roles.map(esc).join('; ')}. ${esc(studySummary(c))}.</p><p><strong>${esc(p.eligibility)}</strong> · Available to join from <strong>${esc(p.availability)}</strong>.</p></section><section class="resume-section"><h2>Location & teaching interests</h2>${optionalProfileFacts(c)}</section><section class="resume-section"><h2>Education</h2>${qualificationRows(c)}</section><section class="resume-section"><h2>Teaching & observation</h2>${c.experiences.map(e=>`<article><h3>${esc(e.title)}</h3><p class="small">${esc(e.period)} · ${esc(e.type)}</p>${list(e.points||[])}</article>`).join('')}</section><section class="resume-section"><h2>Skills</h2><p>${c.competencies.map(esc).join(' · ')}</p></section><section class="resume-section"><h2>Professional learning & presentation</h2>${c.certificates.filter(x=>['Presentation','Professional learning'].includes(x.category)).map(x=>`<p><strong>${esc(x.title)}</strong><br>${esc(x.description)}<br><span class="small">${esc(x.issuer)} · ${esc(x.date)}</span></p>`).join('')}</section></div>`;
   case 'contact': return `<div class="container contact-page"><header class="page-heading chapter-heading contact-hero-header" data-motion="fade-up"><p class="eyebrow"><span class="chapter-number" aria-hidden="true">06</span><span class="chapter-label">LET'S CONNECT</span></p><h1 class="contact-closing-title">Good teaching starts<br>with a good <em>question.</em></h1><p class="lead contact-closing-sub">Let’s start a conversation. Open for school teaching positions, internships, and educational collaboration.</p></header><div class="contact-layout"><section class="contact-dossier" data-motion="fade-right"><div class="contact-section-inner"><div class="contact-channel-block"><p class="eyebrow">Email me directly</p><a class="contact-email" href="mailto:${esc(p.email)}">${esc(p.email)} ${arrow}</a><div class="contact-actions"><button class="text-link copy-email" data-email="${esc(p.email)}">Copy email address</button><p id="copy-status" role="status"></p></div></div><div class="contact-note"><div class="recruiter-highlight-badge"><span class="status-dot" aria-hidden="true"></span><span>Available from ${esc(p.availability)}</span></div><p class="contact-eligibility"><strong>${esc(p.eligibility)}</strong> · ${esc(studySummary(c))}.</p>${optionalProfileFacts(c)}<div class="recruiter-prompt"><p class="eyebrow">For schools &amp; recruiters</p><p class="small">Please include the school name, subject, classes to be taught, location and proposed joining timeline.</p></div></div></div></section><section class="contact-form-section" data-motion="fade-left"><form id="contact-form" class="contact-form"><h2>Prepare an introduction.</h2><p>This opens your email app with a draft. You can review it before sending.</p><label>Your name<input name="name" autocomplete="name" required maxlength="100"></label><label>Your email<input type="email" name="email" autocomplete="email" required maxlength="200"></label><label>School / organisation<input name="school" autocomplete="organization" maxlength="150"></label><label>Your message<textarea name="message" rows="5" required maxlength="3000"></textarea></label><button class="button primary" type="submit">Open email draft ${arrow}</button><p id="contact-status" role="status"></p></form><div class="contact-resume-card"><div class="resume-card-body"><span class="card-tag">DOCUMENTATION</span><h4>Academic &amp; Teaching Résumé</h4><p class="small">Formal education chronology, documented school internships, and teaching competencies formatted for academic review.</p></div><a class="button secondary resume-card-btn" href="${base}resume/">View Résumé / Save PDF ${arrow}</a></div></section></div></div>`;
 case 'admin':return `<div class="container admin-page">${heading('Owner workspace','Portfolio Studio.','Update your profile, teaching experience and files. Changes go live only when you publish.')}<div id="studio"><form id="login-form" class="contact-form"><h2>Owner sign in</h2><label>Email<input name="email" type="email" autocomplete="username" required></label><label>Password<input name="password" type="password" autocomplete="current-password" required></label><button class="button primary" type="submit">Sign in</button><p id="login-status" role="status"></p></form></div></div>`;
 default:return `<div class="container not-found">${heading('404 / Page not found','A page out of place.','The link may have changed. Return to the portfolio to find the right chapter.')}${link(base,'home','Back to the portfolio','button primary')}</div>`;
 }
}
function caseStudy(base,label,title,exp,body,aside){return `<div class="container"><div class="breadcrumb">${link(base,'teaching','Teaching journey')}</div>${heading(label,title,esc(exp?.title||''))}<div class="case-meta"><span>${esc(exp?.period||'')}</span><span>${esc(exp?.type||'')}</span></div><div class="case-layout"><article class="prose">${body}</article>${aside}</div></div>`}
