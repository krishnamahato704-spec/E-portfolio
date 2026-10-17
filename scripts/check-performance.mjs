import {chromium,webkit} from 'playwright';
import {spawn} from 'node:child_process';
import fs from 'node:fs/promises';
const port=4188,base=`http://127.0.0.1:${port}/`;
const server=spawn(process.execPath,['scripts/serve.mjs',...(process.argv.includes('--dist')?['--dist']:[])],{env:{...process.env,PORT:String(port)},windowsHide:true,stdio:'ignore'});
const results=[];
const record=(engine,name,pass)=>{results.push({engine,name,pass:!!pass});console.log(`${pass?'PASS':'FAIL'} ${engine}: ${name}`);};
try{
 for(let i=0;i<80;i++){try{if((await fetch(base)).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
 for(const engine of (process.env.PERFORMANCE_TEST_ENGINES||'chromium').split(',')){
  const browser=await {chromium,webkit}[engine].launch({headless:true});
  try{
   const late=await browser.newContext(),page=await late.newPage();
   await page.route('**/src/app.js*',async route=>{await new Promise(r=>setTimeout(r,2200));await route.continue();});
   await page.goto(base,{waitUntil:'domcontentloaded'});
   await page.waitForTimeout(250);
   record(engine,'A late application never starts another full-screen opening',await page.evaluate(()=>!document.documentElement.classList.contains('opening-pending')&&!document.querySelector('.identity-intro')&&document.querySelector('h1').checkVisibility({checkVisibilityCSS:true})));
   await page.unroute('**/src/app.js*');await page.goto(base,{waitUntil:'domcontentloaded'});await page.waitForTimeout(150);
   record(engine,'Returning after a skipped slow opening does not replay the cover',await page.evaluate(()=>!document.documentElement.classList.contains('opening-pending')&&!document.querySelector('.identity-intro')));
   await late.close();
   const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),photos=await context.newPage();
   const scripts=[];photos.on('request',r=>{if(r.resourceType()==='script')scripts.push(r.url());});
   await photos.goto(base);await photos.locator('[data-hero-gallery][data-enhanced]').waitFor();
   record(engine,'Home does not download controllers for unrelated pages',!scripts.some(url=>/\/(timeline|philosophy|democracy)\.js/.test(url)));
   record(engine,'Unselected gallery photographs stay unloaded',await photos.locator('[data-hero-slide]').evaluateAll(slides=>slides.slice(1).every(slide=>!slide.querySelector('img').getAttribute('src'))));
   record(engine,'Reduced motion starts with rotation explicitly paused',await photos.locator('[data-hero-gallery]').getAttribute('data-rotation')==='paused');
   // Hold the actual image response: the current photograph must remain on
   // screen until the requested replacement can be displayed.
   const source=await photos.locator('[data-hero-slide]').nth(1).locator('img').evaluate(img=>img.dataset.src||img.getAttribute('src'));
   let release;
   const gate=new Promise(resolve=>{release=resolve;});
   await photos.route(new URL(source,base).href,async route=>{await gate;await route.continue();});
   await photos.locator('[data-gallery-next]').click();await photos.waitForTimeout(150);
   record(engine,'A slow next photograph leaves the loaded photograph visible',await photos.locator('[data-hero-gallery]').getAttribute('data-slide')==='0');
   release();
   await photos.waitForFunction(()=>document.querySelector('[data-hero-gallery]').dataset.slide==='1');
   record(engine,'The replacement is decoded before the gallery moves',await photos.locator('[data-hero-slide]').nth(1).locator('img').evaluate(img=>img.complete&&img.naturalWidth>0));
   record(engine,'Manual navigation keeps rotation paused and one slide focusable',await photos.locator('[data-hero-gallery]').getAttribute('data-rotation')==='paused'&&await photos.locator('[data-hero-slide]:not([inert]) a').count()===1);
   const third=await photos.locator('[data-hero-slide]').nth(2).locator('img').getAttribute('data-src');
   await photos.route(new URL(third,base).href,async route=>{await new Promise(r=>setTimeout(r,500));await route.continue();});
   await photos.locator('[data-gallery-next]').click();await photos.locator('[data-gallery-next]').click();
   await photos.waitForFunction(()=>document.querySelector('[data-hero-gallery]').dataset.slide==='3');await photos.waitForTimeout(650);
   record(engine,'Rapid navigation keeps the latest selection when an older image finishes',await photos.locator('[data-hero-gallery]').getAttribute('data-slide')==='3');
   const fifth=await photos.locator('[data-hero-slide]').nth(4).locator('img').getAttribute('data-src');
   await photos.route(new URL(fifth,base).href,route=>route.abort());
   await photos.locator('[data-gallery-next]').click();await photos.waitForFunction(()=>!document.querySelector('[data-hero-gallery]').hasAttribute('aria-busy'));
   record(engine,'A failed photograph leaves the working slide and its original link available',await photos.locator('[data-hero-gallery]').getAttribute('data-slide')==='3'&&await photos.locator('[data-hero-slide]:not([inert]) a').isVisible());
   await photos.goto(base+'profile/');
   record(engine,'About loads no specialist teaching controllers',!scripts.some(url=>/\/(timeline|philosophy|democracy)\.js/.test(url)));
   record(engine,'Reading content has no late translation animation',await photos.locator('h1').evaluate(el=>getComputedStyle(el).transform==='none'));
   await context.close();
   const navigation=await browser.newContext(),nav=await navigation.newPage();
   await nav.addInitScript(()=>{
    sessionStorage.setItem('portfolio-identity-seen','1');
    window.addEventListener('pageswap',event=>sessionStorage.setItem('transition-outgoing',JSON.stringify({transition:!!event.viewTransition,visibility:document.visibilityState,motion:matchMedia('(prefers-reduced-motion: reduce)').matches})));
    window.addEventListener('pagereveal',event=>{window.hasPageTransition=!!event.viewTransition;});
   });
   await nav.goto(base);await nav.locator('.menu-toggle[data-ready]').waitFor({state:'attached'});
   const about=nav.locator('.navigation-links a[href$="profile/"]');
   await about.hover();await nav.waitForTimeout(200);
   record(engine,'Intent prefetch targets the public About document',await nav.locator('link[rel="prefetch"][href$="profile/"]').count()===1);
   await about.click();await nav.waitForURL('**/profile/');
   const supports=await nav.evaluate(()=>typeof CSSViewTransitionRule!=='undefined'&&'onpagereveal' in window);
   if(supports){
    await nav.waitForFunction(()=>window.hasPageTransition!==undefined);
    const transition=await nav.evaluate(()=>window.hasPageTransition);
    if(!transition)console.log('Native transition diagnostics',JSON.stringify({browser:browser.version(),...await nav.evaluate(()=>({outgoing:JSON.parse(sessionStorage.getItem('transition-outgoing')||'null'),incoming:{visibility:document.visibilityState,motion:matchMedia('(prefers-reduced-motion: reduce)').matches,paint:performance.getEntriesByType('paint').map(entry=>entry.name),navigation:performance.getEntriesByType('navigation').map(entry=>({type:entry.type,duration:entry.duration})),url:location.href}}))}));
    record(engine,'Supported browsers use the native document transition',transition);
   }
   record(engine,'Normal page navigation leaves the destination readable',await nav.locator('h1').isVisible());
   await navigation.close();
   const saving=await browser.newContext(),save=await saving.newPage();
   await save.addInitScript(()=>Object.defineProperty(navigator,'connection',{value:{saveData:true,effectiveType:'4g'},configurable:true}));
   await save.goto(base);await save.locator('.menu-toggle[data-ready]').waitFor({state:'attached'});
   await save.locator('.navigation-links a[href$="profile/"]').hover();await save.waitForTimeout(200);
   record(engine,'Data saving disables document prefetch and automatic film loading',await save.locator('link[rel="prefetch"]').count()===0&&await save.locator('.hero-film').evaluate(film=>!film.getAttribute('src')));
   await saving.close();
   const filters=await browser.newContext(),files=await filters.newPage();
   await files.route('**/src/app.js*',async route=>{await new Promise(r=>setTimeout(r,900));await route.continue();});
   const load=files.goto(base+'resources/',{waitUntil:'domcontentloaded'});
   await files.locator('#resource-list').waitFor();await files.evaluate(()=>document.fonts.ready);
   const before=await files.locator('#resource-list').evaluate(el=>el.getBoundingClientRect().top);
   await load;await files.locator('.collection-tools:not([hidden]):not([inert])').waitFor();
   const after=await files.locator('#resource-list').evaluate(el=>el.getBoundingClientRect().top);
   record(engine,'Enhancing search and filters preserves the document list position',Math.abs(before-after)<1);
   await filters.close();
  }finally{await browser.close();}
 }
}finally{
 server.kill();await fs.mkdir('outputs/performance-20261016',{recursive:true});
 await fs.writeFile('outputs/performance-20261016/regressions.json',JSON.stringify(results,null,2));
}
console.log(`${results.filter(r=>r.pass).length}/${results.length} performance regression checks passed.`);
if(results.some(r=>!r.pass))process.exitCode=1;
