import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {defaultContent} from '../src/content.js';
import {view,header} from '../src/views.js';

test('Recruiter metrics follow published claims and owner edits, without inferring exam results',()=>{
 const c=structuredClone(defaultContent);
 c.experiences[0].duration='12';c.experiences[0].points=[];
 c.profile.directTeaching='History · Class 8';c.profile.eligibility='Owner examination — Applied';
 const home=view('home',c);
 assert.match(home,/12 Weeks/);assert.doesNotMatch(home,/15\+/);
 assert.match(home,/Owner examination/);assert.match(home,/Class 8/);
 assert.doesNotMatch(home,/Classes 6–9 · select Class 11 History/);
});
test('Navigation exposes Home and evidence while retaining project and detail URLs',()=>{
 const nav=header('democracy','../../',defaultContent);
 assert.match(nav,/href="\.\.\/\.\.\/">Home/);
 assert.match(nav,/aria-current="page" href="\.\.\/\.\.\/resources\/"/);
});
test('Hero contains one looping music film with a static fallback and no visible caption',()=>{
 const home=view('home',defaultContent);
 assert.doesNotMatch(home,/<video[^>]*(?:\sautoplay| src=)/);
 assert.match(home,/<video[^>]*controls muted loop playsinline/);
 assert.match(home,/data-autoplay="true"/);
 assert.equal((home.match(/<video\s/g)||[]).length,1);
 assert.ok(home.indexOf('<video ')<home.indexOf('class="metrics-strip"'));
 assert.match(home,/preload="none"/);assert.match(home,/Illustrative portfolio film with soft instrumental music/);
 assert.match(home,/hero-video-music\.mp4/);assert.match(home,/Turn on instrumental music/);
 const film=home.match(/<figure class="hero-video-panel">([\s\S]*?)<\/figure>/)?.[1];
 assert.ok(film);assert.doesNotMatch(film,/film-caption|Silent|<figcaption/);
 assert.match(view('credentials',defaultContent),/data-original-url="https:/);
 assert.match(view('resources',defaultContent),/data-viewer/);
});
test('Music video contains video and AAC audio tracks and theme artwork is locally packaged',async()=>{
 const video=await fs.readFile(new URL('../assets/hero-video-music.mp4',import.meta.url));
 assert.ok(video.includes(Buffer.from('vide'))&&video.includes(Buffer.from('soun'))&&video.includes(Buffer.from('mp4a')));
 for(const file of ['history-study.webp','english-study.webp','paper-texture.svg'])await fs.access(new URL('../dist/assets/theme/'+file,import.meta.url));
});
test('Automatically generated résumé stays on one PDF page',async()=>{
 const pdf=await fs.readFile(new URL('../assets/krishna-mahato-resume.pdf',import.meta.url));
 assert.equal(pdf.subarray(0,5).toString(),'%PDF-');
 assert.equal((pdf.toString('latin1').match(/\/Type \/Page\b/g)||[]).length,1);
});
test('GitHub Pages package includes deep routes and public assets while excluding development files',async()=>{
 for(const file of ['index.html','src/styles.css','src/editorial.js','assets/portfolio-film.vtt','assets/krishna-mahato-resume.pdf','teaching/democracy/index.html','admin/index.html','sitemap.xml'])await fs.access(new URL('../dist/'+file,import.meta.url));
 for(const file of ['.env','node_modules','outputs','tests','.git','scripts'])await assert.rejects(fs.access(new URL('../dist/'+file,import.meta.url)));
});
