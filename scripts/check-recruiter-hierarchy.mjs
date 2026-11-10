import {chromium,webkit} from 'playwright';
import {spawn} from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import {defaultContent} from '../src/content.js';

// Checks the useful, settled page. The opening has its own motion coverage.
const root=path.resolve(import.meta.dirname,'..');
const output=path.join(root,'outputs','recruiter-hierarchy');
const url='http://127.0.0.1:4197/E-portfolio/';
const results=[];
const record=(engine,name,pass,details)=>{
 results.push({engine,name,pass:!!pass,...(details===undefined?{}:{details})});
 console.log(`${pass?'PASS':'FAIL'} ${engine}: ${name}`);
 if(!pass&&details!==undefined)console.error(JSON.stringify(details));
};
const normalize=value=>value.replace(/\s+/g,' ').trim();
const luminance=color=>{
 const rgb=color.match(/[\d.]+/g)?.slice(0,3).map(Number);
 if(!rgb||rgb.length!==3)return NaN;
 return rgb.map(value=>value/255).map(value=>value<=.04045?value/12.92:((value+.055)/1.055)**2.4)
  .reduce((sum,value,index)=>sum+value*[.2126,.7152,.0722][index],0);
};
async function inspect(page){
 return page.evaluate(()=>{
  const rect=element=>{
   if(!element)return null;
   const box=element.getBoundingClientRect();
   return {top:box.top,bottom:box.bottom,left:box.left,right:box.right,width:box.width,height:box.height};
  };
  const visible=element=>!!element&&element.checkVisibility({checkOpacity:true,checkVisibilityCSS:true});
  const inViewport=element=>{
   const box=rect(element);
   return visible(element)&&box.width>0&&box.height>0&&box.top>=0&&box.left>=-1&&box.right<=innerWidth+1&&box.bottom<=innerHeight;
  };
  const get=selector=>document.querySelector(selector);
  const hero=get('.atlas-stage'),name=get('.atlas-person h1'),role=get('.atlas-person .hero-role');
  const title=get('.atlas-title-teacher'),scope=get('.atlas-stage .hero-teaching-scope');
  const preview=get('.hero-featured-evidence'),image=get('.hero-featured-image img'),lesson=get('.hero-featured-link');
  const evidence=get('#teaching-evidence'),gallery=get('.atlas-gallery-section'),identity=get('#teacher-student');
  const teacher=get('[data-atlas-copy="teacher"]'),student=get('[data-atlas-copy="student"]');
  const actions=get('.hero-copy > .actions'),footer=get('.atlas-stage-footer');
  const footerControls=footer?[...footer.querySelectorAll('button,a')].filter(visible).map(element=>({text:element.textContent.trim(),...rect(element)})):[];
  const scopeOverflow=[...document.querySelectorAll('.hero-teaching-scope,.hero-learning-records li')].filter(visible).map(element=>{
   const range=document.createRange();range.selectNodeContents(element);
   return {text:element.textContent.trim(),box:rect(element),textBox:rect(range)};
  }).filter(item=>item.textBox.left<item.box.left-1||item.textBox.right>item.box.right+1);
  const precedes=(first,second)=>!!first&&!!second&&Boolean(first.compareDocumentPosition(second)&Node.DOCUMENT_POSITION_FOLLOWING);
  const overflow=[...document.querySelectorAll('main *,header *,footer *')].filter(element=>{
   if(!visible(element))return false;
   const box=rect(element),style=getComputedStyle(element);
   return box.width>0&&style.position!=='fixed'&&(box.left< -1||box.right>innerWidth+1);
  }).slice(0,8).map(element=>({tag:element.tagName,class:element.getAttribute('class'),...rect(element)}));
  return {
   viewport:{width:innerWidth,height:innerHeight},mode:get('.opening-hero')?.dataset.atlasMode,
   name:{visible:visible(name),size:name?parseFloat(getComputedStyle(name).fontSize):0,text:name?.textContent.trim()},
   role:{visible:visible(role),size:role?parseFloat(getComputedStyle(role).fontSize):0,text:role?.textContent.trim()},
   titleSize:title?parseFloat(getComputedStyle(title).fontSize):0,
   scope:{inside:!!scope&&hero?.contains(scope),visible:visible(scope),text:scope?.textContent.trim()},
   preview:{visible:visible(preview),inViewport:inViewport(preview),rect:rect(preview),text:preview?.innerText,
    image:{visible:visible(image),inViewport:inViewport(image),loaded:!!image?.complete&&image.naturalWidth>0,
     width:image?.naturalWidth,source:image?.currentSrc,alt:image?.getAttribute('alt')},
    href:lesson?.href,linkVisible:visible(lesson),linkInViewport:inViewport(lesson)},
   evidence:{top:evidence?rect(evidence).top+scrollY:null,beforeGallery:precedes(evidence,gallery),beforeIdentity:precedes(evidence,identity)},
   teacher:{visible:visible(teacher),text:teacher?.innerText},student:{visible:visible(student),text:student?.innerText},
   learningText:get('.hero-learning-records')?.innerText,
   color:hero?getComputedStyle(hero).backgroundColor:null,
   actions:{visible:visible(actions),rect:rect(actions),links:actions?[...actions.querySelectorAll('a[href]')].map(link=>({href:link.href,text:link.textContent.trim()})):[]},
   footer:{visible:visible(footer),rect:rect(footer),controls:footerControls},shortcuts:rect(get('.mobile-shortcuts')),scopeOverflow,
   documentWidth:document.documentElement.scrollWidth,overflow,
  };
 });
}

