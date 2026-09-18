import {democracyView,evidenceFeature,democracyResource,documentUrl} from './evidence.js?v=evidence-20260917';
import {studySummary,recruiterFacts} from './recruiter.js?v=evidence-20260917';
import {defaultContent} from './content.js?v=evidence-20260917';
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
const knownImages=Object.fromEntries(defaultContent.certificates.map((x,i)=>[x.image,`certificate-${i+1}.webp`]));
knownImages[defaultContent.profile.portrait]='portrait.webp';
knownImages['assets/democracy-thumb.webp']='democracy-thumb.webp';
knownImages['./assets/democracy-thumb.webp']='democracy-thumb.webp';
export function imageUrl(url,base){
  if(!url) return '';
  if(knownImages[url]) return base+'assets/'+knownImages[url];
  if(url.startsWith('./assets/')||url.startsWith('assets/')) return base + url.replace(/^\.?\//, '');
  return safeUrl(url);
}
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
    {r:'resources',num:'03',label:'Teaching Artifacts'},
    {r:'credentials',num:'04',label:'Credentials'},
    {r:'resume',num:'—',label:'Résumé'}
  ];
  return `<a class="skip-link" href="#main">Skip to content</a><header class="site-header"><div class="container header-inner"><a class="brand" href="${base}" aria-label="${esc(c.profile.name)} — Home"><span class="monogram" aria-hidden="true">KM<span>.</span></span><span class="brand-caption">${esc(c.profile.name)}<small>History, Social Science & English</small></span></a><details class="fallback-navigation"><summary>Menu</summary><nav aria-label="Main navigation">${[...navItems,{r:'contact',label:'Let’s Connect'}].map(it=>`<a href="${base}${routes[it.r].path}">${it.label}</a>`).join('')}</nav></details><button class="menu-toggle" aria-expanded="false" aria-controls="navigation">Menu <span class="menu-lines" aria-hidden="true"></span></button><div id="navigation" class="navigation-panel"><div class="navigation-top"><p id="navigation-title" class="eyebrow">Explore the portfolio</p><button class="menu-close" aria-label="Close navigation">Close <span aria-hidden="true">×</span></button></div><nav class="navigation-links" aria-label="Main navigation">${navItems.map(it=>`<a ${route===it.r || (it.r==='teaching'&&['pehchaan','observation','democracy'].includes(route))?'aria-current="page"':''} href="${base}${routes[it.r].path}"><span class="nav-index" aria-hidden="true">${it.num}</span>${it.label}</a>`).join('')}<a class="nav-contact" ${route==='contact'?'aria-current="page"':''} href="${base}contact/"><span class="nav-index" aria-hidden="true">05</span>Let’s Connect ${arrow}</a></nav><p class="navigation-note">History. Inquiry. Possibility.</p></div></div></header>`;
}
export function footer(base,c){return `<footer class="site-footer"><div class="container footer-top"><div><a class="footer-name" href="${base}">${esc(c.profile.name)}</a><p>History. Inquiry. Possibility.</p></div><div><p class="eyebrow">Start a conversation</p><a class="email-link" href="mailto:${esc(c.profile.email)}">${esc(c.profile.email)} ${arrow}</a></div></div><div class="container footer-bottom"><span>© ${new Date().getFullYear()} ${esc(c.profile.name)} · Teaching portfolio</span><div>${link(base,'resume','Résumé')}${link(base,'admin','Owner sign in')}</div></div></footer>`}
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
    const thumbSrc = r.image || r.thumbnail || (/\.(jpg|jpeg|png|webp)($|\?)/i.test(r.url) ? r.url : '');
    const typeLabel = r.type || r.category || 'Teaching material';
    const subjectLabel = r.subject || (r.category && r.category !== typeLabel ? r.category : '');
    const gradeLabel = r.grade || r.class || r.level;

    return `
 <article class="resource-row archive-resource-card" data-category="${esc(r.category||r.type||'Teaching material')}">
  <div class="resource-thumb-wrap">
    ${thumbSrc ? `
      <img class="resource-thumb" src="${esc(imageUrl(thumbSrc,base))}" alt="Thumbnail preview for ${esc(r.title)}" loading="lazy" decoding="async">
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

