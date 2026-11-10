import {chromium,webkit} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import {spawn} from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
const output='outputs/atlas';await fs.mkdir(output,{recursive:true});
const server=spawn(process.execPath,['scripts/serve.mjs','--dist'],{env:{...process.env,PORT:'4192'},windowsHide:true,stdio:'ignore'});
const url='http://127.0.0.1:4192/E-portfolio/';
const results=[];
const check=(engine,name,pass,details)=>{results.push({engine,name,pass:!!pass,...(details===undefined?{}:{details})});if(!pass)console.error(engine,name,details??'');};
const light=rgb=>rgb.match(/[\d.]+/g).slice(0,3).map(Number).map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
const pixels=page=>page.locator('[data-atlas-field]').evaluate(canvas=>{const data=canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data;let sum=0,filled=0;for(let i=3;i<data.length;i+=4){sum=(sum+data[i])%2147483647;if(data[i])filled++;}return {sum,filled,width:canvas.width,height:canvas.height};});
try{
 for(let i=0;i<80;i++){try{if((await fetch(url)).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
 for(const [engine,type] of Object.entries({chromium,webkit})){
  const browser=await type.launch({headless:true});
  try{
   const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
   const page=await context.newPage();const errors=[];page.on('pageerror',error=>errors.push(error.message));
   await page.goto(url);await page.evaluate(()=>document.fonts.ready);
   await page.locator('[data-atlas-controls]').waitFor({state:'visible'});
   const teacher=await pixels(page);
   check(engine,'Static accessible scene contains real contour artwork',teacher.filled>1000,teacher);
   const teacherColor=await page.locator('.atlas-stage').evaluate(el=>getComputedStyle(el).backgroundColor);
   check(engine,'Essential desktop type is visibly larger',await page.evaluate(()=>Number.parseFloat(getComputedStyle(document.querySelector('.hero-statement')).fontSize)>=22&&Number.parseFloat(getComputedStyle(document.querySelector('.hero-study')).fontSize)>=16&&Number.parseFloat(getComputedStyle(document.querySelector('[data-atlas-controls] button')).fontSize)>=16));
   if(engine==='chromium')await page.screenshot({path:path.join(output,'teacher-desktop.png')});
   await page.locator('button[data-atlas-mode=student]').click();
   const student=await pixels(page);
   const studentColor=await page.locator('.atlas-stage').evaluate(el=>getComputedStyle(el).backgroundColor);
   const modeContrast=(Math.max(light(teacherColor),light(studentColor))+.05)/(Math.min(light(teacherColor),light(studentColor))+.05);
   check(engine,'Teacher and Student have strongly distinct full-scene colors',modeContrast>=4.5&&await page.locator('.atlas-stage').evaluate(el=>getComputedStyle(el,'::before').display==='none'),{teacherColor,studentColor,modeContrast});
   check(engine,'Identity switch recomposes artwork, palette and accessible state',student.sum!==teacher.sum&&teacherColor!==studentColor&&await page.locator('button[data-atlas-mode=student]').getAttribute('aria-pressed')==='true',{teacherColor,studentColor});
   await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
   if(engine==='chromium')await page.screenshot({path:path.join(output,'student-desktop.png')});
   for(const mode of ['student','teacher']){
    await page.locator(`button[data-atlas-mode=${mode}]`).click();
    const axe=await new AxeBuilder({page}).include('.atlas-stage').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
    check(engine,`${mode} scene has no serious or critical accessibility violations`,!axe.violations.some(v=>['serious','critical'].includes(v.impact)),axe.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})));
   }
   await page.emulateMedia({reducedMotion:'no-preference'});await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
   await page.mouse.move(200,220);await page.waitForTimeout(150);const before=await pixels(page);
   await page.mouse.move(1200,650);await page.waitForTimeout(400);const after=await pixels(page);
   check(engine,'Pointer movement changes the rendered field',before.sum!==after.sum);
   await page.locator('[data-atlas-pause]').click();
   const pausedA=await pixels(page);await page.waitForTimeout(150);const pausedB=await pixels(page);
   check(engine,'Visitor motion pause stops the graphic without disabling the scene',pausedA.sum===pausedB.sum&&await page.locator('[data-atlas-pause]').getAttribute('aria-pressed')==='true');
   await page.locator('[data-atlas-pause]').click();
   await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(100);const calmA=await pixels(page);await page.waitForTimeout(150);const calmB=await pixels(page);
   check(engine,'Reduced motion immediately settles to a static field',calmA.sum===calmB.sum);
   check(engine,'No browser exceptions',errors.length===0,errors);
   await page.locator('button[data-atlas-mode=student]').click();
   await page.evaluate(()=>{window.dispatchEvent(new PageTransitionEvent('pagehide',{persisted:true}));window.dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true}));});
   check(engine,'Cached restoration preserves the chosen perspective with one field',await page.locator('.opening-hero').getAttribute('data-atlas-mode')==='student'&&await page.locator('[data-atlas-field]').count()===1&&await page.locator('[data-atlas-copy=student]').isVisible());
   await context.close();
   const laptop=await browser.newContext({viewport:{width:1440,height:768},reducedMotion:'reduce'}),lp=await laptop.newPage();await lp.goto(url);await lp.evaluate(()=>document.fonts.ready);
   check(engine,'The scene selector is visible on a 768px-high laptop',await lp.locator('[data-atlas-controls]').evaluate(el=>el.getBoundingClientRect().bottom<innerHeight));await laptop.close();
   for(const width of [320,390,768,1024]){
    const ctx=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
    const p=await ctx.newPage();await p.goto(url);await p.evaluate(()=>document.fonts.ready);
    check(engine,`${width}px opening and availability fit`,await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1&&document.querySelector('.hero-joining').getBoundingClientRect().bottom<800));
    if(width<=390)check(engine,`${width}px scene controls clear the phone shortcut bar`,await p.evaluate(()=>document.querySelector('.atlas-stage-footer').getBoundingClientRect().bottom<=document.querySelector('.mobile-shortcuts').getBoundingClientRect().top));
    if(engine==='chromium'&&width===390)await p.screenshot({path:path.join(output,'teacher-phone.png')});
    await ctx.close();
   }
   const plain=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:900}}),p=await plain.newPage();await p.goto(url);
   check(engine,'No-JavaScript opening retains visual fallback and direct actions',await p.locator('.atlas-fallback').isVisible()&&await p.locator('.hero .actions a.button').count()===2&&await p.locator('h1').isVisible());await plain.close();
  }finally{await browser.close();}
 }
}finally{server.kill();await fs.writeFile(path.join(output,'checks.json'),JSON.stringify({checks:results.length,failed:results.filter(r=>!r.pass).length,results},null,2));}
console.log(`${results.filter(r=>r.pass).length}/${results.length} atlas checks passed.`);
if(results.some(r=>!r.pass))process.exitCode=1;
