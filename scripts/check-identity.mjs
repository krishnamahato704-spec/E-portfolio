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
  console.log('Checking headline reveal, background film and gallery in',engine);
  const browser=await {chromium,firefox,webkit}[engine].launch({headless:true});
  try{
   const ctx=await browser.newContext({viewport:{width:1440,height:1000}}),page=await ctx.newPage();
   const errors=[];page.on('pageerror',error=>errors.push(error.message));
   await page.addInitScript(()=>{
    const reveal=window.heroReveal={};
    const running=hero=>hero.getAnimations({subtree:true}).filter(animation=>animation.animationName==='hero-intro-reveal'&&(animation.playState==='running'||animation.pending));
    document.addEventListener('animationstart',event=>{
     if(event.animationName!=='hero-intro-reveal'||reveal.started)return;
     const hero=document.querySelector('.opening-hero'),heading=hero.querySelector('h1');
     reveal.started=true;
     reveal.readable=heading.checkVisibility({checkVisibilityCSS:true})&&Number(getComputedStyle(heading).opacity)>=.85;
     reveal.focusKept=document.activeElement===document.body&&!document.querySelector('main').inert;
     reveal.delays=running(hero).map(animation=>animation.effect.getTiming().delay);
     reveal.filmUnloaded=!hero.querySelector('.hero-film').getAttribute('src');
    });
    new MutationObserver(changes=>{
     if(changes.some(change=>change.target.matches('.hero-film')&&change.target.getAttribute('src'))&&reveal.startedWithFilm===undefined){
      reveal.startedWithFilm=running(document.querySelector('.opening-hero')).length>0;
     }
    }).observe(document,{subtree:true,attributes:true,attributeFilter:['src']});
   });
   await page.goto(base,{waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>window.heroReveal.started);
   const reveal=await page.evaluate(()=>window.heroReveal);
   record(engine,'Headline reveal uses staggered timing and keeps the name readable',reveal.readable&&new Set(reveal.delays).size>1);
   record(engine,'Automatic entry keeps keyboard focus and leaves main interactive',reveal.focusKept);
   record(engine,'Headline reveal starts with the background film unloaded',reveal.filmUnloaded);
   await page.waitForFunction(()=>{const film=document.querySelector('.hero-film');return !film.paused&&film.readyState>=2;});
   record(engine,'The single muted film starts in the hero after the headline reveal',await page.evaluate(()=>window.heroReveal.startedWithFilm===false&&document.querySelectorAll('video').length===1&&document.querySelector('.opening-hero>.hero-film')?.muted&&document.querySelectorAll('audio,.identity-intro').length===0));
   record(engine,'Home stays readable beside the photograph gallery and playing film',await page.locator('h1').isVisible()&&await page.locator('[data-hero-gallery]').isVisible());
   await page.screenshot({path:'outputs/redesign/opening-'+engine+'-settled.png'});
   await page.locator('[data-film-pause]').click();await page.waitForFunction(()=>document.querySelector('.hero-film').paused);
   record(engine,'The visitor can pause the background film',await page.locator('[data-film-close]').isVisible());
   await page.locator('[data-film-pause]').click();await page.waitForFunction(()=>!document.querySelector('.hero-film').paused);
   await page.locator('#home-contact-title').scrollIntoViewIfNeeded();await page.waitForFunction(()=>document.querySelector('.hero-film').paused);
   record(engine,'Film decoding pauses off screen',await page.locator('.hero-film').evaluate(v=>v.paused));
   await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.waitForFunction(()=>!document.querySelector('.hero-film').paused);
   await page.evaluate(()=>{
    let hidden=false;
    Object.defineProperty(document,'hidden',{configurable:true,get:()=>hidden});
    window.setTestTabHidden=value=>{hidden=value;document.dispatchEvent(new Event('visibilitychange'));};
    window.setTestTabHidden(true);
   });
   await page.waitForFunction(()=>document.querySelector('.hero-film').paused);
   record(engine,'A hidden tab pauses the film',await page.locator('.hero-film').evaluate(v=>v.paused));
   await page.evaluate(()=>window.setTestTabHidden(false));await page.waitForFunction(()=>!document.querySelector('.hero-film').paused);
   await page.locator('[data-film-pause]').click();
   await page.locator('#home-contact-title').scrollIntoViewIfNeeded();await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.waitForTimeout(150);
   record(engine,'Returning to the hero preserves a visitor pause',await page.locator('.hero-film').evaluate(v=>v.paused));
   await page.locator('[data-film-close]').click();
   record(engine,'Hiding the background leaves the gallery visible and restores control focus',await page.locator('[data-hero-gallery]').isVisible()&&!await page.locator('.hero-film').isVisible()&&await page.locator('.hero-film').evaluate(v=>v.paused)&&await page.locator('[data-film-pause]').evaluate(el=>document.activeElement===el));
   await page.evaluate(()=>{window.dispatchEvent(new PageTransitionEvent('pagehide',{persisted:true}));window.dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true}));});
   record(engine,'Cached-page restoration preserves the hidden film',!await page.locator('.hero-film').isVisible()&&await page.locator('.hero-film').evaluate(v=>v.paused));
   await page.goto(base+'resources/');record(engine,'Inner pages have no opening media',await page.locator('video,audio,.hero-intro-line').count()===0);
   await page.locator('.site-header .brand').click();await page.waitForURL(base);
   record(engine,'Internal Home links keep the page ready to read',await page.locator('h1').isVisible());
   record(engine,'No browser exceptions',errors.length===0,errors);await ctx.close();
   const firstPhone=await browser.newContext({viewport:{width:320,height:844}}),phone=await firstPhone.newPage();
   await phone.goto(base,{waitUntil:'domcontentloaded'});
   record(engine,'The narrow phone heading and shortcuts are visible without overflow',await phone.locator('h1').isVisible()&&await phone.locator('.mobile-shortcuts').isVisible()&&await phone.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   await phone.screenshot({path:'outputs/redesign/opening-'+engine+'-phone.png'});
   await phone.locator('.skip-link').focus();await phone.keyboard.press('Enter');
   record(engine,'The page skip link moves focus to main',await phone.evaluate(()=>document.activeElement.id==='main'));
   await firstPhone.close();
   for(const mode of ['reduced','fragment','no-js','media-failure','autoplay-blocked','app-failure']){
    const context=await browser.newContext({reducedMotion:mode==='reduced'?'reduce':'no-preference',javaScriptEnabled:mode!=='no-js'}),p=await context.newPage();
    if(mode==='media-failure')await p.addInitScript(()=>{
     const src=Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype,'src');
     Object.defineProperty(HTMLMediaElement.prototype,'src',{...src,set(value){src.set.call(this,this instanceof HTMLVideoElement?value+'.unavailable':value);}});
    });
    if(mode==='autoplay-blocked')await p.addInitScript(()=>{HTMLMediaElement.prototype.play=function(){return Promise.reject(new DOMException('Blocked','NotAllowedError'));};});
    if(mode==='app-failure')await p.route('**/src/app.js*',r=>r.abort());
    await p.goto(base+(mode==='fragment'?'#teaching-evidence':''),{waitUntil:'domcontentloaded'});
    if(mode==='media-failure')await p.locator('[data-film-failed=true]').waitFor({state:'attached'});
    if(mode==='reduced'||mode==='fragment')await p.locator('[data-film-controls]:not([inert])').waitFor({state:'attached'});
    record(engine,mode+' leaves the heading visible without a gate',await p.locator('h1').isVisible());
    if(mode==='reduced'||mode==='fragment')record(engine,mode+' skips the headline animation and automatic film',await p.evaluate(()=>!document.querySelector('.opening-hero').getAnimations({subtree:true}).some(animation=>animation.animationName==='hero-intro-reveal')&&!document.querySelector('.hero-film').getAttribute('src')));
    await context.close();
   }
   const dataSaver=await browser.newContext(),saving=await dataSaver.newPage();
   await saving.addInitScript(()=>Object.defineProperty(navigator,'connection',{value:{saveData:true,effectiveType:'4g'},configurable:true}));
   await saving.goto(base);await saving.locator('[data-hero-gallery][data-enhanced]').waitFor();
   record(engine,'Data saving mode leaves the film unloaded and keeps photos static',await saving.locator('h1').isVisible()&&await saving.locator('.hero-film').evaluate(video=>!video.getAttribute('src'))&&await saving.locator('[data-hero-gallery]').getAttribute('data-rotation')==='paused');
   await dataSaver.close();
   const photosContext=await browser.newContext({viewport:{width:1440,height:1000}}),photos=await photosContext.newPage();
   await photos.goto(base);await photos.locator('[data-hero-gallery][data-enhanced]').waitFor();
   record(engine,'Home gallery uses five current photographs with one focusable slide',await photos.locator('[data-hero-slide]').count()===5&&await photos.locator('[data-hero-slide]:not([inert]) a').count()===1);
   await photos.locator('[data-hero-gallery]').scrollIntoViewIfNeeded();
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
console.log(`${results.filter(r=>r.pass).length}/${results.length} headline reveal, background film and gallery checks passed.`);
if(results.some(r=>!r.pass))process.exitCode=1;
