import {chromium,firefox,webkit} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import {spawn} from 'node:child_process';
import fs from 'node:fs/promises';
import {routes} from '../src/views.js';
const port=4174,base=`http://127.0.0.1:${port}/E-portfolio/`;
const server=spawn(process.execPath,['scripts/serve.mjs','--dist'],{env:{...process.env,PORT:String(port)},windowsHide:true,stdio:'ignore'});
const results=[];
try{
 for(let i=0;i<100;i++){try{if((await fetch(base)).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
 const engines={chromium,firefox,webkit};
 for(const name of (process.env.TEST_ENGINES||'chromium,firefox,webkit').split(',')){
  if(!engines[name])throw Error('Unknown browser engine');
  const browser=await engines[name].launch({headless:true,...(name==='chromium'&&process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
  try{for(const width of [375,1440]){
   const ctx=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'});
   for(const [key,route] of Object.entries(routes)){
    const page=await ctx.newPage();
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(base+route.path,{waitUntil:'load'});
    await page.locator('h1').waitFor();
    const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
    const failures=result.violations.filter(v=>['serious','critical'].includes(v.impact)).map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)}));
    if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1))failures.push({id:'horizontal-overflow'});
    if(!await page.locator('h1').isVisible())failures.push({id:'hidden-main-heading'});
    if(errors.length)failures.push({id:'page-errors',errors});
    if(await page.locator('.menu-toggle').isVisible())await page.locator('.menu-toggle').click();
    const target=page.locator('.navigation-links a[href$="profile/"]');await target.click();
    await page.waitForURL('**/profile/',{timeout:5000}).catch(()=>{});
    if(!page.url().endsWith('/profile/'))failures.push({id:'menu-navigation'});
    results.push({engine:name,width,route:key,failures});
    if(failures.length)console.error(name,width,key,JSON.stringify(failures));
    await page.close();
   }
   await ctx.close();
  }}finally{await browser.close();}
 }
}finally{server.kill();await fs.mkdir('outputs/browser-checks',{recursive:true});await fs.writeFile('outputs/browser-checks/accessibility.json',JSON.stringify(results,null,2));}
console.log(`${results.length} cross-browser/accessibility route checks; ${results.filter(r=>r.failures.length).length} failed.`);
if(results.some(r=>r.failures.length))process.exitCode=1;
