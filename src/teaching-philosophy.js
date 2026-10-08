import {esc,list,link,img} from './view-helpers.js?v=editorial-20261004';
import {democracyResource} from './evidence.js?v=editorial-20261004';

const influences = [
  {
    name:'Rabindranath Tagore',
    image:'assets/philosophy/rabindranath-tagore.webp',
    theme:'tagore',
    thesis:'Room for curiosity & creative expression.',
    note:'Holistic education and creative inquiry remind me to keep History connected to the whole learner, cultivating imagination alongside analytical critique.',
    source:'https://commons.wikimedia.org/wiki/File:Rabindranath_Tagore_1930.jpg'
  },
  {
    name:'Lev Vygotsky',
    image:'assets/philosophy/lev-vygotsky.webp',
    theme:'vygotsky',
    thesis:'Support toward independent reasoning.',
    note:'Dialogue, guided source work, and the zone of proximal development help learners advance from scaffolded inquiry to autonomous historical explanation.',
    source:'https://commons.wikimedia.org/wiki/File:Lev-Semyonovich-Vygotsky-1896-1934.jpg'
  }
];

export function homePhilosophySection(c,base){
  return `<section id="teaching-philosophy" class="container section home-philosophy" aria-labelledby="home-philosophy-title">
 <header class="home-philosophy-heading">
  <div><p class="eyebrow">Ideas that guide my teaching</p><h2 id="home-philosophy-title">My Teaching Philosophy</h2></div>
  <p class="home-philosophy-intro">Start with the learner. Understanding grows through curiosity, dialogue and support toward independent thinking.</p>
 </header>
 <div class="home-influences">${influences.map(person=>`
  <article class="home-influence influence-${person.theme}">
   <figure class="home-influence-portrait">
    ${img(person.image,'Portrait of '+person.name,base,'thinker-portrait')}
    <figcaption><a href="${person.source}" class="portrait-source" target="_blank" rel="noopener noreferrer">Portrait source<span class="sr-only">: ${person.name} on Wikimedia Commons (opens in a new tab)</span> ↗</a></figcaption>
   </figure>
   <div class="home-influence-copy"><p class="eyebrow">Intellectual influence</p><h3>${esc(person.name)}</h3><p class="home-influence-thesis">${esc(person.thesis)}</p><p>${esc(person.note)}</p></div>
  </article>`).join('')}
 </div>
 <div class="home-philosophy-principles">${c.practice.map((p,i)=>`
  <article><span class="home-principle-number" aria-hidden="true">${String(i+1).padStart(2,'0')}</span><h3>${esc(p.title)}</h3><p>${esc(p.text)}</p></article>`).join('')}
 </div>
 <div class="home-philosophy-links">${link(base,'teaching','Read my full teaching approach','text-link')}${democracyResource(c)?link(base,'democracy','Explore the Democracy lesson plan','text-link'):''}</div>
</section>`;
}

export function philosophySection(c,base){
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


