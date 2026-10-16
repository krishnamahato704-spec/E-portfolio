import test from 'node:test';
import assert from 'node:assert/strict';
import {defaultContent} from '../src/content.js';
import {view} from '../src/views.js';

test('Home compiles existing teaching photographs into a labelled gallery with rotation and navigation controls',()=>{
 const html=view('home',defaultContent);
 assert.match(html,/aria-roledescription="carousel"/);
 assert.equal((html.match(/data-hero-slide\b/g)||[]).length,5);
 for(const label of ['School house placards','Independence Day display','Student artwork for Major Dhyan Chand','Teaching-learning materials exhibition','Learning at Pehchaan'])assert.ok(html.includes(label),label);
 for(const control of ['data-gallery-rotation','data-gallery-previous','data-gallery-next'])assert.ok(html.includes(control),control);
 assert.match(html,/Illustrative background film/);
 assert.equal((html.match(/<video\s/g)||[]).length,1);
});

test('Home gallery preserves owner replacements and omits removed or unpublished photographs',()=>{
 const content=structuredClone(defaultContent);
 content.gallery=content.gallery.filter(r=>['school-house-placards','independence-day'].includes(r.id));
 content.gallery.find(r=>r.id==='school-house-placards').title='Owner <revised> photograph';
 content.gallery.find(r=>r.id==='independence-day').publicationStatus='Pending';
 const html=view('home',content).match(/<section class="hero opening-hero"[\s\S]*?<\/section>/)[0];
 assert.match(html,/Owner &lt;revised&gt; photograph/);
 assert.doesNotMatch(html,/Independence Day display|data-gallery-next/);
 content.gallery=[];
 assert.doesNotMatch(view('home',content),/data-hero-gallery|School house placards/);
});
