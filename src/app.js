import {loadContent} from './cloud.js';
import {mergeContent,validateContent} from './content.js';
import {view} from './views.js?v=editorial-motion-20260911';
import {initMotion,cleanupMotion} from './motion.js';
const route=document.body.dataset.route;
const base=document.body.dataset.base;
let content=mergeContent();
let interacted=false;
document.addEventListener('input',()=>{interacted=true},{once:true});
document.addEventListener('click',e=>{if(e.target.closest('#main button,#main input,#main textarea'))interacted=true;});
document.querySelector('.menu-toggle')?.addEventListener('click',e=>{
 const button=e.currentTarget; const open=button.getAttribute('aria-expanded')!=='true';
 button.setAttribute('aria-expanded',String(open));document.querySelector('#navigation').classList.toggle('is-open',open);
});
document.addEventListener('keydown',e=>{
 const toggle=document.querySelector('.menu-toggle');
 if(e.key==='Escape' && toggle?.getAttribute('aria-expanded')==='true'){
  toggle.setAttribute('aria-expanded','false');document.querySelector('#navigation').classList.remove('is-open');toggle.focus();
 }
});
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
 document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{
  const filter=button.dataset.filter;
  document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  let shown=0; document.querySelectorAll('.resource-row').forEach(row=>{row.hidden=filter!=='All'&&row.dataset.category!==filter;if(!row.hidden) shown++;});
  const empty=document.querySelector('#resource-empty');empty.hidden=shown>0;if(!shown)empty.textContent=filter==='All'?'Lesson plans and assessment files have not yet been published. Explore the teaching design above.':'No files in this category yet.';
 }));
 document.querySelectorAll('img').forEach(im=>im.addEventListener('error',()=>{const note=document.createElement('p');note.className='image-error';note.textContent=im.alt+' — image temporarily unavailable.';im.replaceWith(note)},{once:true}));
}
if(route==='admin') import('./admin.js').then(x=>x.initStudio(base));
else {
 wire();
 initMotion({initial:true});
 window.addEventListener('pagehide',cleanupMotion);
 window.addEventListener('pageshow',e=>{if(e.persisted)initMotion();});
 // Keep the complete static document available during requests, failures, and without JS.
 loadContent().then(row=>{
  const candidate=mergeContent(row.content);validateContent(candidate);content=candidate;
  const footerName=document.querySelector('.footer-name');if(footerName)footerName.textContent=content.profile.name;
  const footerEmail=document.querySelector('.email-link');if(footerEmail){footerEmail.href='mailto:'+content.profile.email;footerEmail.textContent=content.profile.email+' ↗';}
  const brand=document.querySelector('.brand');if(brand)brand.setAttribute('aria-label',content.profile.name+' — Home');
  const caption=document.querySelector('.brand-caption');if(caption?.firstChild)caption.firstChild.textContent=content.profile.name;
  // Avoid interrupting an interaction when a slow request finishes.
  if(!interacted && !document.querySelector('#main').contains(document.activeElement)){
   cleanupMotion();
   document.querySelector('#main').innerHTML=view(route,content,base);wire();
   initMotion();
  }
 }).catch(()=>{});
}
