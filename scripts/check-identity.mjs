import {chromium,firefox,webkit} from 'playwright';
import {spawn} from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';

const port=4175,base=`http://127.0.0.1:${port}/E-portfolio/`;
const output=path.resolve('outputs/redesign');
const results=[];
const record=(engine,name,pass,details)=>{results.push({engine,name,pass:!!pass,...(details?{details}:{})});if(!pass)console.error('FAIL',engine,name,details||'');};
const server=spawn(process.execPath,['scripts/serve.mjs'],{env:{...process.env,PORT:String(port)},windowsHide:true,stdio:'ignore'});
await fs.mkdir(output,{recursive:true});
try {
 for(let i=0;i<100;i++){try{if((await fetch(base)).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
 for(const engine of (process.env.IDENTITY_TEST_ENGINES||'chromium').split(',')){
  const browser=await {chromium,firefox,webkit}[engine].launch({headless:true});
  const fresh=options=>browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'no-preference',...options});
  try {
   const ctx=await fresh(),page=await ctx.newPage();
   const requests=[],errors=[];
   page.on('request',r=>requests.push(r.url()));page.on('pageerror',e=>errors.push(e.message));
   await page.addInitScript(()=>new MutationObserver(records=>{for(const record of records){for(const n of record.addedNodes)if(n.classList?.contains('identity-intro'))window.__introAdded=performance.now();for(const n of record.removedNodes)if(n.classList?.contains('identity-intro'))window.__introRemoved=performance.now();}}).observe(document,{childList:true,subtree:true}));
   const began=Date.now();await page.goto(base);await page.locator('.intro-skip').waitFor();
   record(engine,'First home visit offers a finite introduction and skip',await page.locator('.identity-intro').count()===1);
   await page.evaluate(()=>document.fonts.ready);
   const geometry=await page.locator('#main').boundingBox();
   if(engine==='chromium'){
    await page.waitForTimeout(400);await page.screenshot({path:path.join(output,'opening-timeline.png')});
    await page.waitForFunction(()=>['.intro-name','.intro-role','.intro-principles'].every(s=>Number(getComputedStyle(document.querySelector(s)).opacity)>.99));
    await page.screenshot({path:path.join(output,'opening-identity.png')});
   }
   await page.locator('.identity-intro').waitFor({state:'detached',timeout:4000});
   const duration=await page.evaluate(()=>window.__introRemoved-window.__introAdded);
   record(engine,'Introduction finishes within four seconds',duration<4000,{elapsedMs:duration,totalNavigationMs:Date.now()-began});
   const after=await page.locator('#main').boundingBox();
   record(engine,'Introduction causes no movement of the main layout',Math.abs(after.y-geometry.y)<1&&Math.abs(after.height-geometry.height)<1,{before:geometry,after});
   record(engine,'Real portfolio remains available and is never inert',await page.locator('h1').isVisible()&&await page.evaluate(()=>!document.querySelector('main').inert&&!document.body.style.overflow));
   record(engine,'Classroom images reserve proportional frames',await page.locator('.current-practice .gallery-image').evaluate(img=>{const r=img.getBoundingClientRect();return r.height>0&&r.height<r.width*1.5;}));
   record(engine,'No film download or autoplay during the opening',!requests.some(x=>/\.mp4(?:\?|$)/.test(x))&&await page.locator('video').evaluate(v=>v.paused&&!v.getAttribute('src')));
   await page.reload();record(engine,'Refresh does not replay the introduction',await page.locator('.identity-intro').count()===0);
   await page.goto(base+'resources/');record(engine,'Inner-page navigation never plays the introduction',await page.locator('.identity-intro').count()===0);
   await page.goto(base);record(engine,'Returning home in the same session stays still',await page.locator('.identity-intro').count()===0);
   record(engine,'Opening produces no uncaught browser errors',errors.length===0,errors);
   await ctx.close();

   for(const action of ['skip','escape','keyboard','scroll','preference']){
    const context=await fresh({viewport:{width:390,height:844}}),p=await context.newPage();
    await p.goto(base);await p.locator('.intro-skip').waitFor();
    if(action==='skip'){await p.locator('.intro-skip').focus();await p.keyboard.press('Enter');}
    if(action==='escape')await p.keyboard.press('Escape');
    if(action==='keyboard')await p.keyboard.press('Tab');
    if(action==='scroll')await p.mouse.wheel(0,500);
    if(action==='preference')await p.emulateMedia({reducedMotion:'reduce'});
    await p.locator('.identity-intro').waitFor({state:'detached',timeout:1000});
    record(engine,`${action} immediately dismisses the opening`,await p.locator('.identity-intro').count()===0);
    if(action==='skip')record(engine,'Keyboard skip moves focus to the real content',await p.evaluate(()=>document.activeElement.id==='main'));
    if(action==='scroll')record(engine,'Mobile visitor can scroll without a trap',await p.evaluate(()=>scrollY>0&&!document.body.style.overflow));
    if(action==='preference')record(engine,'Live reduced motion stops all decorative animations',await p.evaluate(()=>document.getAnimations().filter(a=>a.playState==='running').length===0));
    record(engine,`${action} fits the mobile viewport`,await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    await context.close();
   }
   for(const mode of ['reduced','blocked-storage','no-js','script-failure']){
    const context=await fresh({reducedMotion:mode==='reduced'?'reduce':'no-preference',javaScriptEnabled:mode!=='no-js'}),p=await context.newPage();
    if(mode==='blocked-storage')await p.addInitScript(()=>Object.defineProperty(window,'sessionStorage',{get(){throw new DOMException('Storage unavailable','SecurityError');}}));
    if(mode==='script-failure')await p.route('**/src/app.js*',r=>r.abort());
    await p.goto(base);await p.evaluate(()=>document.fonts.ready);
    record(engine,`${mode} shows the normal portfolio immediately`,await p.locator('.identity-intro').count()===0&&await p.locator('h1').isVisible());
    await context.close();
   }
   const inner=await fresh(),p=await inner.newPage();
   await p.goto(base+'teaching/');record(engine,'A new session beginning on a detail page has no intro',await p.locator('.identity-intro').count()===0);
   await p.goto(base);await p.locator('.intro-skip').waitFor();record(engine,'A new browser session receives its own first home opening',await p.locator('.identity-intro').count()===1);
   await inner.close();

   const gallery=await fresh({reducedMotion:'reduce',viewport:{width:390,height:844}}),g=await gallery.newPage();
   await g.goto(base+'gallery/');await g.locator('.gallery-grid a').first().click();
   const first=await g.locator('#viewer-title').innerText();
   await g.keyboard.press('ArrowRight');record(engine,'Gallery arrow keys change the image',await g.locator('#viewer-title').innerText()!==first);
   await g.keyboard.press('ArrowLeft');record(engine,'Gallery can return to the first image',await g.locator('#viewer-title').innerText()===first);
   await g.locator('.viewer-content').evaluate(el=>{for(const [type,x,y] of [['touchstart',300,200],['touchend',100,205]]){const event=new Event(type);Object.defineProperty(event,'changedTouches',{value:[{clientX:x,clientY:y}]});el.dispatchEvent(event);}});
   record(engine,'Gallery horizontal swipe changes the image',await g.locator('#viewer-title').innerText()!==first);
   await g.keyboard.press('Escape');record(engine,'Gallery Escape restores the original trigger',await g.locator('.gallery-grid a').first().evaluate(a=>a===document.activeElement));
   await gallery.close();
  } finally {await browser.close();}
 }
} finally {
 server.kill();
 await fs.writeFile(path.join(output,'identity-results.json'),JSON.stringify({checks:results.length,failed:results.filter(r=>!r.pass).length,results},null,2));
}
console.log(`${results.filter(r=>r.pass).length}/${results.length} identity and gallery checks passed.`);
if(results.some(r=>!r.pass))process.exitCode=1;
