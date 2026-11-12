import test from 'node:test';
import assert from 'node:assert/strict';
import {defaultContent} from '../src/content.js';
import {diagnosticCaseStudy} from '../src/assessment-case-study.js';
import {view} from '../src/views.js';

const originalId='diagnostic-assessment-report-and-tests';
const contentWithResource=change=>{
 const content=structuredClone(defaultContent);
 const resource=content.resources.find(item=>item.id===originalId);
 Object.assign(resource,change);
 return content;
};

test('The verified case connects the teaching decision with the reported scores and their limits',()=>{
 const content=structuredClone(defaultContent);
 const before=structuredClone(content);
 const result=diagnosticCaseStudy(content);
 assert.equal(result.resource,content.resources.find(item=>item.id===originalId));
 assert.match(result.summary,/three 80-mark assessments and two remedial phases with 40 Class IX-A learners/);
 assert.match(result.summary,/map work, vocabulary and answer writing after the progress test/);
 assert.match(result.summary,/43\.10, 44\.50 and 48\.00 out of 80/);
 assert.match(result.outcome,/31.*higher.*2.*unchanged.*7.*lower/);
 assert.match(result.limitation,/not equated for difficulty/);
 assert.match(result.limitation,/do not establish that remedial teaching caused/);
 assert.match(result.cvSummary,/40 learners/);
 assert.match(result.cvSummary,/43\.10 to 48\.00\/80/);
 assert.match(result.cvSummary,/papers not equated/);
 assert.doesNotMatch(result.summary+' '+result.outcome+' '+result.cvSummary,/\b(?:caused|proved|guaranteed|led to|raised|boosted)\b/i);
 assert.deepEqual(content,before);
});

test('Removal, hidden publication or a replacement document removes the verified case',()=>{
 const removed=structuredClone(defaultContent);
 removed.resources=removed.resources.filter(item=>item.id!==originalId);
 assert.equal(diagnosticCaseStudy(removed),null);
 assert.equal(diagnosticCaseStudy({resources:[]}),null);
 assert.equal(diagnosticCaseStudy({}),null);
 for(const change of [
  {publicationStatus:'Draft'},
  {id:'replacement-report'},
  {url:'https://example.com/replacement.pdf'},
  {url:'https://krishnamahato704-spec.github.io/E-portfolio/assets/evidence/diagnostic-assessment-report-and-tests.pdf?edition=2'}
 ])assert.equal(diagnosticCaseStudy(contentWithResource(change)),null,JSON.stringify(change));
});

test('Changed class, subject, title, date or context cannot inherit the original case results',()=>{
 for(const change of [
  {grade:'Class X-A'},
  {subject:'English'},
  {title:'A different assessment'},
  {category:'Presentation'},
  {date:'September 2027'},
  {context:'Different school placement'}
 ])assert.equal(diagnosticCaseStudy(contentWithResource(change)),null,JSON.stringify(change));
});

test('Known local paths identify the same bundled document; lookalike URLs do not',()=>{
 for(const url of ['assets/evidence/diagnostic-assessment-report-and-tests.pdf','./assets/evidence/diagnostic-assessment-report-and-tests.pdf'])
  assert.ok(diagnosticCaseStudy(contentWithResource({url})));
 assert.equal(diagnosticCaseStudy(contentWithResource({url:'https://example.com/assets/evidence/diagnostic-assessment-report-and-tests.pdf'})),null);
});

test('Owner HTML and unverified numbers are never interpolated into the plain-text case copy',()=>{
 const result=diagnosticCaseStudy(contentWithResource({description:'<img src=x onerror="alert(1)"> I improved every score by 100%.'}));
 assert.ok(result);
 for(const key of ['summary','outcome','limitation','cvSummary']){
  assert.equal(typeof result[key],'string');
  assert.doesNotMatch(result[key],/<|>|onerror|100%|alert/);
 }
 assert.equal(diagnosticCaseStudy(contentWithResource({title:'<script>alert(1)</script>'})),null);
});

test('Rendered recruiter pages only attach verified scores to the original published report',()=>{
 for(const route of ['home','resources','teaching','resume']){
  const original=view(route,defaultContent,'../');
  assert.match(original,/43\.10/,'Original scores appear on '+route);
  assert.match(original,/not equated/,'The comparison limit appears on '+route);
  if(route!=='resume')assert.match(original,/href="\.\.\/assets\/evidence\/diagnostic-assessment-report-and-tests\.pdf"/);
  const removed=structuredClone(defaultContent);
  removed.resources=removed.resources.filter(item=>item.id!==originalId);
  for(const content of [removed,contentWithResource({publicationStatus:'Pending'}),contentWithResource({url:'https://example.com/replacement.pdf'})]){
   const html=view(route,content,'../');
   assert.doesNotMatch(html,/43\.10|44\.50|48\.00/,'No original scores without the verified report on '+route);
   assert.doesNotMatch(html,/href="[^"]*diagnostic-assessment-report-and-tests\.pdf"/,'No stale report link on '+route);
  }
 }
});
