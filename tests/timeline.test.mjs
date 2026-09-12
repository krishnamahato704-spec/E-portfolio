import test from 'node:test';
import assert from 'node:assert/strict';
import {initTimeline, cleanupTimeline} from '../src/timeline.js';

test('Timeline exports initTimeline and cleanupTimeline as functions', () => {
  assert.equal(typeof initTimeline, 'function');
  assert.equal(typeof cleanupTimeline, 'function');
});

test('cleanupTimeline is idempotent and does not throw without initialization', () => {
  assert.doesNotThrow(() => {
    cleanupTimeline();
    cleanupTimeline();
  });
});

test('initTimeline safely exits when no timeline container exists', () => {
  const fakeDoc = {
    querySelector: () => null
  };
  assert.doesNotThrow(() => {
    initTimeline(fakeDoc);
    cleanupTimeline();
  });
});

test('initTimeline sets up track positioning and active states with mocked DOM elements', async () => {
  // Mock element environment
  const mockClassList = () => {
    const classes = new Set();
    return {
      add: (c) => classes.add(c),
      remove: (c) => classes.delete(c),
      contains: (c) => classes.has(c),
      get size() { return classes.size; }
    };
  };

  const createMockNode = (top, height) => ({
    getBoundingClientRect: () => ({ top, height, bottom: top + height, left: 0, right: 20 }),
    classList: mockClassList(),
    style: {}
  });

  const createMockRow = (top, height) => {
    const node = createMockNode(top + 10, 20);
    const row = {
      offsetParent: {},
      hidden: false,
      classList: mockClassList(),
      querySelector: (sel) => sel.includes('milestone-node') ? node : null,
      getBoundingClientRect: () => ({ top, height, bottom: top + height, left: 0, right: 600 }),
      style: {}
    };
    return { row, node };
  };

  const { row: row1 } = createMockRow(100, 150);
  const { row: row2 } = createMockRow(270, 150);
  const { row: row3 } = createMockRow(440, 150);

  const mockTrack = { style: {} };
  const mockFill = { style: {} };
  const mockList = {
    querySelectorAll: () => [row1, row2, row3]
  };

  const mockContainer = {
    querySelector: (sel) => {
      if (sel.includes('timeline-track')) return mockTrack;
      if (sel.includes('timeline-fill')) return mockFill;
      if (sel.includes('#experience-list')) return mockList;
      return null;
    },
    getBoundingClientRect: () => ({ top: 80, height: 600, bottom: 680, left: 0, right: 600 }),
    addEventListener: () => {},
    removeEventListener: () => {}
  };

  const fakeRoot = {
    querySelector: (sel) => sel.includes('.timeline-container') ? mockContainer : null,
    querySelectorAll: () => []
  };

  // Mock globals
  const origMatchMedia = global.matchMedia;
  const origWindow = global.window;
  const origRAF = global.requestAnimationFrame;
  const origCAF = global.cancelAnimationFrame;

  let rafCallback = null;
  global.requestAnimationFrame = (cb) => { rafCallback = cb; return 1; };
  global.cancelAnimationFrame = () => { rafCallback = null; };
  global.matchMedia = () => ({
    matches: false,
    addEventListener: () => {},
    removeEventListener: () => {}
  });
  global.window = {
    scrollY: 0,
    innerHeight: 800,
    addEventListener: () => {},
    removeEventListener: () => {}
  };

  try {
    initTimeline(fakeRoot);
    if (rafCallback) {
      rafCallback();
      rafCallback = null;
    }

    // Check track dimensions were set based on nodes
    assert.ok(mockTrack.style.top, 'Track top was computed');
    assert.ok(mockTrack.style.height, 'Track height was computed');
    assert.equal(mockTrack.style.bottom, 'auto');

    // At top of scroll (0), progress should be initialized
    assert.match(mockFill.style.transform, /scaleY/);

    cleanupTimeline();
  } finally {
    global.matchMedia = origMatchMedia;
    global.window = origWindow;
    global.requestAnimationFrame = origRAF;
    global.cancelAnimationFrame = origCAF;
  }
});

test('Teaching journey renders evidence-supported reflections and authentic evidence links', async () => {
  const {view} = await import('../src/views.js');
  const {defaultContent} = await import('../src/content.js');
  const html = view('teaching', defaultContent, '../');

  // Reflection labels: grounded in source content
  assert.ok(html.includes('WHAT I LEARNT'), 'Pehchaan reflects WHAT I LEARNT');
  assert.ok(html.includes('Activity-based foundational literacy and numeracy'), 'Pehchaan reflection text is preserved');
  assert.ok(html.includes('WHAT I NOTICED'), 'Observation reflects WHAT I NOTICED');
  assert.ok(html.includes('Structured teacher questioning that makes historical thinking visible'), 'Observation reflection text is preserved');

  // Ongoing experience only supports activities/learning without invented reflections
  const panchsheelBlock = html.slice(html.indexOf('Panchsheel Balak Inter-College'), html.indexOf('Pehchaan The Street School'));
  assert.ok(!panchsheelBlock.includes('class="experience-reflection"'), 'Ongoing Panchsheel does not force an invented reflection');
  assert.ok(panchsheelBlock.includes('Undertaking a 16-week school internship'), 'Panchsheel includes activities & learning');

  // Meaningful evidence links
  assert.ok(panchsheelBlock.includes('teaching/democracy/'), 'Panchsheel links to illustrative lesson design');
  assert.ok(html.includes('teaching/pehchaan/'), 'Pehchaan links to community teaching story');
  assert.ok(html.includes('teaching/observation/'), 'Observation links to observation notes');
  assert.ok(html.includes('credentials/'), 'Milestones link to credentials');
});


