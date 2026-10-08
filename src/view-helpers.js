import {defaultContent} from './content.js?v=editorial-20261004';
import {recruiterFacts} from './recruiter.js?v=editorial-20261004';
import {imageDimensions} from './image-dimensions.js?v=editorial-20261004';
export const routes={
 home:{path:'',title:'History & Social Science Educator',nav:'Home'},
 profile:{path:'profile/',title:'About & Education',nav:'About'},
 teaching:{path:'teaching/',title:'Teaching Experience',nav:'Experience'},
 resources:{path:'resources/',title:'Teaching Evidence',nav:'Teaching Evidence'},
 credentials:{path:'credentials/',title:'Credentials',nav:'Credentials'},
 resume:{path:'resume/',title:'Résumé',nav:'Résumé'},
 contact:{path:'contact/',title:'Contact',nav:'Contact'},
 pehchaan:{path:'teaching/pehchaan/',title:'Pehchaan Teaching Internship'},
 observation:{path:'teaching/observation/',title:'School Observation at Amity'},
 democracy:{path:'teaching/democracy/',title:'Democracy Lesson Plan · Class IX-B'},
 gallery:{path:'gallery/',title:'Teaching Gallery'},
 admin:{path:'admin/',title:'Portfolio Studio'},
 '404':{path:'404.html',title:'Page Not Found'}
};
export const esc=s=>String(s??'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
export const safeUrl=s=>{try{const u=new URL(s);return u.protocol==='https:'?u.href:''}catch{return ''}};
export const arrow='<span aria-hidden="true">→</span>';
export const link=(base,route,label,cls='text-link')=>`<a class="${cls}" href="${base}${routes[route].path}">${label} ${arrow}</a>`;
export const tag=s=>`<span class="tag">${esc(s)}</span>`;
export const list=items=>`<ul class="plain-list">${items.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`;
const knownImages=Object.fromEntries(defaultContent.certificates.slice(0,4).map((x,i)=>[x.image,`certificate-${i+1}.webp`]));
knownImages[defaultContent.profile.portrait]='portrait.webp';
export function imageUrl(url,base){
 if(!url)return '';
 if(knownImages[url])return base+'assets/'+knownImages[url];
 const prefix='https://krishnamahato704-spec.github.io/E-portfolio/';
 if(url.startsWith(prefix+'assets/'))return base+url.slice(prefix.length);
 if(url.startsWith('./assets/')||url.startsWith('assets/'))return base+url.replace(/^\.?\//,'');
 return safeUrl(url);
}
export function img(url,alt,base,cls='',priority=false){
 const src=imageUrl(url,base);
 const local=src.startsWith(base+'assets/')?src.slice(base.length):'';
 const dimensions=imageDimensions[local];
 const responsive=local==='assets/portrait.webp'?`srcset="${esc(base)}assets/portrait-360.webp 360w, ${esc(base)}assets/portrait-720.webp 720w, ${esc(src)} 1154w" sizes="${cls==='hero-avatar'?'(max-width: 760px) 108px, 128px':cls==='contact-avatar'?'90px':cls==='profile-portrait-photo'?'(max-width: 760px) 70vw, 340px':'(max-width: 650px) 140px, 180px'}"`:'';
 return src?`<img class="${cls}" src="${esc(src)}" ${responsive} alt="${esc(alt)}" ${dimensions?`width="${dimensions[0]}" height="${dimensions[1]}"`:''} ${priority?'fetchpriority="high"':'loading="lazy"'} decoding="async">`:'';
}
export function heading(label,title,desc=''){return `<header class="page-heading"><p class="eyebrow">${label}</p><h1>${title}</h1>${desc?`<p class="lead">${desc}</p>`:''}</header>`;}
export function sectionHead(label,title,aside=''){return `<div class="section-heading"><div>${label?`<p class="eyebrow">${label}</p>`:''}<h2>${title}</h2></div>${aside}</div>`;}
export function qualificationRows(c){return c.qualifications.map(q=>`<article class="qualification"><p class="period">${esc(q.period)}</p><div><h3>${esc(q.title)}</h3><p>${esc(q.place)}</p>${q.note?`<p class="small">${esc(q.note)}</p>`:''}${q.expected?`<p class="small">Expected completion: ${esc(q.expected)}</p>`:''}</div><span class="status ${/progress/i.test(q.status)?'progress':''}">${esc(q.status)}</span></article>`).join('');}
export function optionalProfileFacts(c){return recruiterFacts(c).filter(([key])=>['Based in','Work preferences','Target classes','Boards of interest'].includes(key)).map(([label,value])=>`<p><strong>${esc(label)}:</strong> ${esc(value)}</p>`).join('');}
function stableContent(value){if(Array.isArray(value))return value.map(stableContent);if(value&&typeof value==='object')return Object.fromEntries(Object.keys(value).sort().map(key=>[key,stableContent(value[key])]));return value;}
export function resumeUrl(c,base){
 const custom=safeUrl(c.profile.cv);
 const matches=['profile','qualifications','experiences','competencies','certificates','resources'].every(key=>JSON.stringify(stableContent(c[key]))===JSON.stringify(stableContent(defaultContent[key])));
 return custom||(matches?base+'assets/krishna-mahato-resume.pdf':'');
}
export function resumeDownload(c,base){const url=resumeUrl(c,base);return url?`<a class="button primary" href="${esc(url)}" download="krishna-mahato-resume.pdf">Download Résumé PDF <span aria-hidden="true">↓</span></a>`:'<p class="small">Use Print / save as PDF for the current résumé.</p>';}
