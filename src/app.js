import {wireCollections} from './collections.js?v=recruiter-20260912';
import {loadContent} from './cloud.js?v=recruiter-20260912';
import {mergeContent,validateContent} from './content.js?v=recruiter-20260912';
import {view} from './views.js?v=opening-20260912';
import {initNavigation} from './navigation.js?v=opening-20260912';
import {initMotion,cleanupMotion} from './motion.js?v=opening-20260912';
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
 document.querySelectorAll('img').forEach(im=>im.addEventListener('error',()=>{const note=document.createElement('p');note.className='image-error';note.textContent=im.alt+' — image temporarily unavailable.';im.replaceWith(note)},{once:true}));
}
if(route==='admin') import('./admin.js?v=opening-20260912').then(x=>x.initStudio(base));
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
