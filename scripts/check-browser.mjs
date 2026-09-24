import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {spawn} from 'node:child_process';

// Install Playwright and its Chromium browser in CI. Local desktop runs may
// instead set PLAYWRIGHT_MODULE and CHROME_PATH to existing installations.
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const output=path.join(root,'outputs','browser-checks');
const port=Number(process.env.BROWSER_TEST_PORT||4173);
const origin=process.env.BROWSER_TEST_ORIGIN||`http://127.0.0.1:${port}`;
const base=`${origin.replace(/\/$/,'')}/E-portfolio/`;
const results=[];
let browser,server;
const record=(name,pass,details)=>{
  results.push({name,pass:!!pass,...(details===undefined?{}:{details})});
  if(!pass)console.error(`FAIL ${name}`,details||'');
};
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));

async function loadPlaywright(){
  if(process.env.PLAYWRIGHT_MODULE){
    const module=process.env.PLAYWRIGHT_MODULE;
    return import(path.isAbsolute(module)?pathToFileURL(module).href:module);
  }
  try{return await import('playwright');}
  catch(error){
    if(process.platform!=='win32')throw error;
    return import(pathToFileURL(path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs')).href);
  }
}

async function startServer(){
  if(process.env.BROWSER_TEST_ORIGIN)return;
  server=spawn(process.execPath,['scripts/serve.mjs'],{
    cwd:root,env:{...process.env,PORT:String(port)},windowsHide:true,stdio:['ignore','pipe','pipe']
  });
  let serverError='';
  server.stderr.on('data',chunk=>{serverError+=chunk});
  for(let i=0;i<80;i++){
    if(server.exitCode!==null)throw new Error(`Preview server exited: ${serverError}`);
    try{if((await fetch(base)).ok)return;}catch{}
    await delay(100);
  }
  throw new Error('Preview server did not become ready');
}

async function context(options={}){
  const ctx=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce',...options});
  // Public content must remain useful during an actual backend outage. The
  // successful read/replacement path is exercised by the app browser fixtures.
  await ctx.route('**/rest/v1/portfolio_public?*',route=>route.fulfill({status:503,contentType:'application/json',body:'{"message":"Browser test: backend unavailable"}'}));
  await ctx.route('**/rest/v1/contact_messages*',route=>route.abort());
  return ctx;
}

async function imageFailures(page){
  const imgs=page.locator('main img');
  for(let i=0;i<await imgs.count();i++){
    const img=imgs.nth(i);
    if(await img.isVisible())await img.scrollIntoViewIfNeeded();
  }
  await page.waitForFunction(()=>[...document.querySelectorAll('main img')].filter(i=>i.checkVisibility()).every(i=>i.complete),null,{timeout:10000}).catch(()=>{});
  return page.evaluate(()=>[...document.querySelectorAll('main img')].filter(i=>i.checkVisibility()&&(!i.complete||!i.naturalWidth)).map(i=>({src:i.getAttribute('src'),alt:i.alt})));
}

async function inspectPage(page){
  return page.evaluate(()=>{
    const headings=[...document.querySelectorAll('main h1,main h2,main h3,main h4,main h5,main h6')];
    const visible=el=>el.checkVisibility({checkOpacity:true,checkVisibilityCSS:true});
    const formControls=[...document.querySelectorAll('main input,main textarea,main select')].filter(el=>el.type!=='hidden'&&el.getAttribute('aria-hidden')!=='true'&&visible(el));
    return {
      width:innerWidth,documentWidth:document.documentElement.scrollWidth,
      mainTextLength:document.querySelector('main')?.innerText.trim().length||0,
      mainCount:document.querySelectorAll('main').length,h1Count:document.querySelectorAll('h1').length,
      headingVisible:!!document.querySelector('h1')&&visible(document.querySelector('h1')),
      headingSkips:headings.flatMap((el,i)=>i&&Number(el.tagName[1])>Number(headings[i-1].tagName[1])+1?[el.textContent.trim()]:[]),
      unlabelledControls:formControls.filter(el=>!el.labels?.length&&!el.getAttribute('aria-label')&&!el.getAttribute('aria-labelledby')).map(el=>el.outerHTML.slice(0,200)),
      imagesWithoutAlt:[...document.querySelectorAll('main img:not([alt])')].map(el=>el.src),
      navLinks:[...document.querySelectorAll('header nav a')].filter(visible).length,
      currentLinks:[...document.querySelectorAll('header a[aria-current="page"]')].map(el=>el.getAttribute('href')),
      horizontalOverflow:[...document.querySelectorAll('main *,header *,footer *')].filter(el=>{const r=el.getBoundingClientRect();return visible(el)&&r.width>0&&(r.right>innerWidth+1||r.left<-1)&&getComputedStyle(el).position!=='fixed'}).slice(0,10).map(el=>({tag:el.tagName,class:el.className,text:el.textContent.trim().slice(0,80)}))
    };
  });
}

try{
  await fs.mkdir(output,{recursive:true});
  await startServer();
  const {chromium}=await loadPlaywright();
  browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:process.platform==='win32'?{channel:'msedge'}:{})});
  const {routes}=await import('../src/views.js');
  const publicRoutes=Object.entries(routes).filter(([key])=>key!=='admin');
  // Keep the older public gallery URL covered even when it leaves the sitemap.
  if(!publicRoutes.some(([,meta])=>meta.path==='gallery/'))publicRoutes.push(['gallery',{path:'gallery/'}]);
  const widths=[320,375,390,430,768,1024,1280,1440];

  for(const [name,meta] of publicRoutes){
    const ctx=await context();const page=await ctx.newPage();
    const exceptions=[],badLocalResponses=[];
    page.on('pageerror',error=>exceptions.push(error.message));
    page.on('response',response=>{if(response.url().startsWith(origin)&&response.status()>=400)badLocalResponses.push({url:response.url(),status:response.status()})});
    const response=await page.goto(base+meta.path,{waitUntil:'load'});
    await page.evaluate(()=>document.fonts.ready);
    record(`${name}: direct GitHub Pages subpath loads`,response?.status()===200,response?.status());
    const semantics=await inspectPage(page);
    record(`${name}: one visible page heading and main landmark`,semantics.h1Count===1&&semantics.mainCount===1&&semantics.headingVisible,semantics);
    record(`${name}: labelled controls and image alternatives`,!semantics.unlabelledControls.length&&!semantics.imagesWithoutAlt.length,semantics.unlabelledControls.concat(semantics.imagesWithoutAlt));
    record(`${name}: heading levels do not skip`,!semantics.headingSkips.length,semantics.headingSkips);
    const imageErrors=await imageFailures(page);record(`${name}: visible images load`,!imageErrors.length,imageErrors);
    for(const width of widths){
      await page.setViewportSize({width,height:1000});await page.evaluate(()=>window.scrollTo(0,0));
      await page.waitForTimeout(50);
      const state=await inspectPage(page);
      record(`${name}: no horizontal overflow at ${width}px`,state.documentWidth<=width+1,{documentWidth:state.documentWidth,overflow:state.horizontalOverflow});
      if(width===390||width===1440)await page.screenshot({path:path.join(output,`${name}-${width}.png`),fullPage:true});
    }
    record(`${name}: no uncaught browser errors`,!exceptions.length,exceptions);
    record(`${name}: no failed local assets`,!badLocalResponses.length,badLocalResponses);
    console.log(`Checked ${name} at ${widths.length} widths`);
    await ctx.close();

    for(const mode of ['no-js','script-failure']){
      const fallback=await context({javaScriptEnabled:mode!=='no-js',viewport:{width:320,height:900}});
      if(mode==='script-failure')await fallback.route('**/src/app.js*',route=>route.abort());
      const p=await fallback.newPage();await p.goto(base+meta.path,{waitUntil:'load'});
      const fallbackMenu=p.locator('.fallback-navigation summary');
      if(await fallbackMenu.isVisible())await fallbackMenu.click();
      const state=await inspectPage(p);
      if(await fallbackMenu.isVisible())await fallbackMenu.click();
      record(`${name}: ${mode} preserves readable content`,state.mainTextLength>100&&state.headingVisible,state.mainTextLength);
      record(`${name}: ${mode} has usable navigation`,state.navLinks>=6,state.navLinks);
      record(`${name}: ${mode} fits 320px`,state.documentWidth<=321,state.documentWidth);
      if(name==='home'){
        const hero=await p.evaluate(()=>{const image=document.querySelector('.portrait'),video=document.querySelector('.hero-bg-video');return {portraitVisible:!!image&&image.checkVisibility({checkOpacity:true,checkVisibilityCSS:true})&&image.naturalWidth>0,portraitSrc:image?.getAttribute('src'),poster:video?.getAttribute('poster'),videoSource:video?.getAttribute('src')||''}});
        record(`home: ${mode} shows separate portrait and static poster`,hero.portraitVisible&&!!hero.poster&&hero.portraitSrc!==hero.poster&&!hero.videoSource,hero);
        await p.screenshot({path:path.join(output,`home-${mode}-320.png`),fullPage:false});
      }
      await fallback.close();
    }
  }

  // Existing isolated fixtures exercise actual application modules, including
  // successful Supabase replacement, late-read preservation, and owner editing
  // with mocked auth/uploads only. No real submissions or owner writes occur.
  const fixtures=['app.browser.html?case=home','app.browser.html?case=home-add','app.browser.html?case=home-remove','app.browser.html?case=resources','app.browser.html?case=contact','app.browser.html?case=teaching','app.browser.html?case=failure','motion.browser.html','recruiter.browser.html','navigation.browser.html'];
  for(const fixture of fixtures){
    const ctx=await context({reducedMotion:'no-preference',...(fixture.startsWith('navigation')?{viewport:{width:390,height:844}}:{})});const page=await ctx.newPage();
    await page.goto(`${origin}/tests/${fixture}`,{waitUntil:'load'});
    await page.waitForFunction(()=>['pass','fail'].includes(document.body.dataset.testResult),null,{timeout:15000}).catch(()=>{});
    const state=await page.evaluate(()=>({result:document.body.dataset.testResult,output:document.querySelector('#results')?.textContent}));
    record(`fixture: ${fixture}`,state.result==='pass',state.output);
    await ctx.close();
  }

  const keys=await context({viewport:{width:390,height:844}});const page=await keys.newPage();
  await page.goto(base,{waitUntil:'load'});
  await page.keyboard.press('Tab');
  record('keyboard: first focus exposes skip link',await page.evaluate(()=>document.activeElement.matches('.skip-link')&&document.activeElement.getBoundingClientRect().top>=0));
  await page.keyboard.press('Enter');
  record('keyboard: skip link reaches main',await page.evaluate(()=>document.activeElement.id==='main'));
  const toggle=page.locator('.menu-toggle');await toggle.focus();await page.keyboard.press('Enter');
  record('keyboard: menu opens and isolates background',await page.evaluate(()=>document.querySelector('#navigation').getAttribute('aria-modal')==='true'&&document.querySelector('main').inert&&document.querySelector('#navigation').contains(document.activeElement)));
  for(let i=0;i<12;i++){await page.keyboard.press('Tab');record(`keyboard: open menu contains focus ${i+1}`,await page.evaluate(()=>document.querySelector('#navigation').contains(document.activeElement)));}
  await page.keyboard.press('Escape');
  record('keyboard: Escape restores trigger and page access',await page.evaluate(()=>document.activeElement.matches('.menu-toggle')&&!document.querySelector('main').inert&&document.querySelector('.menu-toggle').getAttribute('aria-expanded')==='false'));
  record('keyboard: trigger has visible focus indicator',await toggle.evaluate(el=>{const s=getComputedStyle(el);return s.outlineStyle!=='none'&&parseFloat(s.outlineWidth)>=2}));
  record('reduced motion: hero starts static',await page.locator('.hero-bg-video').evaluate(v=>v.paused&&!v.getAttribute('src')));
  await keys.close();

  const motion=await context({reducedMotion:'no-preference'});const moving=await motion.newPage();
  await moving.goto(base,{waitUntil:'load'});
  await moving.locator('.hero-bg-video').evaluate(v=>v.play()).catch(error=>record('motion: hero media can play',false,error.message));
  await moving.emulateMedia({reducedMotion:'reduce'});
  await moving.waitForTimeout(100);
  record('reduced motion: changing preference pauses active hero video',await moving.locator('.hero-bg-video').evaluate(v=>v.paused));
  record('reduced motion: changing preference clears decorative animations',await moving.evaluate(()=>document.getAnimations().filter(a=>a.playState==='running').length===0));
  await motion.close();

  const failed=results.filter(result=>!result.pass);
  await fs.writeFile(path.join(output,'results.json'),JSON.stringify({base,checkedAt:new Date().toISOString(),checks:results.length,failed:failed.length,limitations:'Semantic and interaction checks are not a full WCAG conformance audit. No field Core Web Vitals measurement.',results},null,2));
  console.log(`${results.length-failed.length}/${results.length} browser checks passed. Report: outputs/browser-checks/results.json`);
  if(failed.length)process.exitCode=1;
}catch(error){console.error(error);process.exitCode=1;}
finally{await browser?.close();server?.kill();}
