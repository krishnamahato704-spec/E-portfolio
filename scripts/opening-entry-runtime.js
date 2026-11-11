// This file is bundled with the guard and iris by build-opening-entry.mjs.
// Interactive precedes deferred modules; DOMContentLoaded would wait for them.
const doc=document,win=window;
const entryEvents=new AbortController(),entryOptions={signal:entryEvents.signal};
const enter=()=>{
 if(doc.readyState==='loading'||doc.hidden)return;
 const stylesheet=doc.querySelector('link[rel="stylesheet"][href*="src/styles.css"]');
 if(!stylesheet?.sheet)return;
 entryEvents.abort();
 initPortfolioOpening(doc.querySelector('#main'),{initial:true});
};
doc.addEventListener('readystatechange',enter,entryOptions);
doc.addEventListener('visibilitychange',enter,entryOptions);
doc.addEventListener('load',enter,{...entryOptions,capture:true});
win.addEventListener('pagehide',()=>{
 entryEvents.abort();
 cleanupPortfolioOpening();
});
win.addEventListener('pageshow',event=>{
 if(event.persisted)initPortfolioOpening(doc.querySelector('#main'));
});
enter();
