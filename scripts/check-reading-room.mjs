import {chromium,webkit} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import {spawn} from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const server=spawn(process.execPath,['scripts/serve.mjs','--dist'],{cwd:root,env:{...process.env,PORT:'4188'},windowsHide:true,stdio:'ignore'});
const base='http://127.0.0.1:4188/E-portfolio/';
const output=path.join(root,'outputs/reading-room');
await fs.mkdir(output,{recursive:true});
const results=[];
const check=(engine,name,pass,details)=>{results.push({engine,name,pass:!!pass,...(details===undefined?{}:{details})});if(!pass)console.error(engine,name,details??'');};
try{
 let ready=false;
 for(let i=0;i<80;i++){try{if((await fetch(base)).ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,100));}
 if(!ready)throw Error('Preview did not start.');
 for(const [engine,type] of Object.entries({chromium,webkit})){
  const browser=await type.launch({headless:true});
  try{
   const context=await browser.newContext({viewport:{width:1440,height:1000}});
   const page=await context.newPage();
   await page.goto(base);
   await page.locator('[data-identity-lens]').waitFor({state:'visible'});
   await page.locator('button[data-lens=teacher]').click();
   check(engine,'Teacher emphasis keeps both perspectives readable',await page.locator('[data-identity-pair]').getAttribute('data-lens')==='teacher'&&await page.locator('[data-perspective=teacher]').isVisible()&&await page.locator('[data-perspective=student]').isVisible());
   await page.locator('button[data-lens=student]').click();
   check(engine,'Student emphasis reports its pressed state',await page.locator('button[data-lens=student]').getAttribute('aria-pressed')==='true'&&await page.locator('button[data-lens=teacher]').getAttribute('aria-pressed')==='false');
   await page.locator('button[data-lens=both]').click();
   const row=page.locator('.selected-evidence-card').first();
   await row.scrollIntoViewIfNeeded();
   await page.mouse.move(2,2);
   await page.waitForTimeout(350);
   await row.hover();
   const preview=page.locator('.evidence-hover-preview');
   await preview.waitFor({state:'visible'});
   check(engine,'Hover shows the real image in one inert pointer-transparent preview',await preview.count()===1&&await preview.evaluate(p=>p.inert&&p.getAttribute('aria-hidden')==='true'&&getComputedStyle(p).pointerEvents==='none'&&p.querySelector('img').src===new URL(document.querySelector('.selected-evidence-card').dataset.previewSrc,location.href).href));
   check(engine,'Preview stacks below the sticky index',await preview.evaluate(p=>Number(getComputedStyle(p).zIndex)<Number(getComputedStyle(document.querySelector('.editorial-index')).zIndex)));
   const hoverContrast=await new AxeBuilder({page}).include('.selected-evidence-grid').withRules(['color-contrast']).analyze();
   check(engine,'Dimmed surrounding evidence keeps readable contrast',hoverContrast.violations.length===0,hoverContrast.violations.map(v=>v.id));
   await page.keyboard.press('Escape');
   check(engine,'Escape dismisses the hover preview',!await preview.isVisible());
   const lesson=row.locator('a').first();
   await lesson.focus();
   check(engine,'Keyboard focus retains an unobscured evidence link',await lesson.evaluate(el=>{const r=el.getBoundingClientRect();return document.activeElement===el&&document.elementFromPoint(r.left+r.width/2,r.top+r.height/2)?.closest('a')===el;}));
   await page.keyboard.press('Enter');await page.waitForURL('**/teaching/democracy/');
   check(engine,'The lesson keeps its native detail-page destination',await page.locator('h1').isVisible());
   await page.goto(base+'#teaching-evidence');
   await page.locator('.editorial-index a[aria-current=location]').waitFor();
   check(engine,'Index marks evidence after direct navigation',await page.locator('.editorial-index a[aria-current=location]').getAttribute('href')==='#teaching-evidence');
   await page.emulateMedia({reducedMotion:'reduce'});
   await page.locator('button[data-lens=teacher]').click();
   check(engine,'Changing motion preference retains the usable identity lens',await page.locator('[data-identity-pair]').getAttribute('data-lens')==='teacher'&&await page.locator('[data-identity-lens]').isVisible());
   await page.locator('.selected-evidence-card').first().hover();
   check(engine,'Reduced motion leaves floating previews hidden',!await preview.isVisible());
   await page.evaluate(()=>{window.dispatchEvent(new PageTransitionEvent('pagehide',{persisted:true}));window.dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true}));});
   check(engine,'Cached restoration retains a single preview and usable lens',await preview.count()===1&&await page.locator('[data-identity-lens]').isVisible());
   await context.close();

   for(const width of [320,390,768,1024,1440]){
    const ctx=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'});
    const p=await ctx.newPage();await p.goto(base);await p.evaluate(()=>document.fonts.ready);
    check(engine,`${width}px layout fits`,await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    if(width<=390)check(engine,`${width}px availability remains on the first screen`,await p.locator('.hero-joining').evaluate(el=>el.getBoundingClientRect().bottom<800));
    if(engine==='chromium'&&(width===390||width===1440)){
     await p.screenshot({path:path.join(output,`opening-${width}.png`)});
     for(const image of await p.locator('main img:not([data-src])').all()){
      if(!await image.isVisible()||await image.evaluate(el=>!!el.closest('[data-hero-slide][inert]')))continue;
      await image.scrollIntoViewIfNeeded();await image.evaluate(el=>el.decode().catch(()=>{}));
     }
     await p.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
     await p.screenshot({path:path.join(output,`full-${width}.png`),fullPage:true});
     await p.locator('#teaching-philosophy').screenshot({path:path.join(output,`manifesto-${width}.png`)});
    }
    await ctx.close();
   }
   const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});
   const plain=await nojs.newPage();await plain.goto(base);
   check(engine,'No-JavaScript evidence and both identities remain visible',await plain.locator('#teaching-evidence').isVisible()&&await plain.locator('[data-perspective=teacher]').isVisible()&&await plain.locator('[data-perspective=student]').isVisible());
   check(engine,'No-JavaScript hides only the optional lens controls',!await plain.locator('[data-identity-lens]').isVisible());
   await nojs.close();
  }finally{await browser.close();}
 }
}finally{server.kill();await fs.writeFile(path.join(output,'checks.json'),JSON.stringify({checks:results.length,failed:results.filter(r=>!r.pass).length,results},null,2));}
console.log(`${results.filter(r=>r.pass).length}/${results.length} reading-room checks passed.`);
if(results.some(r=>!r.pass))process.exitCode=1;
