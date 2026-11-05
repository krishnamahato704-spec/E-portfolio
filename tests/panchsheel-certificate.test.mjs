import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {defaultContent,mergeContent,CURRENT_SCHEMA_VERSION} from '../src/content.js';
import {view} from '../src/views.js';
import {loadPublishedContent} from '../scripts/load-published-content.mjs';

const certificateId='panchsheel-internship-completion';
function previousContent(){
 const c=structuredClone(defaultContent);c.schemaVersion=8;
 c.certificates=c.certificates.filter(x=>x.id!==certificateId);
 const e=c.experiences.find(x=>x.id==='panchsheel');
 Object.assign(e,{status:'Ongoing',summary:'Supervised B.Ed. school internship with classroom teaching across Social Science, English and History.'});
 e.points[0]='Undertaking a 16-week school internship: teaching Social Science in Classes 6–9 and History in Class 11 on select occasions.';
 e.points[1]='Teaching English in Classes 6 and 8 as an official B.Ed. pedagogy subject.';
 e.points[2]='Assigned classes from Tuesday through Saturday; frequently handling substitution classes.';
 return c;
}

test('The supplied Panchsheel certificate confirms completed dates and subjects',async()=>{
 const e=defaultContent.experiences.find(x=>x.id==='panchsheel');
 assert.equal(e.status,'Completed');assert.equal(e.period,'16 July–31 October 2026');
 assert.doesNotMatch(e.points.join(' '),/Undertaking|Teaching English|frequently handling/);
 const certificate=defaultContent.certificates.find(x=>x.id===certificateId);
 assert.ok(certificate);assert.equal(certificate.date,'31 October 2026');
 assert.match(certificate.description,/16 July to 31 October 2026/);
 assert.match(certificate.description,/Social Science and English/);
 assert.match(certificate.url,/panchsheel-internship-completion\.jpg$/);
 assert.equal(certificate.publicationStatus,'Approved');
 await fs.access(new URL('../assets/evidence/panchsheel-internship-completion.jpg',import.meta.url));
});

test('Recruiter views show completion and link the original certificate',()=>{
 const home=view('home',defaultContent,'./');
 assert.doesNotMatch(home,/Currently teaching:|Current school internship/);
 assert.match(home,/Teaching experience:/);
 const teaching=view('teaching',defaultContent,'../');
 assert.match(teaching,/href="\.\.\/assets\/evidence\/panchsheel-internship-completion\.jpg"[^>]*data-viewer/);
 assert.match(view('credentials',defaultContent,'../'),/panchsheel-internship-completion\.jpg/);
 assert.match(view('resume',defaultContent),/Sixteen-week B.Ed. school internship · Completed/);
 const pending=structuredClone(defaultContent);pending.certificates.find(x=>x.id===certificateId).publicationStatus='Pending review';
 for(const route of ['teaching','credentials'])assert.doesNotMatch(view(route,pending),/panchsheel-internship-completion\.jpg/);
 const ongoing=structuredClone(defaultContent);ongoing.experiences.find(x=>x.id==='panchsheel').status='Ongoing';
 assert.match(view('home',ongoing),/Currently teaching:/);
 assert.match(view('home',ongoing),/Current school internship/);
});

test('Schema 8 completion migration updates known text once and preserves later owner edits and removals',()=>{
 const old=previousContent();old.experiences.find(x=>x.id==='panchsheel').points.push('Owner activity');
 const migrated=mergeContent(old);
 assert.equal(migrated.schemaVersion,CURRENT_SCHEMA_VERSION);
 assert.equal(migrated.experiences.find(x=>x.id==='panchsheel').status,'Completed');
 assert.ok(migrated.experiences.find(x=>x.id==='panchsheel').points.includes('Owner activity'));
 assert.equal(migrated.certificates.filter(x=>x.id===certificateId).length,1);
 assert.deepEqual(mergeContent(migrated),migrated);
 migrated.certificates=migrated.certificates.filter(x=>x.id!==certificateId);
 migrated.experiences.find(x=>x.id==='panchsheel').status='Owner status';
 const later=mergeContent(migrated);
 assert.equal(later.experiences.find(x=>x.id==='panchsheel').status,'Owner status');
 assert.ok(!later.certificates.some(x=>x.id===certificateId));
 const empty=previousContent();empty.certificates=[];
 assert.deepEqual(mergeContent(empty).certificates,[]);
 const removed=previousContent();removed.experiences=[];
 assert.deepEqual(mergeContent(removed).experiences,[]);
 assert.ok(!mergeContent(removed).certificates.some(x=>x.id===certificateId));
 const edited=previousContent();edited.experiences.find(x=>x.id==='panchsheel').period='Owner corrected dates';
 assert.equal(mergeContent(edited).experiences.find(x=>x.id==='panchsheel').period,'Owner corrected dates');
});

test('The published content loader supports the explicit schema 8 completion upgrade',async()=>{
 const old=previousContent();
 const release=await loadPublishedContent({remote:true,fetcher:async()=>new Response(JSON.stringify([{content:old,updated_at:'2026-11-03T15:30:00Z'}]))});
 assert.equal(release.content.schemaVersion,CURRENT_SCHEMA_VERSION);
 assert.equal(release.content.experiences.find(x=>x.id==='panchsheel').status,'Completed');
 assert.ok(release.content.certificates.some(x=>x.id===certificateId));
 assert.equal(release.updatedAt,'2026-11-03T15:30:00Z');
 const input=new URL('../outputs/panchsheel-release-input.json',import.meta.url);
 await fs.writeFile(input,JSON.stringify({content:old,updatedAt:release.updatedAt,source:'supabase'}));
 try {
  const cached=await loadPublishedContent({remote:true,inputFile:input});
  assert.equal(cached.content.schemaVersion,CURRENT_SCHEMA_VERSION);
  assert.equal(cached.content.experiences.find(x=>x.id==='panchsheel').status,'Completed');
 } finally {await fs.unlink(input);}
});
