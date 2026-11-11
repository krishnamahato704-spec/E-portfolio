import test from 'node:test';
import assert from 'node:assert/strict';
import {defaultContent} from '../src/content.js';
import {sortQualifications,sortExperiences} from '../src/chronology.js';
import {educationTimeline} from '../src/education.js';
import {qualificationRows} from '../src/view-helpers.js';

const titles=records=>records.map(record=>record.title);
const academicOrder=['B.Ed.','M.A. History','B.A. History & Economics','Class XII · CBSE','Class X'];
const assertOrder=(html,values)=>{
 const positions=values.map(value=>html.indexOf(value));
 assert.ok(positions.every(position=>position>=0),'Every expected record is rendered');
 assert.deepEqual([...positions].sort((a,b)=>a-b),positions,'Records appear newest first');
};

test('Education is newest first after owner input is shuffled, without mutating saved content',()=>{
 const shuffled=[4,2,1,3,0].map(index=>structuredClone(defaultContent.qualifications[index]));
 const before=structuredClone(shuffled);
 assert.deepEqual(titles(sortQualifications(shuffled)),academicOrder);
 assert.deepEqual(shuffled,before);
 const content={...defaultContent,qualifications:shuffled};
 const profile=educationTimeline(content,'../',{profile:true});
 assertOrder(profile,['<h3>B.Ed.</h3>','<h3>M.A. History</h3>','<h3>B.A. History &amp; Economics</h3>','<h3>Class XII · CBSE</h3>','<h3>Class X</h3>']);
 assert.match(profile,/<ol class="education-timeline"/);
 assert.match(profile,/Current studies \(Concurrent\)/);
 assert.equal((profile.match(/data-tilt/g)||[]).length,5);
 assert.equal((profile.match(/In progress · Expected 2027/g)||[]).length,2);
 const resume=qualificationRows(content);
 assertOrder(resume,['<h3>B.Ed.</h3>','<h3>M.A. History</h3>','<h3>B.A. History &amp; Economics</h3>','<h3>Class XII · CBSE</h3>','<h3>Class X</h3>']);
});

test('Home keeps current studies and the latest completed degree when records are shuffled',()=>{
 const content={...defaultContent,qualifications:[...defaultContent.qualifications].reverse()};
 const home=educationTimeline(content,'./');
 assertOrder(home,['<h3>B.Ed.</h3>','<h3>M.A. History</h3>','<h3>B.A. History &amp; Economics</h3>']);
 assert.doesNotMatch(home,/<h3>Class X/);
 assert.match(home,/Latest completed degree/);
});

test('End dates sort internships within the same year and current work comes first',()=>{
 const shuffled=[...defaultContent.experiences].reverse();
 const before=structuredClone(shuffled);
 assert.deepEqual(sortExperiences(shuffled).map(record=>record.id),['panchsheel','pehchaan','observation']);
 assert.deepEqual(shuffled,before);
 const custom=[
  {id:'old',title:'Old',period:'December 2025',status:'Completed'},
  {id:'march',title:'March',period:'3–8 March 2026',status:'Completed'},
  {id:'february',title:'February',period:'20–28 February 2026',status:'Completed'},
  {id:'current',title:'Current',period:'2025–Present',status:'Ongoing'},
  {id:'undated',title:'Undated',period:'Year not recorded',status:'Completed'}
 ];
 assert.deepEqual(sortExperiences(custom).map(record=>record.id),['current','march','february','old','undated']);
});

test('Completed qualifications use their recorded end year, without treating expected completion as achieved',()=>{
 const records=[
  {title:'Earlier degree',period:'2018–2021',status:'Completed'},
  {title:'Current study',period:'2025–Present',status:'In progress',expected:'2027'},
  {title:'Later award',period:'2020–2024',status:'Completed'},
  {title:'Undated award',period:'Not recorded',status:'Completed',expected:'2030'}
 ];
 assert.deepEqual(titles(sortQualifications(records)),['Current study','Later award','Earlier degree','Undated award']);
 assert.equal(records[1].status,'In progress');
});
