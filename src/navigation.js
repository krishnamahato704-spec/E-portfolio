// A compact disclosure keeps the page interactive while navigation is open.
export function initNavigation() {
 const toggle=document.querySelector('.menu-toggle');
 const panel=document.querySelector('#navigation');
 const header=document.querySelector('.site-header');
 if(!toggle || !panel || toggle.dataset.ready) return;
 toggle.dataset.ready='true';
 const closeButton=panel.querySelector('.menu-close');
 let open=false;
 const close=(restore=true)=>{
  if(!open)return;
  open=false;
  panel.classList.remove('is-open');
  toggle.setAttribute('aria-expanded','false');
  if(restore)toggle.focus({preventScroll:true});
 };
 toggle.addEventListener('click',()=>{
  if(open){close();return}
  open=true;
  panel.classList.add('is-open');toggle.setAttribute('aria-expanded','true');
  panel.querySelector('nav a').focus({preventScroll:true});
 });
 closeButton.addEventListener('click',()=>close());
 panel.addEventListener('click',e=>{if(e.target.closest('a'))close(false)});
 document.addEventListener('keydown',e=>{
  if(!open)return;
  if(e.key==='Escape'){e.preventDefault();close()}
 });
 const dismissOutside=e=>{if(open&&!panel.contains(e.target)&&!toggle.contains(e.target))close(false)};
 document.addEventListener('pointerdown',dismissOutside);
 document.addEventListener('focusin',dismissOutside);
 window.addEventListener('pagehide',()=>close(false));
 window.addEventListener('pageshow',()=>close(false));
 // Only the header surface changes; content and menu position remain stable.
 const updateSurface=()=>header.classList.toggle('is-scrolled',scrollY>24);
 window.addEventListener('scroll',updateSurface,{passive:true});updateSurface();
 // Preserve a menu already opened through the native fallback during loading.
 if(document.querySelector('.fallback-navigation')?.open)toggle.click();
}
