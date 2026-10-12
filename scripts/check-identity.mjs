import {chromium,firefox,webkit} from 'playwright';
import {spawn} from 'node:child_process';
import fs from 'node:fs/promises';
const port=4175,base=`http://127.0.0.1:${port}/`;
const server=spawn(process.execPath,['scripts/serve.mjs'],{env:{...process.env,PORT:String(port)},windowsHide:true,stdio:'ignore'});
const results=[];
const record=(engine,name,pass,details)=>{results.push({engine,name,pass:!!pass,...(details?{details}:{})});if(!pass)console.error('FAIL',engine,name,details||'');};
await fs.mkdir('outputs/redesign',{recursive:true});
try{
 for(let i=0;i<80;i++){try{if((await fetch(base)).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
 for(const engine of (process.env.IDENTITY_TEST_ENGINES||'chromium').split(',')){
  console.log('Checking film introduction and gallery in',engine);
  const browser=await {chromium,firefox,webkit}[engine].launch({headless:true});
  try{
   const firstPaint=await browser.newContext({viewport:{width:1440,height:1000}}),first=await firstPaint.newPage();
   await first.route('**/src/app.js*',async route=>{await new Promise(r=>setTimeout(r,900));await route.continue();});
   const initialLoad=first.goto(base,{waitUntil:'domcontentloaded'});
   await first.waitForFunction(()=>document.documentElement.classList.contains('opening-pending')&&getComputedStyle(document.querySelector('.hero-film')).position==='fixed');
   record(engine,'First paint shows the full-screen poster without a flash of Home',await first.evaluate(()=>{
    const film=document.querySelector('.hero-film'),rect=film.getBoundingClientRect();
    return rect.width>=innerWidth&&rect.height>=innerHeight&&!document.querySelector('h1').checkVisibility({checkVisibilityCSS:true})&&!document.querySelector('.site-header').checkVisibility({checkVisibilityCSS:true});
   }));
   await initialLoad;await first.locator('.intro-running').waitFor();
   record(engine,'The opening starts automatically without an entry gate',await first.locator('.intro-controls button').count()===1&&await first.locator('[data-intro-enter],.intro-sound,[data-film-replay],audio').count()===0);
   await firstPaint.close();
   const ctx=await browser.newContext({viewport:{width:1440,height:1000}}),page=await ctx.newPage();
   const errors=[];page.on('pageerror',error=>errors.push(error.message));
   await page.addInitScript(()=>{
    const timing=window.introSequenceTiming={};let sequence;
    new MutationObserver(()=>{
     if(!sequence){sequence=document.querySelector('.identity-intro.intro-running');if(sequence)timing.started=performance.now();}
     else if(!sequence.isConnected&&!timing.finished)timing.finished=performance.now();
    }).observe(document,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
   });
   await page.goto(base,{waitUntil:'domcontentloaded'});await page.locator('.intro-running').waitFor();
   await page.waitForFunction(()=>!document.querySelector('.hero-film').paused);
   record(engine,'One muted video fills the opening without locking the page',await page.evaluate(()=>document.querySelectorAll('video').length===1&&document.querySelector('.identity-intro .hero-film').getBoundingClientRect().width>=innerWidth&&!document.querySelector('main').inert&&document.querySelector('.hero-film').muted));
   record(engine,'Automatic entry preserves keyboard focus',await page.evaluate(()=>document.activeElement===document.body));
   await page.waitForFunction(()=>performance.now()-introSequenceTiming.started>=950);
   record(engine,'The name arrives gently with a still crop and no added zoom',await page.evaluate(()=>getComputedStyle(document.querySelector('.intro-name-card')).opacity==='1'&&document.querySelector('.intro-name').textContent===document.querySelector('h1').textContent&&getComputedStyle(document.querySelector('.hero-film')).transform==='none'));
   await page.screenshot({path:`outputs/redesign/opening-${engine}-desktop.png`});
   await page.waitForFunction(()=>{const intro=document.querySelector('.intro-settling');return intro&&Number(getComputedStyle(intro).opacity)<.8&&Number(getComputedStyle(intro).opacity)>.1;});
   record(engine,'The dissolve returns the same film to Home before the cover clears',await page.evaluate(()=>document.querySelectorAll('video').length===1&&!!document.querySelector('.opening-hero>.hero-film')&&document.querySelector('.intro-film-frame').getBoundingClientRect().width>=innerWidth&&getComputedStyle(document.querySelector('.hero-film')).opacity==='0.8'));
   await page.screenshot({path:`outputs/redesign/opening-${engine}-transition.png`});
   await page.locator('.identity-intro').waitFor({state:'detached',timeout:4500});
   const elapsed=await page.evaluate(()=>introSequenceTiming.finished-introSequenceTiming.started);
   record(engine,'The opening finishes in about 3.2 seconds',elapsed>=3100&&elapsed<4200,{elapsedMs:Math.round(elapsed)});
   record(engine,'Home is readable and the background film keeps playing',await page.locator('h1').isVisible()&&await page.locator('.hero-film').evaluate(v=>!v.paused&&v.loop));
   record(engine,'The opening frame and cover are removed',await page.locator('.intro-film-frame,.intro-active').count()===0);
   await page.screenshot({path:`outputs/redesign/opening-${engine}-settled.png`});
   await page.locator('#home-contact-title').scrollIntoViewIfNeeded();await page.waitForFunction(()=>document.querySelector('.hero-film').paused);
   record(engine,'Film decoding pauses off screen',await page.locator('.hero-film').evaluate(v=>v.paused));
   await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.waitForFunction(()=>!document.querySelector('.hero-film').paused);
   await page.locator('[data-film-pause]').click();
   await page.locator('#home-contact-title').scrollIntoViewIfNeeded();await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.waitForTimeout(150);
   record(engine,'Returning to Home preserves a visitor pause',await page.locator('.hero-film').evaluate(v=>v.paused));
   await page.reload({waitUntil:'domcontentloaded'});await page.locator('.intro-skip').waitFor();
   record(engine,'A refresh still gives a brief opening',await page.locator('.identity-intro').count()===1);
   await page.locator('.intro-skip').focus();await page.keyboard.press('Enter');
   record(engine,'Keyboard skip restores main focus immediately',await page.evaluate(()=>document.activeElement.id==='main'&&!document.querySelector('.identity-intro')));
   await page.goto(base+'resources/');record(engine,'Inner pages have no opening media',await page.locator('video,audio,.identity-intro').count()===0);
   await page.locator('.site-header .brand').click();await page.waitForURL(base);
   record(engine,'Internal Home links keep the page ready to read',await page.locator('.identity-intro').count()===0);
   record(engine,'No browser exceptions',errors.length===0,errors);await ctx.close();
   const firstPhone=await browser.newContext({viewport:{width:320,height:844}}),phone=await firstPhone.newPage();
   await phone.goto(base,{waitUntil:'domcontentloaded'});await phone.locator('.intro-running').waitFor();
   record(engine,'The narrow phone opening fills the screen with one reachable skip',await phone.evaluate(()=>{
    const film=document.querySelector('.identity-intro .hero-film').getBoundingClientRect(),skip=document.querySelector('.intro-skip').getBoundingClientRect();
    return film.width>=innerWidth&&film.height>=innerHeight-1&&skip.left>=0&&skip.right<=innerWidth&&skip.top>=0&&skip.height>=44&&document.documentElement.scrollWidth<=innerWidth+1;
   }));
   await phone.waitForTimeout(950);await phone.screenshot({path:`outputs/redesign/opening-${engine}-phone.png`});
   await firstPhone.close();
   for(const action of ['escape','scroll','preference','resize','tab']){
    const context=await browser.newContext({viewport:{width:390,height:844}}),p=await context.newPage();
    await p.goto(base,{waitUntil:'domcontentloaded'});await p.locator('.intro-running').waitFor();
    if(action==='escape')await p.keyboard.press('Escape');
    if(action==='scroll')await p.mouse.wheel(0,400);
    if(action==='preference')await p.emulateMedia({reducedMotion:'reduce'});
    if(action==='resize')await p.setViewportSize({width:430,height:844});
    if(action==='tab')await p.keyboard.press('Tab');
    await p.locator('.identity-intro').waitFor({state:'detached',timeout:1000});
    record(engine,`${action} immediately dismisses the opening and leaves a usable page`,await p.evaluate(()=>!document.querySelector('main').inert&&document.documentElement.scrollWidth<=innerWidth+1));
    if(action==='preference')record(engine,'Live reduced motion pauses the film',await p.locator('.hero-film').evaluate(v=>v.paused));
    await context.close();
   }
   const delayed=await browser.newContext(),reading=await delayed.newPage();
   await reading.addInitScript(()=>{const play=HTMLMediaElement.prototype.play;HTMLMediaElement.prototype.play=function(){return this instanceof HTMLVideoElement?new Promise(resolve=>setTimeout(resolve,700)).then(()=>play.call(this)):play.call(this);};});
   await reading.goto(base,{waitUntil:'domcontentloaded'});await reading.locator('.intro-running').waitFor();await reading.evaluate(()=>scrollTo(0,400));await reading.waitForTimeout(1200);
   record(engine,'Late media never interrupts a visitor who has started reading',await reading.locator('.identity-intro').count()===0&&await reading.evaluate(()=>scrollY>24));await delayed.close();
   const stalled=await browser.newContext(),waiting=await stalled.newPage();
   await waiting.addInitScript(()=>{HTMLMediaElement.prototype.play=function(){return new Promise(()=>{});};});
   await waiting.goto(base,{waitUntil:'domcontentloaded'});await waiting.locator('.intro-running').waitFor();await waiting.locator('.identity-intro').waitFor({state:'detached',timeout:4200});
   record(engine,'Stalled playback does not extend the opening',await waiting.locator('h1').isVisible());await stalled.close();
   for(const mode of ['reduced','fragment','blocked-storage','no-js','media-failure','autoplay-blocked','app-failure']){
    const context=await browser.newContext({reducedMotion:mode==='reduced'?'reduce':'no-preference',javaScriptEnabled:mode!=='no-js'}),p=await context.newPage();
    if(mode==='blocked-storage')await p.addInitScript(()=>Object.defineProperty(window,'sessionStorage',{get(){throw new DOMException('Unavailable','SecurityError');}}));
    if(mode==='media-failure')await p.addInitScript(()=>{const src=Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype,'src');Object.defineProperty(HTMLMediaElement.prototype,'src',{...src,set(value){src.set.call(this,this instanceof HTMLVideoElement?value+'.unavailable':value);}});});
    if(mode==='autoplay-blocked')await p.addInitScript(()=>{HTMLMediaElement.prototype.play=function(){return Promise.reject(new DOMException('Blocked','NotAllowedError'));};});
    if(mode==='app-failure')await p.route('**/src/app.js*',r=>r.abort());
    await p.goto(base+(mode==='fragment'?'#teaching-evidence':mode==='reduced'?'?intro=1':''),{waitUntil:'domcontentloaded'});
    await p.waitForFunction(()=>!document.documentElement.classList.contains('opening-pending')&&!document.querySelector('.identity-intro'),null,{timeout:5000});
    record(engine,`${mode} leaves content readable without a gate`,await p.locator('h1').isVisible());
    if(mode==='reduced')record(engine,'Reduced motion retains a static poster with explicit playback',await p.locator('.hero-film').evaluate(v=>v.paused&&!v.getAttribute('src')));
    await context.close();
   }
   const gallery=await browser.newContext({reducedMotion:'reduce'}),g=await gallery.newPage();
   await g.goto(base+'gallery/');await g.locator('[data-gallery-filter="TLM"]').click();
   record(engine,'Gallery filtering still updates visible rows',await g.locator('.gallery-card:not([hidden])').count()>0&&await g.locator('.gallery-card[hidden]').count()>0);
   const trigger=g.locator('.gallery-card:not([hidden]) a[data-viewer]').first();await trigger.click();
   record(engine,'Gallery evidence opens in a labelled dialog',await g.locator('.evidence-viewer').isVisible());await g.keyboard.press('Escape');await g.locator('.evidence-viewer').waitFor({state:'detached'});
   record(engine,'Gallery Escape restores trigger focus',await trigger.evaluate(el=>document.activeElement===el));await gallery.close();
  }finally{await browser.close();}
 }
}finally{server.kill();await fs.writeFile('outputs/redesign/identity-results.json',JSON.stringify({checks:results.length,failed:results.filter(r=>!r.pass).length,results},null,2));}
console.log(`${results.filter(r=>r.pass).length}/${results.length} film introduction and gallery checks passed.`);
if(results.some(r=>!r.pass))process.exitCode=1;
