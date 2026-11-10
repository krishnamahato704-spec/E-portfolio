import {chromium,webkit} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import {spawn} from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import {routes} from '../src/view-helpers.js';

const root=path.resolve(import.meta.dirname,'..');
const output=path.join(root,'outputs','interior-design');
const baselineArgument=process.argv.find(argument=>argument.startsWith('--baseline-dir='))?.slice(15);
const baselineDirectory=path.resolve(baselineArgument||path.resolve(root,'../../work/interior-design-baseline'));
const origin='http://127.0.0.1:4199';
const base=origin+'/E-portfolio/';
const captureOnly=process.argv.includes('--capture-only');
const requested=process.argv.find(argument=>argument.startsWith('--routes='))?.slice(9).split(',');
const selected=['profile','teaching','resources','credentials','gallery','resume','contact','democracy','pehchaan','observation'].filter(route=>!requested||requested.includes(route));
const fullPageRoutes=new Set(['profile','teaching','resources','credentials','resume','contact']);
const engines=(process.env.INTERIOR_TEST_ENGINES||'chromium,webkit').split(',');
const results=[],observations=[];
const record=(engine,route,name,pass,details)=>{
 if(captureOnly)return;
 results.push({engine,route,name,pass:!!pass,...(details===undefined?{}:{details})});
 if(!pass)console.error('FAIL '+engine+' '+route+': '+name,JSON.stringify(details));
};
const missingEntries=(before,after)=>{
 const used=new Set();
 const contains=(expected,actual)=>expected&&typeof expected==='object'
  ?!!actual&&Object.keys(expected).every(key=>contains(expected[key],actual[key]))
  :expected===actual;
 return before.filter(item=>{
  const index=after.findIndex((candidate,index)=>!used.has(index)&&contains(item,candidate));
  if(index===-1)return true;
  used.add(index);return false;
 });
};

async function documentMetadata(page,html,url){
 return page.evaluate(({html,url})=>{
  const doc=new DOMParser().parseFromString(html,'text/html'),main=doc.querySelector('main');
  const normal=value=>value.replace(/\s+/g,' ').trim();
  const destination=value=>{
   if(!value)return '';
   const parsed=new URL(value,url);parsed.searchParams.delete('v');
   return parsed.origin===new URL(url).origin?parsed.pathname+parsed.search+parsed.hash:parsed.href;
  };
  const attributes=(element,names)=>Object.fromEntries(names.filter(name=>element.hasAttribute(name)).map(name=>[name,element.getAttribute(name)]));
  const hooks=[...main.querySelectorAll('*')].flatMap(element=>{
   const attrs=[...element.attributes].filter(attribute=>attribute.name.startsWith('data-')||['aria-controls','aria-labelledby','for'].includes(attribute.name));
   return attrs.length?[{tag:element.tagName,...(element.id?{id:element.id}:{}),...(element.hasAttribute('name')?{name:element.getAttribute('name')}:{}),attrs:Object.fromEntries(attrs.map(attribute=>[attribute.name,attribute.value]))}]:[];
  });
  return {
   ids:[...main.querySelectorAll('[id]')].map(element=>element.id),
   inputs:[...main.querySelectorAll('input,textarea,select')].map(element=>({tag:element.tagName,attrs:attributes(element,['id','name','type','autocomplete','required','maxlength','pattern','min','max','rows','aria-controls'])})),
   hooks,
   links:[...main.querySelectorAll('a[href]')].map(element=>({href:destination(element.getAttribute('href')),attrs:attributes(element,['download','data-viewer','data-original-url','data-title','target','rel'])})),
   metadata:[...main.querySelectorAll('meta')].map(element=>attributes(element,['itemprop','content'])),
   blocks:[...main.querySelectorAll('h1,h2,h3,h4,p,li,dd,figcaption')].filter(element=>!element.closest('[aria-hidden="true"],.page-atmosphere,.study-interval')).map(element=>normal(element.textContent)).filter(text=>text.length>=40),
   text:normal(main.textContent),
   heading:normal(main.querySelector('h1')?.textContent||''),
  };
 },{html,url});
}

