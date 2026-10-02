import {esc, safeUrl, imageUrl} from './views.js';
import {defaultContent} from './content.js';
import {studySummary, recruiterFacts} from './recruiter.js';

const external = (href, label) => `<a href="${esc(safeUrl(href))}" target="_blank" rel="noopener noreferrer" aria-label="${esc(label)} (opens in a new tab)">${esc(label)} <span aria-hidden="true">↗</span></a>`;
const sectionTitle = (number, title, intro = '') => `<header class="section-heading"><div><p class="eyebrow">${number}</p><h2>${title}</h2>${intro ? `<p>${intro}</p>` : ''}</div></header>`;
const items = entries => `<ul class="plain-list">${entries.map(text => `<li>${esc(text)}</li>`).join('')}</ul>`;

// These two roles and the preparation focus come from the owner's specification.
// They supplement presentation only; the saved content document is unchanged.
const specifiedRoles = [
  {title:'Volunteer Teacher', institution:'eVidyaloka', type:'Volunteer teaching', points:[]},
  {title:'Freelance Tutor', institution:'UrbanPro', type:'Independent tutoring', points:[]}
];

export function education(c) {
  return `<div class="education-grid">${c.qualifications.map(q => `<article class="academic-card"><p class="small">${esc(q.period)}</p><h3>${esc(q.title)}</h3><p>${esc(q.place)}</p><span class="status">${esc(q.status)}</span>${q.note ? `<p class="small">${esc(q.note)}</p>` : ''}${q.expected ? `<p class="small">Expected completion: ${esc(q.expected)}</p>` : ''}</article>`).join('')}</div><aside class="study-focus"><h3>Current focus</h3><p>CTET and UGC NET preparation.</p><p class="small">${esc(c.profile.eligibility)}</p></aside>`;
}

export function teachingCards(c, base) {
  const records = [...c.experiences, ...specifiedRoles.filter(e => !c.experiences.some(saved => (saved.institution || saved.title || '').toLowerCase().includes(e.institution.toLowerCase())))];
  return `<div class="experience-grid">${records.map(e => `<article class="academic-card"><p class="eyebrow">${esc(e.type || e.category || 'Teaching')}</p><h3>${esc(e.title)}</h3><p class="institution">${esc(e.institution || '')}</p>${e.period ? `<p class="small">${esc(e.period)}${e.status ? ' · ' + esc(e.status) : ''}</p>` : ''}${e.summary ? `<p>${esc(e.summary)}</p>` : ''}${e.points?.length ? items(e.points) : ''}${['pehchaan','observation'].includes(e.id) ? `<a class="text-link" href="${base}teaching/${e.id}/" aria-label="Read the ${esc(e.institution)} teaching record">Read experience <span aria-hidden="true">↗</span></a>` : ''}</article>`).join('')}</div>`;
}

export function publications(c, base) {
  const papers = c.certificates.filter(record => /presentation|research|publication/i.test(record.category || ''));
  return `<div class="paper-list">${papers.map(paper => {
    const original = defaultContent.certificates.find(record => record.image === paper.image);
    const isKnownPaper = original && paper.title === original.title && paper.description === original.description;
    const title = isKnownPaper ? 'Rootedness in India: An Analysis of NEP 2020 in Promoting IKS in Teacher Education' : paper.title;
    const href = paper.url ? safeUrl(paper.url) : imageUrl(paper.image, base);
    return `<article class="paper-card"><div class="paper-icon" aria-hidden="true">▤</div><div><p class="eyebrow">${isKnownPaper ? 'SETU-TE 2026 · International seminar' : esc(paper.category)}</p><h3>${esc(title)}</h3>${isKnownPaper ? '<p class="paper-authors">Rusha Chaudhauri and Krishna Mahato · Co-authored seminar presentation</p>' : ''}<p>${esc(paper.description || '')}</p><p class="small">${esc(paper.issuer || '')}${paper.date ? ' · ' + esc(paper.date) : ''}</p>${href ? `<a class="text-link" href="${esc(href)}" target="_blank" rel="noopener noreferrer" aria-label="View supporting document for ${esc(title)} (opens in a new tab)">View presentation record <span aria-hidden="true">↗</span></a>` : ''}</div></article>`;
  }).join('') || '<p class="empty-note">No research or presentation records are currently published.</p>'}</div>`;
}

