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

test('Democracy lesson design renders exactly 6 instructional stages in correct sequence', async () => {
  const {view} = await import('../src/views.js');
  const {defaultContent} = await import('../src/content.js');
  const html = view('democracy', defaultContent, '../');

  // Exactly 6 stages
  const stageMatches = html.match(/<section[^>]+class="democracy-stage/g) || [];
  assert.equal(stageMatches.length, 6, 'Exactly six stages rendered');

  // Verify each stage ID and badge
  const expectedStages = [
    {id: 'stage-question', badge: 'STAGE 01', title: 'The shared learning intention'},
    {id: 'stage-explore', badge: 'STAGE 02', title: 'Explore through historical evidence'},
    {id: 'stage-discuss', badge: 'STAGE 03', title: 'Discuss and interpret'},
    {id: 'stage-explain', badge: 'STAGE 04', title: 'Offer different pathways'},
    {id: 'stage-assess', badge: 'STAGE 05', title: 'Check for understanding'},
    {id: 'stage-reflect', badge: 'STAGE 06', title: 'Reflect and adjust'}
  ];

  for (const st of expectedStages) {
    assert.ok(html.includes(`id="${st.id}"`), `Stage ${st.id} is present`);
    assert.ok(html.includes(st.badge), `Badge ${st.badge} is present`);
    assert.ok(html.includes(st.title), `Title ${st.title} is present`);
  }
});

test('Democracy sticky planning lens renders stage navigation, local progress, and active stage label', async () => {
  const {view} = await import('../src/views.js');
  const {defaultContent} = await import('../src/content.js');
  const html = view('democracy', defaultContent, '../');

  // Local progress indicator present
  assert.ok(html.includes('democracy-local-progress'), 'Local progress indicator present');
  assert.ok(html.includes('id="democracy-stage-counter"'), 'Stage counter present');
  assert.ok(html.includes('id="democracy-progress-bar"'), 'Local progress bar present');
  assert.ok(html.includes('id="democracy-active-stage-label"'), 'Active stage label present');

  // Stage navigation present with 6 links
  assert.ok(html.includes('democracy-stage-nav'), 'Stage navigation present');
  assert.ok(html.includes('href="#stage-question"'), 'Stage 1 link present');
  assert.ok(html.includes('href="#stage-explore"'), 'Stage 2 link present');
  assert.ok(html.includes('href="#stage-discuss"'), 'Stage 3 link present');
  assert.ok(html.includes('href="#stage-explain"'), 'Stage 4 link present');
  assert.ok(html.includes('href="#stage-assess"'), 'Stage 5 link present');
  assert.ok(html.includes('href="#stage-reflect"'), 'Stage 6 link present');

  // Non-delivered lesson truth notice is preserved
  assert.ok(html.includes('truth-notice'), 'Truth notice is preserved');
  assert.ok(html.includes('A full lesson plan and student assessment evidence have not yet been published'), 'Truth notice text accurate');
});

test('Democracy story retains readable content without hiding future stages', async () => {
  const {view} = await import('../src/views.js');
  const {defaultContent} = await import('../src/content.js');
  const html = view('democracy', defaultContent, '../');

  // Check pathways in stage 4 are preserved
  assert.ok(html.includes('Read, compare, discuss'), 'Pathway 1 preserved');
  assert.ok(html.includes('Look, interpret, explain'), 'Pathway 2 preserved');

  // Continuation bridge to Chapter 04 Resources
  assert.ok(html.includes('NEXT CHAPTER / 04'), 'Continuation bridge tag present');
  assert.ok(html.includes('Teacher’s Resource Library'), 'Bridge title present');
  assert.ok(html.includes('resources/'), 'Bridge link present');
});
