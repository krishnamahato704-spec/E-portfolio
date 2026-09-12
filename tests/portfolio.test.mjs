import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {defaultContent,mergeContent,validateContent} from '../src/content.js';
import {esc,safeUrl,routes,view} from '../src/views.js';
import {validateFile,loadContent,saveContent,signIn,uploadFile} from '../src/cloud.js';
const root=path.resolve(import.meta.dirname,'..');

test('Published data and supported legacy rows preserve verified metadata',()=>{
 assert.equal(validateContent(defaultContent),defaultContent);
 const legacy=mergeContent({certificates:[{title:'Seminar participation certificate',image:defaultContent.certificates[3].image}]});
 assert.match(legacy.certificates[0].description,/Co-author/);
 assert.equal(mergeContent({schemaVersion:3,certificates:[],qualifications:[]}).certificates.length,0);
 assert.equal(mergeContent({schemaVersion:3,qualifications:[]}).qualifications.length,0);
 assert.equal(mergeContent({certificates:[{...defaultContent.certificates[0],title:'Owner edited title'}]}).certificates[0].title,'Owner edited title');
});
test('Untrusted text and URLs cannot become script markup',()=>{
 assert.equal(safeUrl('javascript:alert(1)'), '');
 assert.equal(safeUrl('data:text/html,evil'),'');
 assert.equal(esc('<img src=x onerror="alert(1)">'),'&lt;img src=x onerror=&quot;alert(1)&quot;&gt;');
 const c=structuredClone(defaultContent);c.profile.name='<script>alert(1)</script>';c.profile.portrait='javascript:alert(1)';
 const rendered=view('home',c);assert.ok(!rendered.includes('<script>'));assert.ok(!rendered.includes('src="javascript:'));
});
test('Content validation rejects malformed collection entries and unsafe files',()=>{
 const c=structuredClone(defaultContent);c.experiences[0].points='invalid';assert.throws(()=>validateContent(c),/activity list/);
 const r=structuredClone(defaultContent);r.resources=[{title:'Bad link',url:'javascript:alert(1)'}];assert.throws(()=>validateContent(r),/HTTPS/);
 const p=structuredClone(defaultContent);p.profile.email='not an email';assert.throws(()=>validateContent(p),/email/);
});
test('File uploads reject executable types, mismatched MIME and oversized files',()=>{
 assert.equal(validateFile({name:'lesson.pdf',type:'application/pdf',size:1024}),'pdf');
 assert.equal(validateFile({name:'lesson-plan.docx',type:'',size:1024}),'docx');
 assert.equal(validateFile({name:'lesson-slides.pptx',type:'application/octet-stream',size:1024}),'pptx');
 assert.throws(()=>validateFile({name:'bad.svg',type:'image/svg+xml',size:200}));
 assert.throws(()=>validateFile({name:'bad.pdf',type:'text/html',size:200}));
 assert.throws(()=>validateFile({name:'large.pdf',type:'application/pdf',size:11*1024*1024}));
});
test('Teaching resource uploads normalize document MIME before storage',async()=>{
 const original=global.fetch;let seen;
 global.fetch=async(url,options)=>{seen={url:String(url),options};return new Response(JSON.stringify({Key:'redesign/test.docx'}),{status:200,headers:{'Content-Type':'application/json'}})};
 try {
  const url=await uploadFile({name:'lesson-plan.docx',type:'',size:1024},'test-token');
  assert.match(seen.url,/\/storage\/v1\/object\/portfolio-media\/redesign\/.+\.docx$/);
  assert.equal(seen.options.headers['Content-Type'],'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  assert.equal(seen.options.headers.Authorization,'Bearer test-token');
  assert.match(url,/\/storage\/v1\/object\/public\/portfolio-media\/redesign\/.+\.docx$/);
 } finally {global.fetch=original}
});
test('Every route renders a complete static document with one heading and working local links',async()=>{
 for(const [route,meta] of Object.entries(routes)){
  const file=path.join(root,meta.path.endsWith('/')||!meta.path?meta.path+'index.html':meta.path);
  const html=await fs.readFile(file,'utf8');
  assert.equal((html.match(/<h1[ >]/g)||[]).length,1,route);
  assert.match(html,/<html lang="en">/);assert.match(html,/id="main"/);assert.match(html,/Content-Security-Policy/);
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);assert.equal(ids.length,new Set(ids).size,route+' duplicate IDs');
  for(const [,href] of html.matchAll(/(?:href|src)="([^"]+)"/g)){
   if(/^(https?:|mailto:|data:)/.test(href))continue;
   const [pathname,hash]=href.split('#');const raw=pathname.split('?')[0];let target=raw.startsWith('/E-portfolio/')?path.resolve(root,raw.slice('/E-portfolio/'.length)):raw?path.resolve(path.dirname(file),raw):file;
   if(raw.endsWith('/'))target=path.join(target,'index.html');
   await fs.access(target).catch(()=>assert.fail(`${route}: missing ${href}`));
   if(hash){const linked=await fs.readFile(target,'utf8');assert.ok(linked.includes(`id="${hash}"`),`${route}: missing fragment ${href}`);}
  }
 }
});
test('Public views are usable with empty resource collections and show degree status honestly',()=>{
 assert.match(view('resources',defaultContent),/have not yet been published/);
 assert.match(view('profile',defaultContent),/In progress/);
 assert.match(view('democracy',defaultContent),/not a report of a delivered lesson/);
 assert.match(view('resume',defaultContent),/Print \/ save as PDF/);
 assert.ok(!view('home',defaultContent).includes('Download CV'));
});
test('No public page depends on legacy editor or external JavaScript',async()=>{
 const html=await fs.readFile(path.join(root,'index.html'),'utf8');
 assert.ok(!/visual-editor|supabase-storage|cdn\.jsdelivr|contenteditable/.test(html));
 for(const [,src] of html.matchAll(/<script[^>]+src="([^"]+)"/g))assert.ok(!src.startsWith('https:'));
});
test('Live content error preserves a readable static portfolio',async()=>{
 const original=global.fetch;global.fetch=async()=>({ok:false,status:503,json:async()=>({message:'Unavailable'})});
 try{await assert.rejects(loadContent(),/Unavailable/);assert.match(view('home',defaultContent),/Krishna/)}finally{global.fetch=original}
});
test('Cloud writes use optimistic locking and reject zero-row authorization/conflict responses',async()=>{
 const original=global.fetch;let seen;
 global.fetch=async(url,options)=>{seen={url,options};return {ok:true,status:200,json:async()=>[]}};
 try{await assert.rejects(saveContent(defaultContent,'test-token','2026-09-07T00:00:00Z'),/changed, or access was denied/);assert.match(seen.url,/updated_at=eq/);assert.equal(seen.options.headers.Authorization,'Bearer test-token');assert.equal(seen.options.method,'PATCH')}finally{global.fetch=original}
});
test('Non-owner authenticated accounts cannot enter the editor',async()=>{
 const original=global.fetch;let requests=0;
 global.fetch=async()=>({ok:true,status:++requests===1?200:204,json:async()=>({user:{id:'not-owner'},access_token:'test-token'})});
 try{await assert.rejects(signIn('someone@example.com','test'),/does not have portfolio editing access/);assert.equal(requests,2)}finally{global.fetch=original}
});
test('Stable experience IDs survive reordering and removed cases do not resurface',()=>{
 const c=structuredClone(defaultContent);c.experiences.reverse();
 assert.match(view('pehchaan',c),/NTCC Internship/);
 c.experiences=[];assert.match(view('pehchaan',c),/page out of place/i);assert.ok(!view('home',c).includes('Read the internship story'));
});
test('Clarified recruiter facts survive loading the legacy public record',()=>{
 const c=mergeContent({qualifications:[{title:'M.A. History',place:'Postgraduate study in History',period:'2025–Present',status:'In progress'}]});
 const html=view('profile',c);assert.match(html,/IGNOU/);assert.match(html,/First year cleared/);assert.match(html,/CTET applied/);assert.match(html,/May 2027/);
});
test('Editorial records retain owner order and escape document metadata',()=>{
 const c=structuredClone(defaultContent);
 c.experiences.reverse();
 const teaching=view('teaching',c);
 assert.ok(teaching.indexOf(esc(c.experiences[0].title))<teaching.indexOf(esc(c.experiences[1].title)));
 for(const entry of c.experiences)assert.ok(teaching.includes(esc(entry.period)));
 c.certificates=[{...c.certificates[0],issuer:'<em>Owner issuer</em>',date:'Owner date'}];
 const evidence=view('credentials',c);
 assert.match(evidence,/<dt>Issued by<\/dt><dd>&lt;em&gt;Owner issuer&lt;\/em&gt;<\/dd>/);
 assert.match(evidence,/<dt>Date<\/dt><dd>Owner date<\/dd>/);
 assert.match(view('resources',c),/id="resource-count"[^>]*role="status"/);
});
test('Supabase client library is configured with project URL and public key',async()=>{
 const {supabase,supabaseUrl,supabaseAnonKey}=await import('../src/supabase.js');
 assert.ok(supabase);
 assert.equal(supabaseUrl,'https://oyqevsygintkjrkfbzpx.supabase.co');
 assert.equal(supabaseAnonKey,'sb_publishable_CZOIotDHbTM9m4E8vHZ9Aw_H3-G9mAd');
 assert.ok(typeof supabase.from==='function');
 assert.ok(typeof supabase.auth.signInWithPassword==='function');
});
