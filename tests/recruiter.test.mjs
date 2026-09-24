import test from 'node:test';
import assert from 'node:assert/strict';
import {defaultContent,mergeContent,validateContent} from '../src/content.js';
import {studySummary,recruiterFacts,recruitmentGaps} from '../src/recruiter.js';
import {view} from '../src/views.js';

test('Legacy pair gains the existing ongoing internship; saved removals stay removed',()=>{
 const legacy={experiences:defaultContent.experiences.slice(1).map(({id,institution,category,status,duration,durationUnit,summary,...rest})=>rest)};
 const c=mergeContent(legacy);
 assert.equal(c.experiences.length,3);
 assert.equal(c.experiences[0].id,'panchsheel');
 assert.equal(c.experiences[1].institution,'Pehchaan The Street School');
 const empty=mergeContent({schemaVersion:4,experiences:[]});
 assert.equal(empty.experiences.length,0);
 assert.ok(!view('home',empty).includes('Panchsheel'));
 assert.ok(!view('resume',empty).includes('Panchsheel'));
});
test('Owner edits control study status and experience text across recruiter pages',()=>{
 const c=mergeContent();
 c.qualifications.forEach(q=>q.status='Completed');
 c.experiences[0].institution='Updated school';c.experiences[0].title='Updated school internship';
 assert.ok(!studySummary(c).includes('in progress'));
 for(const route of ['home','profile','resume','contact'])assert.ok(!view(route,c).includes('History in progress'),route);
 assert.ok(view('home',c).includes('Updated school'));
 assert.ok(view('teaching',c).includes('Updated school internship'));
 assert.ok(view('resume',c).includes('Updated school internship'));
});
test('Recruiter fields are optional, escaped and labelled as interests',()=>{
 const c=mergeContent();c.profile.location='<script>bad()</script>';
 assert.match(view('home',c),/&lt;script&gt;bad\(\)&lt;\/script&gt;/);
 assert.match(view('home',c),/Boards of interest/);
 c.profile.location='';c.profile.targetBoards='';
 assert.ok(!recruiterFacts(c).some(([k])=>k==='Based in'||k==='Boards of interest'));
 assert.ok(recruitmentGaps(c).some(x=>x.includes('current city')));
 c.profile.location={city:'Noida'};assert.throws(()=>validateContent(c),/location must be text/);
});
test('Backend shape preserves owner metadata and labels interests without inventing evidence',()=>{
 const c=mergeContent({schemaVersion:4,profile:{location:'Owner city',eligibility:'Owner status'},experiences:[{id:'owner-entry',title:'Owner title',points:[],category:'Observation',institution:'Owner school'}]});
 assert.equal(validateContent(c),c);
 assert.equal(c.profile.location,'Owner city');assert.equal(c.profile.eligibility,'Owner status');
 assert.equal(c.experiences.length,1);assert.equal(c.experiences[0].institution,'Owner school');
 assert.equal(c.resources.length,0);
});
