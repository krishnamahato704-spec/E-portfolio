import {wireCollections} from './collections.js?v=evidence-20260917';
import {loadContent} from './cloud.js?v=evidence-20260917';
import {mergeContent,validateContent} from './content.js?v=evidence-20260917';
import {view} from './views.js?v=evidence-20260917';
import {initNavigation} from './navigation.js?v=evidence-20260917';
import {initMotion,cleanupMotion} from './motion.js?v=evidence-20260917';
import {initHero3D,cleanupHero3D} from './hero-3d.js?v=evidence-20260917';
import {initCustomCursor,cleanupCustomCursor} from './cursor.js?v=evidence-20260917';
import {init3DTilt} from './tilt.js?v=evidence-20260917';
import {initLightbox} from './lightbox.js?v=evidence-20260917';
const route=document.body.dataset.route;
const base=document.body.dataset.base;
let content=mergeContent();
let interacted=false;
document.addEventListener('input',()=>{interacted=true},{once:true});
document.addEventListener('click',e=>{if(e.target.closest('#main button,#main input,#main textarea,#main summary'))interacted=true;});
initNavigation();
function wire(){
 document.querySelector('#print-resume')?.addEventListener('click',()=>window.print());
 document.querySelector('.copy-email')?.addEventListener('click',async e=>{
  const status=document.querySelector('#copy-status');
  try{await navigator.clipboard.writeText(e.currentTarget.dataset.email);status.textContent='Email address copied.'}catch{status.textContent='Please select and copy the email address above.'}
 });
 document.querySelector('#contact-form')?.addEventListener('submit',e=>{
  e.preventDefault(); const f=new FormData(e.currentTarget);
  const body=`Hello Krishna,\n\n${f.get('message')}\n\n${f.get('name')}\n${f.get('school')}\n${f.get('email')}`;
  location.href=`mailto:${content.profile.email}?subject=${encodeURIComponent('Teaching enquiry'+(f.get('school')?' — '+f.get('school'):''))}&body=${encodeURIComponent(body)}`;
  document.querySelector('#contact-status').textContent='Your email draft is ready to open. If no email app opens, use the email address alongside this form. Nothing has been sent by this website.';
 });
 wireCollections();
 init3DTilt();
 initLightbox();
 const heroCanvas=document.querySelector('#hero-3d-canvas');
 if(heroCanvas)initHero3D(heroCanvas);
 initCustomCursor();
 document.querySelectorAll('img').forEach(im=>im.addEventListener('error',()=>{const note=document.createElement('p');note.className='image-error';note.textContent=im.alt+' — image temporarily unavailable.';im.replaceWith(note)},{once:true}));
}
if(route==='admin') import('./admin.js?v=evidence-20260917').then(x=>x.initStudio(base));
else {
 wire();
 initMotion({initial:true});
 window.addEventListener('pagehide',()=>{cleanupMotion();cleanupHero3D();cleanupCustomCursor();});
 window.addEventListener('pageshow',e=>{if(e.persisted){initMotion();wire();}});
 // Keep the complete static document available during requests, failures, and without JS.
 loadContent().then(row=>{
  const candidate=mergeContent(row.content);validateContent(candidate);content=candidate;
  const main=document.querySelector('#main');
  // Refresh before interaction. Keep form values, open disclosures, focus and
  // reading position when a slow response arrives after the visitor starts.
  if(!interacted && !main.contains(document.activeElement) && scrollY<24) {
   const template=document.createElement('template');template.innerHTML=view(route,content,base);
   if(route==='home') {
    // The first-render portrait and video remain the same DOM nodes.
    const hero=main.querySelector('.hero');
    const incoming=template.content.querySelector('.hero');
    if(hero&&incoming) {
     for(const selector of ['.opening-label','#opening-name span','#opening-name em','.hero-statement','.hero-detail','.opening-status']) {
      const current=hero.querySelector(selector),next=incoming.querySelector(selector);
      if(current&&next)current.replaceChildren(...next.childNodes);
     }
     const portrait=hero.querySelector('.portrait'),nextPortrait=incoming.querySelector('.portrait');
     if(portrait&&nextPortrait){for(const attr of ['src','alt'])if(portrait.getAttribute(attr)!==nextPortrait.getAttribute(attr))portrait.setAttribute(attr,nextPortrait.getAttribute(attr));}
     else if(!!portrait!==!!nextPortrait)hero.querySelector('.portrait-window').replaceChildren(...incoming.querySelector('.portrait-window').childNodes);
     incoming.remove();
     for(const child of [...main.children])if(child!==hero&&child.tagName!=='META')child.remove();
     main.append(template.content);
    }
   } else main.replaceChildren(template.content);
   wire();initMotion();
  }
  const footerName=document.querySelector('.footer-name');if(footerName)footerName.textContent=content.profile.name;
  const footerEmail=document.querySelector('.email-link');if(footerEmail){footerEmail.href='mailto:'+content.profile.email;footerEmail.textContent=content.profile.email+' ↗';}
  const brand=document.querySelector('.brand');if(brand)brand.setAttribute('aria-label',content.profile.name+' — Home');
  const caption=document.querySelector('.brand-caption');if(caption?.firstChild)caption.firstChild.textContent=content.profile.name;
 }).catch(()=>{});
}
