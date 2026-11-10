import test from 'node:test';
import assert from 'node:assert/strict';
import { initAtlasField, cleanupAtlasField } from '../src/atlas-field.js';

test('the decorative field is safe before the DOM exists or after it is removed', () => {
  assert.doesNotThrow(() => initAtlasField());
  assert.doesNotThrow(() => initAtlasField(null));
  assert.doesNotThrow(() => initAtlasField({ querySelector: () => null }));
  assert.doesNotThrow(() => cleanupAtlasField());
  assert.doesNotThrow(() => cleanupAtlasField());
});

test('mode controls and motion preferences stop cleanly on disposal', () => {
  class Element extends EventTarget {
    constructor() { super(); this.dataset = {}; this.attributes = new Map(); this.hidden = true; }
    setAttribute(name, value) { this.attributes.set(name, value); }
    removeAttribute(name) { this.attributes.delete(name); }
  }
  const preference = new EventTarget(); preference.matches = true;
  const connection = new EventTarget(); connection.saveData = false;
  const scheduled = new Map(); let serial = 0, clears = 0;
  const context = new Proxy({}, { get(target, key) {
    if (key === 'createRadialGradient') return () => ({ addColorStop() {} });
    if (key === 'clearRect') return () => { clears++; };
    return target[key] || (() => {});
  }});
  const win = new EventTarget();
  Object.assign(win, {
    Path2D: class { moveTo() {} lineTo() {} closePath() {} },
    matchMedia: () => preference, navigator: { connection },
    innerWidth: 1400, innerHeight: 900, devicePixelRatio: 2,
    requestAnimationFrame: callback => { scheduled.set(++serial, callback); return serial; },
    cancelAnimationFrame: id => scheduled.delete(id),
  });
  const doc = new EventTarget(); doc.defaultView = win; doc.hidden = false;
  const canvas = new Element(); canvas.getContext = () => context;
  let canvasTop = 0;
  canvas.getBoundingClientRect = () => ({ width: 1400, height: 950, left: 0, top: canvasTop, right: 1400, bottom: canvasTop + 950 });
  const controls = new Element(); const status = new Element(); const pause = new Element();
  const teacher = new Element(); teacher.dataset.atlasMode = 'teacher';
  const student = new Element(); student.dataset.atlasMode = 'student';
  const hero = new Element(); hero.ownerDocument = doc;
  hero.getBoundingClientRect = () => ({ width: 1400, height: 1600, left: 0, top: 0, right: 1400, bottom: 1600 });
  hero.matches = () => true;
  hero.querySelector = selector => ({ '[data-atlas-field]': canvas, '[data-atlas-controls]': controls, '[data-atlas-status]': status, '[data-atlas-pause]': pause })[selector];
  hero.querySelectorAll = selector => {
    assert.equal(selector, 'button[data-atlas-mode]');
    return [teacher, student];
  };

  initAtlasField(hero);
  assert.equal(hero.dataset.atlasMode, 'teacher');
  assert.equal(controls.hidden, false);
  assert.equal(canvas.width, 2100, 'pixel density is capped at 1.5');
  assert.equal(canvas.height, 1425, 'bitmap follows the 950px scene, not the taller hero');
  assert.equal(scheduled.size, 0, 'reduced motion has no animation loop');
  student.dispatchEvent(new Event('click'));
  assert.equal(hero.dataset.atlasMode, 'student');
  assert.equal(student.attributes.get('aria-pressed'), 'true');
  assert.equal(teacher.attributes.get('aria-pressed'), 'false');
  assert.equal(status.textContent, 'Student perspective');
  preference.matches = false; preference.dispatchEvent(new Event('change'));
  assert.equal(scheduled.size, 1);
  pause.dispatchEvent(new Event('click'));
  assert.equal(scheduled.size, 0, 'the visitor can pause the atlas without changing system settings');
  assert.equal(pause.textContent, 'Play motion');
  pause.dispatchEvent(new Event('click'));
  assert.equal(scheduled.size, 1, 'the visitor can resume the atlas');
  preference.matches = true;
  const [pendingId,pendingFrame]=scheduled.entries().next().value;
  scheduled.delete(pendingId);pendingFrame(1000);
  assert.equal(scheduled.size,0,'a delayed preference event cannot leave the render loop running');
  assert.equal(pause.disabled,true,'the next frame settles motion controls even before a preference event');
  preference.matches=false;preference.dispatchEvent(new Event('change'));
  canvasTop = -951; win.dispatchEvent(new Event('scroll'));
  assert.equal(scheduled.size, 0, 'loop stops when the canvas leaves even if the photo spread is visible');
  canvasTop = 0; win.dispatchEvent(new Event('scroll'));
  assert.equal(scheduled.size, 1, 'loop resumes when the scene returns');
  connection.saveData = true; connection.dispatchEvent(new Event('change'));
  assert.equal(scheduled.size, 0, 'save-data immediately cancels the loop');
  assert.ok(clears > 0);
  cleanupAtlasField();
  assert.equal(hero.dataset.atlasMode, undefined);
  assert.equal(controls.hidden, true);
  assert.equal(pause.hidden, true);
  student.dispatchEvent(new Event('click'));
  assert.equal(hero.dataset.atlasMode, undefined, 'button listeners were removed');
  preference.matches = false; connection.saveData = false;
  preference.dispatchEvent(new Event('change'));
  assert.equal(scheduled.size, 0, 'preference listeners were removed');
});
