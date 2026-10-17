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
   await first.waitForFunction(()=>document.documentElement.classList.contains('opening-pending')&&getComputedStyle(document.querySelector('.opening-hero'),'::after').position==='fixed');
   record(engine,'First paint shows the full-screen poster without a flash of Home',await first.evaluate(()=>{
    const cover=getComputedStyle(document.querySelector('.opening-hero'),'::after');
    return parseFloat(cover.width)>=innerWidth&&parseFloat(cover.height)>=innerHeight&&cover.backgroundImage.includes('hero-poster.webp')&&!document.querySelector('h1').checkVisibility({checkVisibilityCSS:true})&&!document.querySelector('.site-header').checkVisibility({checkVisibilityCSS:true});
   }));
   await initialLoad;await first.locator('.intro-running').waitFor();
   record(engine,'The opening has visible skip and explicit sound controls',await first.locator('[data-opening-skip]').isVisible()&&await first.locator('[data-opening-sound]').isVisible());
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
   record(engine,'The unobstructed film keeps the earlier gentle zoom',await page.evaluate(()=>document.querySelector('.identity-intro').children.length===1&&new DOMMatrix(getComputedStyle(document.querySelector('.hero-film')).transform).a>1&&new DOMMatrix(getComputedStyle(document.querySelector('.hero-film')).transform).a<1.05));
   await page.screenshot({path:`outputs/redesign/opening-${engine}-desktop.png`});
   await page.waitForFunction(()=>{const intro=document.querySelector('.intro-settling');return intro&&Number(getComputedStyle(intro).opacity)<.8&&Number(getComputedStyle(intro).opacity)>.1;});
   record(engine,'The dissolve goes directly into the Home background without a separate paper fade',await page.evaluate(()=>document.querySelectorAll('video').length===1&&!!document.querySelector('.opening-hero>.hero-film')&&document.querySelector('.intro-film-frame').getBoundingClientRect().width>=innerWidth&&getComputedStyle(document.querySelector('.intro-film-frame')).opacity==='1'&&getComputedStyle(document.querySelector('.hero-film')).opacity==='1'));
   await page.screenshot({path:`outputs/redesign/opening-${engine}-transition.png`});
   await page.locator('.identity-intro').waitFor({state:'detached',timeout:4500});
   const elapsed=await page.evaluate(()=>introSequenceTiming.finished-introSequenceTiming.started);
   record(engine,'The opening finishes in about 3.2 seconds',elapsed>=3100&&elapsed<4200,{elapsedMs:Math.round(elapsed)});
   record(engine,'Home keeps the muted background film playing alongside the photograph gallery',await page.locator('h1').isVisible()&&await page.locator('[data-hero-gallery]').isVisible()&&await page.locator('.hero-film').evaluate(v=>!v.paused&&v.muted));
   record(engine,'The opening frame and cover are removed',await page.locator('.intro-film-frame,.intro-active').count()===0);
   record(engine,'Piano stops when the portfolio opens',await page.locator('[data-opening-audio]').evaluate(a=>a.paused));
   await page.screenshot({path:`outputs/redesign/opening-${engine}-settled.png`});
   await page.locator('[data-film-pause]').click();await page.waitForFunction(()=>document.querySelector('.hero-film').paused);
   record(engine,'The visitor can pause the background film',await page.locator('[data-film-close]').isVisible());
   await page.locator('[data-film-pause]').click();await page.waitForFunction(()=>!document.querySelector('.hero-film').paused);
   await page.locator('#home-contact-title').scrollIntoViewIfNeeded();await page.waitForFunction(()=>document.querySelector('.hero-film').paused);
   record(engine,'Film decoding pauses off screen',await page.locator('.hero-film').evaluate(v=>v.paused));
   await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.waitForFunction(()=>!document.querySelector('.hero-film').paused);
   await page.locator('[data-film-pause]').click();
   await page.locator('#home-contact-title').scrollIntoViewIfNeeded();await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.waitForTimeout(150);
   record(engine,'Returning to Home preserves a visitor pause',await page.locator('.hero-film').evaluate(v=>v.paused));
   await page.locator('[data-film-close]').click();
   record(engine,'Hiding the background leaves the gallery visible and restores control focus',await page.locator('[data-hero-gallery]').isVisible()&&!await page.locator('.hero-film').isVisible()&&await page.locator('.hero-film').evaluate(v=>v.paused&&!v.dataset.manualPlay)&&await page.locator('[data-film-pause]').evaluate(el=>document.activeElement===el));
   // Exercise refresh with neutral focus, independently of the manual pause
   // above. Safari restores that old control and correctly dismisses an intro.
   const refresh=await browser.newContext({viewport:{width:1440,height:1000}}),refreshed=await refresh.newPage();
   await refreshed.goto(base,{waitUntil:'domcontentloaded'});await refreshed.locator('.intro-running').waitFor();await refreshed.keyboard.press('Escape');
   await refreshed.reload({waitUntil:'domcontentloaded'});
   await refreshed.waitForFunction(()=>!document.querySelector('.hero-film').paused);
   record(engine,'A refresh keeps the background film without replaying the full-screen opening',await refreshed.locator('.identity-intro').count()===0&&await refreshed.locator('.hero-film').evaluate(v=>v.muted));
   await refreshed.goto(base+'?intro=1',{waitUntil:'domcontentloaded'});await refreshed.locator('.intro-running').waitFor();
   await refreshed.locator('.skip-link').focus();await refreshed.keyboard.press('Enter');
   record(engine,'The page skip link dismisses the opening and moves focus to main',await refreshed.evaluate(()=>document.activeElement.id==='main'&&!document.querySelector('.identity-intro')));await refresh.close();
   await page.goto(base+'resources/');record(engine,'Inner pages have no opening media',await page.locator('video,audio,.identity-intro').count()===0);
   await page.locator('.site-header .brand').click();await page.waitForURL(base);
   record(engine,'Internal Home links keep the page ready to read',await page.locator('.identity-intro').count()===0);
   record(engine,'No browser exceptions',errors.length===0,errors);await ctx.close();
   const firstPhone=await browser.newContext({viewport:{width:320,height:844}}),phone=await firstPhone.newPage();
   await phone.goto(base,{waitUntil:'domcontentloaded'});await phone.locator('.intro-running').waitFor();
   record(engine,'The narrow phone opening has visible controls and no overflow',await phone.evaluate(()=>{
    const film=document.querySelector('.identity-intro .hero-film').getBoundingClientRect();
    return film.width>=innerWidth&&film.height>=innerHeight-1&&document.querySelector('[data-opening-skip]').checkVisibility()&&document.querySelector('[data-opening-sound]').checkVisibility()&&document.documentElement.scrollWidth<=innerWidth+1;
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
    record(engine,`${action} stops opening audio`,await p.locator('[data-opening-audio]').evaluate(a=>a.paused));
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
    if(mode==='reduced')record(engine,'Reduced motion loads neither film nor piano',await p.locator('.hero-film,[data-opening-audio]').evaluateAll(media=>media.every(m=>m.paused&&!m.getAttribute('src'))));
    await context.close();
   }
   const sound=await browser.newContext(),audible=await sound.newPage();
   await audible.addInitScript(()=>{
    const play=HTMLMediaElement.prototype.play;
    let gesture=false;
    document.addEventListener('click',event=>{if(event.isTrusted&&event.target.closest('[data-opening-sound]'))gesture=true;},{capture:true});
    HTMLMediaElement.prototype.play=function(){
     if(this instanceof HTMLAudioElement&&!gesture)return Promise.reject(new DOMException('Gesture required','NotAllowedError'));
     return play.call(this);
    };
   });
   await audible.goto(base,{waitUntil:'domcontentloaded'});await audible.locator('.intro-running').waitFor();
   record(engine,'Audio stays unloaded before an explicit sound choice',await audible.locator('[data-opening-audio]').evaluate(a=>a.paused)&&await audible.locator('[data-opening-audio]').evaluate(a=>!a.getAttribute('src')));
   await audible.keyboard.press('s');
   record(engine,'An unrelated key does not load or start music',await audible.locator('[data-opening-audio]').evaluate(a=>a.paused&&!a.getAttribute('src')));
   await audible.locator('[data-opening-sound]').click();await audible.waitForFunction(()=>{const a=document.querySelector('[data-opening-audio]');return !a.paused&&a.readyState>=2;});
   record(engine,'Only the explicit music button starts the quiet local piano',await audible.locator('[data-opening-audio]').evaluate(a=>a.currentSrc.endsWith('/assets/opening-piano.mp3')&&!a.loop&&a.duration<3.4));
   await audible.locator('.identity-intro').waitFor({state:'detached',timeout:4200});
   await audible.waitForFunction(()=>{const a=document.querySelector('[data-opening-audio]');return a.paused&&a.currentTime===0;},{},{timeout:1000});
   record(engine,'No piano continues behind the portfolio',await audible.locator('[data-opening-audio]').evaluate(a=>a.paused&&a.currentTime===0));await sound.close();
   const lateSound=await browser.newContext(),late=await lateSound.newPage();
   await late.addInitScript(()=>{
    const play=HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play=function(){return this instanceof HTMLAudioElement?new Promise(resolve=>setTimeout(resolve,700)).then(()=>play.call(this)):play.call(this);};
   });
   await late.goto(base,{waitUntil:'domcontentloaded'});await late.locator('.intro-running').waitFor();await late.locator('[data-opening-sound]').click();await late.keyboard.press('Escape');await late.waitForTimeout(1100);
   record(engine,'Late audio playback is stopped after an early dismissal',await late.locator('[data-opening-audio]').evaluate(a=>a.paused));await lateSound.close();
   const pendingSkip=await browser.newContext(),early=await pendingSkip.newPage();
   await early.route('**/src/app.js*',r=>r.abort());
   await early.goto(base,{waitUntil:'domcontentloaded'});
   await early.locator('[data-opening-skip]').click();
   record(engine,'Visible skip works even when the app module fails',await early.locator('h1').isVisible()&&await early.evaluate(()=>document.activeElement.id==='main'));
   await pendingSkip.close();
   const dataSaver=await browser.newContext(),saving=await dataSaver.newPage();
   await saving.addInitScript(()=>Object.defineProperty(navigator,'connection',{value:{saveData:true,effectiveType:'4g'},configurable:true}));
   await saving.goto(base,{waitUntil:'load'});
   record(engine,'Data saving mode loads no film or piano and keeps photos static',await saving.locator('h1').isVisible()&&await saving.locator('.hero-film,[data-opening-audio]').evaluateAll(media=>media.every(m=>!m.getAttribute('src')))&&await saving.locator('[data-hero-gallery]').getAttribute('data-rotation')==='paused');
   await dataSaver.close();
   const photosContext=await browser.newContext({viewport:{width:1440,height:1000}}),photos=await photosContext.newPage();
   await photos.addInitScript(()=>sessionStorage.setItem('portfolio-identity-seen','1'));
   await photos.goto(base);await photos.locator('[data-hero-gallery][data-enhanced]').waitFor();
   record(engine,'Home gallery uses five current photographs with one focusable slide',await photos.locator('[data-hero-slide]').count()===5&&await photos.locator('[data-hero-slide]:not([inert]) a').count()===1);
   await photos.mouse.move(10,70);
   await photos.waitForFunction(()=>document.querySelector('[data-hero-gallery]').dataset.slide==='1',null,{timeout:8000});
   record(engine,'Photographs advance automatically after a reading interval',true);
   await photos.locator('[data-hero-gallery]').hover();await photos.waitForTimeout(6300);
   record(engine,'Hovering holds the selected photograph through a rotation interval',await photos.locator('[data-hero-gallery]').getAttribute('data-slide')==='1');
   const nextPhoto=photos.locator('[data-gallery-next]');await nextPhoto.focus();
   await photos.mouse.move(10,70);await photos.waitForTimeout(6300);
   record(engine,'Keyboard focus stops rotation until explicitly restarted',await photos.locator('[data-hero-gallery]').getAttribute('data-rotation')==='paused');
   record(engine,'Focused gallery keeps the same photograph through a rotation interval',await photos.locator('[data-hero-gallery]').getAttribute('data-slide')==='1');
   await nextPhoto.click();await photos.waitForFunction(()=>document.querySelector('[data-hero-gallery]').dataset.slide==='2');record(engine,'Next photograph changes the slide and stays paused',await photos.locator('[data-hero-gallery]').getAttribute('data-slide')==='2'&&await photos.locator('[data-hero-gallery]').getAttribute('data-rotation')==='paused');
   await photos.locator('[data-gallery-previous]').click();record(engine,'Previous photograph returns to the prior slide',await photos.locator('[data-hero-gallery]').getAttribute('data-slide')==='1');
   const photoTrigger=photos.locator('[data-hero-slide]:not([inert]) a');await photoTrigger.click();
   record(engine,'The active photograph retains its original evidence viewer',await photos.locator('.evidence-viewer').isVisible());
   await photos.keyboard.press('Escape');await photos.locator('.evidence-viewer').waitFor({state:'detached'});
   record(engine,'Closing a gallery photograph restores its focus',await photoTrigger.evaluate(el=>document.activeElement===el));
   await photos.locator('[data-gallery-rotation]').click();await photos.mouse.move(10,70);
   record(engine,'Play photos explicitly resumes rotation',await photos.locator('[data-hero-gallery]').getAttribute('data-rotation')==='playing');
   await photos.locator('[data-gallery-rotation]').click();record(engine,'Pause photos stops rotation without advancing',await photos.locator('[data-hero-gallery]').getAttribute('data-rotation')==='paused');
   await photos.evaluate(()=>{window.dispatchEvent(new PageTransitionEvent('pagehide',{persisted:true}));window.dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true}));});
   record(engine,'Cached-page restoration preserves the selected photograph and pause',await photos.locator('[data-hero-gallery]').getAttribute('data-rotation')==='paused'&&await photos.locator('[data-hero-gallery]').getAttribute('data-slide')==='1');
   await photosContext.close();
   const staticContext=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'}),staticPhotos=await staticContext.newPage();
   await staticPhotos.goto(base);await staticPhotos.locator('[data-hero-gallery][data-enhanced]').waitFor();
   record(engine,'Reduced motion keeps the phone gallery static and leaves film unloaded',await staticPhotos.locator('[data-hero-gallery]').getAttribute('data-rotation')==='paused'&&await staticPhotos.locator('.hero-film').evaluate(v=>v.paused&&!v.getAttribute('src')));
   await staticPhotos.locator('[data-gallery-next]').click();await staticPhotos.waitForFunction(()=>document.querySelector('[data-hero-gallery]').dataset.slide==='1');
   record(engine,'Phone gallery remains manually usable without overflow',await staticPhotos.locator('[data-hero-gallery]').getAttribute('data-slide')==='1'&&await staticPhotos.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   await staticPhotos.locator('.hero-gallery-window').evaluate(element=>{
    for(const [type,x] of [['touchstart',240],['touchend',100]]){const event=new Event(type,{bubbles:true});Object.defineProperty(event,'changedTouches',{value:[{clientX:x,clientY:100}]});element.dispatchEvent(event);}
   });
   await staticPhotos.waitForFunction(()=>document.querySelector('[data-hero-gallery]').dataset.slide==='2');
   record(engine,'Horizontal phone swipe selects the next photograph',await staticPhotos.locator('[data-hero-gallery]').getAttribute('data-slide')==='2');
   await staticContext.close();
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
