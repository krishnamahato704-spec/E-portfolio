import {chromium,webkit} from 'playwright';
import {spawn} from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';

// Regressions: an unavailable app must not gate the opening, a background
// first visit must wait for visibility, and later app wiring must not own it.
const port=Number(process.env.OPENING_ENTRY_TEST_PORT||4203);
const base=process.env.OPENING_ENTRY_TEST_URL||`http://127.0.0.1:${port}/E-portfolio/`;
const home=new URL(base);home.searchParams.delete('intro');home.hash='';
const output=path.join('outputs','opening-entry');
const engines=(process.env.OPENING_ENTRY_TEST_ENGINES||'chromium,webkit').split(',');
const sizes=[['desktop',{width:1440,height:1000}],['phone',{width:390,height:844}]].filter(([name])=>!process.env.OPENING_ENTRY_TEST_SIZES||process.env.OPENING_ENTRY_TEST_SIZES.split(',').includes(name));
const server=process.env.OPENING_ENTRY_TEST_URL?null:spawn(process.execPath,['scripts/serve.mjs','--dist'],{env:{...process.env,PORT:String(port)},windowsHide:true,stdio:'ignore'});
const results=[];
const check=(engine,size,name,pass,details)=>{results.push({engine,size,name,pass:!!pass,details});if(!pass)console.error('FAIL',engine,size,name,details??'');};