function profileRecruiterSystem(c){return `<section class="section compact recruiter-fact-section" aria-labelledby="recruiter-facts-title"><h2 id="recruiter-facts-title">Recruiter essentials.</h2><p class="lead">${esc(c.profile.summary)}</p><p>${esc(studySummary(c))}. Role and board interests describe future applications; qualification status is listed below.</p><dl class="recruiter-fact-list concise-facts">${recruiterFacts(c).map(([label,value])=>`<div class="fact-unit"><dt class="fact-label">${esc(label)}</dt><dd class="fact-content">${esc(value)}</dd></div>`).join('')}</dl></section>`;}

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

function profileSkillsSection(c){return `<section class="section compact profile-skills-section"><h2>Developing teaching practice.</h2><p>These are areas of preparation and practice. The published artifacts show the evidence currently available.</p><ul class="skill-pill-list">${c.competencies.map(skill=>`<li class="skill-pill">${esc(skill)}</li>`).join('')}</ul></section>`;}

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
function evidenceLinks(base){return '<nav class="evidence-links" aria-label="Explore teaching evidence">'+link(base,'democracy','Published lesson plan')+link(base,'credentials','Certificates & presentation')+'</nav>';}

function homePhilosophy(c,base){return `<section class="section container home-philosophy-section"><div class="section-heading"><div><p class="eyebrow">Teaching approach</p><h2>Beliefs connected<br><em>to planning.</em></h2></div>${link(base,'teaching','Read philosophy, evidence & next steps')}</div>${practiceRows(c)}</section>`;}

function homeFeaturedArtifact(c,base){return evidenceFeature(c,base,true);}

function homeCredentialsHighlight(c,base){return `<section class="section container home-credentials-section"><div class="section-heading"><div><p class="eyebrow">Academic preparation</p><h2>Qualifications and<br><em>supporting documents.</em></h2></div>${link(base,'credentials','View supporting credentials')}</div><div class="credentials-curated-grid">${c.qualifications.slice(0,3).map(q=>`<article class="curated-cred-card"><h3>${esc(q.title)}</h3><p class="cred-place">${esc(q.place)}</p>${q.note?`<p class="cred-note">${esc(q.note)}</p>`:''}${q.expected?`<p class="small">Expected completion: ${esc(q.expected)}</p>`:''}<span class="status ${/progress/i.test(q.status)?'progress':''}">${esc(q.status)}</span></article>`).join('')}</div></section>`;}

function homeReflection(c,base){return `<section class="section compact container home-reflection-section"><div class="reflection-quote-card"><p class="eyebrow">Professional development</p><h2 id="reflection-title">Making reflection<br><em>part of the record.</em></h2><p class="reflection-body">My next evidence priority is a completed lesson reflection: the question I asked, what learners’ responses showed, and the change I would make. The published Democracy plan includes prompts for this review.</p>${link(base,'democracy','Read the reflection section')}</div></section>`;}

function homeClosingCTA(c, base) {
  const p = c.profile;
  return `
<section class="container home-closing-section">
  <div class="closing-cta-card">
    <div class="closing-copy">
      <p class="eyebrow">Let's Connect</p>
      <h2>Looking for a thoughtful,<br>inquiry-driven <em>educator?</em></h2>
      <p class="closing-lead">Open for school teaching positions (TGT Social Science, TGT English, PGT History post-M.A. 2027), school visits, and demonstration lessons.</p>
      <p class="closing-meta">
        <strong>${esc(p.eligibility)}</strong> · Available from <strong>${esc(p.availability)}</strong>
      </p>
    </div>
    <div class="closing-actions">
      ${link(base, 'contact', 'Start a Conversation', 'button primary')}
      <a class="button secondary" href="${base}resume/">View Résumé / PDF ↗</a>
    </div>
  </div>
</section>`;
}

