import {chromium,webkit} from 'playwright';
import fs from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {routes} from '../src/views.js';

const port=4176,base=process.env.PREVIEW_URL||`http://127.0.0.1:${port}/E-portfolio/`;
const server=process.env.PREVIEW_URL?null:spawn(process.execPath,['scripts/serve.mjs','--dist'],{env:{...process.env,PORT:String(port)},windowsHide:true,stdio:'ignore'});
const results=[];
const check=(engine,name,pass,details)=>{
 results.push({engine,name,pass,details});
 if(!pass)console.error(engine,name,details);
};
try{
 let ready=false;
 for(let i=0;i<80;i++){try{if((await fetch(base)).ok){ready=true;break;}}catch{}await new Promise(resolve=>setTimeout(resolve,100));}
 if(!ready)throw Error('The packaged portfolio preview did not start.');
 for(const engine of (process.env.RECRUITER_TEST_ENGINES||'chromium').split(',')){
 const type={chromium,webkit}[engine];
 if(!type)throw Error('Unknown recruiter test browser: '+engine);
 const browser=await type.launch({headless:true});
 try{
  for(const width of [320,390,1440]){
   const ctx=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
   const page=await ctx.newPage();
   for(const [route,meta] of Object.entries(routes)){
    await page.goto(base+meta.path);
    const state=await page.evaluate(()=>{
     const bar=document.querySelector('.mobile-shortcuts');
     return {barVisible:!!bar&&bar.checkVisibility(),barCount:document.querySelectorAll('.mobile-shortcuts').length,
      links:bar?[...bar.querySelectorAll('a')].map(a=>{const r=a.getBoundingClientRect();return {href:a.href,current:a.hasAttribute('aria-current'),height:r.height,left:r.left,right:r.right};}):[],
      width:innerWidth,documentWidth:document.documentElement.scrollWidth};
    });
    const publicPage=!['admin','404'].includes(route);
    check(engine,`${route} ${width}: quick access fits and appears only at phone widths`,state.documentWidth<=width+1&&state.barCount===Number(publicPage)&&state.barVisible===(publicPage&&width<=760),state);
    if(!state.barVisible)continue;
    check(engine,`${route} ${width}: shortcuts have usable targets and correct subpath URLs`,state.links.every(l=>l.height>=44&&l.left>=0&&l.right<=width)&&state.links.map(l=>l.href).join('|')===['resume/','resources/','contact/'].map(path=>new URL(path,base).href).join('|'),state.links);
    if(['resume','resources','contact','democracy'].includes(route))check(engine,`${route} ${width}: shortcut marks the relevant page`,state.links.filter(l=>l.current).length===1&&state.links.find(l=>l.current).href===new URL(route==='democracy'?'resources/':meta.path,base).href);
    await page.locator('.site-footer a').last().focus();
    await page.locator('.site-footer a').last().evaluate(a=>a.scrollIntoView({block:'end'}));
    check(engine,`${route} ${width}: bottom bar leaves the last footer link accessible`,await page.evaluate(()=>document.activeElement.getBoundingClientRect().bottom<=document.querySelector('.mobile-shortcuts').getBoundingClientRect().top));
   }
   if(width===390){
    await page.goto(base+'#teaching-evidence');
    await page.locator('#teaching-evidence').waitFor();
    await page.evaluate(()=>document.fonts.ready);
    check(engine,'Direct evidence link bypasses the film and lands at the selected work',await page.evaluate(()=>!document.querySelector('.identity-intro')&&!document.documentElement.classList.contains('opening-pending')&&document.querySelector('#teaching-evidence').getBoundingClientRect().top>=0&&document.querySelector('#teaching-evidence').getBoundingClientRect().top<150));
    const order=await page.locator('main>section').evaluateAll(sections=>sections.map(s=>s.className));
    check(engine,'Evidence and experience precede detailed education',order.findIndex(s=>s.includes('selected-evidence'))<order.findIndex(s=>s.includes('home-journey'))&&order.findIndex(s=>s.includes('home-journey'))<order.findIndex(s=>s.includes('home-education')),order);
    for(const target of ['resume/','resources/','contact/']){
     await page.locator(`.mobile-shortcuts a[href$="${target}"]`).click();
     await page.waitForURL(new URL(target,base).href);
     check(engine,`Quick access navigates directly to ${target}`,await page.locator('h1').isVisible());
    }
    await page.setViewportSize({width:390,height:480});
    await page.locator('textarea[name="message"]').focus();
    await page.locator('textarea[name="message"]').evaluate(el=>el.scrollIntoView({block:'end'}));
    check(engine,'Focused contact field stays above the shortcut bar in a short viewport',await page.evaluate(()=>document.activeElement.getBoundingClientRect().bottom<=document.querySelector('.mobile-shortcuts').getBoundingClientRect().top));
    await page.goto(base+'resume/');await page.emulateMedia({media:'print'});
    check(engine,'Print hides mobile shortcuts and their reserved space',await page.evaluate(()=>!document.querySelector('.mobile-shortcuts').checkVisibility()&&parseFloat(getComputedStyle(document.body).paddingBottom)===0));
   }
   await ctx.close();
  }
  const fallback=await browser.newContext({viewport:{width:390,height:900},javaScriptEnabled:false});
  const page=await fallback.newPage();await page.goto(base);
  check(engine,'No-JavaScript visitors retain direct mobile résumé access',await page.locator('.mobile-shortcuts').isVisible());
  await page.locator('.mobile-shortcuts a[href$="resume/"]').click();
  check(engine,'No-JavaScript résumé link reaches the complete record',page.url()===new URL('resume/',base).href&&await page.locator('.resume-web-summary').isVisible());
  await fallback.close();
  const moving=await browser.newContext({viewport:{width:390,height:900}});
  const intro=await moving.newPage();await intro.goto(base+'?intro=1');await intro.locator('.intro-skip').waitFor();
  check(engine,'Film opening hides the shortcut bar and clearly labels its exit',!await intro.locator('.mobile-shortcuts').isVisible()&&await intro.locator('.intro-skip').textContent()==='Skip to portfolio');
  await intro.locator('.intro-skip').focus();
  await intro.keyboard.press('Enter');
  check(engine,'Keyboard-focused skip restores quick access and main focus',await intro.locator('.mobile-shortcuts').isVisible()&&await intro.evaluate(()=>document.activeElement.id==='main'));
  await moving.close();
 }finally{await browser.close();}
}
}finally{server?.kill();}
await fs.mkdir('output/portfolio-design-review/recruiter-access',{recursive:true});
await fs.writeFile('output/portfolio-design-review/recruiter-access/checks.json',JSON.stringify({base,checks:results.length,failed:results.filter(r=>!r.pass).length,results},null,2));
console.log(`${results.filter(r=>r.pass).length}/${results.length} recruiter access checks passed.`);
if(results.some(r=>!r.pass))process.exitCode=1;
