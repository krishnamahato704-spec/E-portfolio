import {esc} from './view-helpers.js?v=editorial-20261004';
import {isCurrentRecord,sortQualifications} from './chronology.js?v=editorial-20261004';

// The added Home introduction precedes the existing portfolio opening.
export function portfolioSummary(content) {
 const p=content.profile;
 const qualifications=sortQualifications(content.qualifications);
 const current=qualifications.filter(isCurrentRecord);
 const degree=qualifications.find(q=>q.status==='Completed'&&!/^Class\b/i.test(q.title));
 const tags=[...current.map(q=>`${q.title} · ${q.status}`),...(degree?[degree.title]:[]),p.location].filter(Boolean);
 return `<section class="portfolio-summary" aria-labelledby="summary-title">
  <div class="summary-paper">
   ${p.availability?`<p class="summary-availability"><span aria-hidden="true"></span>Available from ${esc(p.availability)}</p>`:''}
   <p class="summary-byline">${esc(p.name)} · History &amp; Social Science</p>
   <h2 id="summary-title">Teaching history.<br><em>Starting with questions.</em></h2>
   <p class="summary-description">I'm <strong>${esc(p.name)}</strong>. ${esc(p.headline)}${current.length?`<span class="summary-study">Currently studying ${current.map(q=>esc(q.title)).join(' &amp; ')}.</span>`:''}</p>
   <ul class="summary-tags" role="list">${tags.map(tag=>`<li>${esc(tag)}</li>`).join('')}</ul>
   <a class="summary-scroll" href="#portfolio-introduction">Explore my portfolio <span aria-hidden="true">↓</span></a>
  </div>
 </section>`;
}