export function certifications(c, base) {
  const records = c.certificates.filter(record => !/presentation|research|publication/i.test(record.category || '') && !/bachelor|internship/i.test(record.title || ''));
  return `<div class="certification-list">${records.map(record => `<article class="certification-item"><div><span class="issuer-tag">${esc(record.issuer || record.category || 'Credential')}</span><h3>${esc(record.title)}</h3><p class="small">${esc(record.date || '')}</p><p>${esc(record.description || '')}</p></div>${record.url || record.image ? `<a class="text-link" href="${esc(record.url ? safeUrl(record.url) : imageUrl(record.image, base))}" target="_blank" rel="noopener noreferrer" aria-label="View ${esc(record.title)} certificate (opens in a new tab)">View credential <span aria-hidden="true">↗</span></a>` : ''}</article>`).join('') || '<p class="empty-note">No professional learning credentials are currently published.</p>'}</div><p class="small pending-record">CENTA professional development and Advanced Statistics: credential details have not yet been published.</p>`;
}

export function academicOpening(c, base) {
  const p = c.profile;
  // Keep the selectors used by the existing live-content refresh, including
  // the stable hero/portrait nodes and editable statement and status fields.
  return `<section class="hero opening-hero" aria-labelledby="opening-name"><div class="container opening-inner"><div class="hero-copy"><p class="eyebrow opening-label">Historian, Educator, and Instructional Designer.</p><h1 id="opening-name"><span>${esc(p.name.split(' ')[0])}</span> <em>${esc(p.name.split(' ').slice(1).join(' '))}</em></h1><p class="hero-statement">${esc(p.headline)}</p><div class="hero-detail"><p>${esc(p.summary)}</p><div class="actions"><a class="button primary" href="#publications" aria-label="View publications and research">View Publications <span aria-hidden="true">↗</span></a><div class="hero-cv">${cvLink(c, base)}</div></div></div><p class="opening-status small">${esc(studySummary(c))} · Available from ${esc(p.availability)}</p></div><figure class="portrait-frame"><div class="portrait-window">${p.portrait ? `<img class="portrait" src="${esc(imageUrl(p.portrait, base))}" alt="Portrait of ${esc(p.name)}" width="1154" height="1400" fetchpriority="high" decoding="async">` : '<div class="portrait-placeholder">Krishna Mahato</div>'}</div><figcaption>${esc(p.location || 'Academic & teaching portfolio')}</figcaption></figure></div></section><div id="portfolio-start" tabindex="-1"></div>`;
}

export function cvLink(c, base) {
  const custom = safeUrl(c.profile.cv);
  const stable = value => Array.isArray(value) ? value.map(stable) : value && typeof value === 'object' ? Object.fromEntries(Object.keys(value).sort().map(key => [key,stable(value[key])])) : value;
  const matches = ['profile','qualifications','experiences','competencies','certificates','resources'].every(key => JSON.stringify(stable(c[key])) === JSON.stringify(stable(defaultContent[key])));
  if (custom || matches) return `<a class="button secondary" href="${esc(custom || base + 'assets/krishna-mahato-resume.pdf')}" download="krishna-mahato-resume.pdf" aria-label="Download CV as a PDF">Download CV <span aria-hidden="true">↓</span></a>`;
  return `<a class="button secondary" href="${base}resume/" aria-label="View the current CV and save it as a PDF">View current CV <span aria-hidden="true">↗</span></a>`;
}

