import test from 'node:test';
import assert from 'node:assert/strict';
import {initReadingRoom, cleanupReadingRoom} from '../src/reading-room.js';

test('Reading-room setup and repeated cleanup are safe without a document', () => {
  assert.doesNotThrow(() => {
    cleanupReadingRoom();
    initReadingRoom();
    initReadingRoom(null);
    cleanupReadingRoom();
    cleanupReadingRoom();
  });
});

test('An empty home root needs no browser APIs or document mutations', () => {
  const root = {
    ownerDocument: {body: {dataset: {route: 'home'}}},
    querySelectorAll: () => [],
  };
  assert.doesNotThrow(() => {
    initReadingRoom(root);
    initReadingRoom(root);
    cleanupReadingRoom();
  });
});

test('Reading-room enhancements stay on the home route', () => {
  const root = {
    ownerDocument: {body: {dataset: {route: 'philosophy'}}},
    querySelectorAll: () => { throw new Error('Other routes must not be enhanced'); },
  };
  assert.doesNotThrow(() => initReadingRoom(root));
});

// The lens only needs event targets, attributes and a dataset. Keep this small
// boundary fixture independent of a browser or a DOM emulation package.
class LensButton extends EventTarget {
  constructor(lens) {
    super();
    this.dataset = {lens};
    this.attributes = new Map();
  }
  setAttribute(name, value) { this.attributes.set(name, value); }
  getAttribute(name) { return this.attributes.get(name); }
}

test('The identity lens changes emphasis, keeps content visible and resets on cleanup', () => {
  const buttons = ['both', 'teacher', 'student'].map(lens => new LensButton(lens));
  const pair = {dataset: {}, hidden: false};
  const group = {hidden: true, querySelectorAll: () => buttons};
  const root = {
    ownerDocument: {body: {dataset: {route: 'home'}}, defaultView: {AbortController}},
    querySelectorAll(selector) {
      if (selector === '[data-identity-lens]') return [group];
      if (selector === '[data-identity-pair]') return [pair];
      return [];
    },
  };
  initReadingRoom(root);
  assert.equal(group.hidden, false);
  assert.equal(pair.dataset.lens, 'both');
  assert.equal(buttons[0].getAttribute('aria-pressed'), 'true');
  buttons[2].dispatchEvent(new Event('click'));
  assert.equal(pair.dataset.lens, 'student');
  assert.equal(buttons[2].getAttribute('aria-pressed'), 'true');
  assert.equal(buttons[0].getAttribute('aria-pressed'), 'false');
  assert.equal(pair.hidden, false);
  cleanupReadingRoom();
  cleanupReadingRoom();
  assert.equal(group.hidden, true);
  assert.equal(pair.dataset.lens, 'both');
  buttons[1].dispatchEvent(new Event('click'));
  assert.equal(pair.dataset.lens, 'both', 'cleaned-up controls cannot change emphasis');
});
