// Serve with node scripts/serve.mjs, then open /tests/motion.browser.html.
// Uses real browser layout and observers; no Supabase requests or writes.
import {defaultContent} from '../src/content.js';
import {view} from '../src/views.js';
import {initMotion, cleanupMotion} from '../src/motion.js';

const results = [];
const main = document.querySelector('#main');
const output = document.querySelector('#results');
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const assert = (condition, message) => { if (!condition) throw Error(message); };
const check = async (name, run) => {
  try { await run(); results.push({name, pass:true}); }
  catch (error) { results.push({name, pass:false, error:error.message}); }
};
const nativeMatchMedia = window.matchMedia;
const nativeIO = window.IntersectionObserver;
const nativeRO = window.ResizeObserver;
const observers = new Set();
const sizes = new Set();
const media = new EventTarget();
media.matches = false;
window.matchMedia = query => query.includes('prefers-reduced-motion') ? media : nativeMatchMedia(query);
window.IntersectionObserver = class extends nativeIO {
  constructor(...args) { super(...args); observers.add(this); }
  disconnect() { observers.delete(this); super.disconnect(); }
};
window.ResizeObserver = class extends nativeRO {
  constructor(...args) { super(...args); sizes.add(this); }
  disconnect() { sizes.delete(this); super.disconnect(); }
};
try {
  main.innerHTML = view('home',defaultContent,'../');
  await check('Initial hero sequence is finite and completes visibly',async () => {
    initMotion({initial:true});
    assert(main.querySelectorAll('.motion-hero').length === 6,'Six hero steps expected');
    await wait(800);
    assert(!main.querySelector('.motion-hero'),'Hero classes must clear');
    assert(getComputedStyle(main.querySelector('h1')).opacity === '1','Headline must remain visible');
  });
  await check('Repeated initialization retains one observer set and progress bar',() => {
    for (let i=0; i<8; i++) initMotion();
    assert(observers.size===1 && sizes.size===1,'Duplicate observers');
    assert(document.querySelectorAll('.reading-progress').length===1,'Duplicate progress');
  });
  await check('Cloud-style replacement does not replay the hero',() => {
    cleanupMotion();
    main.innerHTML=view('home',defaultContent,'../');
    initMotion();
    assert(!main.querySelector('.motion-hero'),'Replacement replayed the hero');
    assert(document.querySelectorAll('.reading-progress').length===1,'Replacement duplicated progress');
  });
  await check('Keyboard focus immediately cancels an enclosing entrance',() => {
    const card=main.querySelector('.school-stage');
    card.classList.add('motion-enter');
    card.querySelector('a').focus({preventScroll:true});
    assert(!card.classList.contains('motion-enter'),'Focus remained animated');
  });
  await check('Reduced-motion preference change disconnects effects immediately',() => {
    media.matches=true;
    media.dispatchEvent(new Event('change'));
    assert(!document.querySelector('.reading-progress'),'Progress survived preference change');
    assert(observers.size===0 && sizes.size===0,'Observers survived preference change');
    assert(!main.querySelector('.motion-enter,.motion-hero'),'Entrance survived preference change');
    initMotion({initial:true});
    assert(observers.size===0 && !document.querySelector('.reading-progress'),'Reduced initialization adds motion');
  });
  await check('Missing IntersectionObserver leaves every heading readable',() => {
    media.matches=false;
    delete window.IntersectionObserver;
    initMotion();
    assert([...main.querySelectorAll('h1,h2,h3')].every(el=>getComputedStyle(el).opacity==='1'),'Hidden content without observer');
  });
  await check('Reduced-motion CSS removes delayed opacity and translation',() => {
    // Apply the actual reduced-motion declarations as a forced CSS fixture;
    // the test does not change the user's OS accessibility preference.
    const reduced=[];
    const collect=rules=>{for(const rule of rules){
      if(rule.conditionText==='(prefers-reduced-motion: reduce)')reduced.push(...[...rule.cssRules].map(item=>item.cssText));
      else if(rule.cssRules)collect(rule.cssRules);
    }};
    for(const sheet of document.styleSheets)collect(sheet.cssRules);
    assert(reduced.length>0,'Reduced-motion rules are missing');
    const forced=document.createElement('style');
    forced.textContent='@layer motion {'+reduced.join('\n')+'}';
    document.head.append(forced);
    const headline=main.querySelector('h1');
    headline.classList.add('motion-hero');
    try {
      const style=getComputedStyle(headline);
      assert(style.animationName==='none' && style.opacity==='1' && style.transform==='none','Reduced CSS leaves active movement');
    } finally { headline.classList.remove('motion-hero'); forced.remove(); }
  });
  await check('Admin and printable resume do not initialize decorative motion',() => {
    for (const route of ['admin','resume','404']) {
      document.body.dataset.route=route;
      initMotion({initial:true});
      assert(!document.querySelector('.reading-progress'),'Excluded route has progress');
    }
  });
  await check('Cleanup is idempotent and releases observer references',() => {
    cleanupMotion(); cleanupMotion();
    assert(observers.size===0 && sizes.size===0,'Observer leak after cleanup');
  });
} finally {
  cleanupMotion();
  window.matchMedia=nativeMatchMedia;
  window.IntersectionObserver=nativeIO;
  window.ResizeObserver=nativeRO;
  output.textContent=JSON.stringify(results,null,2);
  document.body.dataset.testResult=results.every(result=>result.pass)?'pass':'fail';
}
