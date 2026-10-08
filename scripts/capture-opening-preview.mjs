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
  const context=await browser.newContext({viewport:{width,height:1000}}),page=await context.newPage();
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.route('**/src/app.js*',async route=>{await new Promise(r=>setTimeout(r,900));await route.continue();});
  const loading=page.goto(base+'?intro=1');
  await page.locator('html.opening-pending .hero-film').waitFor({state:'attached'});
  await page.waitForFunction(()=>getComputedStyle(document.querySelector('.hero-film')).position==='fixed');
  const firstPaintFilm=await page.evaluate(()=>!document.querySelector('h1').checkVisibility({checkVisibilityCSS:true})&&document.querySelector('.hero-film').getBoundingClientRect().width>=innerWidth);
  if(engine==='chromium')await page.screenshot({path:path.join(out,`first-frame-${width}.png`)});
  await loading;await page.unroute('**/src/app.js*');await page.locator('.intro-running').waitFor();
  if(engine==='chromium')await page.screenshot({path:path.join(out,`film-${width}.png`)});
  await page.waitForTimeout(2800);
  if(engine==='chromium')await page.screenshot({path:path.join(out,`name-${width}.png`)});
  // Inspect the fully revealed name, with its animation held still during axe.
  await page.locator('.identity-intro').evaluate(el=>el.getAnimations({subtree:true}).forEach(a=>{a.pause();a.currentTime=3000;}));
  const introScan=await new AxeBuilder({page}).include('.identity-intro').withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
  await page.locator('.identity-intro').evaluate(el=>el.getAnimations({subtree:true}).forEach(a=>a.play()));
  await page.locator('.identity-intro').waitFor({state:'detached',timeout:10000});
  await page.waitForTimeout(400);
  if(engine==='chromium')await page.screenshot({path:path.join(out,`home-film-${width}.png`)});
  const homeScan=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
  const failures=[...introScan.violations,...homeScan.violations].filter(v=>['serious','critical'].includes(v.impact)).map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,details:n.failureSummary}))}));
  if(!firstPaintFilm)failures.push({id:'homepage-before-film'});
  if(errors.length)failures.push({id:'page-errors',errors});
  checks.push({engine,width,firstPaintFilm,failures});
  await context.close();
 }}finally{await browser.close();}
}
await fs.writeFile(path.join(out,'accessibility.json'),JSON.stringify(checks,null,2));
await fs.writeFile(path.join(out,'index.html'),`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Restored portfolio opening</title><style>body{margin:0;padding:24px;background:#fffaf4;color:#382f2a;font:16px/1.5 system-ui}main{max-width:1400px;margin:auto}a{color:#78432e}.frames{display:grid;grid-template-columns:repeat(4,1fr);gap:18px}figure{margin:0}img{width:100%;border:1px solid #e8ddcf}figcaption{padding-block:10px}@media(max-width:700px){.frames{grid-template-columns:1fr}}</style><main><h1>Video → name reveal → homepage</h1><p><a href="${base}?intro=1">Replay the local opening</a>. Choose “Play with voice &amp; piano” to hear the supplied recording. This preview has not been deployed.</p>${[1440,390].map(width=>`<h2>${width===1440?'Desktop':'Phone'}</h2><div class="frames">${[['first-frame','First screen while video loads'],['film','Video starts'],['name','Your name appears'],['home-film','Homepage opens']].map(([name,label])=>`<figure><img src="${name}-${width}.png" alt="${label}"><figcaption>${label}</figcaption></figure>`).join('')}</div>`).join('')}</main></html>`);
console.log(JSON.stringify(checks,null,2));
if(checks.some(c=>c.failures.length))process.exitCode=1;
