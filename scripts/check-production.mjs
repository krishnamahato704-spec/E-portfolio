import fs from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';
import { defaultContent } from '../src/content.js';

const base = process.env.BROWSER_TEST_ORIGIN || 'http://127.0.0.1:4179/E-portfolio/';
const output = 'outputs/production-checks';
const results = [];
const check = (name, pass, detail) => { results.push({ name, pass: Boolean(pass), detail }); if (!pass) console.error('FAIL', name, detail ?? ''); else if(results.length % 10 === 0) console.log(`Completed ${results.length} browser checks`); };
const ids = ['hero','about','journey','teaching','tlm-exhibition','action-research','credentials','visual-gallery','contact'];
let browser, server;
await fs.mkdir(output, { recursive: true });
try {
  if (!process.env.BROWSER_TEST_ORIGIN) {
    server = spawn(process.execPath, ['node_modules/vite/bin/vite.js','preview','--host','127.0.0.1','--port','4179','--strictPort'], { stdio:'pipe', windowsHide: true });
    let ready = false;
    for (let i=0;i<50;i++) { try { if ((await fetch(base)).ok) { ready=true; break; } } catch {} await new Promise(r=>setTimeout(r,100)); }
    if (!ready) throw new Error('Production preview did not start');
  }
  browser = await chromium.launch({ executablePath:process.env.CHROME_PATH, args:['--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const context = await browser.newContext({viewport:{width:1440,height:900},deviceScaleFactor:2});
  // Count actual React commits through the standard devtools hook; no instrumentation ships in the site.
  await context.addInitScript(() => {
    Object.defineProperty(navigator,'hardwareConcurrency',{value:8});
    window.__commits = 0;
    window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = { supportsFiber:true, inject:()=>1, onCommitFiberRoot:(_id,root)=>{if(root.containerInfo?.id==='root')window.__commits++;}, onCommitFiberUnmount:()=>{}, onPostCommitFiberRoot:()=>{} };
  });
  const page = await context.newPage();
  await context.route('**/rest/v1/portfolio_public**',route=>route.fulfill({json:[{content:defaultContent,updated_at:'2026-09-23'}]}));
  const errors=[];
  page.on('pageerror', e=>errors.push(e.message));
  page.on('response', r=>{ if(r.status()>=400 && r.url().startsWith(base)) errors.push(`${r.status()} ${r.url()}`); });
  await page.goto(base);
  await page.locator('canvas').waitFor();
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(2500);
  check('Nine semantic portfolio sections',await page.locator('main > section').count()===9);
  check('One visible main heading',await page.locator('h1:visible').count()===1);
  check('Production HUD removed',await page.locator('.camera-hud').count()===0);
  const framing = await page.evaluate(()=>({text:document.querySelector('.hero-content').getBoundingClientRect().right,scene:document.querySelector('canvas').getBoundingClientRect().left}));
  check('Desktop text and 3D occupy separate columns',framing.text<=framing.scene,framing);
  check('Desktop pixel ratio capped at 1.5',await page.locator('canvas').evaluate(el=>el.width/el.getBoundingClientRect().width<=1.501));
  const before = await page.evaluate(()=>window.__commits);
  await page.waitForTimeout(650);
  const after = await page.evaluate(()=>window.__commits);
  check('Animating scene causes no page React commits while idle',before>0 && after===before,{before,after});
  await page.screenshot({path:`${output}/desktop-hero.png`});
  const video=page.locator('video');
  const videoState=await video.evaluate(v=>({muted:v.muted,inline:v.playsInline,src:v.currentSrc,paused:v.paused,width:v.videoWidth,height:v.videoHeight}));
  check('Existing optimized personal video restored',videoState.src.endsWith('hero-video-opt.mp4')&&videoState.muted&&videoState.inline,videoState);
  await page.getByRole('button',{name:'Pause background video'}).click();
  check('Video pause control works',await video.evaluate(v=>v.paused));
  await page.getByRole('button',{name:'Play background video'}).click();
  for (let i=1;i<ids.length;i++) {
    await page.locator(`#${ids[i]}`).evaluate(el=>window.scrollTo({top:el.getBoundingClientRect().top+scrollY+280,behavior:'instant'}));
    await page.waitForFunction(index => document.querySelector('#scroll-root')?.getAttribute('data-section') === String(index), i, {timeout:5000}).catch(() => {});
    const currentSection=await page.locator('#scroll-root').getAttribute('data-section');
    check(`Section ${ids[i]} tracks the actual scroll position`,currentSection===String(i),{expected:i,actual:currentSection});
    await page.screenshot({path:`${output}/desktop-${ids[i]}.png`});
  }
  check('Offscreen hero video pauses',await video.evaluate(v=>v.paused));
  await page.locator('img').evaluateAll(images=>images.forEach(img=>img.loading='eager'));
  await page.waitForFunction(()=>Array.from(document.images).every(img=>img.complete));
  check('All portfolio image previews load',await page.locator('img').evaluateAll(imgs=>imgs.every(img=>img.naturalWidth>0)));
  const localLinks=await page.locator('a[href]').evaluateAll(links=>[...new Set(links.map(a=>a.href).filter(url=>url.startsWith(location.origin)&&!url.includes('#')))]);
  for(const url of localLinks) {const response=await page.request.get(url);check(`Document link ${new URL(url).pathname}`,response.ok()&&!response.headers()['content-type']?.includes('text/html'));}
  for(const route of ['admin/','profile/','teaching/democracy/','src/admin.js']) {
    const response=await page.request.get(new URL(route,base).href); check(`Preserved route ${route}`,response.ok());
  }
  // Every viewer traps focus, closes with Escape, and returns focus to its opener.
  const openers=[page.getByRole('button',{name:'Explore Lesson Case Study'}), page.getByRole('button',{name:'Explore TLM Case Study'}), page.locator('.stage-evidence-card').first(), page.getByRole('button',{name:/Inspect Document/}).first(), page.locator('.gallery-card').first()];
  for(let i=0;i<openers.length;i++) {
    const opener=openers[i]; await opener.focus(); await opener.press('Enter');
    const modal=page.locator('dialog[open]'); await modal.waitFor();
    check(`Viewer ${i+1} has a labelled native dialog`,Boolean(await modal.getAttribute('aria-labelledby')));
    for(let n=0;n<14;n++) await page.keyboard.press('Tab');
    check(`Viewer ${i+1} contains keyboard focus`,await page.evaluate(()=>Boolean(document.activeElement?.closest('dialog[open]'))));
    if(i===4) { const title=await modal.locator('h2').textContent(); await page.keyboard.press('ArrowRight'); check('Gallery arrow navigation changes image',await modal.locator('h2').textContent()!==title); }
    await page.screenshot({path:`${output}/viewer-${i+1}.png`});
    await page.keyboard.press('Escape');
    check(`Viewer ${i+1} closes with Escape`,await page.locator('dialog[open]').count()===0);
    check(`Viewer ${i+1} restores opener focus`,await opener.evaluate(el=>el===document.activeElement));
  }
  check('No production runtime errors or missing local responses',errors.length===0,errors);
  const hidden=await page.evaluate(async()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));await new Promise(r=>setTimeout(r,100));return document.querySelector('video').paused;});
  check('Hidden tab pauses video',hidden);
  await context.close();
  for(const width of [390,768,1024]) {
    const mobile=await browser.newPage({viewport:{width,height:844},deviceScaleFactor:3});
    await mobile.goto(base); await mobile.waitForTimeout(800);
    check(`${width}px has no horizontal overflow`,await mobile.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    await mobile.getByRole('button',{name:'Menu',exact:true}).click();
    check(`${width}px menu opens`,await mobile.locator('#portfolio-nav').isVisible());
    await mobile.locator('#portfolio-nav').getByRole('link',{name:'About',exact:true}).click();
    check(`${width}px menu closes after navigation`,await mobile.getByRole('button',{name:'Menu',exact:true}).getAttribute('aria-expanded')==='false');
    if(width===390) {
      check('Phone does not download autoplay video',!await mobile.locator('video').getAttribute('src'));
      check('Phone pixel ratio capped at 1',await mobile.locator('canvas').evaluate(el=>el.width/el.getBoundingClientRect().width<=1.001));
    }
    await mobile.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
    await mobile.screenshot({path:`${output}/width-${width}.png`});
    await mobile.close();
  }
  const reduced=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});
  await reduced.goto(base); await reduced.locator('canvas').waitFor();
  check('Reduced motion uses a poster without loading video',!await reduced.locator('video').getAttribute('src'));
  check('Reduced motion disables smooth scrolling',await reduced.evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior)==='auto');
  await reduced.close();
  const poster=await browser.newPage();
  await poster.addInitScript(()=>{Object.defineProperty(navigator,'hardwareConcurrency',{value:8});Object.defineProperty(HTMLMediaElement.prototype,'play',{value(){return Promise.reject(new DOMException('Autoplay denied','NotAllowedError'));}});});
  await poster.goto(base); await poster.getByRole('button',{name:'Play background video'}).waitFor();
  check('Blocked autoplay retains poster and a play control',await poster.locator('video').getAttribute('poster')!==null);
  await poster.close();
  const noVideo=await browser.newPage();
  await noVideo.addInitScript(()=>Object.defineProperty(navigator,'hardwareConcurrency',{value:8}));
  await noVideo.route('**/hero-video-opt.mp4',route=>route.fulfill({status:404,body:'Missing'}));
  await noVideo.goto(base); await noVideo.waitForFunction(()=>!document.querySelector('video').getAttribute('src'));
  check('Missing video retains its poster and readable hero',Boolean(await noVideo.locator('video').getAttribute('poster')) && await noVideo.locator('h1').isVisible());
  await noVideo.close();
  const saveData=await browser.newPage();
  await saveData.addInitScript(()=>Object.defineProperty(navigator,'connection',{value:{saveData:true}}));
  await saveData.goto(base);
  check('Save-Data avoids downloading video',!await saveData.locator('video').getAttribute('src'));
  await saveData.close();
  const offline=await browser.newPage({reducedMotion:'reduce'}); await offline.route('**/rest/v1/portfolio_public**',route=>route.abort());
  await offline.goto(base); check('Supabase unavailable keeps saved portfolio readable',await offline.locator('h1').textContent()==='Krishna Mahato');
  await offline.close();
  const legacy=await browser.newPage({reducedMotion:'reduce'});
  await legacy.route('**/rest/v1/portfolio_public**',route=>route.fulfill({json:[{content:{schemaVersion:4,profile:{name:'Compatibility test',availability:'Owner availability'},gallery:null,qualifications:null},updated_at:'2026-01-01'}]}));
  await legacy.goto(base); await legacy.getByRole('heading',{name:'Compatibility test',exact:true}).waitFor();
  check('Old Supabase records merge safe defaults and preserve owner edits',await legacy.locator('main > section').count()===9 && (await legacy.locator('#contact').textContent()).includes('Owner availability'));
  await legacy.close();
  const noGL=await browser.newPage();
  await noGL.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return type.includes('webgl')?null:original.call(this,type,...args);};});
  await noGL.goto(base); await noGL.locator('.scene-fallback').waitFor();
  check('WebGL failure preserves all HTML sections and links',await noGL.locator('main > section').count()===9);
  await noGL.close();
  const broken=await browser.newPage({reducedMotion:'reduce'}); await broken.route('**/assets/certificate-1.webp',route=>route.fulfill({status:404,body:'Missing'}));
  await broken.goto(base); await broken.locator('#credentials').scrollIntoViewIfNeeded(); await broken.locator('.image-unavailable').first().waitFor();
  check('Missing evidence image shows an accessible explanation',await broken.locator('.image-unavailable').first().getAttribute('role')==='img');
  await broken.close();
  const loss=await browser.newPage({reducedMotion:'reduce'}); await loss.goto(base); await loss.locator('canvas').waitFor(); await loss.waitForTimeout(400);
  await loss.locator('canvas').evaluate(el=>el.dispatchEvent(new Event('webglcontextlost',{cancelable:true})));
  await loss.locator('.scene-fallback').waitFor();
  check('Lost WebGL context leaves content usable',await loss.locator('main > section').count()===9);
} catch(error) { check('Production browser run completed',false,error.stack); }
finally {
  await browser?.close(); server?.kill();
  await fs.writeFile(`${output}/results.json`,JSON.stringify(results,null,2));
  const failed=results.filter(r=>!r.pass);
  console.log(`${results.length-failed.length}/${results.length} production browser checks passed.`);
  if(failed.length)process.exitCode=1;
}