async function inspect(page){
 return page.evaluate(()=>{
  const get=selector=>document.querySelector(selector);
  const visible=element=>!!element&&element.checkVisibility({checkOpacity:true,checkVisibilityCSS:true});
  const rect=element=>{if(!element)return null;const box=element.getBoundingClientRect();return {top:box.top,bottom:box.bottom,left:box.left,right:box.right,width:box.width,height:box.height};};
  const main=get('main'),heading=main?.querySelector('h1'),header=get('.site-header'),bar=get('.mobile-shortcuts');
  const glyphs=element=>{
   const range=document.createRange();range.selectNodeContents(element);
   return [...range.getClientRects()].filter(box=>box.width&&box.height).map(box=>({top:box.top,bottom:box.bottom,left:box.left,right:box.right}));
  };
  const headingBoxes=heading?glyphs(heading):[];
  const headingClips=[];
  for(let ancestor=heading?.parentElement;ancestor&&ancestor!==document.body;ancestor=ancestor.parentElement){
   const style=getComputedStyle(ancestor),box=rect(ancestor);
   const horizontal=/hidden|clip/.test(style.overflowX),vertical=/hidden|clip/.test(style.overflowY);
   if(headingBoxes.some(glyph=>(horizontal&&(glyph.left<box.left-2||glyph.right>box.right+2))||(vertical&&(glyph.top<box.top-2||glyph.bottom>box.bottom+2))))headingClips.push({class:ancestor.className,box});
  }
  const blockers=[...document.querySelectorAll('.site-header a,.site-header button,.site-header summary')].filter(visible).map(rect);
  const headingBlocked=headingBoxes.some(box=>blockers.some(block=>box.left<block.right&&box.right>block.left&&box.top<block.bottom&&box.bottom>block.top));
  const prose=[...main.querySelectorAll('p,li,dd')].filter(element=>visible(element)&&element.textContent.trim().length>=80&&!element.closest('figcaption,.page-atmosphere,.study-interval,[aria-hidden="true"]')&&!element.matches('.eyebrow,.small,.card-meta,.film-status,.collection-count')&&!element.querySelector('p,li,dd'));
  const smallProse=prose.filter(element=>parseFloat(getComputedStyle(element).fontSize)<16).map(element=>({class:element.className,size:getComputedStyle(element).fontSize,text:element.textContent.trim().slice(0,130)}));
  const formFields=[...main.querySelectorAll('input,textarea,select')].filter(element=>visible(element)&&element.getAttribute('aria-hidden')!=='true'&&element.type!=='hidden');
  const labels=formFields.filter(element=>!element.labels?.length&&!element.getAttribute('aria-label')&&!element.getAttribute('aria-labelledby')).map(element=>element.outerHTML.slice(0,180));
  const smallLabels=[...main.querySelectorAll('label,figcaption')].filter(visible).filter(element=>parseFloat(getComputedStyle(element).fontSize)<14).map(element=>({text:element.textContent.trim(),size:getComputedStyle(element).fontSize}));
  const targets=[...document.querySelectorAll('main button,main a.button,main details>summary,.site-header a,.site-header button,.site-header summary,.mobile-shortcuts a')].filter(element=>visible(element)&&!element.disabled);
  const smallTargets=targets.filter(element=>{const box=rect(element);return box.height<40||box.width<24;}).map(element=>({text:element.textContent.trim().slice(0,80),box:rect(element)}));
  const images=[...main.querySelectorAll('img')].filter(element=>visible(element)&&!!element.alt&&!element.closest('[aria-hidden="true"],.page-atmosphere,.study-interval'));
  const firstImages=images.filter(element=>{const box=rect(element);return box.top<innerHeight&&box.bottom>0;});
  const brokenImages=firstImages.filter(element=>!element.complete||!element.naturalWidth).map(element=>({alt:element.alt,src:element.currentSrc}));
  const light=color=>{
   const values=color.match(/[\d.]+/g)?.map(Number);
   if(!values||values.length<3||(values.length>3&&values[3]<.99))return null;
   return values.slice(0,3).map(value=>value/255).map(value=>value<=.04045?value/12.92:((value+.055)/1.055)**2.4).reduce((sum,value,index)=>sum+value*[.2126,.7152,.0722][index],0);
  };
  const badges=[...main.querySelectorAll('.postcard-name')].filter(visible).map(element=>{
   const style=getComputedStyle(element),foreground=light(style.color),background=light(style.backgroundColor);
   const contrast=foreground===null||background===null?null:(Math.max(foreground,background)+.05)/(Math.min(foreground,background)+.05);
   const large=parseFloat(style.fontSize)>=24||(parseFloat(style.fontSize)>=18.66&&parseFloat(style.fontWeight)>=700);
   return {text:element.textContent.trim(),color:style.color,background:style.backgroundColor,contrast,minimum:large?3:4.5};
  });
  return {viewport:{width:innerWidth,height:innerHeight},documentWidth:document.documentElement.scrollWidth,heading:{text:heading?.textContent.trim(),visible:visible(heading),box:rect(heading),glyphs:headingBoxes,clips:headingClips,blocked:headingBlocked},header:rect(header),bar:rect(bar),smallProse,proseCount:prose.length,labels,smallLabels,smallTargets,brokenImages,badges,contentImageCount:images.length,firstImageCount:firstImages.length};
 });
}

