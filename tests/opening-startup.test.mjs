import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';

const source=await fs.readFile(process.env.TEST_OPENING_STARTUP_SOURCE||new URL('../src/opening-startup.js',import.meta.url),'utf8');

// Run the real head script. Native event targets preserve abortable listeners;
// a small clock lets these lifecycle checks exercise the four-second fallback.
function startup({hidden=false,reduced=false}={}){
 let now=0,nextTimer=0;
 const timers=new Map(),attributes=new Map();
 const entry={tagName:'SCRIPT',src:'https://portfolio.example/src/opening-entry.js?v=release'};
 const preference=Object.assign(new EventTarget(),{matches:reduced});
 const connection=Object.assign(new EventTarget(),{saveData:false,effectiveType:'4g'});
 const document=Object.assign(new EventTarget(),{
  hidden,currentScript:entry,
  documentElement:{animate(){},setAttribute:(name,value)=>attributes.set(name,value),removeAttribute:name=>attributes.delete(name)}
 });
 const window=Object.assign(new EventTarget(),{
  navigator:{connection},location:{hash:'',search:''},scrollY:0,
  performance:{now:()=>now},matchMedia:()=>preference,
  sessionStorage:{getItem:()=>null},
  setTimeout:(callback,delay)=>{const id=++nextTimer;timers.set(id,{callback,at:now+delay});return id;},
  clearTimeout:id=>timers.delete(id)
 });
 vm.runInNewContext(source,{window,document,AbortController,URLSearchParams});
 return {
  boot:window.__portfolioOpeningBoot,
  covered:()=>attributes.has('data-opening-pending'),
  visible(value){document.hidden=!value;document.dispatchEvent(new Event('visibilitychange'));},
  error({target=window,filename,error}={}){
   const event=new Event('error');
   Object.defineProperty(event,'target',{value:target});
   Object.assign(event,{filename,error});
   window.dispatchEvent(event);
  },
  entry,
  advance(duration){
   const end=now+duration;
   for(;;){
    const next=[...timers].filter(([,timer])=>timer.at<=end).sort((a,b)=>a[1].at-b[1].at)[0];
    if(!next)break;
    const [id,timer]=next;now=timer.at;timers.delete(id);timer.callback();
   }
   now=end;
  }
 };
}

test('A first visit loaded in the background keeps its prepaint cover',()=>{
 const page=startup({hidden:true});
 assert.equal(page.covered(),true);
 assert.equal(page.boot.state,'pending');
});

test('Time spent in a background tab does not consume the opening startup allowance',()=>{
 const page=startup({hidden:true});
 page.advance(6500);
 assert.equal(page.covered(),true);
 page.visible(true);
 assert.equal(page.boot.claim(),true);
 page.boot.release('handed-off');
 assert.equal(page.covered(),false);
});

test('The fallback counts visible waiting time across a tab switch',()=>{
 const page=startup();
 page.advance(1500);
 page.visible(false);
 page.advance(6500);
 assert.equal(page.covered(),true);
 page.visible(true);
 page.advance(2499);
 assert.equal(page.covered(),true);
 page.advance(1);
 assert.equal(page.covered(),false);
 assert.equal(page.boot.claim(),false);
});

for(const kind of ['resource','runtime'])test(`An unrelated app ${kind} failure cannot cancel a pending opening in a foreground or background tab`,()=>{
 for(const hidden of [false,true]){
  const page=startup({hidden});
  const app={tagName:'SCRIPT',src:'https://portfolio.example/src/app.js?v=release'};
  assert.equal(page.covered(),true);
  page.error(kind==='resource'?{target:app}:{filename:app.src,error:new Error('App unavailable')});
  assert.equal(page.covered(),true);
  page.visible(true);
  assert.equal(page.boot.claim(),true);
  page.boot.release('handed-off');
 }
});

for(const kind of ['resource','runtime'])test(`An opening entry ${kind} failure releases its cover and prevents a late automatic opening`,()=>{
 const page=startup();
 assert.equal(page.covered(),true);
 page.error(kind==='resource'?{target:page.entry}:{filename:page.entry.src,error:new Error('Opening unavailable')});
 assert.equal(page.covered(),false);
 page.visible(true);
 assert.equal(page.boot.claim(),false);
});

test('A visible startup that never becomes ready exposes the page after its finite allowance',()=>{
 const page=startup();
 page.advance(4001);
 assert.equal(page.covered(),false);
 assert.equal(page.boot.state,'expired');
 assert.equal(page.boot.claim(),false);
});

test('Reduced motion leaves the ordinary page uncovered from the start',()=>{
 const page=startup({hidden:true,reduced:true});
 assert.equal(page.covered(),false);
 page.visible(true);
 page.advance(6500);
 assert.equal(page.covered(),false);
 assert.equal(page.boot.claim(),false);
});
