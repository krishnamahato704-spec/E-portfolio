import test from 'node:test';
import assert from 'node:assert/strict';
import {canRevealLens,collectLensPhotos,nextLensPhotoIndex,createCuriosityLens} from '../src/curiosity-lens.js';

const baseURI='https://portfolio.example/E-portfolio/';
const sourcePhoto=({src='',deferred='',currentSrc='',caption}={})=>{
 const attributes=Object.freeze({src,'data-src':deferred});
 const heading=caption===undefined?null:Object.freeze({textContent:caption});
 const figure=Object.freeze({querySelector:()=>heading});
 return Object.freeze({
  currentSrc,
  getAttribute:name=>attributes[name]||null,
  closest:()=>figure,
  setAttribute(){assert.fail('Collecting lens photos must not change gallery attributes');},
  removeAttribute(){assert.fail('Collecting lens photos must not remove deferred gallery sources');},
  set src(value){assert.fail('Collecting metadata must not request a source image');}
 });
};
const photoRoot=photos=>Object.freeze({ownerDocument:Object.freeze({baseURI}),querySelectorAll:selector=>selector==='[data-hero-slide] img.plate-image'?photos:[]});
const absolute=url=>new URL(url,baseURI).href;

test('Lens records retain deferred images and pair each selected source with its own caption',()=>{
 const photos=[
  sourcePhoto({src:'assets/classroom.webp',deferred:'assets/unused.webp',currentSrc:'https://images.example/classroom-large.webp',caption:'  Classroom discussion  '}),
  sourcePhoto({deferred:'assets/community.webp',caption:'Community teaching'}),
  sourcePhoto({src:'assets/materials.webp',caption:'Teaching materials'}),
  sourcePhoto({currentSrc:'https://images.example/responsive.webp',caption:'Responsive gallery photograph'})
 ];
 const records=collectLensPhotos(photoRoot(photos));
 assert.deepEqual(records.map(record=>({url:absolute(record.url),caption:record.caption})),[
  {url:'https://images.example/classroom-large.webp',caption:'Classroom discussion'},
  {url:absolute('assets/community.webp'),caption:'Community teaching'},
  {url:absolute('assets/materials.webp'),caption:'Teaching materials'},
  {url:'https://images.example/responsive.webp',caption:'Responsive gallery photograph'}
 ]);
 assert.equal(photos[1].getAttribute('src'),null,'Deferred originals remain deferred');
 assert.equal(photos[1].getAttribute('data-src'),'assets/community.webp');
});

test('Canonical gallery aliases do not repeat the same photo or replace its matching caption',()=>{
 const records=collectLensPhotos(photoRoot([
  sourcePhoto({src:'assets/classroom.webp?v=1',currentSrc:'https://images.example/classroom-large.webp',caption:'Original caption'}),
  sourcePhoto({deferred:'./assets/classroom.webp?v=1',currentSrc:'https://images.example/classroom-small.webp',caption:'Duplicate responsive source'}),
  sourcePhoto({src:absolute('assets/classroom.webp?v=1'),caption:'Duplicate absolute source'}),
  sourcePhoto({deferred:'assets/classroom.webp?v=2',caption:'Updated photograph'})
 ]));
 assert.equal(records.length,2);
 assert.deepEqual(records.map(record=>record.caption),['Original caption','Updated photograph']);
 assert.equal(absolute(records[0].url),'https://images.example/classroom-large.webp');
});

test('Incomplete photo records are omitted without inventing captions or image requests',()=>{
 const records=collectLensPhotos(photoRoot([
  sourcePhoto({caption:'A caption without a photograph'}),
  sourcePhoto({src:'assets/no-caption.webp'}),
  sourcePhoto({deferred:'assets/blank-caption.webp',caption:'   '}),
  sourcePhoto({deferred:'assets/valid.webp',caption:'  Existing gallery caption  '})
 ]));
 assert.deepEqual(records.map(record=>record.caption),['Existing gallery caption']);
 assert.deepEqual(collectLensPhotos(photoRoot([])),[]);
 assert.deepEqual(collectLensPhotos(null),[]);
 assert.deepEqual(collectLensPhotos({querySelectorAll:()=>[]}),[]);
});

test('A detached gallery without a base URL safely deduplicates exact relative sources',()=>{
 const photos=[
  sourcePhoto({src:'classroom.webp',caption:'Classroom photograph'}),
  sourcePhoto({deferred:'classroom.webp',caption:'Duplicate photograph'}),
  sourcePhoto({deferred:'materials.webp',caption:'Materials photograph'})
 ];
 const records=collectLensPhotos({querySelectorAll:()=>photos});
 assert.deepEqual(records,[
  {url:'classroom.webp',caption:'Classroom photograph'},
  {url:'materials.webp',caption:'Materials photograph'}
 ]);
});

test('Photo selection cycles through available records without adjacent repeats',()=>{
 let current=-1;
 const selected=[];
 for(let step=0;step<7;step++){current=nextLensPhotoIndex(3,current);selected.push(current);}
 assert.deepEqual(selected,[0,1,2,0,1,2,0]);
 const failed=new Set([1]);
 assert.equal(nextLensPhotoIndex(3,0,failed),2);
 assert.equal(nextLensPhotoIndex(3,2,failed),0);
 assert.deepEqual([...failed],[1],'Selection does not modify the failure registry');
});

test('Empty, failed and single-photo galleries keep a stable valid selection',()=>{
 assert.equal(nextLensPhotoIndex(0,-1),-1);
 assert.equal(nextLensPhotoIndex(1,-1),0);
 assert.equal(nextLensPhotoIndex(1,0),0);
 assert.equal(nextLensPhotoIndex(1,0,new Set([0])),-1);
 assert.equal(nextLensPhotoIndex(3,2,new Set([0,1])),2,'Keep the current photograph when it is the only usable one');
 assert.equal(nextLensPhotoIndex(3,-1,new Set([0,1,2])),-1);
});

test('The curiosity lens respects motion, visibility and opening preferences',()=>{
 const eligible={visible:true};
 assert.equal(canRevealLens(eligible),true);
 for(const override of [{visible:false},{reduced:true},{saveData:true},{paused:true},{hidden:true},{opening:true}])assert.equal(canRevealLens({...eligible,...override}),false,JSON.stringify(override));
 assert.equal(canRevealLens(),false);
});
test('Missing or removed hero content leaves a safe disposable lens controller',()=>{
 for(const root of [null,undefined,{querySelector:()=>null}]){
  const lens=createCuriosityLens(root);
  assert.doesNotThrow(()=>lens.render(0,{}));
  assert.doesNotThrow(()=>lens.hide());
  assert.doesNotThrow(()=>lens.dispose());
  assert.doesNotThrow(()=>lens.dispose());
 }
});
