import test from 'node:test';
import assert from 'node:assert/strict';
import {experiencePeriod} from '../src/recruiter.js';
import {documentSize} from '../src/view-helpers.js';
import {defaultContent,mergeContent} from '../src/content.js';
import {view} from '../src/views.js';
import {requestContentRebuild} from '../scripts/check-content-release-trigger.mjs';

test('The confirmed observation year is shared without overwriting later owner dates',()=>{
 const original=defaultContent.experiences.find(e=>e.id==='observation');
 assert.equal(experiencePeriod(original),'1–4 December 2025');
 assert.equal(experiencePeriod({...original,period:'1–4 December'}),'1–4 December 2025');
 assert.equal(experiencePeriod({...original,period:'1–4 December 2024'}),'1–4 December 2024');
 assert.equal(experiencePeriod({...original,period:'1–4 December 2025'}),'1–4 December 2025');
 assert.equal(experiencePeriod({...original,period:'Owner revised date'}),'Owner revised date');
 for(const route of ['home','teaching','resume','observation'])assert.match(view(route,defaultContent),/1–4 December 2025/,route);
 assert.equal(original.period,'1–4 December 2025');
});

test('Schema 8 gains the confirmed observation year while preserving owner edits and removals',()=>{
 const row=structuredClone(defaultContent);
 const observation=row.experiences.find(e=>e.id==='observation');
 const journal=row.resources.find(r=>r.id==='amity-observation-journal');
 observation.period='1–4 December';journal.date='1–4 December';
 journal.description='Edited journal with four daily records, original photographs, reflections and self-reflection. Rebuilt from the supplied handwritten journal; the source does not state a year.';
 const updated=mergeContent(row);
 assert.equal(updated.experiences.find(e=>e.id==='observation').period,'1–4 December 2025');
 assert.equal(updated.resources.find(r=>r.id===journal.id).date,'1–4 December 2025');
 assert.match(updated.resources.find(r=>r.id===journal.id).description,/confirmed the observation year as 2025/);
 observation.period='Owner corrected period';journal.date='Owner corrected date';journal.description='Owner revised description';
 const preserved=mergeContent(row);
 assert.equal(preserved.experiences.find(e=>e.id==='observation').period,observation.period);
 assert.equal(preserved.resources.find(r=>r.id===journal.id).date,journal.date);
 assert.equal(preserved.resources.find(r=>r.id===journal.id).description,journal.description);
 row.experiences=row.experiences.filter(e=>e.id!=='observation');
 row.resources=row.resources.filter(r=>r.id!==journal.id);
 const removed=mergeContent(row);
 assert.ok(!removed.experiences.some(e=>e.id==='observation'));
 assert.ok(!removed.resources.some(r=>r.id===journal.id));
});

test('Document sizes use known local originals and leave unknown uploads unlabelled',()=>{
 assert.match(documentSize(defaultContent.resources.find(r=>r.id==='amity-observation-journal').url,'../'),/\d+\.\d{2} MB/);
 assert.equal(documentSize('https://example.com/new-owner-report.pdf','../'),'');
 assert.equal(documentSize('javascript:alert(1)','../'),'');
 assert.match(view('resources',defaultContent),/class="file-size"/);
});

test('The content-release bridge skips an absent hook and rejects another destination before sending',async()=>{
 let calls=0;const fetcher=async()=>{calls++;return {ok:true};};
 assert.equal((await requestContentRebuild({fetcher})).requested,false);
 await assert.rejects(requestContentRebuild({hook:'https://example.com/deploy',fetcher}),/Unexpected/);
 assert.equal(calls,0);
});

test('A configured content rebuild uses POST without following redirects and reports errors safely',async()=>{
 const hook='https://api.vercel.com/v1/integrations/deploy/test-project/test-hook';
 const result=await requestContentRebuild({hook,fetcher:async(url,options)=>{
  assert.equal(url.href,hook);assert.equal(options.method,'POST');assert.equal(options.redirect,'error');return {ok:true};
 }});
 assert.equal(result.requested,true);assert.ok(!result.message.includes(hook));
 await assert.rejects(requestContentRebuild({hook,fetcher:async()=>({ok:false,status:403})}),/failed \(403\)/);
});
