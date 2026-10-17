import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {routes} from '../src/views.js';
import {config} from '../src/config.js';

test('The generated homepage carries the real Google ownership tag',async()=>{
 const html=await fs.readFile(new URL('../index.html',import.meta.url),'utf8');
 assert.ok(html.includes('<meta name="google-site-verification" content="10U71hhED9rXhy740NbaNdWb4cw4nJl9EMHoSG6DrNk">'));
});
test('All generated routes prefer the matching primary page and the sitemap lists only public canonical URLs',async()=>{
 for(const [route,meta] of Object.entries(routes)){
  const file=meta.path.endsWith('/')||!meta.path?meta.path+'index.html':meta.path;
  const html=await fs.readFile(new URL('../'+file,import.meta.url),'utf8');
  assert.ok(html.includes(`<link rel="canonical" href="${config.canonical+meta.path}">`),route);
  assert.ok(html.includes(`<meta property="og:url" content="${config.canonical+meta.path}">`),route);
  if(['admin','404'].includes(route))assert.match(html,/name="robots" content="noindex,nofollow"/);
 }
 const sitemap=await fs.readFile(new URL('../sitemap.xml',import.meta.url),'utf8');
 const urls=[...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match=>match[1]);
 assert.equal(urls.length,11);assert.ok(urls.every(url=>url.startsWith(config.canonical)));
 assert.ok(!urls.some(url=>/\/admin\/|404\.html/.test(url)));
});
