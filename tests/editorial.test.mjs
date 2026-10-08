import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {defaultContent} from '../src/content.js';
import {view,header} from '../src/views.js';


test('Home puts teaching evidence before education while About preserves the full academic timeline',()=>{
 const c=structuredClone(defaultContent);
 c.experiences[0].duration='12';c.experiences[0].institution='Owner school';
 const home=view('home',c);
 const profile=view('profile',c);
 assert.ok(profile.indexOf('2014')<profile.indexOf('2017'));
 assert.ok(profile.indexOf('2017')<profile.indexOf('2018–2021'));
 assert.ok(home.indexOf('<h3>B.Ed.</h3>')<home.indexOf('<h3>B.A. History'));
 assert.doesNotMatch(home,/<h3>Class X/);
 assert.match(profile,/<h3>Class X/);
 assert.ok(home.indexOf('Education &amp; Credentials')<home.indexOf('Professional Learning'));
 assert.ok(home.indexOf('Selected Teaching Evidence')<home.indexOf('My Teaching Journey'));
 assert.ok(home.indexOf('My Teaching Journey')<home.indexOf('Education &amp; Credentials'));
 assert.match(home,/Current studies \(Concurrent\)/);
 assert.match(home,/Owner school/);assert.match(home,/12 Weeks/);
 assert.doesNotMatch(home,/recruiter-snapshot|metrics-strip/);
 c.profile.eligibility='Owner examination — Applied';
 assert.match(view('resume',c),/Owner examination/);
});

test('Homepage hiring and contact summaries use the owner facts without inferred eligibility',()=>{
 const c=structuredClone(defaultContent);
 c.profile.availability='August 2028';c.profile.roles=['Owner role <script>'];
 c.profile.subjects=['Owner subject <script>'];
 c.profile.workPreferences='Owner relocation preference';
 const home=view('home',c);
 assert.match(home,/Available August 2028/);
 assert.match(home,/Roles of interest:<\/strong> Owner role &lt;script&gt;/);
 assert.match(home,/Subjects of interest:<\/strong> Owner subject &lt;script&gt;/);
 assert.match(home,/Owner relocation preference/);
 assert.match(home,/<details class="hero-recruiter-brief"><summary>Roles &amp; subjects of interest<\/summary>/);
 assert.match(home,/href="mailto:krishnamahato704@gmail.com"/);
 assert.doesNotMatch(home,/Available May 2027|PGT History/);
 c.profile.availability='';c.profile.roles=[];c.profile.workPreferences='';
 const cleared=view('home',c);
 assert.doesNotMatch(cleared,/Available from|hero-availability|Roles of interest/);
});

test('Homepage previews existing published work and respects evidence removal',()=>{
 const home=view('home',defaultContent);
 assert.match(home,/Selected Teaching Evidence/);
 assert.match(home,/href="\.\/teaching\/democracy\/"/);
 assert.match(home,/href="\.\/assets\/evidence\/mock-election-activity.webp" data-viewer/);
 assert.match(home,/href="\.\/assets\/evidence\/ntcc-community-report.pdf" data-viewer/);
 assert.match(home,/Planning evidence/);
 const cleared=structuredClone(defaultContent);cleared.resources=[];cleared.gallery=[];
 const withoutEvidence=view('home',cleared);
 assert.doesNotMatch(withoutEvidence,/Democracy · Lesson Plan|Mock election activity|Community Work and Adult Literacy/);
});
test('Navigation exposes Home and evidence while retaining project and detail URLs',()=>{
 const nav=header('democracy','../../',defaultContent);
 assert.match(nav,/href="\.\.\/\.\.\/">Home/);
 assert.match(nav,/aria-current="page" href="\.\.\/\.\.\/resources\/"/);
 assert.match(nav,/<nav class="mobile-shortcuts" aria-label="Quick access">/);
 assert.match(nav,/href="\.\.\/\.\.\/resume\/"/);
 assert.doesNotMatch(header('admin','../',defaultContent),/mobile-shortcuts/);
});

test('Film hero has a static fallback, user controls and original evidence links',()=>{
 const home=view('home',defaultContent);
 assert.doesNotMatch(home,/<video[^>]*(?:\sautoplay| src=)/);
 assert.match(home,/preload="none"/);
 assert.match(home,/class="hero-avatar"/);
 assert.equal((home.match(/<video\s/g)||[]).length,1);
 assert.match(home,/hero-video-opt\.mp4/);
 assert.match(home,/opening-piano\.mp3/);
 assert.doesNotMatch(home,/opening-soundtrack|portfolio-sound/);
 assert.match(home,/data-film-pause/);assert.match(home,/data-film-replay/);
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
 for(const file of ['assets/opening-soundtrack.mp3','src/sound.js'])await assert.rejects(fs.access(new URL('../dist/'+file,import.meta.url)));
});
