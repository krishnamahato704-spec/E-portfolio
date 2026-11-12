import {esc} from './view-helpers.js?v=editorial-20261004';
import {isCurrentRecord,sortQualifications} from './chronology.js?v=editorial-20261004';
import {diagnosticCaseStudy} from './assessment-case-study.js?v=editorial-20261004';

// The added Home introduction follows the existing animated portfolio opening.
export function portfolioSummary(content) {
 const p=content.profile;
 const assessment=diagnosticCaseStudy(content);
 const qualifications=sortQualifications(content.qualifications);
 const current=qualifications.filter(isCurrentRecord);
 const degree=qualifications.find(q=>q.status==='Completed'&&!/^Class\b/i.test(q.title));
 const tags=[...current.map(q=>`${q.title} · ${q.status}`),...(degree?[degree.title]:[]),p.location].filter(Boolean);
 return `<section id="portfolio-summary" class="portfolio-summary" aria-labelledby="summary-title">
  <div class="summary-paper">
   ${p.availability?`<p class="summary-availability"><span aria-hidden="true"></span>Available from ${esc(p.availability)}</p>`:''}
   <p class="summary-byline">${esc(p.name)} · History &amp; Social Science</p>
   <h2 id="summary-title">Teaching history.<br><em>Starting with questions.</em></h2>
   <p class="summary-description"><strong>${assessment?'Assessment informed my next lesson.':'From preparation into classroom practice.'}</strong> ${assessment?esc(assessment.shortSummary):'My teaching record connects lesson planning, classroom experience and reflection.'}<span class="summary-study">${assessment?esc(assessment.shortLimitation):'Explore my teaching and academic record below.'}</span></p>
   <ul class="summary-tags" role="list">${tags.map(tag=>`<li>${esc(tag)}</li>`).join('')}</ul>
   <a class="summary-scroll" href="#teaching-evidence">Explore my portfolio <span aria-hidden="true">↓</span></a>
  </div>
 </section>`;
}
