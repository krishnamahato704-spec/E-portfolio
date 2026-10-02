import {wireCollections} from './collections.js?v=build';
import {defaultContent} from './content.js?v=build';
import {initNavigation} from './navigation.js?v=build';
import {initMotion,cleanupMotion} from './motion.js?v=build';
import {initCustomCursor,cleanupCustomCursor} from './cursor.js?v=build';
import {initLightbox} from './lightbox.js?v=build';
const route=document.body.dataset.route;
const base=document.body.dataset.base;
// Packaging installs the exact content used to generate this release's HTML/PDF.
const content=defaultContent;
initNavigation();
if(route==='admin') import('./admin.js?v=build').then(x=>x.initStudio(base));
else {
 document.querySelector('#print-resume')?.addEventListener('click',()=>window.print());
 document.querySelector('.copy-email')?.addEventListener('click',async e=>{
  const status=document.querySelector('#copy-status');
  try{await navigator.clipboard.writeText(e.currentTarget.dataset.email);status.textContent='Email address copied.'}catch{status.textContent='Please select and copy the email address above.'}
 });
 document.querySelector('#contact-form')?.addEventListener('submit',e=>{
  e.preventDefault();const f=new FormData(e.currentTarget);
  const body=`Hello Krishna,\n\n${f.get('message')}\n\n${f.get('name')}\n${f.get('school')}\n${f.get('email')}`;
  location.href=`mailto:${content.profile.email}?subject=${encodeURIComponent('Teaching enquiry'+(f.get('school')?' — '+f.get('school'):''))}&body=${encodeURIComponent(body)}`;
  document.querySelector('#contact-status').textContent='Your email draft is ready to open. If no email app opens, use the email address alongside this form. Nothing has been sent by this website.';
 });
 wireCollections();initLightbox();initCustomCursor();initMotion({initial:true});
 document.querySelectorAll('img').forEach(im=>im.addEventListener('error',()=>{const note=document.createElement('p');note.className='image-error';note.textContent=im.alt+' — image temporarily unavailable.';im.replaceWith(note)},{once:true}));
 window.addEventListener('pagehide',()=>{cleanupMotion();cleanupCustomCursor();});
 window.addEventListener('pageshow',e=>{if(e.persisted){initMotion();initCustomCursor();}});
}
