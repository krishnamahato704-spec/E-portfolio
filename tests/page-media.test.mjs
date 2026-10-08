import test from 'node:test';
import assert from 'node:assert/strict';
import {view} from '../src/views.js';
import {defaultContent} from '../src/content.js';
import {photoBackdrop,photoPlate,pageAtmosphere} from '../src/page-media.js';

test('Personal-photo backgrounds follow owner replacement, removal and publication status',()=>{
 const c=structuredClone(defaultContent);
 c.gallery.find(x=>x.id==='tlm-exhibition').image='https://example.com/owner-exhibition.webp';
 for(const route of ['home','gallery']){
  assert.match(view(route,c),/owner-exhibition.webp/);
  assert.doesNotMatch(view(route,c),/tlm-exhibition.webp/);
 }
 c.gallery=c.gallery.map(x=>({...x,publicationStatus:'Pending review'}));
 for(const route of ['home','profile','teaching','resources','credentials','resume','contact','gallery','pehchaan','democracy','admin','404']){
  const html=view(route,c);
  assert.doesNotMatch(html,/owner-exhibition.webp|school-house-placards.webp|pehchaan-collage.webp|independence-day.webp|mock-election-activity.webp|tlm-documentation.webp/,route);
 }
 c.resources=c.resources.filter(x=>!/observation.*journal/i.test(x.title));
 assert.doesNotMatch(view('observation',c),/assets\/evidence\/amity-journal\//);
});

test('Distributed page backgrounds use current records and stay decorative',()=>{
 const c=structuredClone(defaultContent);
 const background=pageAtmosphere(c,'resources','../../');
 assert.match(background,/aria-hidden="true"/);
 assert.doesNotMatch(background,/<a\b|<button\b/);
 assert.ok((background.match(/class="atmosphere-scene /g)||[]).length>=4);
 assert.ok([...background.matchAll(/alt="([^"]*)"/g)].every(([,alt])=>alt===''));
 c.gallery.find(x=>x.id==='mock-election-activity').image='https://example.com/new-owner-material.webp';
 assert.match(pageAtmosphere(c,'resources','../../'),/new-owner-material.webp/);
 assert.doesNotMatch(pageAtmosphere(c,'resources','../../'),/mock-election-activity.webp/);
 c.resources=c.resources.filter(x=>x.id!=='amity-observation-journal');
 assert.doesNotMatch(pageAtmosphere(c,'observation','../../'),/amity-journal\//);
 const missing=structuredClone(defaultContent);missing.experiences=[];
 assert.equal((view('observation',missing).match(/class="page-atmosphere /g)||[]).length,1);
});

test('Photo decorations are silent and original-photo captions and URLs remain escaped',()=>{
 const record={image:'https://example.com/photo.webp',title:'Owner <script>',context:'Context <img>',description:'Owner "description"'};
 const background=photoBackdrop(record,'../');
 assert.match(background,/aria-hidden="true"/);assert.match(background,/alt=""/);
 const plate=photoPlate(record,'../');
 assert.match(plate,/data-viewer/);assert.match(plate,/data-original-url="https:\/\/example.com\/photo.webp"/);
 assert.match(plate,/Owner &lt;script&gt;/);assert.doesNotMatch(plate,/<script>|<img>/);
 assert.equal(photoBackdrop(null,'../'),'');assert.equal(photoPlate(null,'../'),'');
});
