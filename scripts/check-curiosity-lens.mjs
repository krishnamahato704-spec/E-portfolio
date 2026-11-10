import {chromium,webkit} from 'playwright';
import {spawn} from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';

const output='outputs/signature-motion';await fs.mkdir(output,{recursive:true});
const server=spawn(process.execPath,['scripts/serve.mjs','--dist'],{env:{...process.env,PORT:'4196'},windowsHide:true,stdio:'ignore'});
const base='http://127.0.0.1:4196/E-portfolio/';
const results=[];
const check=(engine,name,pass,details)=>{results.push({engine,name,pass:!!pass,...(details===undefined?{}:{details})});if(!pass)console.error(engine,name,details??'');};
const exposed=page=>page.waitForFunction(()=>{const l=document.querySelector('[data-atlas-lens]');return l&&!l.hidden&&Number(getComputedStyle(l).opacity)>.5;});
const point=page=>page.locator('[data-atlas-lens]').evaluate(el=>{const m=new DOMMatrixReadOnly(getComputedStyle(el).transform);return {x:m.m41,y:m.m42};});
const photoDetails=page=>page.locator('[data-atlas-lens]').evaluate(lens=>{
 const records=[...document.querySelectorAll('[data-hero-slide] img.plate-image')];
 const index=Number(lens.dataset.photoIndex),source=records[index],image=lens.querySelector('img');
 const url=source&&(source.currentSrc||source.getAttribute('src')||source.dataset.src);
 return {index,source:image.src,caption:lens.querySelector('.atlas-lens-caption span:last-child').textContent,
  matches:!!source&&image.src===new URL(url,location.href).href&&lens.querySelector('.atlas-lens-caption span:last-child').textContent===source.closest('figure').querySelector('figcaption strong').textContent.trim()};
});
const photoChanged=(page,before)=>page.waitForFunction(before=>{
 const lens=document.querySelector('[data-atlas-lens]'),image=lens?.querySelector('img');
 return lens&&!lens.hidden&&Number(lens.dataset.photoIndex)!==before&&image.complete&&image.naturalWidth>0&&Number(image.style.opacity)>.95;
},before,{timeout:7000});
const treatment=page=>page.locator('.atlas-lens-window').evaluate(el=>{
 const scrim=getComputedStyle(el,'::after').backgroundColor;
 const rgba=scrim.match(/[\d.]+/g).map(Number),alpha=rgba[3]??1;
 const text=getComputedStyle(document.querySelector('.atlas-title')).color.match(/[\d.]+/g).slice(0,3).map(Number);
 const luminance=rgb=>rgb.map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
 const foreground=luminance(text),worstPhoto=foreground>.4?255:0;
 const background=luminance(rgba.slice(0,3).map(v=>v*alpha+worstPhoto*(1-alpha)));
 return {scrim,contrast:(Math.max(foreground,background)+.05)/(Math.min(foreground,background)+.05)};
});
try{
 for(let i=0;i<80;i++){try{if((await fetch(base)).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
 for(const [engine,type] of Object.entries({chromium,webkit})){
  const browser=await type.launch({headless:true});
  try{
   const context=await browser.newContext({viewport:{width:1440,height:1000},...(engine==='chromium'?{recordVideo:{dir:path.join(output,'recordings'),size:{width:1440,height:1000}}}:{})});
   const page=await context.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));
   await page.goto(base+'?intro=replay');await page.waitForFunction(()=>document.querySelector('.opening-hero')?.dataset.openingState==='completed');await exposed(page);
   check(engine,'A brief desktop demonstration reveals the actual gallery photograph',await page.locator('[data-atlas-lens] img').evaluate(el=>el.naturalWidth>0&&el.src===document.querySelector('[data-hero-slide] img.plate-image').src));
   check(engine,'The decorative lens stays outside the text and ignores input',await page.locator('[data-atlas-lens]').evaluate(el=>el.getAttribute('aria-hidden')==='true'&&el.inert&&getComputedStyle(el).pointerEvents==='none'&&!el.closest('.hero-copy')));
   if(engine==='chromium')await page.screenshot({path:path.join(output,'home-demo.png')});
   await page.mouse.move(400,330);await page.waitForTimeout(400);const before=await point(page);
   // Capture the first actual movement inside the browser. Host-side PNG work
   // can delay a later sample until the lens has already finished easing.
   await page.evaluate(()=>{
    const lens=document.querySelector('[data-atlas-lens]');
    const read=()=>{const m=new DOMMatrixReadOnly(getComputedStyle(lens).transform);return {x:m.m41,y:m.m42};};
    const initial=read();
    window.__lensFirstMovement=new Promise(resolve=>{
     const observer=new MutationObserver(()=>{const value=read();if(value.x>initial.x+5){observer.disconnect();resolve(value);}});
     observer.observe(lens,{attributes:true,attributeFilter:['style']});
    });
   });
   // The new lesson preview is a real link on the right. Follow the open field
   // between copy and preview so this assertion measures movement, not the
   // intentional hide-on-controls behavior tested immediately below.
   await page.mouse.move(900,350);const drifting=await page.evaluate(()=>window.__lensFirstMovement);
   await page.waitForTimeout(850);const settled=await point(page);
   check(engine,'The photo lens follows with visible inertia',drifting.x>before.x+5&&settled.x>drifting.x+20,{before,drifting,settled});
   if(engine==='chromium')await page.screenshot({path:path.join(output,'home-pointer-lens.png')});
   const deferredBefore=await page.locator('[data-hero-slide] img').evaluateAll(images=>images.map(img=>({src:img.getAttribute('src'),deferred:img.dataset.src})));
   const variations=[await photoDetails(page)];
   for(let index=0;index<3;index++){
    await page.waitForTimeout(1000);
    const previous=variations.at(-1).index;
    await page.mouse.move(index%2?900:400,index%2?350:330);
    await photoChanged(page,previous);variations.push(await photoDetails(page));
    if(engine==='chromium')await page.screenshot({path:path.join(output,`lens-photo-${index+1}.png`)});
   }
   check(engine,'Deliberate travel reveals distinct approved photographs with their own captions',new Set(variations.map(photo=>photo.index)).size===variations.length&&variations.every(photo=>photo.matches),variations);
   const deferredAfter=await page.locator('[data-hero-slide] img').evaluateAll(images=>images.map(img=>({src:img.getAttribute('src'),deferred:img.dataset.src})));
   check(engine,'Lens variation preserves the deferred carousel and its selected slide',JSON.stringify(deferredBefore)===JSON.stringify(deferredAfter)&&await page.locator('[data-hero-gallery]').getAttribute('data-slide')==='0');
   const teacherTreatment=await treatment(page);
   const lessonPreview=page.locator('.hero-featured-image');await lessonPreview.hover();
   await page.waitForFunction(()=>document.querySelector('[data-atlas-lens]').hidden,null,{timeout:3000});
   check(engine,'The visible lesson preview stays clickable without a decorative lens covering it',await lessonPreview.evaluate(el=>{const r=el.getBoundingClientRect();return document.elementFromPoint(r.left+r.width/2,r.top+r.height/2)?.closest('a')===el;}));
   const primary=page.locator('.hero-copy>.actions a').first();await primary.hover();
   await page.waitForFunction(()=>document.querySelector('[data-atlas-lens]').hidden,null,{timeout:3000});
   check(engine,'The lens fades at real controls and leaves their hit targets clear',await page.locator('[data-atlas-lens]').evaluate(el=>el.hidden)&&await primary.evaluate(el=>{const r=el.getBoundingClientRect();return document.elementFromPoint(r.left+r.width/2,r.top+r.height/2)?.closest('a')===el;}));
   await page.locator('button[data-atlas-mode=student]').click();await page.mouse.move(900,330);await exposed(page);await page.waitForTimeout(850);
   const studentTreatment=await treatment(page);
   check(engine,'Student mode retains the lens and changes its readable image treatment',await page.locator('.opening-hero').getAttribute('data-atlas-mode')==='student'&&teacherTreatment.scrim!==studentTreatment.scrim&&teacherTreatment.contrast>=4.5&&studentTreatment.contrast>=4.5,{teacherTreatment,studentTreatment});
   if(engine==='chromium')await page.screenshot({path:path.join(output,'student-pointer-lens.png')});
   await page.locator('[data-atlas-pause]').click();
   check(engine,'Pause motion immediately stops the lens and ring',await page.locator('[data-atlas-lens]').evaluate(el=>el.hidden)&&await page.locator('[data-atlas-ripple]').evaluate(el=>el.hidden));
   await page.locator('[data-atlas-pause]').click();await page.mouse.move(1000,300);await exposed(page);await page.emulateMedia({reducedMotion:'reduce'});
   await page.waitForFunction(()=>document.querySelector('[data-atlas-lens]').hidden);
   check(engine,'Live reduced motion hides the photo effect immediately',await page.locator('[data-atlas-lens]').evaluate(el=>el.hidden));
   await page.evaluate(()=>{window.dispatchEvent(new PageTransitionEvent('pagehide',{persisted:true}));window.dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true}));});
   check(engine,'History restoration creates exactly one lens and ring',await page.locator('[data-atlas-lens]').count()===1&&await page.locator('[data-atlas-ripple]').count()===1);
   check(engine,'No exceptions during the main interaction',errors.length===0,errors);
   const video=page.video();await context.close();if(engine==='chromium')await video.saveAs(path.join(output,'opening-and-home.webm'));

   const mobile=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true}),phone=await mobile.newPage();
   await phone.goto(base+'?intro=replay');await phone.waitForFunction(()=>document.querySelector('.opening-hero')?.dataset.openingState==='completed');
   check(engine,'Touch screens leave the photo lens quiet until a tap',await phone.locator('[data-atlas-lens]').evaluate(el=>el.hidden));
   // Tap ordinary copy; the previous coordinate now falls on the mode switch.
   const tapArea=await phone.locator('.hero-statement').boundingBox();
   await phone.touchscreen.tap(tapArea.x+tapArea.width/2,tapArea.y+tapArea.height/2);await exposed(phone);
   check(engine,'A background tap gives a bounded photo and ripple response',await phone.locator('[data-atlas-ripple]').evaluate(el=>!el.hidden));
   if(engine==='chromium')await phone.screenshot({path:path.join(output,'phone-tap.png')});
   await phone.waitForTimeout(1900);
   check(engine,'The tap response settles without another tap',await phone.locator('[data-atlas-lens]').evaluate(el=>el.hidden)&&await phone.locator('[data-atlas-ripple]').evaluate(el=>el.hidden));
   const firstTap=await photoDetails(phone);
   await phone.touchscreen.tap(tapArea.x+tapArea.width/2,tapArea.y+tapArea.height/2);
   await photoChanged(phone,firstTap.index);
   const nextTap=await photoDetails(phone);
   check(engine,'A second qualified phone tap reveals a different photo and matching caption',firstTap.index!==nextTap.index&&firstTap.matches&&nextTap.matches,{firstTap,nextTap});
   await phone.waitForTimeout(1300);
   const touchUnblocked=await phone.evaluate(()=>{
    const stage=document.querySelector('.atlas-stage');
    for(const [type,y] of [['pointerdown',350],['pointermove',200],['pointerup',200]])stage.dispatchEvent(new PointerEvent(type,{bubbles:true,cancelable:true,pointerId:7,pointerType:'touch',clientX:190,clientY:y}));
    const event=new Event('touchmove',{bubbles:true,cancelable:true});const allowed=stage.dispatchEvent(event);scrollBy(0,300);return allowed&&!event.defaultPrevented;
   });await phone.waitForTimeout(150);
   check(engine,'A scrolling touch gesture is not captured or treated as a tap',touchUnblocked&&await phone.evaluate(()=>scrollY>0)&&await phone.locator('[data-atlas-ripple]').evaluate(el=>el.hidden));
   check(engine,'The phone scene has no horizontal overflow',await phone.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await mobile.close();

   // Delay or fail a deferred photo: the old image must remain usable, and a
   // stale completion must not overwrite the newer photo the visitor selected.
   for(const scenario of ['failed','late']){
    const ctx=await browser.newContext({viewport:{width:1440,height:1000}}),q=await ctx.newPage();
    await q.addInitScript(()=>sessionStorage.setItem('portfolio-atlas-opening-v2','seen'));
    let release,requested;
    const pendingRequest=new Promise(resolve=>{requested=resolve;});
    const gate=new Promise(resolve=>{release=resolve;});
    const deferred=deferredBefore[2].deferred||deferredBefore[2].src;
    await q.route(new URL(deferred,base).href,async route=>{requested();if(scenario==='failed')await route.abort();else{await gate;await route.continue();}});
    try{
     await q.goto(base);await exposed(q);await q.mouse.move(400,330);
     await q.waitForTimeout(1000);await q.mouse.move(900,350);await photoChanged(q,0);
     const beforePending=await photoDetails(q);
     await q.waitForTimeout(1000);await q.mouse.move(400,330);
     await Promise.race([pendingRequest,new Promise((_,reject)=>setTimeout(()=>reject(Error('Deferred photo request was not observed')),5000))]);
     await q.waitForTimeout(250);
     check(engine,`${scenario} photo loading keeps the current photo and caption visible`,(await photoDetails(q)).index===beforePending.index&&(await photoDetails(q)).matches);
     await q.waitForTimeout(1000);await q.mouse.move(900,350);await photoChanged(q,beforePending.index);
     const latest=await photoDetails(q);release();await q.waitForTimeout(700);
     const after=await photoDetails(q);
     check(engine,`${scenario} photo is skipped without replacing a newer matching photo`,latest.index===3&&after.index===latest.index&&after.matches,{latest,after});
    }finally{release();await ctx.close();}
   }
   for(const scenario of ['reduced','save-data','no-js']){
    const ctx=await browser.newContext({viewport:{width:390,height:844},reducedMotion:scenario==='reduced'?'reduce':'no-preference',javaScriptEnabled:scenario!=='no-js'});
    if(scenario==='save-data')await ctx.addInitScript(()=>Object.defineProperty(navigator,'connection',{value:{saveData:true,effectiveType:'4g'}}));
    const p=await ctx.newPage();await p.goto(base);await p.waitForTimeout(250);
    check(engine,`${scenario} leaves the home page readable without a lens image request`,await p.locator('h1').isVisible()&&(scenario==='no-js'?await p.locator('[data-atlas-lens]').count()===0:await p.locator('[data-atlas-lens] img').getAttribute('src')===null));await ctx.close();
   }
  }finally{await browser.close();}
 }
}finally{server.kill();await fs.writeFile(path.join(output,'checks.json'),JSON.stringify({checks:results.length,failed:results.filter(r=>!r.pass).length,results},null,2));}
console.log(`${results.filter(r=>r.pass).length}/${results.length} curiosity lens checks passed.`);
if(results.some(r=>!r.pass))process.exitCode=1;
