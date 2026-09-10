import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import {defaultContent,mergeContent,validateContent} from '../src/content.js';
import {config} from '../src/config.js';
import {esc,view} from '../src/views.js';
import * as cloud from '../src/cloud.js';

const source=(await fs.readFile(new URL('../src/admin.js',import.meta.url),'utf8'))
  .replace(/^import .*;\r?\n/gm,'').replace('export function initStudio','function initStudio');

test('Editor retains profile, root, collection and upload edits through preview and publishing',async()=>{
  const originalFetch=global.fetch;
  const row={content:structuredClone(defaultContent),updated_at:'2026-09-10T00:00:00Z'};
  row.content.resources=[{title:'Local QA resource',category:'Assessment',url:'https://example.com/lesson.pdf'}];
  const calls=[];let published;
  global.fetch=async(url,options={})=>{
    assert.ok(url.startsWith(config.url));
    calls.push({url,options});
    if(url.includes('/auth/v1/token'))return Response.json({user:{id:config.ownerId},access_token:'local-test-token'});
    if(options.method==='PATCH'){
      published=JSON.parse(options.body);
      return Response.json([{...published,updated_at:'2026-09-10T00:01:00Z'}]);
    }
    if(url.includes('/storage/v1/object/'))return Response.json({Key:'test'});
    return Response.json([row]);
  };
  try {
    // Only the browser boundary is doubled; templates, editor and cloud adapter are real.
    const node=(dataset={})=>({dataset,listeners:{},value:'',addEventListener(type,fn){this.listeners[type]=fn;}});
    const fields=[node({scope:'profile',field:'name'}),node({scope:'root',field:'about'}),node({scope:'qualifications',index:'0',field:'title'})];
    const uploads=[node({scope:'profile',upload:'cv'}),node({scope:'resources',index:'0',upload:'url'})];
    const nodes=new Map();
    for(const key of ['#studio','#studio-status','#login-status','#preview','#publish','#export','#logout','#import-draft','#preview-route','#close-preview','#preview-content'])nodes.set(key,node());
    const dialog={open:false,showModal(){this.open=true;},close(){this.open=false;}};
    nodes.set('dialog',dialog);
    const login=node();login.querySelector=()=>node();login.reset=()=>{};login.elements={password:node()};nodes.set('#login-form',login);
    const context={...cloud,mergeContent,validateContent,esc,view,crypto,Blob,URL,setTimeout,confirm:()=>true,location:{reload(){}},
      FormData:class{get(key){return key==='email'?'test@example.com':'local-fixture-only';}},
      window:{addEventListener(){}},document:{querySelector:key=>nodes.get(key),querySelectorAll:key=>key==='[data-field]'?fields:key==='[data-upload]'?uploads:[]}};
    vm.runInNewContext(source+'\ninitStudio("./");',context);
    await login.listeners.submit({preventDefault(){},currentTarget:login});
    assert.match(nodes.get('#studio').innerHTML,/Preview changes/);
    for(const [i,value] of ['Local QA educator','Local QA about text.','Local QA qualification'].entries()){
      fields[i].value=value;fields[i].listeners.input();
    }
    assert.match(nodes.get('#studio-status').textContent,/Unpublished changes/);
    nodes.get('#preview').onclick();
    assert.equal(dialog.open,true);
    assert.match(nodes.get('#preview-content').innerHTML,/Local QA educator/);
    nodes.get('#close-preview').onclick();assert.equal(dialog.open,false);
    for(const upload of uploads){upload.files=[new File(['local QA'],'lesson.pdf',{type:'application/pdf'})];await upload.listeners.change();}
    await nodes.get('#publish').onclick();
    assert.match(nodes.get('#studio-status').textContent,/Published successfully/);
    assert.equal(published.content.profile.name,'Local QA educator');
    assert.equal(published.content.about,'Local QA about text.');
    assert.equal(published.content.qualifications[0].title,'Local QA qualification');
    assert.match(published.content.profile.cv,/\/portfolio-media\/redesign\/.*\.pdf$/);
    assert.match(published.content.resources[0].url,/\/portfolio-media\/redesign\/.*\.pdf$/);
    assert.notEqual(published.content.profile.cv,published.content.resources[0].url);
    assert.equal(published.content.schemaVersion,3);
    assert.equal(calls.length,5); // Login, one read, two uploads, one publish.
    const patch=calls.at(-1);assert.match(patch.url,/updated_at=eq.2026-09-10T00%3A00%3A00Z/);
    assert.equal(patch.options.headers.Authorization,'Bearer local-test-token');
  } finally {global.fetch=originalFetch;}
});
