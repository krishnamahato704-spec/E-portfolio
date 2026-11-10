import test from 'node:test';
import assert from 'node:assert/strict';
import {defaultContent} from '../src/content.js';
import {view} from '../src/views.js';

test('Removing all experiences removes the journey index destination as well',()=>{
 const content=structuredClone(defaultContent);
 content.experiences=[];
 const html=view('home',content);
 assert.doesNotMatch(html,/href="#teaching-journey"/);
 assert.doesNotMatch(html,/id="teaching-journey"/);
});

test('Custom experiences cannot inherit the Amity campus preview',()=>{
 const content=structuredClone(defaultContent);
 content.experiences=[{id:'owner-school',title:'Owner school',institution:'Owner school',points:[],summary:'Owner record'}];
 const html=view('home',content);
 const journey=html.slice(html.indexOf('id="teaching-journey"'),html.indexOf('class="container section home-education"'));
 assert.match(journey,/Owner record/);
 assert.doesNotMatch(journey,/data-preview-src|amity-journal\/campus/);
});

test('Replacing an observation journal or school removes its original campus preview',()=>{
 for(const change of ['journal','school']){
  const content=structuredClone(defaultContent);
  if(change==='journal')content.resources.find(r=>r.id==='amity-observation-journal').url='https://example.com/owner-journal.pdf';
  else content.experiences.find(e=>e.id==='observation').institution='Owner revised school';
  const html=view('home',content);
  const journey=html.slice(html.indexOf('id="teaching-journey"'),html.indexOf('class="container section home-education"'));
  assert.doesNotMatch(journey,/amity-journal\/campus/);
 }
});
