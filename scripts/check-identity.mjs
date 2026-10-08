import {chromium,firefox,webkit} from 'playwright';
import {spawn} from 'node:child_process';
import fs from 'node:fs/promises';
const port=4175,base=`http://127.0.0.1:${port}/`;
const server=spawn(process.execPath,['scripts/serve.mjs'],{env:{...process.env,PORT:String(port)},windowsHide:true,stdio:'ignore'});
const results=[];
const record=(engine,name,pass,details)=>{results.push({engine,name,pass:!!pass,...(details?{details}:{})});if(!pass)console.error('FAIL',engine,name,details||'');};
try{
 for(let i=0;i<80;i++){try{if((await fetch(base)).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
 for(const engine of (process.env.IDENTITY_TEST_ENGINES||'chromium').split(',')){
  console.log('Checking film introduction and gallery in',engine);
  const browser=await {chromium,firefox,webkit}[engine].launch({headless:true});
  try{
   const firstPaint=await browser.newContext({viewport:{width:1440,height:1000}}),first=await firstPaint.newPage();
   await first.route('**/src/app.js*',async route=>{await new Promise(r=>setTimeout(r,900));await route.continue();});
   const initialLoad=first.goto(base,{waitUntil:'domcontentloaded'});
   await first.locator('html.opening-pending .hero-film').waitFor({state:'attached'});
   await first.waitForFunction(()=>getComputedStyle(document.querySelector('.hero-film')).position==='fixed');
   record(engine,'Before the app loads, the first screen is the full-screen film poster and Home is hidden',await first.evaluate(()=>{
    const film=document.querySelector('.hero-film'),rect=film.getBoundingClientRect();
    return rect.width>=innerWidth&&rect.height>=innerHeight&&!document.querySelector('h1').checkVisibility({checkVisibilityCSS:true})&&!document.querySelector('.site-header').checkVisibility({checkVisibilityCSS:true});
   }));
   await initialLoad;
   await first.locator('[data-intro-enter]').click();
   try{await first.locator('.intro-running').waitFor();}
   catch(error){
    console.error('First-paint opening state',engine,await first.evaluate(()=>({
     ready:document.readyState,hidden:document.hidden,pending:document.documentElement.classList.contains('opening-pending'),
     intro:document.querySelector('.identity-intro')?.className,filmState:document.querySelector('.hero-film')?.readyState,
     filmError:document.querySelector('.hero-film')?.error?.code,status:document.querySelector('.film-status')?.textContent
    })));
    throw error;
   }
   record(engine,'Loaded video takes over the first-screen cover before Home is revealed',await first.evaluate(()=>getComputedStyle(document.querySelector('.identity-intro'),'::before').opacity==='1'&&document.querySelector('.hero-film').getBoundingClientRect().width>=innerWidth));
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
   // Native media can hold WebKit's load event beyond a finite introduction.
   // Observe the running sequence as soon as the document and module are ready.
   await page.goto(base,{waitUntil:'domcontentloaded'});
   await page.locator('[data-intro-enter]').waitFor();
   record(engine,'Default entry requests sound before the film and voice start',await page.locator('.hero-film').evaluate(v=>v.paused)&&await page.locator('#opening-audio').evaluate(a=>a.paused)&&await page.locator('[data-intro-enter]').textContent()==='Enter with sound');
   await page.locator('[data-intro-enter]').click();
   try{await page.locator('.intro-running').waitFor();}
   catch(error){
    console.error('Opening state when the sequence was not observed',engine,await page.evaluate(()=>({
     ready:document.readyState,hidden:document.hidden,scroll:scrollY,pending:document.documentElement.classList.contains('opening-pending'),
     intro:document.querySelector('.identity-intro')?.className,filmState:document.querySelector('.hero-film')?.readyState,
     filmError:document.querySelector('.hero-film')?.error?.code,status:document.querySelector('.film-status')?.textContent
    })));
    throw error;
   }
   record(engine,'First visit has one finite film introduction',await page.locator('.identity-intro').count()===1);
   await page.waitForFunction(()=>!document.querySelector('#opening-audio').paused);
   record(engine,'Entry starts the film and supplied voice track together',await page.locator('.hero-film').evaluate(v=>v.muted&&!v.paused)&&await page.locator('#opening-audio').evaluate(a=>!a.paused&&a.volume>0&&a.volume<=.85));
   record(engine,'Full-screen opening uses one visible film and preserves the underlying page',await page.evaluate(()=>document.querySelectorAll('video').length===1&&document.querySelector('.identity-intro .hero-film').getBoundingClientRect().width>=innerWidth*.95&&!document.querySelector('main').inert&&getComputedStyle(document.querySelector('.hero-film')).opacity==='1'));
   await page.waitForTimeout(2800);
   record(engine,'Name and greeting appear after the initial video',await page.evaluate(()=>getComputedStyle(document.querySelector('.intro-name-card')).opacity==='1'&&document.querySelector('.intro-name').textContent===document.querySelector('h1').textContent&&document.querySelector('.intro-greeting').textContent==='Hi, my name is'));
   await page.waitForTimeout(3500);
   record(engine,'Film fades to the homepage during the final transition',await page.locator('.hero-film').evaluate(v=>parseFloat(getComputedStyle(v).opacity)<1));
   await page.locator('.identity-intro').waitFor({state:'detached',timeout:10000});
   const elapsed=await page.evaluate(()=>introSequenceTiming.finished-introSequenceTiming.started);
   record(engine,'Introduction settles after eight seconds',elapsed>=7900&&elapsed<10000,{elapsedMs:Math.round(elapsed)});
   record(engine,'Final homepage is readable and voice stops',await page.locator('h1').isVisible()&&await page.locator('#opening-audio').evaluate(a=>a.paused));
   record(engine,'Background film settles at a softer opacity',await page.locator('.hero-film').evaluate(v=>getComputedStyle(v).opacity==='0.8'));
   record(engine,'Background film continues playing after the opening settles',await page.locator('.hero-film').evaluate(v=>!v.paused&&v.loop));
   await page.locator('#home-contact-title').scrollIntoViewIfNeeded();
   await page.waitForFunction(()=>document.querySelector('.hero-film').paused);
   record(engine,'Film decoding pauses when the hero is off screen',await page.locator('.hero-film').evaluate(v=>v.paused));
   await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.waitForFunction(()=>!document.querySelector('.hero-film').paused);
   await page.locator('[data-film-pause]').click();
   await page.locator('#home-contact-title').scrollIntoViewIfNeeded();await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.waitForFunction(()=>scrollY===0);await page.waitForTimeout(150);
   record(engine,'Returning to the hero preserves an intentional film pause',await page.locator('.hero-film').evaluate(v=>v.paused));
   await page.reload({waitUntil:'domcontentloaded'});
   try{await page.locator('.intro-skip').waitFor();}
   catch(error){console.error('Reload opening state',engine,await page.evaluate(()=>({scroll:scrollY,hidden:document.hidden,pending:window.portfolioOpeningBoot?.pending,focus:document.activeElement?.outerHTML.slice(0,250),intro:document.querySelector('.identity-intro')?.className,status:document.querySelector('.film-status')?.textContent,navigation:performance.getEntriesByType('navigation')[0]?.type})));throw error;}
   record(engine,'Refreshing Home opens with the film even in an existing session',await page.locator('.identity-intro').count()===1);
   await page.locator('.intro-skip').click();
   await page.goto(base+'?intro=1');await page.locator('.intro-skip').waitFor();
   record(engine,'Preview link replays the opening in an existing session',await page.locator('.identity-intro').count()===1);
   await page.locator('.intro-skip').click();
   await page.locator('[data-film-replay]').click();await page.waitForFunction(()=>!document.querySelector('#opening-audio').paused);
   await page.locator('.intro-sound').click();
   record(engine,'Visitor can mute voice and piano while the opening continues',await page.locator('#opening-audio').evaluate(a=>a.paused)&&await page.locator('.identity-intro').count()===1&&await page.locator('[data-film-sound]').getAttribute('aria-pressed')==='false');
   await page.locator('.intro-skip').click();
   await page.locator('[data-film-replay]').click();await page.locator('.intro-skip').waitFor();
   await page.locator('.intro-skip').focus();await page.keyboard.press('Enter');
   record(engine,'Keyboard skip restores main focus',await page.evaluate(()=>document.activeElement.id==='main'));
   await page.goto(base+'resources/');record(engine,'Inner pages have no film or voice',await page.locator('video,audio,.identity-intro').count()===0);
   await page.locator('.site-header .brand').click();await page.waitForURL(base);
   record(engine,'Following an internal Home link keeps the page ready to read',await page.locator('.identity-intro').count()===0);
   record(engine,'No browser exceptions',errors.length===0,errors);
   await ctx.close();
   const firstPhone=await browser.newContext({viewport:{width:320,height:844}}),phone=await firstPhone.newPage();
   await phone.goto(base);await phone.locator('.intro-skip').waitFor();
   const phoneFrame=await phone.locator('.identity-intro .hero-film').evaluate(v=>({height:v.getBoundingClientRect().height,width:v.getBoundingClientRect().width,viewportHeight:innerHeight,viewportWidth:innerWidth}));
   record(engine,'Phone introduction poster fills the screen',phoneFrame.height>=phoneFrame.viewportHeight-1&&phoneFrame.width>=phoneFrame.viewportWidth-1,phoneFrame);
   record(engine,'Narrow phone opening keeps entry and skip controls inside the screen',await phone.evaluate(()=>[...document.querySelectorAll('.intro-controls button:not([hidden]),[data-intro-enter]')].every(el=>{const r=el.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.height>=44;})&&document.documentElement.scrollWidth<=innerWidth+1));
   record(engine,'Phone education dates, notes and status labels are at least 14px',await phone.evaluate(()=>[...document.querySelectorAll('.education-period,.education-note,.education-card .status,.school-stage .stage-period')].every(el=>parseFloat(getComputedStyle(el).fontSize)>=14)));
   await firstPhone.close();
   for(const action of ['escape','scroll','preference','resize']){
    const context=await browser.newContext({viewport:{width:390,height:844}}),p=await context.newPage();
    await p.goto(base);await p.locator('.intro-skip').waitFor();
    if(action==='escape')await p.keyboard.press('Escape');
    if(action==='scroll')await p.mouse.wheel(0,400);
    if(action==='preference')await p.emulateMedia({reducedMotion:'reduce'});
    if(action==='resize')await p.setViewportSize({width:430,height:844});
    await p.locator('.identity-intro').waitFor({state:'detached',timeout:1000});
    record(engine,`${action} dismisses the introduction`,await p.locator('.identity-intro').count()===0);
    record(engine,`${action} leaves a usable mobile page`,await p.evaluate(()=>!document.querySelector('main').inert&&document.documentElement.scrollWidth<=innerWidth+1));
    if(action==='preference')record(engine,'Reduced motion pauses the film',await p.locator('.hero-film').evaluate(v=>v.paused));
    await context.close();
   }
   const delayed=await browser.newContext(),reading=await delayed.newPage();
   await reading.addInitScript(()=>{
    const play=HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play=function(){return this instanceof HTMLVideoElement?new Promise(resolve=>setTimeout(resolve,700)).then(()=>play.call(this)):play.call(this);};
   });
   await reading.goto(base);await reading.locator('[data-intro-enter]').click();await reading.evaluate(()=>scrollTo(0,400));await reading.waitForTimeout(1200);
   record(engine,'A late-loading film does not interrupt a visitor who has started reading',await reading.locator('.identity-intro').count()===0&&await reading.evaluate(()=>scrollY>24));
   await delayed.close();
   const cancelled=await browser.newContext(),cancelPage=await cancelled.newPage();
   await cancelPage.addInitScript(()=>{const play=HTMLMediaElement.prototype.play;HTMLMediaElement.prototype.play=function(){return this instanceof HTMLAudioElement?new Promise((resolve,reject)=>{window.rejectPendingVoice=()=>reject(new DOMException('Interrupted','AbortError'));}):play.call(this);};});
   await cancelPage.goto(base);await cancelPage.locator('[data-intro-enter]').click();await cancelPage.locator('.intro-skip').click();await cancelPage.evaluate(()=>window.rejectPendingVoice());await cancelPage.waitForTimeout(50);
   record(engine,'A cancelled voice request does not report an error after Skip',await cancelPage.locator('.identity-intro').count()===0&&!(await cancelPage.locator('.film-status').textContent()));
   await cancelled.close();
   for(const mode of ['reduced','blocked-storage','no-js','media-failure','autoplay-blocked','app-failure']){
    const context=await browser.newContext({reducedMotion:mode==='reduced'?'reduce':'no-preference',javaScriptEnabled:mode!=='no-js'}),p=await context.newPage();
    if(mode==='blocked-storage')await p.addInitScript(()=>Object.defineProperty(window,'sessionStorage',{get(){throw new DOMException('Unavailable','SecurityError');}}));
    if(mode==='media-failure')await p.addInitScript(()=>{
     // WebKit's native media requests can bypass Playwright route interception.
     // Send the video to a real missing URL so both engines exercise the error.
     const src=Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype,'src');
     Object.defineProperty(HTMLMediaElement.prototype,'src',{...src,set(value){src.set.call(this,this instanceof HTMLVideoElement?value+'.unavailable':value);}});
    });
    if(mode==='autoplay-blocked')await p.addInitScript(()=>{HTMLMediaElement.prototype.play=function(){return Promise.reject(new DOMException('Blocked','NotAllowedError'));};});
    if(mode==='app-failure')await p.route('**/src/app.js*',r=>r.abort());
    await p.goto(base+(mode==='reduced'?'?intro=1':''));await p.waitForTimeout(400);
    if(mode==='media-failure'||mode==='autoplay-blocked')await p.locator('[data-intro-enter]').click();
    if(mode==='blocked-storage'){
     record(engine,'Blocked storage still provides entry and skip controls',await p.locator('[data-intro-enter]').isVisible());
     await p.locator('.intro-skip').click();
    }
    if(mode==='media-failure'||mode==='autoplay-blocked')await p.locator('.identity-intro').waitFor({state:'detached',timeout:6000});
    if(mode==='app-failure')await p.waitForFunction(()=>!document.documentElement.classList.contains('opening-pending'),null,{timeout:5000});
    record(engine,`${mode} immediately shows readable content`,await p.locator('.identity-intro').count()===0&&await p.locator('h1').isVisible());
    await context.close();
   }
   const gallery=await browser.newContext({reducedMotion:'reduce'}),g=await gallery.newPage();
   await g.goto(base+'gallery/');await g.locator('[data-gallery-filter="TLM"]').click();
   record(engine,'Gallery filter updates count and hidden rows',await g.locator('.gallery-card:not([hidden])').count()>0&&await g.locator('.gallery-card[hidden]').count()>0);
   const trigger=g.locator('.gallery-card:not([hidden]) a[data-viewer]').first();await trigger.click();
   record(engine,'Visible gallery image opens in a labelled dialog',await g.locator('.evidence-viewer').isVisible());
   await g.keyboard.press('Escape');await g.locator('.evidence-viewer').waitFor({state:'detached'});
   record(engine,'Gallery Escape restores trigger focus',await trigger.evaluate(el=>document.activeElement===el));
   await gallery.close();
   const soundContext=await browser.newContext({reducedMotion:'reduce'}),soundPage=await soundContext.newPage();
   await soundPage.addInitScript(()=>{
    window.portfolioAudioContexts=[];
    const Native=window.AudioContext||window.webkitAudioContext;
    if(Native)window.AudioContext=new Proxy(Native,{construct(Target,args){
     const ctx=new Target(...args);window.portfolioAudioContexts.push(ctx);
     const createGain=ctx.createGain.bind(ctx);
     ctx.createGain=()=>{const gain=createGain(),connect=gain.connect.bind(gain);gain.connect=(destination,...rest)=>{if(destination===ctx.destination){window.portfolioSoundAnalyser=ctx.createAnalyser();connect(window.portfolioSoundAnalyser);}return connect(destination,...rest);};return gain;};
     const createOscillator=ctx.createOscillator.bind(ctx);
     ctx.createOscillator=()=>{const node=createOscillator(),start=node.start.bind(node);node.start=(...args)=>{try{const records=JSON.parse(sessionStorage.getItem('audit-sound-notes')||'[]');records.push(node.frequency.value);sessionStorage.setItem('audit-sound-notes',JSON.stringify(records));}catch{}return start(...args);};return node;};
     return ctx;
    }});
   });
   await soundPage.goto(base+'profile/');
   record(engine,'No audio context or music download before a visitor enables sound',await soundPage.evaluate(()=>portfolioAudioContexts.length===0&&performance.getEntriesByType('resource').every(r=>!r.name.includes('.mp3'))));
   const hasWebAudio=await soundPage.evaluate(()=>!!(window.AudioContext||window.webkitAudioContext));
   if(!hasWebAudio){
    if(engine!=='webkit'||process.platform!=='win32')throw Error('Web Audio is required in the supported CI browsers');
    await soundPage.locator('[data-sound-toggle]').click();
    record(engine,'Windows WebKit without Web Audio keeps the page readable and reports unsupported sound',await soundPage.locator('h1').isVisible()&&await soundPage.locator('.portfolio-sound [role=status]').textContent()==='Sound is unavailable. The portfolio remains ready to read.');
    await soundContext.close();continue;
   }
   await soundPage.locator('[data-sound-toggle]').click();
   try{await soundPage.waitForFunction(()=>document.querySelector('.portfolio-sound').dataset.sound==='on');}
   catch(error){console.error('Audio activation state',engine,await soundPage.evaluate(()=>({contexts:portfolioAudioContexts.map(c=>({state:c.state,currentTime:c.currentTime,sampleRate:c.sampleRate})),status:document.querySelector('.portfolio-sound [role=status]').textContent,hidden:document.hidden,api:typeof AudioContext})));throw error;}
   record(engine,'Quiet ambience uses one running audio context',await soundPage.evaluate(()=>portfolioAudioContexts.length===1&&portfolioAudioContexts[0].state==='running'&&document.querySelector('[data-sound-volume]').value==='20'));
   await soundPage.waitForTimeout(600);
   const amplitude=await soundPage.evaluate(()=>{const samples=new Float32Array(portfolioSoundAnalyser.fftSize);portfolioSoundAnalyser.getFloatTimeDomainData(samples);return Math.sqrt(samples.reduce((sum,value)=>sum+value*value,0)/samples.length);});
   record(engine,'Ambient output is audible at a low level',amplitude>0&&amplitude<.05,{rmsAmplitude:amplitude});
   await soundPage.locator('.portfolio-sound summary').click();
   await soundPage.locator('[data-sound-volume]').focus();await soundPage.keyboard.press('ArrowRight');
   record(engine,'Keyboard volume adjustment updates the visible value',await soundPage.locator('.portfolio-sound output').textContent()==='21%');
   await soundPage.locator('[data-sound-toggle]').click();
   await soundPage.waitForFunction(()=>portfolioAudioContexts[0].state==='suspended');
   record(engine,'Mute suspends the audio engine',await soundPage.locator('[data-sound-toggle]').getAttribute('aria-pressed')==='false');
   await soundPage.locator('.site-header .brand').click();
   await soundPage.waitForURL(base);await soundPage.locator('.portfolio-sound').waitFor({state:'visible'});
   record(engine,'Mute and volume preferences survive navigation',await soundPage.evaluate(()=>document.querySelector('[data-sound-volume]').value==='21'&&document.querySelector('[data-sound-toggle]').getAttribute('aria-pressed')==='false'));
   if(await soundPage.locator('.intro-skip').count())await soundPage.locator('.intro-skip').click();
   await soundPage.locator('[data-sound-toggle]').click();await soundPage.waitForFunction(()=>portfolioAudioContexts[0]?.state==='running');
   const cues=await soundPage.evaluate(async()=>{const sound=await import(new URL(document.querySelector('script[type=module][src]').src).href.replace(/app\.js/, 'sound.js'));return Object.values(sound.routeCues).map(notes=>notes.join(','));});
   record(engine,'Every portfolio page has a distinct navigation cue',new Set(cues).size===cues.length&&cues.length===11);
   await soundPage.locator('.site-footer a[href$="resources/"]').click();
   record(engine,'Normal navigation reaches the destination without a sound delay',soundPage.url()===base+'resources/');
   await soundPage.locator('.portfolio-sound').waitFor({state:'visible'});
   if(await soundPage.locator('[data-sound-toggle]').getAttribute('aria-pressed')!=='true')await soundPage.locator('[data-sound-toggle]').click();
   await soundPage.waitForFunction(()=>portfolioAudioContexts[0]?.state==='running');
   record(engine,'Changing to Evidence starts its own two-note cue',await soundPage.evaluate(()=>{const notes=JSON.parse(sessionStorage.getItem('audit-sound-notes')||'[]');return notes.some(f=>Math.abs(f-349.23)<.01)&&notes.some(f=>Math.abs(f-523.25)<.01);}));
   await soundPage.evaluate(()=>{sessionStorage.setItem('portfolio-sound',JSON.stringify({enabled:false,volume:.13}));window.dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true}));});
   await soundPage.waitForFunction(()=>portfolioAudioContexts[0].state==='suspended');
   record(engine,'A restored history page respects mute and volume changed on another page',await soundPage.locator('[data-sound-toggle]').getAttribute('aria-pressed')==='false'&&await soundPage.locator('[data-sound-volume]').inputValue()==='13');
   await soundPage.locator('[data-sound-toggle]').click();await soundPage.waitForFunction(()=>portfolioAudioContexts[0].state==='running');
   await soundPage.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});
   await soundPage.waitForFunction(()=>portfolioAudioContexts[0].state==='suspended');
   record(engine,'A hidden browser tab suspends ambience',await soundPage.locator('[data-sound-toggle]').getAttribute('aria-pressed')==='false');
   await soundContext.close();
  }finally{await browser.close();}
 }
}finally{server.kill();await fs.mkdir('outputs/redesign',{recursive:true});await fs.writeFile('outputs/redesign/identity-results.json',JSON.stringify({checks:results.length,failed:results.filter(r=>!r.pass).length,results},null,2));}
console.log(`${results.filter(r=>r.pass).length}/${results.length} film introduction and gallery checks passed.`);
if(results.some(r=>!r.pass))process.exitCode=1;
