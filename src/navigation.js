// The mobile panel is a modal containing ordinary navigation links.
export function initNavigation() {
 const toggle=document.querySelector('.menu-toggle');
 const panel=document.querySelector('#navigation');
 const header=document.querySelector('.site-header');
 if(!toggle || !panel || toggle.dataset.ready) return;
 toggle.dataset.ready='true';
 const mobile=matchMedia('(max-width: 1000px)');
 const closeButton=panel.querySelector('.menu-close');
 let open=false, position=0, savedBody={}, inertNodes=[];
 const close=(restore=true)=>{
  if(!open)return;
  open=false;
  panel.classList.remove('is-open');
  panel.removeAttribute('role');panel.removeAttribute('aria-modal');panel.removeAttribute('aria-labelledby');
  toggle.setAttribute('aria-expanded','false');
  document.body.classList.remove('navigation-open');
  Object.assign(document.body.style,savedBody);
  inertNodes.forEach(([el,previous])=>{el.inert=previous});inertNodes=[];
  window.scrollTo({top:position,behavior:'instant'});
  if(restore)toggle.focus({preventScroll:true});
 };
 toggle.addEventListener('click',()=>{
  if(open){close();return}if(!mobile.matches)return;
  open=true;position=scrollY;
  savedBody=Object.fromEntries(['position','top','width','overflow'].map(key=>[key,document.body.style[key]]));
  Object.assign(document.body.style,{position:'fixed',top:`-${position}px`,width:'100%',overflow:'hidden'});
  document.body.classList.add('navigation-open');
  const background=[...document.body.children].filter(el=>el!==header && !el.contains(header));
  background.push(...[...panel.parentElement.children].filter(el=>el!==panel));
  inertNodes=background.map(el=>[el,el.inert]);inertNodes.forEach(([el])=>{el.inert=true});
  panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-labelledby','navigation-title');
  panel.classList.add('is-open');toggle.setAttribute('aria-expanded','true');
  panel.querySelector('nav a').focus({preventScroll:true});
 });
 closeButton.addEventListener('click',()=>close());
 panel.addEventListener('click',e=>{if(e.target.closest('a'))close(false)});
 document.addEventListener('keydown',e=>{
  if(!open)return;
  if(e.key==='Escape'){e.preventDefault();close();return}
  if(e.key!=='Tab')return;
  const controls=[...panel.querySelectorAll('a[href],button:not([disabled])')];
  const first=controls[0],last=controls.at(-1);
  if(e.shiftKey && document.activeElement===first){e.preventDefault();last.focus()}
  else if(!e.shiftKey && document.activeElement===last){e.preventDefault();first.focus()}
 });
 mobile.addEventListener('change',()=>{
  const hadFocus=panel.contains(document.activeElement);
  close(false);
  if(hadFocus && !mobile.matches)panel.querySelector('a[aria-current],a').focus({preventScroll:true});
 });
 window.addEventListener('pagehide',()=>close(false));
 window.addEventListener('pageshow',()=>close(false));
 // Only the header surface changes; content and menu position remain stable.
 const updateSurface=()=>header.classList.toggle('is-scrolled',scrollY>24);
 window.addEventListener('scroll',updateSurface,{passive:true});updateSurface();
}
