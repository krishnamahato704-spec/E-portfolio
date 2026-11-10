import test from 'node:test';
import assert from 'node:assert/strict';
import {defaultContent} from '../src/content.js';
import {view} from '../src/views.js';
import {democracyResource} from '../src/evidence.js';

const opening=html=>html.match(/<section class="hero opening-hero"[\s\S]*?<\/section>/)?.[0]||'';
const studentPanel=html=>opening(html).match(/<div[^>]+data-atlas-copy="student"[^>]*>[\s\S]*?<\/div>/)?.[0]||'';

test('Home shows the teaching scope and a real lesson before gallery and personal narrative',()=>{
 const html=view('home',defaultContent,'../');
 const hero=opening(html);
 assert.ok(hero.includes(defaultContent.profile.directTeaching));
 assert.ok(hero.includes(defaultContent.profile.additionalTeaching));
 assert.match(hero,/<article class="hero-featured-evidence"/);
 assert.match(hero,/href="\.\.\/teaching\/democracy\/"/);
 assert.match(hero,/assets\/democracy-plan-preview\.webp/);
 const evidence=html.indexOf('id="teaching-evidence"');
 const gallery=html.indexOf('class="atlas-gallery-section"');
 const identity=html.indexOf('id="teacher-student"');
 assert.ok(evidence>html.indexOf('</section>'), 'The full evidence section follows the opening');
 assert.ok(gallery>evidence, 'Evidence is reachable before the photograph spread');
 assert.ok(identity>gallery, 'Personal narrative follows evidence and photographs');
 const index=html.match(/<nav class="container editorial-index"[\s\S]*?<\/nav>/)?.[0]||'';
 assert.match(index,/href="#teaching-evidence"><span>01<\/span> Evidence/);
 assert.match(index,/href="#teacher-student"><span>02<\/span> Two perspectives/);
});

test('The learner panel follows changed qualification dates, results and removals',()=>{
 const content=structuredClone(defaultContent);
 content.qualifications[0].note='Final examinations expected in September 2032';
 content.qualifications[0].expected='2032';
 content.qualifications[1].note='Final examinations expected in February 2033';
 content.qualifications[1].expected='2033';
 content.qualifications[2].place='Gurukul Kangri Vishwavidyalaya · CGPA 9.10';
 const panel=studentPanel(view('home',content));
 assert.match(panel,/B\.Ed\./);
 assert.match(panel,/September 2032/);
 assert.match(panel,/February 2033/);
 assert.match(panel,/B\.A\. History &amp; Economics/);
 assert.match(panel,/CGPA 9\.10/);
 assert.doesNotMatch(panel,/April 2027|June 2027|CGPA 8\.80/);
 content.qualifications=[];
 const cleared=studentPanel(view('home',content));
 assert.doesNotMatch(cleared,/B\.Ed\.|M\.A\.|B\.A\.|2032|2033|9\.10/);
});

test('The opening lesson preview follows the published resource and disappears when removed',()=>{
 const content=structuredClone(defaultContent);
 const resource=democracyResource(content);
 Object.assign(resource,{title:'Revised Democracy <planning> record',grade:'Class IX-C',duration:'35 minutes',thumbnail:'assets/evidence/diagnostic-assessment-report-and-tests.webp'});
 const hero=opening(view('home',content,'../'));
 const preview=hero.match(/<article class="hero-featured-evidence"[\s\S]*?<\/article>/)?.[0]||'';
 assert.match(preview,/Revised Democracy &lt;planning&gt; record/);
 assert.match(preview,/Class IX-C/);
 assert.match(preview,/35 minutes/);
 assert.match(preview,/src="\.\.\/assets\/evidence\/diagnostic-assessment-report-and-tests\.webp"/);
 assert.match(preview,/Planning evidence/);
 assert.doesNotMatch(preview,/Class IX-B|40 minutes|data-viewer/);
 content.resources=content.resources.filter(record=>record!==resource);
 assert.doesNotMatch(opening(view('home',content)),/hero-featured-evidence/);
});