export function academicHome(c, base) {
  return `${academicOpening(c,base)}<div class="container academic-home"><section id="education" class="section">${sectionTitle('01 / Academic background','Education','History, teacher education, and continued study.')}${education(c)}</section><section id="experience" class="section">${sectionTitle('02 / Teaching & volunteer experience','Learning through teaching')}${teachingCards(c,base)}<div class="section-end"><a class="text-link" href="${base}teaching/">Explore teaching practice and evidence <span aria-hidden="true">↗</span></a></div></section><section id="publications" class="section">${sectionTitle('03 / Publications & research','Research and presentations','Work on history education, teacher preparation, and Indian knowledge systems.')}${publications(c,base)}</section><section id="certifications" class="section">${sectionTitle('04 / Certifications & upskilling','Continued learning')}${certifications(c,base)}</section><section class="section home-practice">${sectionTitle('05 / Teaching approach','Inquiry in the classroom')}<div class="practice-grid">${c.practice.map(p => `<article class="academic-card"><h3>${esc(p.title)}</h3><p>${esc(p.text)}</p></article>`).join('')}</div><a class="text-link" href="${base}resources/">Browse teaching artifacts <span aria-hidden="true">↗</span></a><p class="small">Completed student responses, marked feedback and lesson reflections have not yet been published.</p></section><section class="section home-contact" id="contact"><div><p class="eyebrow">Contact</p><h2>Start a conversation</h2><p>For teaching opportunities, academic work, and educational collaboration.</p><p class="small">${esc(c.profile.eligibility)} · Available from ${esc(c.profile.availability)}</p></div><a class="button primary" href="${base}contact/" aria-label="Contact Krishna Mahato">Get in touch <span aria-hidden="true">↗</span></a></section><section class="recruiter-summary"><h2 class="sr-only">Teaching interests</h2><dl>${recruiterFacts(c).map(([label,value]) => `<div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl></section></div>`;
}

export function academicProfile(c, base) {
  return `<div class="container profile-page"><header class="page-heading"><p class="eyebrow">Profile / Academic background</p><h1>History, education,<br><em>and the classroom.</em></h1><p class="lead">${esc(c.profile.summary)}</p></header><section class="section compact prose"><h2>About ${esc(c.profile.name)}</h2><p>${esc(c.about)}</p><p>${esc(c.preparation)}</p><p>${esc(studySummary(c))}.</p></section><section class="section">${sectionTitle('Academic record','Education')}${education(c)}</section><section class="section">${sectionTitle('Practice & skills','Teaching competencies')}<ul class="competency-list">${c.competencies.map(text=>`<li>${esc(text)}</li>`).join('')}</ul></section><section class="section"><h2>Teaching interests</h2><dl class="profile-facts">${recruiterFacts(c).map(([label,value])=>`<div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl><a class="text-link" href="${base}teaching/">Explore teaching experience <span aria-hidden="true">↗</span></a></section></div>`;
}

export function academicFooter(base, c) {
  const linkedin = safeUrl(c.profile.linkedin || 'https://www.linkedin.com/in/krishna-mahato-758523176');
  return `<footer class="site-footer"><div class="container footer-top"><div><a class="footer-name" href="${base}">${esc(c.profile.name)}</a><p>History · Education · Research</p></div><div><a class="email-link" href="mailto:${esc(c.profile.email)}" aria-label="Email ${esc(c.profile.name)}">${esc(c.profile.email)}</a><div class="footer-social">${linkedin ? external(linkedin,'LinkedIn') : ''}${external('https://github.com/krishnamahato704-spec/E-portfolio','GitHub')}<a href="${base}" aria-label="Return to the portfolio home page">Portfolio</a></div></div></div><div class="container footer-bottom"><span>© 2026 ${esc(c.profile.name)}</span><div><a href="${base}resume/">CV</a><a href="${base}admin/">Owner sign in</a></div></div></footer>`;
}
