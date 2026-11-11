import {chromium,webkit} from 'playwright';
import {spawn} from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';

const port=Number(process.env.FIRST_PAINT_TEST_PORT||4202);
const base=process.env.FIRST_PAINT_TEST_URL||`http://127.0.0.1:${port}/E-portfolio/`;
const output=path.join('outputs','opening-first-paint','current');
await fs.mkdir(output,{recursive:true});
const server=process.env.FIRST_PAINT_TEST_URL?null:spawn(process.execPath,['scripts/serve.mjs','--dist'],{env:{...process.env,PORT:String(port)},windowsHide:true,stdio:'ignore'});
const results=[],traces=[];
const check=(engine,size,name,pass,details)=>{
 results.push({engine,size,name,pass:!!pass,...(details===undefined?{}:{details})});
 if(!pass)console.error('FAIL',engine,size,name,details??'');
};
const destination=(replay=false,fragment='')=>{const url=new URL(base);if(replay)url.searchParams.set('intro','replay');url.hash=fragment;return url.href;};
const bootRoute='**/src/opening-entry.js*',appRoute='**/src/app.js*';

async function instrument(context){
 await context.addInitScript(()=>{
  const opaque=color=>!!color&&color!=='transparent'&&(!color.startsWith('rgba(')||Number(color.slice(color.lastIndexOf(',')+1,-1))>=.99);
  const trace=window.__openingFirstPaint={frames:[],handoff:false};
  trace.read=()=>{
   const stage=document.querySelector('.atlas-stage'),heading=document.querySelector('#opening-name'),main=document.querySelector('#main');
   if(!stage)return null;
   const before=getComputedStyle(stage,'::before'),bounds=stage.getBoundingClientRect(),copy=stage.querySelector('.hero-content');
   const copyZ=copy?Number(getComputedStyle(copy).zIndex)||0:0;
   const pending=document.documentElement.getAttribute('data-opening-pending')==='true';
   const cover=pending&&before.content!=='none'&&before.display!=='none'&&before.visibility==='visible'&&Number(before.opacity)>=.99&&opaque(before.backgroundColor)&&['absolute','fixed'].includes(before.position)&&Number(before.zIndex)>copyZ&&parseFloat(before.top)===0&&parseFloat(before.left)===0&&before.clipPath==='none'&&before.transform==='none'&&parseFloat(before.width)>=bounds.width-1&&parseFloat(before.height)>=bounds.height-1;
   const overlay=document.querySelector('.portfolio-opening'),paper=overlay?.querySelector('.opening-iris-paper');
   const active=stage.closest('.opening-hero')?.dataset.openingActive==='true'&&!!overlay;
   const nativePainted=active&&!!paper&&opaque(getComputedStyle(paper).backgroundColor);
   return {time:performance.now(),pending,boot:window.__portfolioOpeningBoot?.state||'missing',cover,nativePainted,active,semanticHeading:!!heading&&heading.checkVisibility({checkVisibilityCSS:true,checkOpacity:true})&&!heading.closest('[inert],[aria-hidden="true"]')&&!main?.inert,coverPointerEvents:before.pointerEvents,coverZ:before.zIndex};
  };
  const frame=()=>{
   const styles=document.querySelector('link[rel="stylesheet"][href*="src/styles.css"]');
   if(styles?.sheet&&!trace.handoff){
    const snapshot=trace.read();
    if(snapshot){trace.frames.push(snapshot);if(snapshot.nativePainted)trace.handoff=true;}
   }
   if(!trace.handoff)requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
 });
}

// Hold the actual app response until the pre-app frame has been inspected.
// A fixed network sleep alone can expire during slow screenshot work.
async function gateApp(page,url,{reload=false}={}){
 await page.unroute(appRoute);
 let release;
 const gate=new Promise(resolve=>{release=resolve;});
 await page.route(appRoute,async route=>{
  const mode=await gate;
  if(mode==='error')await route.fulfill({status:200,contentType:'text/javascript',body:'throw new Error("first-paint fixture app failure");'});
  else await route.continue();
 });
 const requested=page.waitForRequest(request=>/\/src\/app\.js(?:\?|$)/.test(request.url()));
 const navigation=(reload?page.reload({waitUntil:'domcontentloaded'}):page.goto(url,{waitUntil:'domcontentloaded'})).then(()=>null,error=>error);
 await requested;
 await page.waitForFunction(()=>document.querySelector('.atlas-stage')&&document.querySelector('link[rel="stylesheet"][href*="src/styles.css"]')?.sheet);
 await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
 return {release,async finish(mode){release(mode);const error=await navigation;if(error)throw error;await page.unroute(appRoute);}};
}

const snapshot=page=>page.evaluate(()=>window.__openingFirstPaint.read());
async function handoff(page,engine,size,label){
 await page.waitForFunction(()=>window.__openingFirstPaint.handoff,null,{timeout:5000});
 const trace=await page.evaluate(()=>({frames:window.__openingFirstPaint.frames,handoff:window.__openingFirstPaint.handoff}));
 traces.push({engine,size,label,...trace});
 const gaps=trace.frames.filter(frame=>!frame.cover&&!frame.nativePainted);
 check(engine,size,`${label}: no uncovered hero frame precedes the native opening`,trace.handoff&&trace.frames.length>0&&gaps.length===0,{frames:trace.frames.length,uncovered:gaps.slice(0,4)});
 await page.waitForFunction(()=>document.querySelector('.opening-hero')?.dataset.openingState==='completed',null,{timeout:5000});
 const end=await snapshot(page);
 check(engine,size,`${label}: the prepaint cover hands off and clears completely`,!end.pending&&!end.cover&&!await page.locator('.portfolio-opening').count()&&end.semanticHeading&&end.boot==='handed-off',end);
}

async function ordinary(page,engine,size,label){
 const value=await snapshot(page);
 check(engine,size,`${label}: ordinary semantic home remains visible without a startup cover`,!value.pending&&!value.cover&&!value.active&&value.semanticHeading,value);
}

try{
 let ready=false;
 for(let attempt=0;attempt<80;attempt++){try{if((await fetch(base)).ok){ready=true;break;}}catch{}await new Promise(resolve=>setTimeout(resolve,100));}
 if(!ready)throw Error(`First-paint test server is unavailable: ${base}`);
 const engines=(process.env.FIRST_PAINT_TEST_ENGINES||'chromium,webkit').split(',');
 for(const engine of engines){
  const browser=await {chromium,webkit}[engine].launch({headless:true});
  try{
   for(const [size,viewport] of [['desktop',{width:1440,height:1000}],['phone',{width:390,height:844}]].filter(([size])=>!process.env.FIRST_PAINT_TEST_SIZES||process.env.FIRST_PAINT_TEST_SIZES.split(',').includes(size))){
    console.log('Checking first paint in',engine,size);
    const context=await browser.newContext({viewport,reducedMotion:'no-preference'});await instrument(context);
    const page=await context.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));
    const first=await gateApp(page,destination());
    await page.waitForTimeout(700);
    const before=await snapshot(page);
    check(engine,size,'A delayed app has a covered homepage or an opening already in progress',before.cover||before.nativePainted,before);
    check(engine,size,'The decorative startup keeps the h1 semantic and main interactive',before.semanticHeading&&await page.evaluate(()=>{const overlay=document.querySelector('.portfolio-opening');return !document.querySelector('#main').inert&&(overlay?getComputedStyle(overlay).pointerEvents==='none':getComputedStyle(document.querySelector('.atlas-stage'),'::before').pointerEvents==='none');}),before);
    // WebKit's font-ready promise can wait for DOMContentLoaded, which this
    // fixture intentionally blocks. Its first-paint proof uses the RAF trace;
    // Chromium additionally records the opaque pre-app cover as a PNG.
    if(engine==='chromium')await page.screenshot({path:path.join(output,`${engine}-${size}-before-app.png`)});
    await first.finish();
    await handoff(page,engine,size,'First visit');

    const repeat=await gateApp(page,destination(),{reload:true});
    await ordinary(page,engine,size,'Same-session repeat');await repeat.finish();await page.waitForTimeout(180);
    check(engine,size,'A same-session repeat does not introduce a late opening',!await page.locator('.portfolio-opening').count()&&!await page.evaluate(()=>window.__openingFirstPaint.handoff));
    const replay=await gateApp(page,destination(true));
    const forced=await snapshot(page);
    check(engine,size,'An explicit replay request starts before deferred app code',forced.semanticHeading&&(forced.cover||forced.nativePainted),forced);
    await replay.finish();await handoff(page,engine,size,'Explicit replay');
    check(engine,size,'Eligible entry paths produce no browser exceptions',errors.length===0,errors);
    await context.close();

    for(const mode of ['reduced','fragment','data','slow']){
     const ctx=await browser.newContext({viewport,reducedMotion:mode==='reduced'?'reduce':'no-preference'});await instrument(ctx);
     if(['data','slow'].includes(mode))await ctx.addInitScript(mode=>Object.defineProperty(navigator,'connection',{configurable:true,value:{saveData:mode==='data',effectiveType:mode==='slow'?'2g':'4g'}}),mode);
     const p=await ctx.newPage(),gate=await gateApp(p,destination(false,mode==='fragment'?'teaching-evidence':''));
     await ordinary(p,engine,size,mode);await gate.finish();await p.waitForTimeout(180);
     check(engine,size,`${mode}: delayed app code does not add an opening later`,!await p.locator('.portfolio-opening').count()&&!await p.evaluate(()=>window.__openingFirstPaint.handoff));
     await ctx.close();
    }

    const plain=await browser.newContext({viewport,javaScriptEnabled:false}),plainPage=await plain.newPage();
    await plainPage.goto(destination());
    check(engine,size,'No JavaScript retains the ordinary page and native links',await plainPage.locator('#opening-name').isVisible()&&await plainPage.locator('.hero-copy .actions a[href]').count()>=2&&await plainPage.evaluate(()=>!document.documentElement.hasAttribute('data-opening-pending')&&['none','normal'].includes(getComputedStyle(document.querySelector('.atlas-stage'),'::before').content)));
    await plain.close();

    const missing=await browser.newContext({viewport});await instrument(missing);await missing.route(bootRoute,route=>route.abort('failed'));
    const m=await missing.newPage(),missingGate=await gateApp(m,destination());
    await ordinary(m,engine,size,'Unavailable head startup script');await missingGate.finish();await m.waitForTimeout(180);
    check(engine,size,'An unavailable startup script cannot trigger a late automatic overlay',!await m.locator('.portfolio-opening').count()&&!await m.evaluate(()=>window.__openingFirstPaint.handoff));
    await missing.close();

    const broken=await browser.newContext({viewport});await instrument(broken);
    await broken.route(bootRoute,async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text())+'\nthrow new Error("first-paint fixture entry failure");'});});
    const b=await broken.newPage(),failureErrors=[];b.on('pageerror',error=>failureErrors.push(error.message));
    const brokenGate=await gateApp(b,destination());await brokenGate.finish();
    await b.waitForFunction(()=>!document.documentElement.hasAttribute('data-opening-pending'),null,{timeout:5000});
    const failed=await snapshot(b);
    check(engine,size,'An entry script error releases the cover and keeps home readable',!failed.cover&&failed.semanticHeading&&failed.boot==='failed'&&!await b.locator('.portfolio-opening').count()&&failureErrors.length===1&&failureErrors[0]==='first-paint fixture entry failure',{...failed,errors:failureErrors});
    await broken.close();

    const stalled=await browser.newContext({viewport});await instrument(stalled);
    let releaseStyles;
    const stylesGate=new Promise(resolve=>{releaseStyles=resolve;});
    await stalled.route('**/src/styles.css*',async route=>{await stylesGate;await route.continue();});
    const s=await stalled.newPage();
    await s.goto(destination(),{waitUntil:'commit'});
    let expired=false;
    // A render-blocking stylesheet can suspend RAF polling; the watchdog uses
    // wall-clock timers, so inspect it on the same kind of bounded timer.
    try{await s.waitForFunction(()=>window.__portfolioOpeningBoot?.state==='expired',null,{timeout:5500,polling:100});expired=true;}catch{}
    const stalledState=await s.evaluate(()=>({boot:window.__portfolioOpeningBoot?.state,pending:document.documentElement.hasAttribute('data-opening-pending'),ready:document.readyState,hidden:document.hidden}));
    releaseStyles();
    await s.waitForFunction(()=>document.querySelector('.atlas-stage')&&document.querySelector('link[rel="stylesheet"][href*="src/styles.css"]')?.sheet);
    await s.waitForLoadState('domcontentloaded');
    check(engine,size,'A genuinely stalled stylesheet triggers the finite startup watchdog',expired,stalledState);
    await ordinary(s,engine,size,'A stylesheet startup stall expires safely');
    await s.waitForTimeout(180);
    check(engine,size,'A stylesheet arriving after expiry cannot introduce a late opening',!await s.locator('.portfolio-opening').count()&&!await s.evaluate(()=>window.__openingFirstPaint.handoff));
    await stalled.close();
   }
  }finally{await browser.close();}
 }
}finally{
 server?.kill();
 await fs.writeFile(path.join(output,'checks.json'),JSON.stringify({base,checks:results.length,failed:results.filter(result=>!result.pass).length,results,traces},null,2));
}
console.log(`${results.filter(result=>result.pass).length}/${results.length} opening first-paint checks passed.`);
if(results.some(result=>!result.pass))process.exitCode=1;
