import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import {routes} from '../src/views.js';

const port=4180,base=`http://127.0.0.1:${port}/`;
const out=path.resolve('output/portfolio-design-review/screenshots');
const server=spawn(process.execPath,['scripts/serve.mjs','--dist'],{env:{...process.env,PORT:String(port)},windowsHide:true,stdio:'ignore'});
let browser;
try{
 await fs.mkdir(out,{recursive:true});
 for(let i=0;i<80;i++){try{if((await fetch(base)).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
 browser=await chromium.launch({headless:true});
 for(const width of [390,1440]){
  const ctx=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'});
  const page=await ctx.newPage();
  for(const [name,route] of Object.entries(routes)){
   await page.goto(base+route.path);
   await page.evaluate(()=>document.fonts.ready);
   for(const image of await page.locator('main img').all()){
    if(await image.isVisible())await image.evaluate(async image=>{image.loading='eager';await image.decode().catch(()=>{});});
   }
   await page.screenshot({path:path.join(out,`${name}-${width}.png`),fullPage:true});
   await page.screenshot({path:path.join(out,`${name}-${width}-opening.png`)});
   if(name==='home')await page.screenshot({path:path.join(out,`hero-${width}.png`)});
  }
  await ctx.close();
 }
 for(const width of [320,1440]){
  const ctx=await browser.newContext({viewport:{width,height:1000}}),page=await ctx.newPage();
  await page.goto(base);await page.locator('.intro-skip').waitFor();
  await page.evaluate(()=>document.fonts.ready);await page.locator('.hero-avatar').evaluate(image=>image.decode());
  await page.screenshot({path:path.join(out,`first-visit-${width}.png`)});
  await ctx.close();
 }
 const panels=Object.entries(routes).map(([name,route])=>`<section><h2>${route.title}</h2><a href="http://127.0.0.1:4181/${route.path}">Open page</a><div class="pair"><img loading="lazy" src="screenshots/${name}-1440.png" alt="${name} at desktop width"><img loading="lazy" src="screenshots/${name}-390.png" alt="${name} at phone width"></div></section>`).join('');
 await fs.writeFile(path.join(out,'../index.html'),`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Revised portfolio preview</title><style>body{font:16px/1.6 system-ui;margin:0;background:#f7faf9;color:#123d49}main{max-width:1500px;margin:auto;padding:28px}section{margin:40px 0}.pair{display:grid;grid-template-columns:3fr 1fr;gap:20px;align-items:start}img{width:100%;border:1px solid #dce7e3}a{color:inherit}@media(max-width:700px){.pair{grid-template-columns:1fr}}</style><main><h1>Revised portfolio preview</h1><p>Individual page designs with light colors, readable text and original personal photographs throughout the backgrounds. This local revision has not been pushed or deployed.</p><p><a href="http://127.0.0.1:4181/?intro=1">Replay the restored opening</a> · <a href="opening/index.html">Film, name and homepage preview</a> · <a href="comparison.html">Compare the six main inner pages</a> · <a href="backgrounds/index.html">Review the top, middle and bottom backgrounds</a></p>${panels}</main></html>`);
 const identities=[['profile','About','Sage & cream'],['teaching','Experience','Powder blue & slate'],['resources','Teaching Evidence','Peach & clay'],['credentials','Credentials','Lavender & pearl'],['resume','Résumé','Stone & blue grey'],['contact','Contact','Dusty rose & white']];
 const comparisonPath=path.join(out,'../comparison.html');
 await fs.writeFile(comparisonPath,`<!doctype html><html lang="en"><meta charset="utf-8"><title>Portfolio page comparison</title><style>body{margin:0;padding:24px;background:#edf5f2;color:#123d49;font:16px/1.4 system-ui}h1{font-size:26px;margin:0 0 8px}p{margin:0 0 20px}.pages{display:grid;grid-template-columns:1fr 1fr;gap:18px}figure{margin:0;background:white;border:1px solid #dce7e3}img{display:block;width:100%}figcaption{padding:12px 16px;border-top:3px solid #b57a55;display:flex;justify-content:space-between;gap:12px}strong{font-size:18px}span{color:#52666f}</style><h1>Distinct pages, light color palettes</h1><p>Local preview · Original personal photographs and teaching materials</p><div class="pages">${identities.map(([name,title,description])=>`<figure><img src="screenshots/${name}-1440-opening.png" alt="${title} page"><figcaption><strong>${title}</strong><span>${description}</span></figcaption></figure>`).join('')}</div></html>`);
 const comparisonPage=await browser.newPage({viewport:{width:1440,height:1000}});
 await comparisonPage.goto(new URL('file:///'+comparisonPath.replaceAll('\\','/')).href);
 await comparisonPage.screenshot({path:path.join(out,'../page-comparison.png'),fullPage:true});
 await comparisonPage.close();
 console.log('Captured all 13 routes at desktop and phone widths, plus the immediate first-visit hero.');
}finally{await browser?.close();server.kill();}
