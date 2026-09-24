import { cp, mkdir, readdir, writeFile } from 'node:fs/promises';
import { routes } from '../src/views.js';

// Keep the existing editor, evidence pages and saved inbound links working in dist.
// Never run the old generator here: it overwrites the React entry page.
await mkdir('dist/src', { recursive: true });
for (const entry of await readdir('src')) {
  if (/\.(js|css)$/.test(entry)) await cp(`src/${entry}`, `dist/src/${entry}`);
}
for (const { path } of Object.values(routes)) {
  if (!path) continue;
  await cp(path, `dist/${path}`, { recursive: true });
}
for (const file of ['robots.txt', 'sitemap.xml']) await cp(file, `dist/${file}`);
await writeFile('dist/.nojekyll', '');
