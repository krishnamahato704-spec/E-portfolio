// Review artifacts are kept outside the production package.
import {chromium} from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
const out=path.resolve('outputs/redesign');
const browser=await chromium.launch({headless:true});
const reports=[];
const pages={home:'',experience:'teaching/',evidence:'resources/',democracy:'teaching/democracy/',credentials:'credentials/',resume:'resume/',about:'profile/',gallery:'gallery/',contact:'contact/'};
async function ready(page){
 await page.evaluate(()=>document.fonts.ready);
 for(const image of await page.locator('main img').all())if(await image.isVisible()){
  await image.scrollIntoViewIfNeeded();
  await image.evaluate(async i=>{i.loading='eager';await i.decode();});
 }
 await page.evaluate(()=>scrollTo(0,0));
 await page.waitForTimeout(150);
}
try{
 for(const [version,origin] of [['before','http://127.0.0.1:3001'],['after','http://127.0.0.1:3000']]){
  await fs.mkdir(path.join(out,version),{recursive:true});
  for(const width of [390,768,1440]){
   const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'}),page=await context.newPage();
   for(const [name,route] of Object.entries(pages)){
    if(version==='before'&&name!=='home'&&width===768)continue;
    await page.goto(`${origin}/E-portfolio/${route}`);await ready(page);
    await page.screenshot({path:path.join(out,version,`${name}-${width}.png`),fullPage:true});
    if(name==='home'){
     await page.screenshot({path:path.join(out,version,`hero-${width}.png`)});
     const metrics=await page.evaluate(()=>({width:innerWidth,documentWidth:document.documentElement.scrollWidth,resources:performance.getEntriesByType('resource').filter(r=>r.name.startsWith(location.origin)).map(r=>({name:r.name.split('/').pop(),bytes:r.transferSize,duration:r.duration})),images:[...document.querySelectorAll('img')].filter(i=>i.checkVisibility()).map(i=>({src:i.currentSrc.split('/').pop(),width:i.naturalWidth,height:i.naturalHeight})),videoRequested:!!document.querySelector('video')?.getAttribute('src')}));
     reports.push({version,width,...metrics});
     if(version==='after'&&width===1440){
      await page.locator('.site-header').evaluate(el=>el.style.visibility='hidden');
      for(const [key,selector] of [['selected-evidence','.selected-evidence'],['current-practice','.current-practice'],['classroom-moments','.home-records']])await page.locator(selector).screenshot({path:path.join(out,`after/${key}.png`)});
      await page.locator('.site-header').evaluate(el=>el.style.visibility='');
     }
    }
    if(version==='after'&&name==='home'&&width===390){await page.locator('.menu-toggle').click();await page.screenshot({path:path.join(out,'after/mobile-menu.png')});await page.keyboard.press('Escape');}
   }
   await context.close();
  }
 }
 await fs.writeFile(path.join(out,'local-performance.json'),JSON.stringify(reports,null,2));
 const cards=[['Portrait and identity','hero-1440.png'],['Recruiter reading on mobile','hero-390.png'],['Full homepage','home-1440.png'],['Mobile homepage','home-390.png'],['Teaching experience','experience-1440.png'],['Evidence library','evidence-1440.png'],['Democracy case study','democracy-1440.png'],['Credentials','credentials-1440.png'],['Résumé','resume-1440.png'],['About','about-1440.png'],['Gallery','gallery-1440.png'],['Contact','contact-1440.png']];
 const html=`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Krishna Mahato — Redesign review</title><style>body{margin:0;background:#f6f3eb;color:#193f3b;font:16px/1.6 system-ui,sans-serif}main{max-width:1400px;margin:auto;padding:32px}h1,h2{font-family:Georgia,serif;font-weight:400}h1{font-size:36px}section{margin-block:48px}.pair{display:grid;grid-template-columns:1fr 1fr;gap:24px}.pair figure{margin:0}.pair img{width:100%;height:auto;border:1px solid #dddcd6}figcaption{margin-bottom:12px}p{max-width:80ch}a{color:inherit}.keys{display:flex;gap:24px}.keys img{width:48%;height:auto;object-fit:contain}@media(max-width:650px){main{padding:20px}.pair{grid-template-columns:1fr}.keys{display:block}.keys img{width:100%}}</style><main><h1>Krishna Mahato · Portfolio redesign</h1><p>Before: commit 480c05b. After: the review branch. The source, schema 8 content, published release workflow and Owner Studio remain in the existing repository. These captures use reduced motion so the actual page is visible.</p><p>The Wix draft was discovered; direct editor automation could not initialize. This is the local design prototype. Approval is still needed before merging.</p><p><a href="http://127.0.0.1:3000/E-portfolio/">Open the interactive portfolio</a> · <a href="identity-results.json">Opening and gallery checks</a> · <a href="local-performance.json">Local resource measurements</a></p><section><h2>Opening sequence</h2><p>A finite paper/globe/timeline identity reveal, with skip and session handling. Reduced-motion visits and navigation show the portfolio immediately.</p><div class="keys"><img src="opening-timeline.png" alt="Timeline keyframe"><img src="opening-identity.png" alt="Name and educator identity keyframe"></div></section>${cards.map(([title,file])=>`<section><h2>${title}</h2><div class="pair"><figure><figcaption>Before</figcaption><img loading="lazy" src="before/${file}" alt="Before: ${title}"></figure><figure><figcaption>After</figcaption><img loading="lazy" src="after/${file}" alt="After: ${title}"></figure></div></section>`).join('')}</main></html>`;
 await fs.writeFile(path.join(out,'comparison.html'),html);
 console.log(`Captured before/after core routes, all three homepage widths, the mobile menu and local resource measurements. Review: ${path.join(out,'comparison.html')}`);
}finally{await browser.close();}
