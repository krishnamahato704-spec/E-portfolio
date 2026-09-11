// Run /tests/app.browser.html?case=resources, ?case=contact, or ?case=failure.
// Exercises the real app with an isolated, controllable read response.
import {defaultContent} from '../src/content.js';
import {view} from '../src/views.js';
const mode=new URLSearchParams(location.search).get('case') || 'resources';
const route=mode==='contact'?'contact':'resources';
document.body.dataset.route=route;
const main=document.querySelector('#main');
main.innerHTML=view(route,defaultContent,'../');
const original=main.firstElementChild;
let resolveRead;
const nativeFetch=window.fetch;
const calls=[];
window.fetch=(url,options)=>{
  calls.push({url:String(url),method:options?.method||'GET'});
  return new Promise(resolve=>{resolveRead=resolve;});
};
const results=[];
const assert=(condition,name)=>{results.push({name,pass:!!condition});};
try {
  await import('../src/app.js');
  const content=structuredClone(defaultContent);
  content.schemaVersion=3;
  content.resources=[
    {title:'Test lesson',category:'Lesson plan',description:'Local fixture only',url:'https://example.com/lesson.pdf'},
    {title:'Test assessment',category:'Assessment',description:'Local fixture only',url:'https://example.com/assessment.pdf'}
  ];
  if(mode==='contact') {
    const name=main.querySelector('[name=name]');
    name.value='Local regression fixture';
    name.dispatchEvent(new Event('input',{bubbles:true}));
  }
  resolveRead(new Response(JSON.stringify(mode==='failure'?{message:'Fixture unavailable'}:[{content,updated_at:'2026-09-11T00:00:00Z'}]),{status:mode==='failure'?503:200,headers:{'Content-Type':'application/json'}}));
  await new Promise(resolve=>setTimeout(resolve,80));
  assert(calls.length===1 && calls[0].method==='GET' && calls[0].url.includes('/rest/v1/portfolio_public?'),'One public read and no writes');
  if(mode==='resources') {
    assert(main.firstElementChild!==original,'Successful content read replaces markup');
    assert(main.querySelectorAll('.resource-row').length===2,'New resources rendered');
    main.querySelector('[data-filter=Assessment]').click();
    assert(main.querySelectorAll('.resource-row:not([hidden])').length===1,'Filter handles replaced resource rows');
    assert(main.querySelector('.resource-row:not([hidden]) h3').textContent==='Test assessment','Correct filtered resource remains');
    main.querySelector('[data-filter=All]').click();
    assert(main.querySelectorAll('.resource-row:not([hidden])').length===2,'All filter restores rows');
  } else {
    assert(main.firstElementChild===original,'Slow or failed read preserves the existing document');
    if(mode==='contact')assert(main.querySelector('[name=name]').value==='Local regression fixture','Typed form value survives the late read');
  }
  assert(document.querySelectorAll('.reading-progress').length===1,'Exactly one reading-progress element');
  assert(!main.querySelector('form.motion-enter, input.motion-enter, textarea.motion-enter'),'Form controls are excluded from reveals');
} catch(error) { results.push({name:String(error),pass:false}); }
finally {
  window.fetch=nativeFetch;
  document.querySelector('#results').textContent=JSON.stringify(results,null,2);
  document.body.dataset.testResult=results.every(result=>result.pass)?'pass':'fail';
}
