import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {assetFingerprints,fingerprintUrls} from '../scripts/fingerprint-assets.mjs';

test('Media cache keys follow file contents while documents and remote URLs retain their identity',async()=>{
 const folder=await fs.mkdtemp(path.join(os.tmpdir(),'portfolio-media-'));
 try{
  await fs.mkdir(path.join(folder,'fonts'));
  await fs.writeFile(path.join(folder,'photo.webp'),'first image');
  await fs.writeFile(path.join(folder,'fonts/body.woff2'),'font');
  await fs.writeFile(path.join(folder,'lesson.pdf'),'document');
  const first=await assetFingerprints(folder);
  const source='<img src="../../assets/photo.webp"><img data-src="./assets/photo.webp"><img srcset="assets/photo.webp 720w"><link href="../assets/fonts/body.woff2"><a href="assets/lesson.pdf">PDF</a><img src="https://example.com/assets/photo.webp">';
  const result=fingerprintUrls(source,first);
  assert.ok(result.includes(`../../assets/photo.webp?v=${first.get('photo.webp')}`));
  assert.ok(result.includes(`data-src="./assets/photo.webp?v=${first.get('photo.webp')}`));
  assert.ok(result.includes(`srcset="assets/photo.webp?v=${first.get('photo.webp')} 720w`));
  assert.ok(result.includes(`../assets/fonts/body.woff2?v=${first.get('fonts/body.woff2')}`));
  assert.ok(result.includes('href="assets/lesson.pdf"'));
  assert.ok(result.includes('src="https://example.com/assets/photo.webp"'));
  assert.equal(fingerprintUrls(result,first),result);
  await fs.writeFile(path.join(folder,'photo.webp'),'replacement image');
  assert.notEqual((await assetFingerprints(folder)).get('photo.webp'),first.get('photo.webp'));
 }finally{await fs.rm(folder,{recursive:true,force:true});}
});
