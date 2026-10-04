import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {defaultContent,mergeContent} from '../src/content.js';
import {view} from '../src/views.js';
const legacyPoints=['Observed Social Science and History lessons in Classes 6–12.','Observed school assemblies, morning events and a student-organised PCOS/PCOD awareness programme.','Studied classroom questioning, student engagement and management practices.','Connected teacher-education theory with daily classroom practice.'];
function previousPublishedRow(){
 const row=structuredClone(defaultContent);row.schemaVersion=7;
 Object.assign(row.experiences.find(e=>e.id==='observation'),{period:'24–28 November 2025',type:'Five-day school observation',duration:'5',summary:'Observation of Social Science and History classrooms across Classes 6–12.',points:legacyPoints});
 row.resources=row.resources.filter(r=>r.id!=='amity-observation-journal');return row;
}
test('The supplied journal corrects the old Amity record and survives the cloud merge',()=>{
 const c=mergeContent(previousPublishedRow());const e=c.experiences.find(e=>e.id==='observation');
 assert.equal(e.period,'1–4 December');assert.equal(e.duration,'4');assert.equal(e.type,'Four-day school observation');
 assert.deepEqual(e.points,defaultContent.experiences.find(e=>e.id==='observation').points);
 assert.equal(c.resources.filter(r=>r.id==='amity-observation-journal').length,1);
 assert.equal(c.schemaVersion,8);assert.deepEqual(mergeContent(c),c);
});
test('Amity migration respects custom observations, empty libraries and later journal removal',()=>{
 const old=previousPublishedRow();old.experiences.find(e=>e.id==='observation').points=['Owner classroom observation'];
 assert.deepEqual(mergeContent(old).experiences.find(e=>e.id==='observation').points,['Owner classroom observation']);
 old.resources=[];assert.deepEqual(mergeContent(old).resources,[]);
 const edited=previousPublishedRow();edited.experiences.find(e=>e.id==='observation').period='Owner corrected dates';
 assert.equal(mergeContent(edited).experiences.find(e=>e.id==='observation').period,'Owner corrected dates');
 const removed=mergeContent(previousPublishedRow());removed.resources=removed.resources.filter(r=>r.id!=='amity-observation-journal');
 assert.ok(!mergeContent(removed).resources.some(r=>r.id==='amity-observation-journal'));
});
test('Each internship detail uses its own supporting evidence',()=>{
 const amity=view('observation',defaultContent,'../../');const pehchaan=view('pehchaan',defaultContent,'../../');
 assert.match(amity,/amity-observation-reflective-journal\.pdf/);assert.match(amity,/Day 4 · 4 December/);
 assert.match(amity,/Kinship, Caste and Class/);assert.doesNotMatch(amity,/certificate-2|Pehchaan certificate|ntcc-community-report/);
 assert.match(pehchaan,/Pehchaan certificate/);assert.match(pehchaan,/ntcc-community-report\.pdf/);assert.doesNotMatch(pehchaan,/amity-observation-reflective-journal/);
 const removed=structuredClone(defaultContent);removed.resources=removed.resources.filter(r=>r.id!=='amity-observation-journal');
 assert.doesNotMatch(view('observation',removed),/amity-observation-reflective-journal|The four-day record/);
});
test('The rebuilt journal is a real local PDF included in the public package',async()=>{
 const asset=await fs.readFile(new URL('../assets/evidence/amity-observation-reflective-journal.pdf',import.meta.url));
 const packaged=await fs.readFile(new URL('../dist/assets/evidence/amity-observation-reflective-journal.pdf',import.meta.url));
 assert.equal(asset.subarray(0,5).toString(),'%PDF-');assert.deepEqual(packaged,asset);
 const data=JSON.parse(await fs.readFile(new URL('../docs/amity-journal.json',import.meta.url),'utf8'));
 assert.equal(data.period,'1-4 December');assert.equal(data.sourcePages,49);assert.equal(data.pages.length,16);
});
