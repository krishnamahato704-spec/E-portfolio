// Real browser coverage of the static academic interface. No backend writes.
import {defaultContent} from '../src/content.js';
import {view} from '../src/views.js';
import {initMotion,cleanupMotion} from '../src/motion.js';
const main=document.querySelector('#main'),results=[];
const check=(name,run)=>{try{run();results.push({name,pass:true})}catch(error){results.push({name,pass:false,error:error.message})}};
const assert=(pass,message)=>{if(!pass)throw Error(message)};
try{
 main.innerHTML=view('home',defaultContent,'../');
 check('Hero and all section headings remain visible on initialization',()=>{
  initMotion({initial:true});
  assert([...main.querySelectorAll('h1,h2,h3')].every(el=>getComputedStyle(el).opacity==='1'),'A heading is hidden');
  assert(!main.querySelector('video,canvas,.motion-hero,.motion-enter'),'Decorative motion is present');
 });
 check('Repeated initialization adds no progress bars, cursors, or animations',()=>{
  for(let i=0;i<8;i++)initMotion();
  assert(!document.querySelector('.reading-progress,.custom-cursor'),'Decorative UI was added');
  assert(!document.getAnimations().length,'Decorative animations are running');
 });
 check('Native pointer and focus styles remain available',()=>{
  const cta=main.querySelector('.button');cta.focus();
  assert(document.activeElement===cta,'CTA cannot receive focus');
  assert(getComputedStyle(cta).cursor!=='none','Native cursor is hidden');
  assert(getComputedStyle(cta).outlineStyle!=='none','Focus indicator is missing');
 });
 check('Cleanup can run repeatedly without altering readable content',()=>{
  cleanupMotion();cleanupMotion();
  assert(main.querySelector('h1').textContent.includes('Krishna'),'Content was removed');
  assert(getComputedStyle(main.querySelector('h1')).opacity==='1','Headline became hidden');
 });
}finally{
 cleanupMotion();
 document.querySelector('#results').textContent=JSON.stringify(results,null,2);
 document.body.dataset.testResult=results.every(r=>r.pass)?'pass':'fail';
}
