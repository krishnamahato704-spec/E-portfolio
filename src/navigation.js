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
 window.addEventListener('pageshow',e=>{if(e.persisted)close(false)});
 // Only the header surface changes; content and menu position remain stable.
 let scrolled;
 const updateSurface=()=>{const next=scrollY>24;if(next!==scrolled){scrolled=next;header.classList.toggle('is-scrolled',next);}};
 window.addEventListener('scroll',updateSurface,{passive:true});updateSurface();
 // Preserve a menu already opened through the native fallback during loading.
 if(document.querySelector('.fallback-navigation')?.open)toggle.click();
 // Fetch at most two public documents after a visitor shows intent. Browser
 // prefetch is optional; ordinary links remain the navigation mechanism.
 const prefetched=new Set();
 const prefetch=link=>{
  if(!link||link.download||link.target||prefetched.size>=2||navigator.connection?.saveData||/^(slow-2g|2g|3g)$/.test(navigator.connection?.effectiveType||''))return;
  const url=new URL(link.href,location.href);
  if(url.origin!==location.origin||url.pathname===location.pathname||!url.pathname.endsWith('/')||url.search||url.hash||/\/admin\//.test(url.pathname))return;
  if(prefetched.has(url.href))return;
  prefetched.add(url.href);
  const hint=document.createElement('link');hint.rel='prefetch';hint.href=url.href;document.head.append(hint);
 };
 let intentTimer=0;
 document.addEventListener('pointerover',event=>{
  clearTimeout(intentTimer);
  const link=event.target.closest('a[href]');
  if(link&&event.pointerType!=='touch')intentTimer=setTimeout(()=>prefetch(link),120);
 });
 document.addEventListener('pointerout',()=>clearTimeout(intentTimer));
 document.addEventListener('focusin',event=>prefetch(event.target.closest('a[href]')));
 window.addEventListener('pagehide',()=>clearTimeout(intentTimer));
}