function opening(c,base) {
 const p=c.profile;
 const ongoing=c.experiences.find(e=>e.status==='Ongoing' && /internship/i.test(e.type+' '+e.title));
 const status=ongoing?'Currently developing through school internship':c.qualifications.some(q=>q.title==='B.Ed.' && /progress/i.test(q.status))?'Currently developing through teacher education':'';
  return `<section class="hero opening-hero" aria-labelledby="opening-name"><video class="hero-bg-video" autoplay loop muted playsinline preload="none" poster="${base}assets/hero-poster.webp" data-src="${base}assets/hero-video.mp4" aria-hidden="true"></video><button class="video-toggle" hidden type="button" aria-pressed="false">Pause background video</button><div class="opening-traces" aria-hidden="true"><span></span><span></span><span></span></div><div class="container opening-inner"><div class="hero-copy"><p class="eyebrow opening-label" data-hero-step="1">${esc(p.eyebrow)}</p><h1 id="opening-name" data-hero-step="2"><span>${esc(p.name.split(' ')[0])}</span><em>${esc(p.name.split(' ').slice(1).join(' '))}</em></h1><p class="hero-statement" data-hero-step="3">${esc(p.headline)}</p><div class="actions" data-hero-step="6">${link(base,'teaching','Explore My Teaching','button primary')}${link(base,'resume','View Résumé','button secondary')}</div><p class="hero-detail">${esc(studySummary(c))}<span>Available to join from ${esc(p.availability)}</span></p></div><div class="opening-visual"><span class="visual-reference" aria-hidden="true">01 / THE EDUCATOR</span><figure class="portrait-frame" ><div class="portrait-window">${img(p.portrait,'Portrait of '+p.name,base,'portrait',true)||'<div class="portrait-placeholder">Portrait<br>forthcoming</div>'}</div><figcaption><span>Curiosity is where<br><strong>understanding begins.</strong></span><span class="portrait-mark" aria-hidden="true">↗</span></figcaption></figure><p class="visual-annotation" data-hero-step="7" aria-hidden="true">Question · Explore · Reflect</p></div><div class="opening-bottom">${status?`<p class="opening-status" data-hero-step="5"><span class="status-dot" aria-hidden="true"></span>${esc(status)}</p>`:'<p class="opening-status" data-hero-step="5">History. Inquiry. Possibility.</p>'}<a class="opening-continue" href="#portfolio-start">Continue to the portfolio <span aria-hidden="true">↓</span></a></div></div></section><div id="portfolio-start" class="opening-transition" tabindex="-1"><span aria-hidden="true">The portfolio / Inquiry into practice</span></div>`;
}

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
export function view(route,c,base='./') {
 const p=c.profile;
 const pehchaan=c.experiences.find(e=>e.id==='pehchaan');
 const observation=c.experiences.find(e=>e.id==='observation');
  if((route==='pehchaan'&&!pehchaan)||(route==='observation'&&!observation))return view('404',c,base);
  switch(route){
  case 'home': return `${opening(c,base)}${hiringSummary(c,base)}${schoolProgression(c,base)}${homePhilosophy(c,base)}${homeFeaturedArtifact(c,base)}${homeCredentialsHighlight(c,base)}${homeReflection(c,base)}${homeClosingCTA(c,base)}`;
  case 'profile': return `<div class="container profile-page"><header class="educator-opening" aria-labelledby="educator-title"><div class="educator-opening-grid"><div class="educator-col-left"><p class="eyebrow educator-chapter" data-motion="fade-up" data-motion-index="1"><span class="chapter-number" aria-hidden="true">01</span><span class="chapter-label">The Educator</span></p><h1 id="educator-title" class="educator-mantra" data-motion="fade-up" data-motion-index="2">HISTORY.<br>INQUIRY.<br>POSSIBILITY.</h1></div><div class="educator-col-right"><p class="educator-lead" data-motion="fade-up" data-motion-index="3">${esc(p.summary)}</p><div class="educator-meta-badge" data-motion="fade-up" data-motion-index="4"><span class="meta-code">EDUCATOR RECORD / KM-01</span><span class="meta-sep" aria-hidden="true">·</span><span class="meta-field">FIELD / HISTORY &amp; SOCIAL SCIENCE</span></div></div></div><div class="educator-divider" data-motion="fade-up" data-motion-index="5" aria-hidden="true"><span class="divider-line"></span><span class="divider-notch"></span></div></header><section class="profile-narrative-section section compact"><div class="profile-editorial-composition"><div class="profile-portrait-col"><figure class="portrait-archival-frame"><div class="portrait-window" data-motion="image">${img(p.portrait,'Portrait of '+p.name,base,'portrait-img',false)||'<div class="portrait-placeholder">Portrait<br>forthcoming</div>'}</div><figcaption class="portrait-caption" data-motion="fade-up" data-motion-index="4"><div class="portrait-meta-line"><span class="meta-code">PORTRAIT / KM-01</span><span class="meta-dot" aria-hidden="true">·</span><span class="meta-field">ARCHIVAL RECORD</span></div><p class="caption-text"><strong>${esc(p.name)}</strong> · History &amp; Social Science Educator</p></figcaption></figure></div><div class="profile-narrative-col"><header class="narrative-header" data-motion="fade-up" data-motion-index="2"><p class="eyebrow narrative-eyebrow">Educator Narrative</p><h2 class="narrative-heading">Connecting the past<br>with the classroom.</h2></header><div class="narrative-blocks" data-motion="fade-up" data-motion-index="3"><div class="narrative-block"><p class="narrative-block-label">WHY HISTORY</p><p class="narrative-text">${esc(c.about)}</p></div><div class="narrative-block"><p class="narrative-block-label">WIDER HUMANITIES CONTEXT</p><p class="narrative-text">${esc(c.preparation)}</p></div><div class="narrative-block"><p class="narrative-block-label">CURRENT DEVELOPMENT</p><p class="narrative-text">${esc(studySummary(c))}. The education record below lists institutions, progress and expected completion.</p></div></div></div></div></section>${profileRecruiterSystem(c)}${profileAcademicChronology(c)}${profileSkillsSection(c)}${profileExitPath(base)}</div>`;
  case 'teaching': return `<div class="container teaching-page">${heading('02 / Teaching Journey','Learning to teach.<br><em>Teaching to understand.</em>','School internships, community teaching, observation and the ideas I am developing through them.')}<div class="journey-flow-strip" aria-label="Educator development continuum"><div class="flow-strip-intro"><span class="flow-strip-tag">FRAMEWORK</span><span class="flow-strip-desc">Pedagogical Continuum</span></div><div class="flow-sequence" role="list"><span class="flow-step" role="listitem">OBSERVE</span><span class="flow-sep" aria-hidden="true">→</span><span class="flow-step" role="listitem">QUESTION</span><span class="flow-sep" aria-hidden="true">→</span><span class="flow-step" role="listitem">PLAN</span><span class="flow-sep" aria-hidden="true">→</span><span class="flow-step" role="listitem">TEACH</span><span class="flow-sep" aria-hidden="true">→</span><span class="flow-step" role="listitem">ASSESS</span><span class="flow-sep" aria-hidden="true">→</span><span class="flow-step" role="listitem">REFLECT</span><span class="flow-sep" aria-hidden="true">→</span><span class="flow-step" role="listitem">GROW</span></div></div>${evidenceLinks(base)}<div class="collection-tools" data-enhancement hidden><label>Find teaching experience<input id="experience-search" type="search" placeholder="Search school, activity or date" aria-controls="experience-list"></label><div class="filters" role="group" aria-label="Filter teaching experience">${['All','Teaching','Observation'].map((s,i)=>`<button class="filter" data-experience-filter="${s}" aria-pressed="${i===0}">${s}</button>`).join('')}</div></div><p id="experience-count" class="collection-count" role="status" data-enhancement hidden></p><div class="timeline-container"><div class="timeline-track" aria-hidden="true"><div class="timeline-fill"></div></div><h2 class="sr-only">Teaching and observation experience</h2><section id="experience-list" class="experience-timeline" aria-label="Teaching and observation record">${experienceRows(c,base)}</section></div><p id="experience-empty" class="empty-note" ${c.experiences.length?'hidden':''}>No experiences match this search.</p>${philosophySection(c,base)}</div>`;
  case 'pehchaan': return caseStudy(base,'Community teaching','Foundational literacy<br><em>and numeracy.</em>',pehchaan,`<h2>The teaching context</h2><p>The portfolio record describes a five-week NTCC internship with Nursery, LKG and UKG learners, alongside ULLAS adult-literacy sessions for five learners.</p><h2>Responsibilities recorded</h2>${list(pehchaan.points)}<h2>What the document supports</h2><p>The completion certificate confirms 80 hours as an on-ground intern / teacher at Pehchaan The Street School. It does not report learner outcomes or describe individual teaching activities.</p><h2>Next reflection to document</h2><p>A short account of one activity, the learner response and a subsequent adjustment would add evidence of how this experience informed teaching.</p>`,`<aside class="evidence-aside"><p class="eyebrow">Completion certificate</p><h2>80 hours</h2><p>Pehchaan The Street School · 6 July 2026</p><a class="archive-doc-frame" href="${base}assets/certificate-2.webp">${img(defaultContent.certificates[1].image,'Pehchaan certificate confirming 80 hours as an on-ground intern / teacher',base,'case-evidence-img')}</a>${link(base,'credentials','View supporting credentials')}</aside>`);
  case 'observation': return caseStudy(base,'School observation','Learning through<br><em>classroom observation.</em>',observation,`<h2>Observation context</h2><p>This five-day observation placement at Amity International School, Mayur Vihar took place on 24–28 November 2025. The record concerns observation of teaching.</p><h2>What I paid attention to</h2>${list(observation.points)}<h2>From observation to planning</h2><p>The account identifies questioning, participation and classroom routines as areas of attention. A dated observation note linking a specific teaching choice to a planning decision would make this learning easier to assess.</p>`,`<aside class="note-panel"><p class="eyebrow">Evidence status</p><h2>Observation record</h2><p>The dates are confirmed by the candidate. A school observation certificate or mentor record is not currently published.</p><p>The women’s-safety webinar certificate belongs to professional learning.</p>${link(base,'credentials','View published credentials')}</aside>`);
  case 'democracy': return democracyView(c,base);
  case 'resources': return `<div class="container resources-page">${heading('04 / Teaching Resources','Teacher’s Resource Library.<br><em>Ideas into practice.</em>','Published teaching files, with context and links to the original evidence.')}${evidenceFeature(c,base)}<section class="section resource-library">${sectionHead('Teacher’s Resource Library','Curated teaching files.')}<div class="resource-collection-tools ${c.resources.length===0?'is-catalog-empty':''}" data-enhancement hidden><label class="collection-search">Search teaching files<input id="resource-search" type="search" placeholder="Search title, category or description" aria-controls="resource-list"></label><div class="filters" role="group" aria-label="Filter resources">${['All',...new Set(c.resources.map(r=>r.category||r.type||'Teaching material'))].map((s,i)=>`<button class="filter" data-filter="${esc(s)}" aria-pressed="${i===0}">${esc(s)}</button>`).join('')}</div></div><p class="collection-count" id="resource-count" role="status">${c.resources.length} ${c.resources.length===1?'file':'files'} in the library</p><div id="resource-list">${resourceRows(c,base)}</div><p class="empty-note" id="resource-empty" ${c.resources.length?'hidden':''}>No teaching files match this search.</p><p class="small">Completed student responses, marked feedback and lesson reflections have not yet been published.</p></section></div>`;
  case 'credentials': return `<div class="container credentials-page">${heading('05 / Evidence &amp; Credentials','The work.<br><em>The record.</em>','Academic qualifications, teaching internships, and seminar presentation records.')}<section class="presentation-callout" data-motion="fade-up"><div class="callout-header"><span class="callout-badge">RESEARCH &amp; PRESENTATION</span><span class="meta-sep" aria-hidden="true">·</span><span class="callout-date">10 March 2026</span></div><h2>Rootedness in India: NEP 2020 &amp; Teacher Education</h2><p class="callout-lead">Co-author and presenter with lead author Rusha Chaudhauri on <em>“Rootedness in India: An Analysis of NEP 2020 in Promoting IKS in Teacher Education”</em> at the international seminar organised by Amity Institute of Education (sponsored by GAIL India Ltd).</p>
  <div class="seminar-credential-preview" data-motion="fade-up"><a class="archive-doc-frame" href="${esc(safeUrl(defaultContent.certificates[3].image))}" target="_blank" rel="noopener noreferrer" aria-label="Open presentation certificate in a new tab">${img(defaultContent.certificates[3].image,'NEP 2020 and IKS Seminar Certificate',base,'seminar-cert-img')}<span class="doc-view-hint" aria-hidden="true">Examine presentation certificate ↗</span></a></div>
  <div class="callout-link">${link(base,'teaching','Connect with teaching journey')}</div></section><section class="section credentials-archive-section"><div class="collection-tools" data-enhancement hidden><label>Find a credential<input id="credential-search" type="search" placeholder="Search title, issuer or date" aria-controls="credential-list"></label><div class="filters" role="group" aria-label="Filter credentials">${['All',...new Set(c.certificates.map(x=>x.category||'Other'))].map((s,i)=>`<button class="filter" data-credential-filter="${esc(s)}" aria-pressed="${i===0}">${esc(s)}</button>`).join('')}</div></div><p id="credential-count" class="collection-count" role="status" data-enhancement hidden></p><p id="credential-empty" class="empty-note" hidden>No credentials match this search.</p><div class="certificate-grid" id="credential-list">${c.certificates.map((x,i)=>certificateCard(x,base,i)).join('')}</div>${c.certificates.length?'':'<p class="empty-note">No credentials are currently published.</p>'}</section><div class="credential-future-strip" data-motion="fade-up"><div class="future-strip-inner"><span class="future-tag">APPLICATION STATUS</span><p class="future-text">Cambridge pre-service programme application recorded; programme not yet commenced.</p></div></div><section class="credentials-continuation-bridge" data-motion="fade-up"><div class="continuation-meta"><span class="continuation-tag">NEXT CHAPTER / 05</span><h3>Let’s Connect</h3><p>For school teaching opportunities, internships, and conversations on History and Social Science education.</p></div><a class="button secondary" href="${base}contact/">Start a Conversation <span aria-hidden="true">→</span></a></section></div>`;
  case 'resume': return `<div class="container resume-page">${heading('Résumé / Professional overview',esc(p.name),'History, Social Science & English · Developing Educator')}<div class="actions print-actions">${resumeDownload(c,base)}<button class="button secondary" id="print-resume">Print / save as PDF <span aria-hidden="true">↗</span></button>${link(base,'contact','Contact')}</div><p class="resume-contact-bar"><a href="mailto:${esc(p.email)}">${esc(p.email)}</a> · ${p.languages.map(esc).join(' · ')}</p><section class="resume-section"><h2>Professional profile</h2><p>${esc(p.summary)}</p><p>Roles of interest: ${p.roles.map(esc).join('; ')}. ${esc(studySummary(c))}.</p><p><strong>${esc(p.eligibility)}</strong> · Available to join full-time from <strong>${esc(p.availability)}</strong>.</p></section><section class="resume-section"><h2>Location & teaching interests</h2>${optionalProfileFacts(c)}</section><section class="resume-section"><h2>Education</h2>${qualificationRows(c)}</section><section class="resume-section"><h2>Teaching & observation experience</h2>${c.experiences.map(e=>`<article class="resume-exp-entry"><h3>${esc(e.title)}</h3><p class="small"><strong>${esc(e.period)}</strong> · ${esc(e.type)}</p>${list(e.points||[])}</article>`).join('')}</section><section class="resume-section"><h2>Skills & competencies</h2><p>${c.competencies.map(esc).join(' · ')}</p></section><section class="resume-section"><h2>Professional learning & seminar presentations</h2>${c.certificates.filter(x=>['Presentation','Professional learning'].includes(x.category)).map(x=>`<p><strong>${esc(x.title)}</strong><br>${esc(x.description)}<br><span class="small">${esc(x.issuer)} · ${esc(x.date)}</span></p>`).join('')}</section></div>`;
  case 'contact': return `<div class="container contact-page"><header class="page-heading chapter-heading contact-hero-header" data-motion="fade-up"><p class="eyebrow"><span class="chapter-number" aria-hidden="true">05</span><span class="chapter-label">LET'S CONNECT</span></p><h1 class="contact-closing-title">Good teaching starts<br>with a good <em>question.</em></h1><p class="lead contact-closing-sub">Let’s start a conversation. Open for school teaching positions, internships, and educational collaboration.</p></header><div class="contact-layout"><section class="contact-dossier" data-motion="fade-right"><div class="contact-section-inner"><div class="contact-channel-block"><h2 class="eyebrow">Email me directly</h2><a class="contact-email" href="mailto:${esc(p.email)}">${esc(p.email)} ${arrow}</a><div class="contact-actions"><button class="text-link copy-email" data-email="${esc(p.email)}">Copy email address</button><p id="copy-status" role="status"></p></div></div><div class="contact-note"><div class="recruiter-highlight-badge"><span class="status-dot" aria-hidden="true"></span><span>Available from ${esc(p.availability)}</span></div><p class="contact-eligibility"><strong>${esc(p.eligibility)}</strong> · ${esc(studySummary(c))}.</p>${optionalProfileFacts(c)}<div class="recruiter-prompt"><h3 class="eyebrow">For schools &amp; recruiters</h3><p class="small">Please include the school name, subject, classes to be taught, location and proposed joining timeline.</p></div></div></div></section><section class="contact-form-section" data-motion="fade-left"><form id="contact-form" class="contact-form"><h2>Prepare an introduction.</h2><p>This opens your email app with a draft. You can review it before sending.</p><input type="text" name="website_url" class="sr-only" tabindex="-1" autocomplete="off" aria-hidden="true"><label>Your name<input name="name" autocomplete="name" required maxlength="100"></label><label>Your email<input type="email" name="email" autocomplete="email" required maxlength="200"></label><label>School / organisation<input name="school" autocomplete="organization" maxlength="150"></label><label>Your message<textarea name="message" rows="5" required maxlength="3000"></textarea></label><button class="button primary" type="submit">Open email draft ${arrow}</button><p id="contact-status" role="status"></p></form><div class="contact-resume-card"><div class="resume-card-body"><span class="card-tag">DOCUMENTATION</span><h3 class="resume-card-title">Academic &amp; Teaching Résumé</h3><p class="small">Formal education chronology, documented school internships, and teaching competencies formatted for academic review.</p></div><a class="button secondary resume-card-btn" href="${base}resume/">View Résumé / Save PDF ${arrow}</a></div></section></div></div>`;
  case 'gallery':return `<div class="container">${heading('Gallery','Teaching gallery.','Published images and their context.')}<div class="gallery-grid">${c.gallery.map(x=>`<figure>${img(x.image,x.title,base)}<figcaption>${esc(x.title)}</figcaption></figure>`).join('')}</div>${c.gallery.length?'':'<p>No gallery images are currently published. The teaching artifacts contain the available lesson evidence.</p>'}${link(base,'resources','View teaching artifacts')}</div>`;
  case 'admin':return `<div class="container admin-page">${heading('Owner workspace','Portfolio Studio.','Update your profile, teaching experience and files. Changes go live only when you publish.')}<div id="studio"><form id="login-form" class="contact-form"><h2>Owner sign in</h2><label>Email<input name="email" type="email" autocomplete="username" required></label><label>Password<input name="password" type="password" autocomplete="current-password" required></label><button class="button primary" type="submit">Sign in</button><p id="login-status" role="status"></p></form></div></div>`;
  default:return `<div class="container not-found">${heading('404 / Page not found','A page out of place.','The link may have changed. Return to the portfolio to find the right chapter.')}${link(base,'home','Back to the portfolio','button primary')}</div>`;
  }
}
function caseStudy(base,label,title,exp,body,aside){return `<div class="container"><div class="breadcrumb">${link(base,'teaching','Teaching journey')}</div>${heading(label,title,esc(exp?.title||''))}<div class="case-meta"><span>${esc(exp?.period||'')}</span><span>${esc(exp?.type||'')}</span></div><div class="case-layout"><article class="prose">${body}</article>${aside}</div></div>`}