async function ready(page,url){
 const response=await page.goto(url,{waitUntil:'load'});
 await page.evaluate(()=>document.fonts.ready);
 await page.locator('main h1').waitFor({state:'visible'});
 await settleImages(page);
 return response;
}

async function settleImages(page){
 await page.locator('main').evaluate(async main=>{
  await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
  await Promise.allSettled([...main.querySelectorAll('img')].filter(image=>{const box=image.getBoundingClientRect();return box.top<innerHeight&&box.bottom>0;}).map(image=>image.decode()));
 });
}

async function mobileNavigation(page){
 const toggle=page.locator('.menu-toggle');
 if(!await toggle.isVisible())return {pass:false,reason:'Menu trigger is hidden'};
 await toggle.focus();await page.keyboard.press('Enter');
 const opened=await page.evaluate(()=>{const panel=document.querySelector('#navigation');return panel.classList.contains('is-open')&&panel.contains(document.activeElement)&&document.querySelector('.menu-toggle').getAttribute('aria-expanded')==='true'&&!document.querySelector('main').inert;});
 await page.keyboard.press('Escape');
 const closed=await toggle.evaluate(element=>document.activeElement===element&&element.getAttribute('aria-expanded')==='false');
 return {pass:opened&&closed,opened,closed};
}

async function focusField(page){
 const fields=page.locator('main input:not([aria-hidden="true"]),main textarea,main select');
 let field;
 for(let index=0;index<await fields.count();index++)if(await fields.nth(index).isVisible()){field=fields.nth(index);break;}
 if(!field)return null;
 await field.scrollIntoViewIfNeeded();await field.focus();await page.keyboard.press('ArrowRight');
 const state=await field.evaluate(element=>{
  const style=getComputedStyle(element),box=element.getBoundingClientRect();
  const center={x:box.left+box.width/2,y:box.top+Math.min(box.height/2,30)};
  const hit=document.elementFromPoint(center.x,center.y);
  return {name:element.name,focused:document.activeElement===element,indicated:(style.outlineStyle!=='none'&&parseFloat(style.outlineWidth)>=2)||style.boxShadow!=='none',uncovered:hit===element||element.contains(hit)};
 });
 await field.evaluate(element=>element.blur());await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
 return {...state,pass:state.focused&&state.indicated&&state.uncovered};
}

