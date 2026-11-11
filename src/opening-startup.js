// Arm the opening before a static homepage can paint. The independent opening
// entry claims this cover only after the hero, stylesheet and visible tab agree.
(() => {
 const win=window,doc=document,root=doc.documentElement,entry=doc.currentScript,entryUrl=entry?.src;
 const preference=win.matchMedia('(prefers-reduced-motion: reduce)'),connection=win.navigator.connection;
 const events=new AbortController(),options={signal:events.signal};
 let state='bypassed',timer=0,remaining=4000,resumed=0;
 const eligible=()=>typeof root.animate==='function'&&!preference.matches&&!connection?.saveData&&!/^(slow-2g|2g)$/.test(connection?.effectiveType||'')&&!win.location.hash&&win.scrollY<25;
 const pause=()=>{
  if(!timer)return;
  remaining-=win.performance.now()-resumed;
  win.clearTimeout(timer);timer=0;
 };
 const release=(reason='released')=>{
  state=reason;root.removeAttribute('data-opening-pending');
  pause();events.abort();
 };
 const resume=()=>{
  pause();
  if(state!=='pending'||doc.hidden)return;
  resumed=win.performance.now();
  timer=win.setTimeout(()=>release('expired'),Math.max(0,remaining));
 };
 win.__portfolioOpeningBoot={
  get state(){return state;},
  claim(){
   if(state!=='pending')return false;
   if(!eligible()||doc.hidden||remaining-(timer?win.performance.now()-resumed:0)<=0){release('bypassed');return false;}
   state='claimed';return true;
  },
  release
 };
 if(!eligible()){events.abort();return;}
 state='pending';root.setAttribute('data-opening-pending','true');
 resume();
 for(const name of ['scroll','hashchange','pagehide','pointerdown','keydown','focusin'])win.addEventListener(name,()=>release('interacted'),{...options,passive:true});
 preference.addEventListener('change',()=>release('preferences'),options);
 connection?.addEventListener?.('change',()=>release('preferences'),options);
 doc.addEventListener('visibilitychange',resume,options);
 // Other deferred scripts are independent of this opening, including failures
 // while a background tab is still waiting for its first visible frame.
 win.addEventListener('error',event=>{if(event.target===entry||(entryUrl&&event.filename===entryUrl))release('failed');},{...options,capture:true});
})();
