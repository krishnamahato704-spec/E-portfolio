import {chromium,webkit} from 'playwright';
import {spawn} from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';

// Regression: normal headings must not be squeezed into isolated letter lines.
// Measure words in the browser, including content outside the first viewport.
const port=Number(process.env.HOME_LAYOUT_TEST_PORT||4211);
const base=process.env.HOME_LAYOUT_TEST_URL||`http://127.0.0.1:${port}/E-portfolio/`;
const engines=(process.env.HOME_LAYOUT_TEST_ENGINES||'chromium,webkit').split(',');
const widths=[320,375,390,768,800,900,1024,1159,1280,1440];
const output=path.join('outputs','home-layout'),results=[];
await fs.mkdir(output,{recursive:true});
const server=process.env.HOME_LAYOUT_TEST_URL?null:spawn(process.execPath,['scripts/serve.mjs','--dist'],{env:{...process.env,PORT:String(port)},windowsHide:true,stdio:'ignore'});
const check=(engine,width,name,pass,details)=>{
 results.push({engine,width,name,pass:!!pass,details});
 if(!pass)console.error('FAIL',engine,width,name,JSON.stringify(details));
};
const inspect=()=>{
 const broken=[],clipped=[];
 const headings=[...document.querySelectorAll('main h2,main h3')].filter(heading=>heading.checkVisibility({checkVisibilityCSS:true,checkOpacity:true})&&!heading.closest('.sr-only,[hidden],[aria-hidden="true"]'));
 for(const heading of headings){
  const walker=document.createTreeWalker(heading,NodeFilter.SHOW_TEXT);let node;
  while(node=walker.nextNode())for(const match of node.textContent.matchAll(/[\p{L}]{4,}/gu)){
   const range=document.createRange();range.setStart(node,match.index);range.setEnd(node,match.index+match[0].length);
   const rects=[...range.getClientRects()].filter(rect=>rect.width>0),bounds=heading.getBoundingClientRect();
   const lines=[...new Set(rects.map(rect=>Math.round(rect.top)))];
   if(rects.some(rect=>rect.left<bounds.left-2||rect.right>bounds.right+2||rect.left< -2||rect.right>innerWidth+2))clipped.push({heading:heading.textContent,word:match[0],headingBounds:{left:bounds.left,right:bounds.right},wordBounds:rects.map(rect=>({left:rect.left,right:rect.right})),viewport:innerWidth});
   if(lines.length>1){
    const groups=[];
    for(let offset=match.index;offset<match.index+match[0].length;offset++){
     const character=document.createRange();character.setStart(node,offset);character.setEnd(node,offset+1);
     const top=Math.round(character.getBoundingClientRect().top),group=groups.find(item=>item.top===top);
     if(group)group.text+=node.textContent[offset];else groups.push({top,text:node.textContent[offset]});
    }
    const style=getComputedStyle(heading),parent=heading.parentElement,section=heading.closest('section');
    broken.push({heading:heading.textContent,word:match[0],wordGroups:groups.map(group=>group.text),lines:lines.length,width:heading.getBoundingClientRect().width,font:style.font,fontSize:style.fontSize,section:section?.className||null,parent:parent.className||parent.tagName.toLowerCase(),parentWidth:parent.getBoundingClientRect().width});
   }
  }
 }
 return {headings:headings.length,broken,clipped,width:innerWidth,documentWidth:document.documentElement.scrollWidth};
};
const capture=async(page,file)=>{
 // Scrolling into a lazy photograph starts its real request. Capture its
 // settled state, with a finite wait, instead of a transient loading frame.
 await page.waitForFunction(()=>[...document.images].filter(image=>{const box=image.getBoundingClientRect();return box.top<innerHeight&&box.bottom>0&&image.currentSrc;}).every(image=>image.complete),null,{timeout:2500}).catch(()=>{});
 await page.screenshot({path:path.join(output,file)});
};
const galleryPaint=async()=>{
 const root=document.querySelector('[data-hero-gallery]');
 const selected=root.querySelector('[data-hero-slide][aria-hidden="false"] img');
 await selected.decode().catch(()=>{});
 const unloaded=[...root.querySelectorAll('[data-hero-slide][aria-hidden="true"] img:not([src])')];
 const images=[selected,...unloaded];
 const hitTest=()=>{
  const slides=[...root.querySelectorAll('[data-hero-slide]')],inert=slides.map(slide=>slide.inert),leaked=new Set();
  const windowBounds=root.querySelector('.hero-gallery-window').getBoundingClientRect(),imageBounds=selected.getBoundingClientRect();
  let selectedPainted=false,samples=0,unloadedHits=0;const hitPoints=[];
  // Inert excludes a painted neighbor from hit testing. Temporarily clear it
  // and restore it within this synchronous task; send no pointer/focus events.
  // This samples the actual rotated clipping, unlike axis-aligned IO bounds.
  try{
   slides.forEach(slide=>{slide.inert=false;});
   for(let y=Math.max(0,Math.floor(windowBounds.top));y<Math.min(innerHeight,imageBounds.bottom,windowBounds.bottom);y+=2){
    for(let x=Math.max(0,Math.floor(windowBounds.left));x<Math.min(innerWidth,windowBounds.right);x+=2){
     const image=document.elementFromPoint(x,y);samples++;
     if(image===selected)selectedPainted=true;
     if(unloaded.includes(image)){leaked.add(unloaded.indexOf(image));unloadedHits++;if(hitPoints.length<12)hitPoints.push({x,y});}
    }
   }
  }finally{slides.forEach((slide,index)=>{slide.inert=inert[index];});}
  return {selectedPainted,unloadedPainted:[...leaked],unloadedHits,hitPoints,samples};
 };
 return new Promise(resolve=>{
  const painted=new Map();let timer;
  const finish=()=>{observer.disconnect();clearTimeout(timer);resolve({selectedLoaded:selected.complete&&selected.naturalWidth>0,rotation:root.dataset.rotation,paint:hitTest(),images:images.map(image=>({selected:image===selected,loaded:image.naturalWidth>0,...painted.get(image)}))});};
  const observer=new IntersectionObserver(entries=>{
   for(const entry of entries)painted.set(entry.target,{intersecting:entry.isIntersecting,width:entry.intersectionRect.width,height:entry.intersectionRect.height});
   if(painted.size===images.length)finish();
  });
  timer=setTimeout(finish,2000);
  images.forEach(image=>observer.observe(image));
 });
};
try{
 let ready=false;
 for(let attempt=0;attempt<80;attempt++){try{if((await fetch(base)).ok){ready=true;break;}}catch{}await new Promise(resolve=>setTimeout(resolve,100));}
 if(!ready)throw Error(`Homepage layout test site is unavailable: ${base}`);
 for(const engine of engines){
  if(!{chromium,webkit}[engine])throw Error('Unknown homepage layout browser');
  const browser=await {chromium,webkit}[engine].launch({headless:true});
  try{
   const context=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce'}),page=await context.newPage(),errors=[],failed=[];
   page.on('pageerror',error=>errors.push(error.message));
   page.on('response',response=>{if(response.status()>=400&&new URL(response.url()).origin===new URL(base).origin)failed.push({url:response.url(),status:response.status()});});
   page.on('requestfailed',request=>{if(new URL(request.url()).origin===new URL(base).origin)failed.push({url:request.url(),error:request.failure()?.errorText});});
   await page.goto(base,{waitUntil:'load'});await page.evaluate(()=>document.fonts.ready);
   for(const width of widths){
    await page.setViewportSize({width,height:900});
    await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
    const state=await page.evaluate(inspect);
    check(engine,width,'Homepage headings keep each word together',state.headings>0&&state.broken.length===0,{headings:state.headings,broken:state.broken});
    check(engine,width,'Heading words fit inside their text area without clipping',state.headings>0&&state.clipped.length===0,state.clipped);
    check(engine,width,'Homepage stays within its viewport',state.documentWidth<=state.width+1,{width:state.width,documentWidth:state.documentWidth});
    if(width===320){
     for(const [name,selector] of [['gallery','.atlas-gallery-heading h2'],['contact','.home-contact h2']]){
      await page.locator(selector).scrollIntoViewIfNeeded();
      if(name==='gallery'){
       const paint=await page.evaluate(galleryPaint);
       check(engine,width,'The gallery shows its loaded photo without exposing unloaded neighbors',paint.selectedLoaded&&paint.rotation==='paused'&&paint.paint.selectedPainted&&paint.paint.unloadedPainted.length===0,paint);
      }
      await capture(page,`${name}-${engine}-${width}.png`);
     }
    }
    if([375,900].includes(width)){
     await page.locator('#education-title').scrollIntoViewIfNeeded();
     await capture(page,`education-${engine}-${width}.png`);
    }
   }
   check(engine,'all','Homepage layout and assets produce no browser errors',errors.length===0&&failed.length===0,{errors,failed});
   await context.close();
  }finally{await browser.close();}
 }
}finally{
 server?.kill();
 await fs.writeFile(path.join(output,'checks.json'),JSON.stringify({base,checks:results.length,failed:results.filter(result=>!result.pass).length,results},null,2));
}
console.log(`${results.filter(result=>result.pass).length}/${results.length} homepage layout checks passed.`);
if(results.some(result=>!result.pass))process.exitCode=1;
