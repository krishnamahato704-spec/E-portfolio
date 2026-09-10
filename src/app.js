import {loadContent} from './cloud.js';
import {mergeContent,validateContent} from './content.js';
import {view} from './views.js';

const {route,base}=document.body.dataset;
const main=document.querySelector('#main');
const menu=document.querySelector('.menu-toggle');
const navigation=document.querySelector('#navigation');
let content=mergeContent();
let interacted=false;

function setMenu(open) {
  menu.setAttribute('aria-expanded',String(open));
  navigation.classList.toggle('is-open',open);
}
menu?.addEventListener('click',()=>setMenu(menu.getAttribute('aria-expanded')!=='true'));
document.addEventListener('keydown',event=>{
  if(event.key==='Escape' && menu?.getAttribute('aria-expanded')==='true') {
    setMenu(false);
    menu.focus();
  }
});

function showImageError(image) {
  const note=document.createElement('p');
  note.className='image-error';
  note.textContent=image.alt+' — image temporarily unavailable.';
  image.replaceWith(note);
}
function checkFailedImages() {
  // A cached failure may have happened before the module or refresh completed.
  main.querySelectorAll('img').forEach(image=>{
    if(image.complete && image.naturalWidth===0) showImageError(image);
  });
}
function filterResources(button) {
  const filter=button.dataset.filter;
  main.querySelectorAll('[data-filter]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
  let shown=0;
  main.querySelectorAll('.resource-row').forEach(row=>{
    row.hidden=filter!=='All' && row.dataset.category!==filter;
    if(!row.hidden) shown++;
  });
  const empty=main.querySelector('#resource-empty');
  empty.hidden=shown>0;
  if(!shown) empty.textContent=filter==='All'
    ? 'Lesson plans and assessment files have not yet been published. Explore the teaching design above.'
    : 'No files in this category yet.';
}
async function copyEmail(button) {
  const status=main.querySelector('#copy-status');
  try {
    await navigator.clipboard.writeText(button.dataset.email);
    status.textContent='Email address copied.';
  } catch {
    status.textContent='Please select and copy the email address above.';
  }
}
function prepareEmail(event) {
  if(event.target.id!=='contact-form') return;
  event.preventDefault();
  interacted=true;
  const fields=new FormData(event.target);
  const school=fields.get('school');
  const body=`Hello Krishna,\n\n${fields.get('message')}\n\n${fields.get('name')}\n${school}\n${fields.get('email')}`;
  location.href=`mailto:${content.profile.email}?subject=${encodeURIComponent('Teaching enquiry'+(school?' — '+school:''))}&body=${encodeURIComponent(body)}`;
  main.querySelector('#contact-status').textContent='Your email draft is ready to open. If no email app opens, use the email address alongside this form. Nothing has been sent by this website.';
}
function bindPublicInteractions() {
  // These listeners belong to the persistent main element, not replaced children.
  const markInteracted=()=>{interacted=true;};
  main.addEventListener('input',markInteracted,{once:true});
  main.addEventListener('pointerdown',markInteracted,{once:true});
  main.addEventListener('click',event=>{
    const button=event.target.closest('button');
    if(!button || !main.contains(button)) return;
    interacted=true;
    if(button.id==='print-resume') window.print();
    else if(button.matches('.copy-email')) copyEmail(button);
    else if(button.hasAttribute('data-filter')) filterResources(button);
  });
  main.addEventListener('submit',prepareEmail);
  // Image errors do not bubble; capture handles current and future images once.
  main.addEventListener('error',event=>{
    if(event.target.tagName==='IMG') showImageError(event.target);
  },true);
  checkFailedImages();
}
function updateIdentity(profile) {
  const footerName=document.querySelector('.footer-name');
  if(footerName) footerName.textContent=profile.name;
  const footerEmail=document.querySelector('.email-link');
  if(footerEmail) {
    footerEmail.href='mailto:'+profile.email;
    footerEmail.textContent=profile.email+' ↗';
  }
  document.querySelector('.brand')?.setAttribute('aria-label',profile.name+' — Home');
  const caption=document.querySelector('.brand-caption');
  if(caption?.firstChild) caption.firstChild.textContent=profile.name;
}
async function refreshContent() {
  try {
    const row=await loadContent();
    content=validateContent(mergeContent(row.content));
    updateIdentity(content.profile);
    // Preserve a pointer press, entered data or focus while a slow read finishes.
    if(!interacted && !main.contains(document.activeElement)) {
      main.innerHTML=view(route,content,base);
      checkFailedImages();
    }
  } catch {
    // The complete static portfolio remains available when online content fails.
  }
}
if(route==='admin') {
  import('./admin.js').then(module=>module.initStudio(base));
} else {
  bindPublicInteractions();
  refreshContent();
}
