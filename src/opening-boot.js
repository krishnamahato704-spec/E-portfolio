// This small, blocking Home script runs before the first browser paint.
// The normal portfolio stays available when scripting or motion is unavailable.
(()=>{
 const root=document.documentElement;
 let timer=0;
 const events=new AbortController();
 const boot={pending:false,release(){
  clearTimeout(timer);root.classList.remove('opening-pending','opening-measure');
  boot.pending=false;events.abort();
 }};
 window.portfolioOpeningBoot=boot;
 try{
  if(matchMedia('(prefers-reduced-motion: reduce)').matches||navigator.connection?.saveData||/^(slow-2g|2g)$/.test(navigator.connection?.effectiveType||'')||location.hash)return;
  const preview=new URLSearchParams(location.search).get('intro')==='1';
  const seen=sessionStorage.getItem('portfolio-identity-seen');
  const navigation=performance.getEntriesByType('navigation')[0]?.type;
  const referrer=document.referrer?new URL(document.referrer):null;
  const internalReturn=referrer?.origin===location.origin&&referrer.pathname!==location.pathname;
  if(!preview&&(seen||navigation==='back_forward'||internalReturn))return;
  boot.pending=true;root.classList.add('opening-pending');
  // An unavailable app module must never leave the portfolio behind a cover.
  timer=setTimeout(boot.release,4000);
  window.addEventListener('scroll',()=>{if(scrollY>24)boot.release();},{passive:true,signal:events.signal});
  window.addEventListener('pagehide',boot.release,{signal:events.signal});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')boot.release();},{signal:events.signal});
  document.addEventListener('click',e=>{if(e.target.closest('[data-opening-skip]')){boot.release();document.querySelector('#main')?.focus({preventScroll:true});}},{signal:events.signal});
 }catch{boot.release();}
})();
