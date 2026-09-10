import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import {defaultContent,mergeContent,validateContent} from '../src/content.js';
const source=(await fs.readFile(new URL('../src/app.js',import.meta.url),'utf8')).replace(/^import .*;\r?\n/gm,'');
const tick=()=>new Promise(resolve=>setImmediate(resolve));

// A small event/DOM boundary double: tests execute the actual application module.
// Child collections are replaced on rendering; listeners on main must survive.
function harness(){
 const handlers=new Map();const queries=new Map();let replacements=0,prints=0,reads=0,resolve,reject;
 const pending=new Promise((yes,no)=>{resolve=yes;reject=no;});
 const main={innerHTML:'baseline',contains:node=>node?.inside===true,querySelector:key=>queries.get(key),querySelectorAll:key=>queries.get(key)||[],addEventListener(type,fn,options){const list=handlers.get(type)||[];list.push({fn,once:options?.once});handlers.set(type,list);}};
 Object.defineProperty(main,'innerHTML',{get:()=>replacements?'refreshed':'baseline',set:()=>{replacements++;}});
 const documentHandlers={};let expanded='false',navigationOpen=false,focused=false;
 const menu={getAttribute:()=>expanded,setAttribute:(key,value)=>{expanded=value},addEventListener(type,fn){this[type]=fn},focus(){focused=true}};
 const navigation={classList:{toggle:(name,value)=>{navigationOpen=value}}};
 const document={body:{dataset:{route:'resources',base:'./'}},activeElement:null,addEventListener(type,fn){documentHandlers[type]=fn},querySelector:key=>key==='#main'?main:key==='.menu-toggle'?menu:key==='#navigation'?navigation:null,createElement:()=>({})};
 const location={href:''};const copied=[];
 vm.runInNewContext(source,{document,window:{print:()=>prints++},navigator:{clipboard:{writeText:async value=>copied.push(value)}},location,FormData:class{constructor(form){this.data=form.data}get(key){return this.data[key]}},loadContent:()=>{reads++;return pending},mergeContent,validateContent,view:()=>'<p>refreshed</p>',encodeURIComponent});
 const emit=(type,target,extra={})=>{const event={target,preventDefault(){this.prevented=true},...extra};for(const listener of [...handlers.get(type)||[]]){listener.fn(event);if(listener.once)handlers.set(type,handlers.get(type).filter(x=>x!==listener));}return event;};
 const button=(data={},id='')=>({inside:true,id,dataset:data,hasAttribute:key=>key==='data-filter'&&data.filter!==undefined,matches:selector=>selector==='.copy-email'&&data.email!==undefined,setAttribute(key,value){this[key]=value},closest(){return this}});
 return {main,queries,handlers,emit,button,resolve,reject,location,copied,menu,documentHandlers,get expanded(){return expanded},get navigationOpen(){return navigationOpen},get focused(){return focused},get replacements(){return replacements},get prints(){return prints},get reads(){return reads}};
}

test('Mobile menu exposes its state and Escape closes it and restores keyboard focus',()=>{
 const h=harness();h.menu.click();assert.equal(h.expanded,'true');assert.equal(h.navigationOpen,true);
 h.documentHandlers.keydown({key:'Escape'});assert.equal(h.expanded,'false');assert.equal(h.navigationOpen,false);assert.equal(h.focused,true);
});

test('A pointer press protects current content from a late Supabase response',async()=>{
 const h=harness();h.emit('pointerdown',{inside:true});h.resolve({content:defaultContent});await tick();assert.equal(h.replacements,0);assert.equal(h.reads,1);
});
test('A refresh retains one set of delegated handlers and filters new nodes',async()=>{
 const h=harness();const bindings=[...h.handlers].map(([key,list])=>[key,list.length]);h.resolve({content:defaultContent});await tick();assert.equal(h.replacements,1);assert.deepEqual([...h.handlers].map(([key,list])=>[key,list.length]),bindings);
 const all=h.button({filter:'All'}),assessment=h.button({filter:'Assessment'}),rows=[{dataset:{category:'Assessment'}},{dataset:{category:'Lesson plan'}}];
 h.queries.set('[data-filter]',[all,assessment]);h.queries.set('.resource-row',rows);h.queries.set('#resource-empty',{});
 h.emit('click',{closest:()=>assessment});assert.equal(rows[0].hidden,false);assert.equal(rows[1].hidden,true);assert.equal(assessment['aria-pressed'],'true');assert.equal(h.queries.get('#resource-empty').hidden,true);
 h.emit('click',all);assert.ok(rows.every(row=>!row.hidden));assert.equal(all['aria-pressed'],'true');
});
test('Input and online errors preserve the initial page',async()=>{
 const h=harness();h.emit('input',{});h.resolve({content:defaultContent});await tick();assert.equal(h.replacements,0);
 const failed=harness();failed.reject(new Error('offline'));await tick();assert.equal(failed.main.innerHTML,'baseline');
});
test('Image errors use the same alternative-text fallback before and after refresh',async()=>{
 const h=harness();let replacement;
 const image={tagName:'IMG',alt:'Teaching evidence',complete:true,naturalWidth:0,replaceWith:node=>{replacement=node}};
 h.queries.set('img',[image]);h.resolve({content:defaultContent});await tick();assert.equal(replacement.textContent,'Teaching evidence — image temporarily unavailable.');assert.equal(replacement.className,'image-error');
 replacement=null;h.emit('error',image);assert.equal(replacement.className,'image-error');
});
test('Delegated print, copy and email draft actions execute once and preserve encoding',async()=>{
 const h=harness();h.queries.set('#copy-status',{});h.queries.set('#contact-status',{});
 h.emit('click',h.button({},'print-resume'));assert.equal(h.prints,1);
 h.emit('click',h.button({email:'krishnamahato704@gmail.com'}));await tick();assert.deepEqual(h.copied,['krishnamahato704@gmail.com']);assert.equal(h.queries.get('#copy-status').textContent,'Email address copied.');
 const event=h.emit('submit',{id:'contact-form',data:{name:'Recruiter',email:'school@example.com',school:'History & Arts',message:'A question?'}});assert.equal(event.prevented,true);const url=new URL(h.location.href);assert.equal(url.protocol,'mailto:');assert.equal(url.searchParams.get('subject'),'Teaching enquiry — History & Arts');assert.match(url.searchParams.get('body'),/A question\?/);assert.match(h.queries.get('#contact-status').textContent,/Nothing has been sent/);
});
