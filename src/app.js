import {wireCollections} from './collections.js?v=editorial-20261004';
import {initNavigation} from './navigation.js?v=editorial-20261004';
import {initMotion,cleanupMotion} from './motion.js?v=editorial-20261004';
import {wireViewer} from './viewer.js?v=editorial-20261004';
const route=document.body.dataset.route;
const base=document.body.dataset.base;
initNavigation();
function wire(){
 document.querySelector('#print-resume')?.addEventListener('click',()=>window.print());
 document.querySelector('.copy-email')?.addEventListener('click',async e=>{
  const status=document.querySelector('#copy-status');
  try{await navigator.clipboard.writeText(e.currentTarget.dataset.email);status.textContent='Email address copied.'}catch{status.textContent='Please select and copy the email address above.'}
 });
 document.querySelector('#contact-form')?.addEventListener('submit',e=>{
  e.preventDefault(); if(!e.currentTarget.reportValidity())return; const f=new FormData(e.currentTarget);
  const body=`Hello Krishna,\n\n${f.get('message')}\n\n${f.get('name')}\n${f.get('school')}\n${f.get('email')}`;
  location.href=`mailto:${e.currentTarget.dataset.email}?subject=${encodeURIComponent('Teaching enquiry'+(f.get('school')?' — '+f.get('school'):''))}&body=${encodeURIComponent(body)}`;
  document.querySelector('#contact-status').textContent='Your email draft is ready to open. If no email app opens, use the email address alongside this form. Nothing has been sent by this website.';
 });
 wireCollections();
 wireViewer();
 document.querySelectorAll('img').forEach(im=>im.addEventListener('error',()=>{if(!im.alt){im.remove();return;}const note=document.createElement('p');note.className='image-error';note.textContent=im.alt+' — image temporarily unavailable.';im.replaceWith(note)},{once:true}));
}
if(route==='admin') import('./admin.js?v=editorial-20261004').then(x=>x.initStudio(base));
else {
 wire();
 let opening;
 if(route==='home')import('./identity.js?v=editorial-20261004').then(module=>{opening=module;module.initOpening();});
 initMotion({initial:true});
 window.addEventListener('pagehide',()=>{opening?.cleanupOpening();cleanupMotion();});
 window.addEventListener('pageshow',e=>{if(e.persisted){initMotion();opening?.initOpening({auto:false});}});
}
