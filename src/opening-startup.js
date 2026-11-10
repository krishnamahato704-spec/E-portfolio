// Arm the opening before a static homepage can paint. The deferred module
// claims this cover and releases it only after its real iris is attached.
(() => {
 const win=window,doc=document,root=doc.documentElement;
 const sessionKey='portfolio-atlas-opening-v2',started=win.performance.now();
 const preference=win.matchMedia('(prefers-reduced-motion: reduce)'),connection=win.navigator.connection;
 const events=new AbortController(),options={signal:events.signal};
 let state='bypassed',timer=0;
 const eligible=()=>{
  let seen=false;try{seen=win.sessionStorage.getItem(sessionKey)==='seen';}catch{}
  return typeof root.animate==='function'&&!preference.matches&&!connection?.saveData&&!/^(slow-2g|2g)$/.test(connection?.effectiveType||'')&&!win.location.hash&&!doc.hidden&&win.scrollY<25&&(!seen||new URLSearchParams(win.location.search).get('intro')==='replay');
 };
 const release=(reason='released')=>{
  state=reason;root.removeAttribute('data-opening-pending');
  if(timer)win.clearTimeout(timer);timer=0;events.abort();
 };
 win.__portfolioOpeningBoot={
  get state(){return state;},
  claim(){
   if(state!=='pending')return false;
   if(!eligible()||win.performance.now()-started>=4000){release('bypassed');return false;}
   state='claimed';return true;
  },
  release
 };
 if(!eligible()){events.abort();return;}
 state='pending';root.setAttribute('data-opening-pending','true');
 timer=win.setTimeout(()=>release('expired'),4000);
 for(const name of ['scroll','hashchange','pagehide','pointerdown','keydown','focusin'])win.addEventListener(name,()=>release('interacted'),{...options,passive:true});
 preference.addEventListener('change',()=>release('preferences'),options);
 connection?.addEventListener?.('change',()=>release('preferences'),options);
 doc.addEventListener('visibilitychange',()=>{if(doc.hidden)release('hidden');},options);
 win.addEventListener('error',event=>{if(event.target?.tagName==='SCRIPT'||event.error)release('failed');},{...options,capture:true});
})();
