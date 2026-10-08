import {esc,link,sectionHead} from './view-helpers.js?v=editorial-20261004';
import {icon} from './icons.js?v=editorial-20261004';

export function educationGroups(content) {
  const completed = content.qualifications.filter(q => q.status === 'Completed')
    .sort((a,b) => Number.parseInt(a.period,10) - Number.parseInt(b.period,10));
  const current = content.qualifications.filter(q => q.status !== 'Completed');
  return {completed,current};
}

function qualificationCard(q) {
  const current=q.status!=='Completed';
  const parts=q.place.split(' · ');
  const score=parts.find(p => /CGPA|\d.*%/.test(p));
  return `<li class="education-record"><span class="education-node" aria-hidden="true"></span>
    <p class="education-period">${esc(q.period)}</p><article class="education-card">
      <span class="icon-disc">${icon(/Class X/.test(q.title)?'school':'cap')}</span>
      <div><h3>${esc(q.title)}</h3><p>${esc(parts.filter(p=>p!==score).join(' · '))}</p>
      ${score?`<strong class="education-score">${esc(score)}</strong>`:''}
      ${q.note?`<p class="small education-note">${esc(q.note)}</p>`:''}
      <span class="status ${current?'progress':''}">${esc(q.status)}${q.expected?' · Expected '+esc(q.expected):''}</span></div>
    </article></li>`;
}

export function educationTimeline(content,base,{profile=false}={}) {
  const {completed,current}=educationGroups(content);
  if(!profile){
    const degree=completed.filter(q=>!/^Class\b/i.test(q.title)).at(-1)||completed.at(-1);
    const featured=[...current,...(degree?[degree]:[])];
    const caption=[current.length?`Current studies${current.length>1?' (Concurrent)':''}`:'',degree?`Latest completed ${/^Class\b/i.test(degree.title)?'qualification':'degree'}`:''].filter(Boolean).join(' · ');
    return `<section class="container section home-education" aria-labelledby="education-title">
      ${sectionHead('', '<span id="education-title">Education &amp; Credentials</span>', link(base,'credentials','View all credentials'))}
      ${featured.length?`<p class="education-caption">${caption}</p><ol class="education-focus">${featured.map(qualificationCard).join('')}</ol>`:'<p>No qualifications are currently published.</p>'}
      ${link(base,'profile','Full academic timeline and school qualifications','education-details-link')}
    </section>`;
  }
  return `<section class="${profile?'section':'container section home-education'}" aria-labelledby="education-title">
    ${sectionHead(profile?'Qualifications and current study':'',`<span id="education-title">${profile?'Academic Preparation':'Education &amp; Credentials'}</span>`,profile?'':link(base,'credentials','View all credentials'))}
    ${completed.length?`<ol class="education-completed">${completed.map(qualificationCard).join('')}</ol>`:''}
    ${current.length?`<div class="current-studies"><p class="current-studies-label">Current studies${current.length>1?' (Concurrent)':''}</p><ol class="education-current">${current.map(qualificationCard).join('')}</ol></div>`:''}
    ${!completed.length&&!current.length?'<p>No qualifications are currently published.</p>':''}
  </section>`;
}