async function instrument(context,{hidden=false}={}){
 await context.addInitScript(initiallyHidden=>{
  if(initiallyHidden){
   let hidden=true;
   Object.defineProperties(document,{hidden:{configurable:true,get:()=>hidden},visibilityState:{configurable:true,get:()=>hidden?'hidden':'visible'}});
   window.__entryMakeVisible=()=>{hidden=false;document.dispatchEvent(new Event('visibilitychange'));};
  }
  const trace=window.__entryTrace={frames:[],started:false};
  const opaque=color=>!!color&&color!=='transparent'&&(!color.startsWith('rgba(')||Number(color.slice(color.lastIndexOf(',')+1,-1))>=.99);
  const frame=()=>{
   const stage=document.querySelector('.atlas-stage'),styles=document.querySelector('link[rel=stylesheet][href*="src/styles.css"]');
   if(stage&&styles?.sheet&&!trace.started&&!document.hidden){
    const cover=getComputedStyle(stage,'::before'),bounds=stage.getBoundingClientRect();
    const paper=document.querySelector('.portfolio-opening .opening-iris-paper');
    const active=stage.closest('.opening-hero')?.dataset.openingActive==='true'&&!!paper;
    const covered=document.documentElement.hasAttribute('data-opening-pending')&&cover.content!=='none'&&cover.visibility==='visible'&&Number(cover.opacity)>=.99&&opaque(cover.backgroundColor)&&Number(cover.zIndex)>=24&&cover.clipPath==='none'&&cover.transform==='none'&&parseFloat(cover.width)>=bounds.width-1&&parseFloat(cover.height)>=bounds.height-1;
    trace.frames.push({time:performance.now(),covered,active:active&&opaque(getComputedStyle(paper).backgroundColor)});
    if(active)trace.started=true;
   }
   if(!trace.started)requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
 },hidden);
}

async function gatedPage(context){
 const page=await context.newPage(),errors=[];let release;
 page.on('pageerror',error=>errors.push(error.message));
 const gate=new Promise(resolve=>{release=resolve;});
 await page.route('**/src/app.js*',async route=>{await gate;try{await route.continue();}catch(error){if(!page.isClosed())throw error;}});
 await page.goto(home.href,{waitUntil:'commit'});
 await page.waitForFunction(()=>document.querySelector('.atlas-stage')&&document.querySelector('link[rel=stylesheet][href*="src/styles.css"]')?.sheet,null,{timeout:15000});
 return {page,errors,release,async close(){release();await context.close();}};
}
const playing=async page=>{try{await page.waitForFunction(()=>document.querySelector('.opening-hero')?.dataset.openingState==='playing'&&document.querySelector('.portfolio-opening'),null,{timeout:3500});return true;}catch{return false;}};
const completed=async page=>{try{await page.waitForFunction(()=>document.querySelector('.opening-hero')?.dataset.openingState==='completed'&&!document.querySelector('.portfolio-opening'),null,{timeout:4000});return true;}catch{return false;}};
const state=page=>page.evaluate(()=>{const stage=document.querySelector('.atlas-stage')?.getBoundingClientRect();return {ready:document.readyState,hidden:document.hidden,boot:window.__portfolioOpeningBoot?.state,opening:document.querySelector('.opening-hero')?.dataset.openingState,pending:document.documentElement.hasAttribute('data-opening-pending'),heading:document.querySelector('#opening-name')?.checkVisibility({checkOpacity:true,checkVisibilityCSS:true}),overlays:document.querySelectorAll('.portfolio-opening').length,viewport:[innerWidth,innerHeight],stage:stage&&{width:stage.width,height:stage.height}};});

try{
 let ready=false;
 for(let attempt=0;attempt<80;attempt++){try{if((await fetch(base)).ok){ready=true;break;}}catch{}await new Promise(resolve=>setTimeout(resolve,100));}
 if(!ready)throw Error(`Opening entry test site is unavailable: ${base}`);
 for(const engine of engines){
  const browser=await {chromium,webkit}[engine].launch({headless:true});
  try{
   for(const [size,viewport] of sizes){
    console.log('Checking independent opening in',engine,size);
    // A narrow desktop viewport misses the mobile browser's initial viewport
    // notifications. Exercise actual mobile layout and touch semantics here.
    const device=size==='phone'?{hasTouch:true,isMobile:true}:{};
    const context=await browser.newContext({viewport,...device,reducedMotion:'no-preference'});await instrument(context);
    const blocked=await gatedPage(context),started=await playing(blocked.page);
    check(engine,size,'A fresh visit starts its opening while the main app is still unavailable',started,await state(blocked.page));
    const done=started&&await completed(blocked.page),after=await state(blocked.page);
    check(engine,size,'The opening completes and exposes semantic home without the main app',done&&!after.pending&&after.heading&&after.ready==='interactive'&&blocked.errors.length===0,{...after,errors:blocked.errors});
    const trace=await blocked.page.evaluate(()=>window.__entryTrace);
    check(engine,size,'No uncovered homepage frame appears before the independent opening',trace.started&&trace.frames.length>0&&trace.frames.every(frame=>frame.covered||frame.active),{started:trace.started,frames:trace.frames.length,gaps:trace.frames.filter(frame=>!frame.covered&&!frame.active).slice(0,4)});
    blocked.release();
    await blocked.page.waitForLoadState('domcontentloaded');
    // A visitor may retain the previous release's session marker. It must not
    // suppress later Home documents or a tab which copies its opener's storage.
    await blocked.page.evaluate(()=>sessionStorage.setItem('portfolio-atlas-opening-v2','seen'));
    if(new URL(blocked.page.url()).searchParams.has('intro'))await blocked.page.goto(home.href,{waitUntil:'domcontentloaded'});
    await blocked.page.reload({waitUntil:'domcontentloaded'});
    const reloaded=await playing(blocked.page);
    check(engine,size,'A normal same-context reload plays without a replay query despite a legacy session marker',reloaded&&await completed(blocked.page)&&!new URL(blocked.page.url()).searchParams.has('intro'),await state(blocked.page));
    await blocked.page.goto(new URL('credentials/',home).href,{waitUntil:'domcontentloaded'});
    await blocked.page.locator('a.brand').click();
    await blocked.page.waitForURL(url=>url.pathname===home.pathname&&!url.searchParams.has('intro'));
    const returned=await playing(blocked.page);
    check(engine,size,'The actual Credentials Home link plays the opening on return without a replay query',returned&&await completed(blocked.page),await state(blocked.page));
    const popupEvent=blocked.page.waitForEvent('popup');
    await blocked.page.evaluate(url=>window.open(url,'_blank'),home.href);
    const popup=await popupEvent;await popup.waitForLoadState('domcontentloaded');
    const inherited=await popup.evaluate(()=>sessionStorage.getItem('portfolio-atlas-opening-v2'));
    const popupStarted=await playing(popup);
    check(engine,size,'A new Home tab plays even when the opener copies a legacy seen marker',inherited==='seen'&&popupStarted&&await completed(popup)&&!new URL(popup.url()).searchParams.has('intro'),{inherited,state:await state(popup)});
    await popup.close();
    await blocked.close();

    const adopting=await browser.newContext({viewport,...device,reducedMotion:'no-preference'});await instrument(adopting);
    const later=await gatedPage(adopting),alreadyStarted=await playing(later.page);
    if(alreadyStarted)await later.page.evaluate(()=>{
     const original=document.querySelector('.portfolio-opening'),hero=document.querySelector('.opening-hero');
     window.__entryAdoption={original,replaced:false,interrupted:false};
     new MutationObserver(records=>{
      if(records.some(record=>[...record.addedNodes].some(node=>node.nodeType===1&&(node.matches('.portfolio-opening')||node.querySelector('.portfolio-opening')))))window.__entryAdoption.replaced=true;
      if(['disposed','bypassed'].includes(hero.dataset.openingState))window.__entryAdoption.interrupted=true;
     }).observe(hero,{childList:true,subtree:true,attributes:true,attributeFilter:['data-opening-state']});
    });
    later.release();
    await later.page.waitForFunction(()=>document.querySelector('.menu-toggle')?.dataset.ready==='true',null,{timeout:15000});
    const preserved=alreadyStarted&&await later.page.evaluate(()=>{
     const tracking=window.__entryAdoption,overlay=document.querySelector('.portfolio-opening'),status=document.querySelector('.opening-hero').dataset.openingState;
     return !tracking.replaced&&!tracking.interrupted&&((overlay===tracking.original&&status==='playing')||(!overlay&&status==='completed'));
    });
    check(engine,size,'Main app arrival preserves the opening already in progress',preserved&&await completed(later.page)&&later.errors.length===0,{preserved,errors:later.errors,state:await state(later.page)});
    await later.close();

    const background=await browser.newContext({viewport,...device,reducedMotion:'no-preference'});await instrument(background,{hidden:true});
    const hidden=await gatedPage(background);
    await hidden.page.waitForTimeout(4250);
    const waiting=await state(hidden.page);
    await hidden.page.evaluate(()=>window.__entryMakeVisible());
    const visibleStarted=await playing(hidden.page);
    check(engine,size,'A background first visit waits past four seconds and opens when first made visible',waiting.overlays===0&&visibleStarted&&await completed(hidden.page)&&hidden.errors.length===0,{waiting,after:await state(hidden.page),errors:hidden.errors});
    await hidden.close();

    const failedApp=await browser.newContext({viewport,...device,reducedMotion:'no-preference'});await instrument(failedApp,{hidden:true});
    await failedApp.route('**/src/app.js*',route=>route.abort('failed'));
    const failedPage=await failedApp.newPage();
    await failedPage.goto(home.href,{waitUntil:'domcontentloaded'});
    const beforeVisible=await state(failedPage);
    await failedPage.evaluate(()=>window.__entryMakeVisible());
    const survived=await playing(failedPage);
    check(engine,size,'A failed main app request cannot cancel a background first opening',survived&&await completed(failedPage),{beforeVisible,after:await state(failedPage)});
    await failedApp.close();

    const reduced=await browser.newContext({viewport,...device,reducedMotion:'reduce'});await instrument(reduced);
    const quiet=await gatedPage(reduced);await quiet.page.waitForTimeout(150);
    const quietState=await state(quiet.page);
    check(engine,size,'Reduced motion keeps the ordinary homepage immediately readable',quietState.heading&&!quietState.pending&&quietState.overlays===0,quietState);
    await quiet.close();

    const plain=await browser.newContext({viewport,...device,javaScriptEnabled:false}),plainPage=await plain.newPage();
    await plainPage.goto(home.href,{waitUntil:'load'});
    check(engine,size,'Disabled JavaScript keeps the heading and native contact links readable',await plainPage.locator('#opening-name').isVisible()&&await plainPage.locator('.hero-copy .actions a[href]').count()>=2&&await plainPage.evaluate(()=>!document.documentElement.hasAttribute('data-opening-pending')));
    await plain.close();
   }
  }finally{await browser.close();}
 }
}finally{
 server?.kill();await fs.mkdir(output,{recursive:true});await fs.writeFile(path.join(output,'checks.json'),JSON.stringify({base,checks:results.length,failed:results.filter(result=>!result.pass).length,results},null,2));
}
console.log(`${results.filter(result=>result.pass).length}/${results.length} independent opening checks passed.`);
if(results.some(result=>!result.pass))process.exitCode=1;
