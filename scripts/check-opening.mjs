import {chromium,webkit} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import {spawn} from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';

const output='outputs/opening';await fs.mkdir(output,{recursive:true});
const server=spawn(process.execPath,['scripts/serve.mjs','--dist'],{env:{...process.env,PORT:'4193'},windowsHide:true,stdio:'ignore'});
const url='http://127.0.0.1:4193/E-portfolio/';
const results=[];
const check=(engine,name,pass,details)=>{results.push({engine,name,pass:!!pass,...(details===undefined?{}:{details})});if(!pass)console.error(engine,name,details??'');};
const active=page=>page.waitForFunction(()=>document.querySelector('.opening-hero')?.dataset.openingActive==='true');
const finished=page=>page.waitForFunction(()=>document.querySelector('.opening-hero')?.dataset.openingState==='completed');
const sameStyle=(a,b)=>Math.abs(Number(a.opacity)-Number(b.opacity))<.005&&a.transform.replace(/-?[\d.]+/g,'#')===b.transform.replace(/-?[\d.]+/g,'#')&&[...a.transform.matchAll(/-?[\d.]+/g)].every((n,i)=>Math.abs(Number(n[0])-Number([...b.transform.matchAll(/-?[\d.]+/g)][i][0]))<.05);
const inspectIris=page=>page.locator('[data-opening-iris]').evaluate(paper=>{
 const bounds=paper.getBoundingClientRect(),previous=paper.style.pointerEvents,shell=paper.parentElement,wasInert=shell.inert;
 // Temporarily allow hit testing of this decorative mask; no events are sent.
 shell.inert=false;
 paper.style.pointerEvents='auto';
 const covered=(x,y)=>document.elementFromPoint(bounds.left+x,bounds.top+y)===paper;
 const result={clip:getComputedStyle(paper).clipPath,centerOpen:!covered(bounds.width/2,bounds.height/2),cornersCovered:[[2,2],[bounds.width-2,2],[bounds.width-2,bounds.height-2],[2,bounds.height-2]].map(([x,y])=>covered(x,y))};
 paper.style.pointerEvents=previous;
 shell.inert=wasInert;
 return result;
});
const inspectLining=page=>page.locator('[data-opening-lining]').evaluate(lining=>{
 const paper=document.querySelector('[data-opening-iris]'),shell=lining.parentElement;
 const bounds=lining.getBoundingClientRect(),wasInert=shell.inert,previous=[lining.style.pointerEvents,paper.style.pointerEvents];
 const radius=element=>{
  const clip=getComputedStyle(element).clipPath;
  const firstInner=clip.slice(clip.indexOf(',')+1,-1).split(',')[5].trim().split(/\s+/).map(parseFloat);
  return firstInner[0]-bounds.width/2;
 };
 const liningRadius=radius(lining),paperRadius=radius(paper);
 shell.inert=false;lining.style.pointerEvents='auto';paper.style.pointerEvents='auto';
 const annulusIsLining=document.elementFromPoint(bounds.left+bounds.width/2+(liningRadius+paperRadius)/2,bounds.top+bounds.height/2)===lining;
 lining.style.pointerEvents=previous[0];paper.style.pointerEvents=previous[1];shell.inert=wasInert;
 const field=document.querySelector('[data-atlas-field]');
 return {liningRadius,paperRadius,annulusIsLining,differentPaperColor:getComputedStyle(lining).backgroundColor!==getComputedStyle(paper).backgroundColor,rings:shell.querySelectorAll('.opening-iris-ring').length,fieldFilter:getComputedStyle(field).filter};
});
const freezeOpeningAt=(page,time)=>page.locator('.opening-hero').evaluate((hero,time)=>{
 for(const animation of hero.getAnimations({subtree:true})){animation.pause();animation.currentTime=time;}
 return new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
},time);
try{
 for(let i=0;i<80;i++){try{if((await fetch(url)).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
 for(const [engine,type] of Object.entries({chromium,webkit})){
  const browser=await type.launch({headless:true});
  try{
   const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'no-preference',...(engine==='chromium'?{recordVideo:{dir:path.join(output,'recordings'),size:{width:1440,height:1000}}}:{})});
   const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto(url,{waitUntil:'domcontentloaded'});await active(page);
   // Snapshot short-lived entry state together, before PNG work can consume it.
   const initial=await page.evaluate(()=>{
    const overlay=document.querySelector('.portfolio-opening');
    return {count:document.querySelectorAll('.portfolio-opening').length,operable:!!overlay&&getComputedStyle(overlay).pointerEvents==='none'&&!document.querySelector('#main').inert&&!document.body.inert&&overlay.getAttribute('aria-hidden')==='true',name:overlay?.querySelector('.opening-identity')?.textContent||''};
   });
   check(engine,'A fresh visit automatically starts the original opening',initial.count===1);
   check(engine,'The visual overlay leaves the page and navigation operable',initial.operable);
   check(engine,'The actual name is revealed inside the opening',initial.name.includes('Krishna')&&initial.name.includes('Mahato'));
   await page.waitForTimeout(350);
   if(engine==='chromium')await page.screenshot({path:path.join(output,'name-reveal.png')});
   await page.waitForTimeout(950);
   await finished(page);
   check(engine,'The bounded sequence removes its overlay and exposes Replay',await page.locator('.portfolio-opening').count()===0&&await page.locator('[data-opening-lining],.opening-iris-ring').count()===0&&await page.locator('[data-opening-replay]').isVisible());
   check(engine,'Hero typography does not restart a second CSS entrance',await page.locator('.atlas-title-teacher').evaluate(el=>getComputedStyle(el).animationName==='none'));
   if(engine==='chromium')await page.screenshot({path:path.join(output,'finished-desktop.png')});
   await page.waitForTimeout(700);
   const video=page.video();await context.close();
   if(engine==='chromium')await video.saveAs(path.join(output,'premium-opening.webm'));
   check(engine,'No exceptions during the full sequence',errors.length===0,errors);

   // Geometric proof is deterministic and separate from the natural recording.
   // Screenshot/font work must not consume a short real-time sampling window.
   const proof=await browser.newContext({viewport:{width:1440,height:1000}}),aperture=await proof.newPage();
   await aperture.goto(url,{waitUntil:'domcontentloaded'});await active(aperture);
   await freezeOpeningAt(aperture,450);
   const irisStart=await inspectIris(aperture);
   check(engine,'Native iris clipping opens the center while retaining the paper corners',await aperture.locator('.portfolio-opening').getAttribute('data-opening-reveal')==='iris'&&irisStart.clip.startsWith('polygon(')&&irisStart.centerOpen&&irisStart.cornersCovered.every(Boolean),irisStart);
   await freezeOpeningAt(aperture,1550);
   const irisMiddle=await inspectIris(aperture);
   check(engine,'The circular aperture visibly progresses through native clipping',irisMiddle.clip!==irisStart.clip&&irisMiddle.clip.startsWith('polygon(')&&irisMiddle.centerOpen,{changed:irisMiddle.clip!==irisStart.clip,centerOpen:irisMiddle.centerOpen,clip:irisMiddle.clip.slice(0,120)});
   const liningMiddle=await inspectLining(aperture);
   check(engine,'A distinct lining and paired fine rings add depth to the expanding aperture',liningMiddle.paperRadius>liningMiddle.liningRadius&&liningMiddle.annulusIsLining&&liningMiddle.differentPaperColor&&liningMiddle.rings===2,liningMiddle);
   if(engine==='chromium'){
    await aperture.screenshot({path:path.join(output,'aperture-reveal.png')});
    // Retain the previous delivery helper's filename while adding the new frame.
    await fs.copyFile(path.join(output,'aperture-reveal.png'),path.join(output,'shutter-reveal.png'));
   }
   await freezeOpeningAt(aperture,2300);
   const irisEnd=await inspectIris(aperture);
   check(engine,'The final aperture clears the center and every viewport corner',irisEnd.centerOpen&&irisEnd.cornersCovered.every(value=>!value),irisEnd);
   const fieldEnd=await aperture.locator('[data-atlas-field]').evaluate(field=>({filter:getComputedStyle(field).filter,opacity:Number(getComputedStyle(field).opacity),transform:getComputedStyle(field).transform}));
   check(engine,'The field settles into focus without changing its geometry',/^(none|blur\(0px\))$/.test(fieldEnd.filter)&&fieldEnd.opacity>0&&fieldEnd.transform==='none',fieldEnd);
   await aperture.keyboard.press('Escape');await proof.close();

   const session=await browser.newContext({viewport:{width:1440,height:900}}),p=await session.newPage();
   await p.goto(url);await active(p);await p.keyboard.press('Escape');
   check(engine,'Escape exposes the full page immediately',await p.locator('.portfolio-opening').count()===0&&await p.locator('.opening-hero').getAttribute('data-opening-state')==='escaped');
   await p.reload();
   const repeated=await p.waitForFunction(()=>document.querySelector('.opening-hero')?.dataset.openingState==='playing'&&document.querySelector('.portfolio-opening'),null,{timeout:3500}).then(()=>true,()=>false);
   check(engine,'An ordinary repeat Home load in the same session starts its opening',repeated&&!new URL(p.url()).searchParams.has('intro'));
   if(repeated)await p.keyboard.press('Escape');
   await p.locator('[data-opening-replay]').click();await active(p);
   check(engine,'Explicit Replay starts the sequence with a keyboard exit',await p.locator('[data-opening-skip]').evaluate(el=>el===document.activeElement));
   await p.locator('[data-opening-skip]').click();
   check(engine,'Skip restores focus to the replay control',await p.locator('.portfolio-opening').count()===0&&await p.locator('[data-opening-replay]').evaluate(el=>el===document.activeElement));
   await p.locator('button[data-atlas-mode=student]').click();await p.waitForTimeout(850);
   const resting=await p.locator('.atlas-title-teacher').evaluate(el=>({opacity:getComputedStyle(el).opacity,transform:getComputedStyle(el).transform}));
   await p.locator('[data-opening-replay]').click();await active(p);
   await p.locator('.atlas-title-teacher').evaluate(async el=>{const animation=el.getAnimations().find(a=>a.effect.target===el&&a.effect.getTiming().duration===1000);if(animation)await animation.finished;});
   const endOfEntrance=await p.locator('.atlas-title-teacher').evaluate(el=>({opacity:getComputedStyle(el).opacity,transform:getComputedStyle(el).transform}));
   check(engine,'The Student title reaches its selected style before the overlay leaves',sameStyle(resting,endOfEntrance),{resting,endOfEntrance});
   await finished(p);
   const afterReplay=await p.locator('.atlas-title-teacher').evaluate(el=>({opacity:getComputedStyle(el).opacity,transform:getComputedStyle(el).transform}));
   check(engine,'Replay retains the selected Student composition',sameStyle(resting,afterReplay)&&await p.locator('.opening-hero').getAttribute('data-atlas-mode')==='student',{resting,afterReplay});
   await p.locator('[data-opening-replay]').click();await active(p);
   await p.mouse.wheel(0,400);
   // Wheel dispatch is asynchronous in WebKit; observe the actual scroll exit.
   await p.waitForFunction(()=>scrollY>0&&!document.querySelector('.portfolio-opening'),null,{timeout:3000});
   check(engine,'Scrolling dismisses the sequence without blocking movement',await p.locator('.portfolio-opening').count()===0&&await p.evaluate(()=>scrollY>0));
   await p.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await p.locator('[data-opening-replay]').click();await active(p);await p.keyboard.press('Tab');
   check(engine,'Keyboard navigation dismisses the intro when focus leaves Skip',await p.locator('.portfolio-opening').count()===0);
   await p.locator('[data-opening-replay]').click();await active(p);await p.setViewportSize({width:1390,height:900});
   await p.waitForFunction(()=>document.querySelector('.opening-hero')?.dataset.openingState==='resized');
   check(engine,'Viewport changes dismiss the aperture before its measured geometry becomes stale',await p.locator('.portfolio-opening').count()===0);
   await p.setViewportSize({width:1440,height:900});
   await p.locator('[data-opening-replay]').click();await active(p);await p.emulateMedia({reducedMotion:'reduce'});
   await p.waitForFunction(()=>matchMedia('(prefers-reduced-motion: reduce)').matches&&!document.querySelector('.portfolio-opening'));
   check(engine,'Enabling reduced motion immediately removes and disables the sequence',await p.locator('.portfolio-opening').count()===0&&!await p.locator('[data-opening-replay]').isVisible());
   await session.close();

   const fallback=await browser.newContext({viewport:{width:1440,height:1000}});
   await fallback.addInitScript(()=>{const supports=CSS.supports.bind(CSS);CSS.supports=(...args)=>args[0]==='clip-path'?false:supports(...args);});
   const f=await fallback.newPage(),fallbackErrors=[];f.on('pageerror',error=>fallbackErrors.push(error.message));
   await f.goto(url);await active(f);
   check(engine,'Unsupported aperture clipping uses the finite fade fallback',await f.locator('.portfolio-opening').getAttribute('data-opening-reveal')==='fade'&&await f.locator('.opening-iris-ring:visible').count()===0&&await f.locator('[data-opening-lining]').isHidden());
   await finished(f);
   check(engine,'The fade fallback exposes the complete page without exceptions',await f.locator('.portfolio-opening').count()===0&&fallbackErrors.length===0,fallbackErrors);
   await fallback.close();

   for(const scenario of ['reduced','data','fragment','no-script']){
    const ctx=await browser.newContext({viewport:{width:390,height:900},reducedMotion:scenario==='reduced'?'reduce':'no-preference',javaScriptEnabled:scenario!=='no-script'});
    if(scenario==='data')await ctx.addInitScript(()=>Object.defineProperty(navigator,'connection',{value:{saveData:true,effectiveType:'4g'}}));
    const q=await ctx.newPage();await q.goto(url+(scenario==='fragment'?'#teaching-evidence':''));await q.waitForTimeout(350);
    check(engine,`${scenario} keeps a readable page without an opening overlay`,await q.locator('.portfolio-opening').count()===0&&await q.locator('h1').isVisible());
    if(scenario==='reduced'){
     const axe=await new AxeBuilder({page:q}).include('.atlas-stage').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
     check(engine,'Calm mobile scene has no serious or critical accessibility violations',!axe.violations.some(v=>['serious','critical'].includes(v.impact)),axe.violations.map(v=>v.id));
    }
    await ctx.close();
   }
   for(const width of [320,390,768]){
    const ctx=await browser.newContext({viewport:{width,height:900}}),q=await ctx.newPage();await q.goto(url);await active(q);await q.waitForTimeout(450);
    check(engine,`${width}px name and skip control fit the viewport`,await q.evaluate(()=>[...document.querySelectorAll('.opening-name-line,.opening-skip')].every(el=>{const r=el.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth+1;})&&document.documentElement.scrollWidth<=innerWidth+1));
    if(engine==='chromium'&&width===390)await q.screenshot({path:path.join(output,'name-phone.png')});
    await finished(q);
    if(width<=390)check(engine,`${width}px Replay clears the phone shortcut bar`,await q.locator('[data-opening-replay]').evaluate(el=>el.getBoundingClientRect().bottom<=document.querySelector('.mobile-shortcuts').getBoundingClientRect().top));
    if(engine==='chromium'&&width===390)await q.screenshot({path:path.join(output,'finished-phone.png')});
    await ctx.close();
   }
  }finally{await browser.close();}
 }
}finally{server.kill();await fs.writeFile(path.join(output,'checks.json'),JSON.stringify({checks:results.length,failed:results.filter(r=>!r.pass).length,results},null,2));}
console.log(`${results.filter(r=>r.pass).length}/${results.length} opening checks passed.`);
if(results.some(r=>!r.pass))process.exitCode=1;
