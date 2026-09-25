import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { suppliedCertificates, suppliedGallery, suppliedResources } from '../src/media.js';

test('All supplied portfolio files have real previews and downloadable originals',async()=>{
  const entries=[...suppliedCertificates,...suppliedGallery,...suppliedResources];
  assert.equal(entries.length,16);
  for(const item of entries) {
    for(const url of [item.image,item.thumbnail,item.url].filter(Boolean)) {
      const relative=url.split('/E-portfolio/')[1];
      assert.ok(relative.startsWith('assets/evidence/'));
      const data=await fs.readFile(new URL('../'+relative,import.meta.url));
      assert.ok(data.length>1000,item.id);
      if(url.endsWith('.pdf')) assert.equal(data.subarray(0,5).toString(),'%PDF-');
      if(url.endsWith('.pptx')) assert.equal(data.subarray(0,2).toString(),'PK');
    }
  }
});
