import {test} from 'node:test';
import assert from 'node:assert/strict';
import {defaultContent,publicContent,CURRENT_SCHEMA_VERSION} from '../src/content.js';
import {loadPublishedContent} from '../scripts/load-published-content.mjs';
import {view,safeUrl} from '../src/views.js';
import {uploadFile} from '../src/cloud.js';
import {validateContent} from '../src/content.js';
test('Production fails closed instead of silently publishing an outdated fallback',async()=>{
 await assert.rejects(loadPublishedContent({remote:true,fetcher:async()=>new Response('{}',{status:503})}),/deployment stopped/);
 await assert.rejects(loadPublishedContent({remote:true,fetcher:async()=>new Response('[]')}),/missing/);
 await assert.rejects(loadPublishedContent({remote:true,fetcher:async()=>new Response(JSON.stringify([{content:{...defaultContent,schemaVersion:6},updated_at:'2026-10-02T00:00:00Z'}]))}),/schema/);
});
test('A validated remote release retains its exact content and timestamp',async()=>{
 const content=structuredClone(defaultContent);content.profile.availability='August 2027';
 const release=await loadPublishedContent({remote:true,fetcher:async()=>new Response(JSON.stringify([{content,updated_at:'2026-10-02T00:00:00Z'}]))});
 assert.equal(release.content.profile.availability,'August 2027');assert.equal(release.content.schemaVersion,CURRENT_SCHEMA_VERSION);
 assert.equal(release.updatedAt,'2026-10-02T00:00:00Z');
});
test('Pending credentials stay in Studio data and are hidden from all recruiter views',()=>{
 assert.ok(defaultContent.certificates.some(c=>c.id==='gemini-badge'));
 assert.ok(!publicContent(defaultContent).certificates.some(c=>c.id==='gemini-badge'));
 for(const route of ['home','credentials','resume'])assert.doesNotMatch(view(route,defaultContent),/Gemini Certified Educator/);
});
test('Corrected dates and HTTPS-only external links are rendered consistently',()=>{
 assert.equal(safeUrl('http://example.com/file.pdf'),'');
 assert.match(view('pehchaan',defaultContent),/1 June–6 July 2026/);
 assert.doesNotMatch(view('pehchaan',defaultContent),/60% improvement demonstrated/);
 assert.doesNotMatch(view('home',defaultContent),/id="opening-name" class="sr-only"/);
});
test('Private uploads stay authenticated and cannot be published as evidence',async()=>{
 const native=global.fetch;let request;
 global.fetch=async(url,options)=>{request={url:String(url),options};return new Response('{}');};
 try{
  const url=await uploadFile({name:'permission.pdf',type:'application/pdf',size:1234},'fixture-token',{privateSource:true});
  assert.match(request.url,/portfolio-private-source\/source\/.*\.pdf$/);
  assert.equal(request.options.headers.Authorization,'Bearer fixture-token');
  assert.match(url,/\/object\/authenticated\/portfolio-private-source\//);
  const content=structuredClone(defaultContent);content.resources=[{title:'Raw private record',url}];
  assert.throws(()=>validateContent(content),/Private source files cannot be published/);
 }finally{global.fetch=native;}
});
