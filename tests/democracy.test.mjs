import test from 'node:test';
import assert from 'node:assert/strict';
import {initDemocracy, cleanupDemocracy} from '../src/democracy.js';

test('Democracy exports initDemocracy and cleanupDemocracy as functions', () => {
  assert.equal(typeof initDemocracy, 'function');
  assert.equal(typeof cleanupDemocracy, 'function');
});

test('cleanupDemocracy is idempotent and safe without initialization', () => {
  assert.doesNotThrow(() => {
    cleanupDemocracy();
    cleanupDemocracy();
  });
});

test('initDemocracy safely exits when no democracy layout exists', () => {
  const fakeDoc = {
    querySelector: () => null
  };
  assert.doesNotThrow(() => {
    initDemocracy(fakeDoc);
    cleanupDemocracy();
  });
});

test('Democracy retains the six detailed source sections in their original sequence', async () => {
  const {view} = await import('../src/views.js');
  const {defaultContent} = await import('../src/content.js');
  const html = view('democracy', defaultContent, '../');

  // Exactly 6 stages
  const stageMatches = html.match(/<section[^>]+class="democracy-stage/g) || [];
  assert.equal(stageMatches.length, 6, 'Exactly six stages rendered');

  // Verify each stage ID and badge
  const expectedStages = [
    {id: 'stage-question', badge: '01', title: 'The shared learning intention'},
    {id: 'stage-explore', badge: '02', title: 'Begin with what learners know'},
    {id: 'stage-discuss', badge: '03', title: 'Use visuals and questions'},
    {id: 'stage-explain', badge: '04', title: 'Oral and written ways to respond'},
    {id: 'stage-assess', badge: '05', title: 'Check for understanding'},
    {id: 'stage-reflect', badge: '06', title: 'Reflect and adjust'}
  ];

  for (const st of expectedStages) {
    assert.ok(html.includes(`id="${st.id}"`), `Stage ${st.id} is present`);
    assert.ok(html.includes(st.badge), `Badge ${st.badge} is present`);
    assert.ok(html.includes(st.title), `Title ${st.title} is present`);
  }
});


test('Compact lesson leads with four steps and retains source access and evidence limits',async()=>{
 const {view}=await import('../src/views.js');
 const {defaultContent}=await import('../src/content.js');
 const html=view('democracy',defaultContent,'../../');
 const sequence=html.match(/<ol class="lesson-sequence">([\s\S]*?)<\/ol>/)[1];
 assert.equal((sequence.match(/<li>/g)||[]).length,4);
 assert.match(html,/Planning evidence/);
 assert.match(html,/not a report of a delivered lesson/);
 assert.match(html,/<details class="evidence-details">/);
 assert.match(html,/download="democracy-lesson-plan.pdf"/);
 assert.doesNotMatch(html,/democracy-stage-counter|democracy-stage-nav/);
});
test('Democracy story retains readable content without hiding future stages', async () => {
  const {view} = await import('../src/views.js');
  const {defaultContent} = await import('../src/content.js');
  const html = view('democracy', defaultContent, '../');

  // Check pathways in stage 4 are preserved
  assert.ok(html.includes('Learners are asked to recall, discuss, explain'), 'Pathway 1 preserved');
  assert.ok(html.includes('does not specify differentiated tasks'), 'Pathway 2 preserved');

  // Continuation bridge to Chapter 04 Resources
  assert.ok(html.includes('Teacher’s Resource Library'), 'Bridge title present');
  assert.ok(html.includes('resources/'), 'Bridge link present');
});
