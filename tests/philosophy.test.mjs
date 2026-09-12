import test from 'node:test';
import assert from 'node:assert/strict';
import {initPhilosophy, cleanupPhilosophy} from '../src/philosophy.js';

test('Philosophy exports initPhilosophy and cleanupPhilosophy as functions', () => {
  assert.equal(typeof initPhilosophy, 'function');
  assert.equal(typeof cleanupPhilosophy, 'function');
});

test('cleanupPhilosophy is idempotent and safe without initialization', () => {
  assert.doesNotThrow(() => {
    cleanupPhilosophy();
    cleanupPhilosophy();
  });
});

test('initPhilosophy safely exits when no philosophy sequence exists', () => {
  const fakeDoc = {
    querySelector: () => null
  };
  assert.doesNotThrow(() => {
    initPhilosophy(fakeDoc);
    cleanupPhilosophy();
  });
});

test('Teaching philosophy renders editorial sequence preserving exactly three principles', async () => {
  const {view} = await import('../src/views.js');
  const {defaultContent} = await import('../src/content.js');
  const html = view('teaching', defaultContent, '../');

  // Three principles preserved
  assert.ok(html.includes('Inquiry before recall'), 'Principle 1 title preserved');
  assert.ok(html.includes('Different routes, shared depth'), 'Principle 2 title preserved');
  assert.ok(html.includes('Assessment that changes teaching'), 'Principle 3 title preserved');

  // Count philosophy principles
  const principleMatches = html.match(/class="philosophy-principle"/g) || [];
  assert.equal(principleMatches.length, 3, 'Exactly three principles rendered, no fourth principle');

  // Sequenced numerals
  assert.ok(html.includes('PRINCIPLE 01'), 'Principle 01 label present');
  assert.ok(html.includes('PRINCIPLE 02'), 'Principle 02 label present');
  assert.ok(html.includes('PRINCIPLE 03'), 'Principle 03 label present');

  // Classroom implications
  assert.ok(html.includes('Classroom Implication'), 'Classroom implication cue is present');
  assert.ok(html.includes('Students examine primary sources, maps, and contradictory accounts'), 'Principle 1 implication present');
  assert.ok(html.includes('comprehension routes flex between textual sources, visual interpretations'), 'Principle 2 implication present');
  assert.ok(html.includes('Checks for understanding directly determine whether to reteach'), 'Principle 3 implication present');
});

test('Teaching philosophy presents Tagore and Vygotsky as supporting intellectual influences', async () => {
  const {view} = await import('../src/views.js');
  const {defaultContent} = await import('../src/content.js');
  const html = view('teaching', defaultContent, '../');

  // Supporting citations
  assert.ok(html.includes('Intellectual Foundations'), 'Foundations label present');
  assert.ok(html.includes('Rabindranath Tagore'), 'Rabindranath Tagore is present');
  assert.ok(html.includes('Room for curiosity &amp; creative expression.'), 'Tagore thesis is preserved');
  assert.ok(html.includes('Lev Vygotsky'), 'Lev Vygotsky is present');
  assert.ok(html.includes('Support toward independent reasoning.'), 'Vygotsky thesis is preserved');
  assert.ok(html.includes('influence-citation'), 'Styled as archive citations rather than hero cards');
});

test('Belief to practice transition bridges directly to Democracy teaching design', async () => {
  const {view} = await import('../src/views.js');
  const {defaultContent} = await import('../src/content.js');
  const html = view('teaching', defaultContent, '../');

  // Visual bridge steps
  assert.ok(html.includes('Belief'), 'Belief step present');
  assert.ok(html.includes('Design'), 'Design step present');
  assert.ok(html.includes('Classroom'), 'Classroom step present');
  assert.ok(html.includes('Reflection'), 'Reflection step present');

  // Chapter route to Democracy
  assert.ok(html.includes('NEXT CHAPTER / LESSON DESIGN'), 'Chapter transition eyebrow present');
  assert.ok(html.includes('Explore the Democracy teaching design'), 'Democracy link present');
  assert.ok(html.includes('href="../teaching/democracy/"'), 'Democracy relative URL correctly resolved');
});
