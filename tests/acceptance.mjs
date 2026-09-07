import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(resolve(root, 'index.html'), 'utf8');
const css = readFileSync(resolve(root, 'styles.css'), 'utf8');
const js = readFileSync(resolve(root, 'app.js'), 'utf8');

assert.match(html, /<meta name="viewport"/);
assert.match(html, /<main id="main">/);
assert.match(html, /data-menu-toggle/);
assert.match(html, /id="profile"/);
assert.match(html, /id="practice"/);
assert.match(html, /id="experience"/);
assert.match(html, /id="credentials"/);
assert.match(html, /id="contact"/);
assert.match(html, /styles\.css\?v=astra-1/);
assert.match(html, /app\.js\?v=astra-1/);

assert.match(css, /@media \(max-width: 900px\)/);
assert.match(css, /@media \(max-width: 560px\)/);
assert.match(css, /prefers-reduced-motion/);
assert.match(css, /:focus-visible/);
assert.doesNotMatch(css, /inset-top/);

assert.match(js, /portfolio_public/);
assert.match(js, /SUPABASE_PUBLISHABLE_KEY/);
assert.match(js, /IntersectionObserver/);
assert.match(js, /textContent/);
assert.doesNotMatch(js, /innerHTML\s*=/);

const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
assert.equal(ids.length, new Set(ids).size, 'HTML IDs must be unique');

console.log('Astra portfolio acceptance checks passed.');
