import {defaultContent} from '../src/content.js';
import {view} from '../src/views.js';
const mode=new URLSearchParams(location.search).get('case')||'resources';
const route=mode.startsWith('home')?'home':mode==='contact'?'contact':mode==='teaching'?'teaching':'resources';
document.body.dataset.route=route;
const main=document.querySelector('#main');main.innerHTML=view(route,defaultContent,'../');
const hero=main.querySelector('.hero'),first=main.firstElementChild;
const nativeFetch=window.fetch;let calls=0;
window.fetch=async()=>{calls++;throw Error('Public visits must not depend on a live content read');};
const results=[];const assert=(pass,name)=>results.push({pass:!!pass,name});
try{
 await import('../src/app.js');
 await new Promise(r=>setTimeout(r,100));
 assert(calls===0,'Static public release makes no Supabase reads or writes');
 assert(main.firstElementChild===first,'The complete static document stays in place');
 if(route==='home')assert(main.querySelector('.hero')===hero,'The original hero video remains in place');
 if(route==='resources'){
  const search=main.querySelector('#resource-search');search.value='unlikely-fixture-match';search.dispatchEvent(new Event('input',{bubbles:true}));
  assert(!main.querySelector('#resource-empty').hidden,'Search exposes the empty state');
  window.dispatchEvent(new PageTransitionEvent('pagehide',{persisted:true}));window.dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true}));
  assert(search.value==='unlikely-fixture-match'&&!main.querySelector('#resource-empty').hidden,'History restoration keeps search state');
 }
 if(route==='contact'){const input=main.querySelector('[name=name]');input.value='Fixture name';window.dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true}));assert(input.value==='Fixture name','Form input survives history restoration');}
}catch(e){assert(false,String(e));}
finally{window.fetch=nativeFetch;document.querySelector('#results').textContent=JSON.stringify(results,null,2);document.body.dataset.testResult=results.every(r=>r.pass)?'pass':'fail';}