async function homeSignature(page){
 return page.evaluate(()=>['body','.site-header','.brand','.opening-hero','.atlas-stage','.atlas-person h1','.hero-role','.atlas-title','.atlas-controls','.hero-featured-evidence','.mobile-shortcuts'].map(selector=>{
  const element=document.querySelector(selector),style=getComputedStyle(element),box=element.getBoundingClientRect();
  return {selector,style:{font:style.font,color:style.color,backgroundColor:style.backgroundColor,borderRadius:style.borderRadius,display:style.display,position:style.position},box:{top:box.top,left:box.left,width:box.width,height:box.height}};
 }));
}

await fs.mkdir(output,{recursive:true});
let original=null,homeBefore=[];
if(!captureOnly){
 try{
  const [html,home]=await Promise.all(['original-html.json','home-signatures.json'].map(file=>fs.readFile(path.join(baselineDirectory,file),'utf8')));
  original=JSON.parse(html);homeBefore=JSON.parse(home);
 }catch(error){
  if(error.code!=='ENOENT'||baselineArgument)throw error;
  console.log('No prechange snapshot found. Running interface checks only; content and Home snapshot comparisons are omitted. Supply --baseline-dir=PATH to include them.');
 }
}
let server,executionError=false;
try{
 server=spawn(process.execPath,['scripts/serve.mjs','--dist'],{cwd:root,env:{...process.env,PORT:'4199'},windowsHide:true,stdio:['ignore','pipe','pipe']});
 let serverError='';server.stderr.on('data',chunk=>{serverError+=chunk;});
 let serving=false;
 for(let index=0;index<80;index++){
  if(server.exitCode!==null)throw Error('Preview server exited: '+serverError);
  try{if((await fetch(base)).ok){serving=true;break;}}catch{}
  await new Promise(resolve=>setTimeout(resolve,100));
 }
 if(!serving)throw Error('Built preview did not become ready on port4199');
 for(const engine of engines){
  const browser=await {chromium,webkit}[engine].launch({headless:true});
  try{
   const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
   for(const route of selected){
    const url=base+routes[route].path,page=await context.newPage(),errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    const response=await ready(page,url);
    record(engine,route,'The published route loads',response?.status()===200,response?.status());
    if(!captureOnly&&original){
     const before=await documentMetadata(page,original.pages[route],url);
     const after=await documentMetadata(page,await response.text(),url);
     const missing={ids:missingEntries(before.ids,after.ids),inputs:missingEntries(before.inputs,after.inputs),hooks:missingEntries(before.hooks,after.hooks),links:missingEntries(before.links,after.links),metadata:missingEntries(before.metadata,after.metadata)};
     const duplicateIds=after.ids.filter((id,index)=>after.ids.indexOf(id)!==index);
     record(engine,route,'Existing IDs, inputs, hooks and native evidence links are preserved',Object.values(missing).every(items=>!items.length)&&!duplicateIds.length,{...missing,duplicateIds});
     const lostBlocks=before.blocks.filter(block=>!after.text.includes(block));
     record(engine,route,'Published substantive text and page heading remain present',!lostBlocks.length&&before.heading===after.heading,{lostBlocks,originalHeading:before.heading,currentHeading:after.heading});
    }
    for(const width of [1440,390,320]){
     await page.setViewportSize({width,height:width===1440?1000:900});
     await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
     await settleImages(page);
     const state=await inspect(page);
     observations.push({engine,route,width,...state});
     const fitted=state.heading.glyphs.length>0&&!state.heading.clips.length&&state.heading.glyphs.every(box=>box.left>=-1&&box.right<=width+1);
     record(engine,route,width+'px heading glyphs fit and remain clear of the masthead',state.heading.visible&&fitted&&!state.heading.blocked,{heading:state.heading,header:state.header});
     record(engine,route,width+'px content fits the document and stays readable',state.documentWidth<=width+1&&!state.smallProse.length&&!state.smallLabels.length,{documentWidth:state.documentWidth,smallProse:state.smallProse,smallLabels:state.smallLabels});
     record(engine,route,width+'px real images, controls and labels remain usable',!state.brokenImages.length&&!state.labels.length&&!state.smallTargets.length,{brokenImages:state.brokenImages,unlabelledFields:state.labels,smallTargets:state.smallTargets,contentImages:state.contentImageCount});
     if(state.badges.length)record(engine,route,width+'px photograph name badge has readable text contrast',state.badges.every(badge=>badge.contrast!==null&&badge.contrast>=badge.minimum),state.badges);
     if(width===390){
      const navigation=await mobileNavigation(page);
      record(engine,route,'The phone menu opens by keyboard and restores focus',navigation.pass,navigation);
      const field=await focusField(page);
      if(field)record(engine,route,'A real input keeps visible focus without being covered',field.pass,field);
      if(engine==='chromium'&&!captureOnly){
       const audit=await new AxeBuilder({page}).include('main').include('.site-header').include('.mobile-shortcuts').withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
       const serious=audit.violations.filter(violation=>['serious','critical'].includes(violation.impact)).map(violation=>({id:violation.id,nodes:violation.nodes.map(node=>({target:node.target,summary:node.failureSummary}))}));
       record(engine,route,'The redesigned phone page has no serious or critical axe findings',!serious.length,serious);
      }
     }
     if(width!==320||route==='pehchaan'){
      await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
      await page.screenshot({path:path.join(output,engine+'-'+route+'-'+width+'-top.png')});
      if(fullPageRoutes.has(route)){
       await page.locator('main img').evaluateAll(async images=>{for(const image of images){if(!image.checkVisibility()||!image.alt)continue;image.scrollIntoView({block:'center'});await image.decode().catch(()=>{});}});
       await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
       await page.screenshot({path:path.join(output,engine+'-'+route+'-'+width+'-full.png'),fullPage:true});
      }
     }
    }
    record(engine,route,'No uncaught browser errors',!errors.length,errors);
    await page.close();console.log('Checked '+engine+' '+route);
   }
   if(!captureOnly&&!requested&&homeBefore.length){
    for(const width of [1440,390]){
     const page=await context.newPage();await page.setViewportSize({width,height:width===1440?1000:900});
     await ready(page,base);await page.locator('[data-atlas-controls]').waitFor({state:'visible'});
     const current=await homeSignature(page),before=homeBefore.find(item=>item.engine===engine&&item.width===width)?.values;
     const changes=current.flatMap((item,index)=>{
      const saved=before?.[index],styleChanged=JSON.stringify(item.style)!==JSON.stringify(saved?.style);
      const geometryChanged=!saved||Object.keys(item.box).some(key=>Math.abs(item.box[key]-saved.box[key])>1);
      return styleChanged||geometryChanged?[{selector:item.selector,before:saved,current:item}]:[];
     });
     record(engine,'home',width+'px accepted Home type, palette and geometry stay unchanged',!changes.length,changes);
     await page.close();
    }
   }
   await context.close();
  }finally{await browser.close();}
 }
}catch(error){executionError=true;console.error(error);record('runner','all','Interior checks completed',false,error.stack||String(error));}
finally{
 server?.kill();
 await fs.writeFile(path.join(output,'checks.json'),JSON.stringify({base,captureOnly,baselineUsed:Boolean(original),checkedAt:new Date().toISOString(),checks:results.length,failed:results.filter(result=>!result.pass).length,results},null,2));
 await fs.writeFile(path.join(output,'observations.json'),JSON.stringify(observations,null,2));
}
console.log(results.filter(result=>result.pass).length+'/'+results.length+' interior checks passed. Evidence: outputs/interior-design/');
if(executionError||results.some(result=>!result.pass))process.exitCode=1;
