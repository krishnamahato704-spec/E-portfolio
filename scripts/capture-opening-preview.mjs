import {chromium,webkit} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
const base=process.env.PREVIEW_URL||'http://127.0.0.1:4181/';
const out=path.resolve('output/portfolio-design-review/opening');
await fs.mkdir(out,{recursive:true});
const checks=[];
for(const [engine,launcher] of Object.entries({chromium,webkit})){
 const browser=await launcher.launch({headless:true});
 try{for(const width of [390,1440]){
  const context=await browser.newContext({viewport:{width,height:width===390?844:900}}),page=await context.newPage();
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.addInitScript(()=>{
   document.addEventListener('animationstart',event=>{
    if(event.animationName!=='hero-intro-reveal'||window.previewAnimations)return;
    window.previewAnimations=document.querySelector('.opening-hero').getAnimations({subtree:true})
     .filter(animation=>animation.animationName==='hero-intro-reveal');
    window.previewAnimations.forEach(animation=>{animation.pause();animation.currentTime=150;});
   });
  });
  await page.goto(base,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.previewAnimations?.length);
  const textFirst=await page.evaluate(()=>{
   const title=document.querySelector('h1.hero-intro-line');
   return title.checkVisibility({checkVisibilityCSS:true})&&Number(getComputedStyle(title).opacity)>=.85&&
    !document.querySelector('.hero-film').getAttribute('src')&&document.documentElement.scrollWidth<=innerWidth;
  });
  if(engine==='chromium')await page.screenshot({path:path.join(out,`text-${width}.png`)});
  await page.evaluate(()=>window.previewAnimations.forEach(animation=>animation.play()));
  const hero=page.locator('.opening-hero[data-film-started=true]');
  await hero.waitFor();
  await hero.locator('.hero-film').evaluate(video=>Promise.allSettled(video.getAnimations().map(animation=>animation.finished)));
  if(engine==='chromium')await page.screenshot({path:path.join(out,`home-film-${width}.png`)});
  const homeScan=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
  const failures=homeScan.violations.filter(v=>['serious','critical'].includes(v.impact)).map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,details:n.failureSummary}))}));
  if(!textFirst)failures.push({id:'headline-before-film'});
  if(errors.length)failures.push({id:'page-errors',errors});
  checks.push({engine,width,textFirst,failures});
  await context.close();
 }}finally{await browser.close();}
}
await fs.writeFile(path.join(out,'accessibility.json'),JSON.stringify(checks,null,2));
await fs.writeFile(path.join(out,'index.html'),`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Portfolio opening preview</title><style>body{margin:0;padding:24px;background:#fbf7f0;color:#30251f;font:16px/1.5 system-ui}main{max-width:1400px;margin:auto}a{color:#754026}.frames{display:grid;grid-template-columns:repeat(2,1fr);gap:18px}figure{margin:0}img{width:100%;border:1px solid #ded0c0}figcaption{padding-block:10px}@media(max-width:700px){.frames{grid-template-columns:1fr}}</style><main><h1>Portfolio opening preview</h1><p><a href="${base}">Open the homepage</a></p>${[1440,390].map(width=>`<h2>${width===1440?'Desktop':'Phone'}</h2><div class="frames">${[['text','Headline reveal over the poster'],['home-film','Homepage with background film playing']].map(([name,label])=>`<figure><img src="${name}-${width}.png" alt="${label}"><figcaption>${label}</figcaption></figure>`).join('')}</div>`).join('')}</main></html>`);
console.log(JSON.stringify(checks,null,2));
if(checks.some(c=>c.failures.length))process.exitCode=1;