async function setMode(page,mode){
 await page.locator(`button[data-atlas-mode="${mode}"]`).click();
 await page.waitForFunction(mode=>document.querySelector('.opening-hero')?.dataset.atlasMode===mode,mode);
 await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
}

async function settleScene(page){
 await page.locator('.atlas-stage').evaluate(stage=>Promise.allSettled(stage.getAnimations({subtree:true})
  .filter(animation=>animation.effect.getTiming().iterations!==Infinity).map(animation=>animation.finished)));
}

async function ready(page){
 const response=await page.goto(url,{waitUntil:'load'});
 if(response?.status()!==200)throw Error(`Homepage responded ${response?.status()}`);
 await page.evaluate(()=>document.fonts.ready);
 await page.locator('[data-atlas-controls]').waitFor({state:'visible'});
 await page.locator('.hero-featured-image img').evaluate(async image=>{await image.decode().catch(()=>{});});
}

await fs.mkdir(output,{recursive:true});
let server;
try{
 server=spawn(process.execPath,['scripts/serve.mjs','--dist'],{
  cwd:root,env:{...process.env,PORT:'4197'},windowsHide:true,stdio:['ignore','pipe','pipe'],
 });
 let serverError='';
 server.stderr.on('data',chunk=>{serverError+=chunk;});
 let serving=false;
 for(let attempt=0;attempt<80;attempt++){
  if(server.exitCode!==null)throw Error(`Preview server exited: ${serverError}`);
  try{if((await fetch(url)).ok){serving=true;break;}}catch{}
  await new Promise(resolve=>setTimeout(resolve,100));
 }
 if(!serving)throw Error('Built preview did not become ready on port 4197');

 for(const [engine,launcher] of Object.entries({chromium,webkit})){
  const browser=await launcher.launch({headless:true});
  try{
   const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
   const page=await context.newPage(),errors=[];
   page.on('pageerror',error=>errors.push(error.message));
   await ready(page);
   const teacher=await inspect(page);
   record(engine,'Desktop name and role lead the first scene',teacher.name.visible&&teacher.role.visible&&teacher.name.size>=60&&teacher.role.size>=22&&teacher.name.size>teacher.titleSize,{name:teacher.name,role:teacher.role,taglineSize:teacher.titleSize});
   record(engine,'Teaching classes appear in the opening scene',teacher.scope.inside&&teacher.scope.visible&&normalize(teacher.scope.text||'').includes(normalize(defaultContent.profile.directTeaching)),teacher.scope);
   record(engine,'A real lesson preview is fully visible in the first desktop viewport',teacher.preview.inViewport&&teacher.preview.image.inViewport&&teacher.preview.image.loaded&&!!teacher.preview.image.alt&&teacher.preview.linkInViewport&&/\/teaching\/democracy\/$/.test(teacher.preview.href||''),teacher.preview);
   if(teacher.preview.href){
    const lesson=await context.request.get(teacher.preview.href);
    const lessonHtml=await lesson.text();
    record(engine,'Featured lesson link opens the real Democracy case study',lesson.ok()&&/<h1[^>]*>Teaching Democracy<\/h1>/.test(lessonHtml),{status:lesson.status(),href:teacher.preview.href});
   }else record(engine,'Featured lesson link opens the real Democracy case study',false,'Missing native featured lesson link');
   record(engine,'Selected evidence comes before photographs and the identity essay',teacher.evidence.beforeGallery&&teacher.evidence.beforeIdentity,teacher.evidence);
   record(engine,'Selected evidence starts within 1300px on desktop',teacher.evidence.top!==null&&teacher.evidence.top<=1300,teacher.evidence);
   const actionBottom=teacher.actions.rect?.bottom,footerTop=teacher.footer.rect?.top;
   record(engine,'Working actions and scene footer have separate rows',teacher.actions.visible&&teacher.actions.links.length>=2&&teacher.footer.visible&&Number.isFinite(actionBottom)&&Number.isFinite(footerTop)&&footerTop>=actionBottom+16,{actions:teacher.actions,footer:teacher.footer,gap:footerTop-actionBottom});
   await page.screenshot({path:path.join(output,`${engine}-teacher-desktop.png`)});

   await setMode(page,'student');
   const student=await inspect(page);
   const learning=normalize(student.learningText||'');
   const degree=defaultContent.qualifications.find(qualification=>/^B\.A\./.test(qualification.title));
   const current=defaultContent.qualifications.filter(qualification=>qualification.status==='In progress');
   const qualificationMatches=current.map(qualification=>({
    title:qualification.title,titlePresent:learning.includes(qualification.title),
    date:qualification.period,datePresent:learning.includes(qualification.period)||(qualification.expected&&learning.includes(qualification.expected)),
   }));
   const degreeResult=degree?.place.match(/CGPA\s+[\d.]+/i)?.[0];
   const degreePresent=!!degree&&learning.includes(degree.title)&&!!degreeResult&&learning.includes(degreeResult);
   const academicRecordLink=await page.locator('[data-atlas-copy="student"] .hero-learning-link').evaluate(link=>link.href).catch(()=>'');
   record(engine,'Student mode displays actual academic qualifications, dates and degree result',student.student.visible&&!student.teacher.visible&&qualificationMatches.length>=2&&qualificationMatches.every(qualification=>qualification.titlePresent&&qualification.datePresent)&&degreePresent&&/\/(?:profile|credentials)\/$/.test(academicRecordLink),{qualificationMatches,degree:degree?.title,degreeResult,degreePresent,learning,academicRecordLink});
   const contrast=(Math.max(luminance(teacher.color||''),luminance(student.color||''))+.05)/(Math.min(luminance(teacher.color||''),luminance(student.color||''))+.05);
   record(engine,'Teacher and Student retain distinct full-scene colors',teacher.color!==student.color&&contrast>=4.5,{teacherColor:teacher.color,studentColor:student.color,contrast});
   record(engine,'Student perspective keeps the real lesson preview available',student.preview.visible&&student.preview.image.loaded&&student.preview.linkVisible,student.preview);
   await page.screenshot({path:path.join(output,`${engine}-student-desktop.png`)});
   await setMode(page,'teacher');
   const restored=await inspect(page);
   record(engine,'Teacher selection restores the teaching copy',restored.teacher.visible&&!restored.student.visible&&normalize(restored.teacher.text||'')===normalize(teacher.teacher.text||'')&&restored.scope.visible&&restored.color===teacher.color,{teacher:restored.teacher,student:restored.student,scope:restored.scope});

   for(const width of [320,375,390,768,1024,1440]){
    await page.setViewportSize({width,height:width===1440?1000:900});
    for(const mode of ['teacher','student']){
     await setMode(page,mode);
     const state=await inspect(page);
     record(engine,`${width}px ${mode} perspective has no horizontal overflow`,state.documentWidth<=width+1,{documentWidth:state.documentWidth,overflow:state.overflow});
     record(engine,`${width}px ${mode} perspective separates actions from the footer`,!!state.actions.rect&&!!state.footer.rect&&state.footer.rect.top>=state.actions.rect.bottom+16,{actions:state.actions.rect,footer:state.footer.rect});
     if(width===390){
      record(engine,`${mode} selected evidence starts within 1700px on phone`,state.evidence.top!==null&&state.evidence.top<=1700,state.evidence);
      record(engine,`${mode} phone retains a loaded lesson preview`,state.preview.visible&&state.preview.image.loaded&&state.preview.linkVisible,state.preview);
      await page.screenshot({path:path.join(output,`${engine}-${mode}-phone.png`)});
     }
    }
   }
   record(engine,'No uncaught browser errors',errors.length===0,errors);
   await context.close();

   // A replay control exists only after an ordinary motion-enabled visit.
   // The 375px heading wraps differently from the neighboring phone widths.
   for(const width of [320,360,375,390]){
    const moving=await browser.newContext({viewport:{width,height:900},reducedMotion:'no-preference'});
    const phone=await moving.newPage();
    await ready(phone);
    await phone.locator('[data-opening-replay]').waitFor({state:'visible',timeout:10000});
    for(const mode of ['teacher','student']){
     await setMode(phone,mode);await settleScene(phone);
     const state=await inspect(phone);
     const controls=state.footer.controls,bar=state.shortcuts;
     const overlap=controls.some((control,index)=>controls.slice(index+1).some(next=>control.left<next.right&&control.right>next.left&&control.top<next.bottom&&control.bottom>next.top));
     record(engine,`${width}px ${mode} motion and replay controls clear the shortcut bar`,!!bar&&controls.length>=3&&!overlap&&controls.every(control=>control.bottom<=bar.top-8),{controls,shortcuts:bar,overlap});
     record(engine,`${width}px ${mode} teaching and academic text stay inside their columns`,state.scopeOverflow.length===0,state.scopeOverflow);
     if(width===360||width===375)await phone.screenshot({path:path.join(output,`${engine}-${mode}-phone${width}-normal.png`)});
    }
    await moving.close();
   }
  }finally{await browser.close();}
 }
}catch(error){record('runner','Hierarchy checks completed',false,error.stack||String(error));}
finally{
 server?.kill();
 await fs.writeFile(path.join(output,'checks.json'),JSON.stringify({url,checkedAt:new Date().toISOString(),checks:results.length,failed:results.filter(result=>!result.pass).length,results},null,2));
}
console.log(`${results.filter(result=>result.pass).length}/${results.length} recruiter hierarchy checks passed. Report: outputs/recruiter-hierarchy/checks.json`);
if(results.some(result=>!result.pass))process.exitCode=1;
