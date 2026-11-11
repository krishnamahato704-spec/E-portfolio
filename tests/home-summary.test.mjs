import test from 'node:test';
import assert from 'node:assert/strict';
import {defaultContent} from '../src/content.js';
import {view} from '../src/views.js';

test('Home opens with the added summary and preserves the original portfolio after it',()=>{
 const home=view('home',defaultContent);
 const summary=home.indexOf('class="portfolio-summary"');
 const opening=home.indexOf('id="portfolio-introduction"');
 assert.ok(summary>=0&&summary<opening);
 assert.match(home,/href="#portfolio-introduction"/);
 assert.equal((home.match(/<h1\b/g)||[]).length,1);
 assert.match(home,/class="hero opening-hero"/);
 assert.match(home,/class="home-record-band journey-band"/);
 assert.match(home,/class="home-record-band education-band"/);
 assert.doesNotMatch(view('profile',defaultContent),/class="portfolio-summary"/);
 assert.match(view('profile',defaultContent),/<h1>About Me<\/h1>/);
});

test('Home summary follows owner availability and removed or completed studies',()=>{
 const content=structuredClone(defaultContent);
 content.profile.name='Owner <name>';
 content.profile.availability='August 2028';
 content.qualifications=content.qualifications.filter(q=>q.title==='B.A. History & Economics');
 const summary=view('home',content).split('id="portfolio-introduction"')[0];
 assert.match(summary,/Owner &lt;name&gt;/);
 assert.match(summary,/Available from August 2028/);
 assert.doesNotMatch(summary,/Currently studying|B.Ed.|M.A. History|In progress/);
});
