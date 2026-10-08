import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';

test('Preview server provides exact media byte ranges, suffix ranges and unsatisfied responses', async()=>{
 const root=path.resolve(import.meta.dirname,'..');
 const port=4179;
 const server=spawn(process.execPath,['scripts/serve.mjs'],{cwd:root,env:{...process.env,PORT:String(port)},windowsHide:true,stdio:'ignore'});
 const base=`http://127.0.0.1:${port}/`;
 try{
  let ready=false;
  for(let i=0;i<60;i++){
   try{if((await fetch(base+'assets/opening-piano.mp3',{method:'HEAD'})).ok){ready=true;break;}}catch{}
   await new Promise(resolve=>setTimeout(resolve,50));
  }
  assert.ok(ready,'preview starts');
  for(const file of ['assets/hero-video-opt.mp4','assets/opening-piano.mp3']){
   const bytes=await fs.readFile(path.join(root,file));
   const full=await fetch(base+file,{method:'HEAD'});
   assert.equal(full.status,200);
   assert.equal(full.headers.get('accept-ranges'),'bytes');
   assert.equal(Number(full.headers.get('content-length')),bytes.length);
   for(const [range,start,end] of [['bytes=0-99',0,99],['bytes=-100',bytes.length-100,bytes.length-1],['bytes=100-',100,bytes.length-1],['bytes=0-999999999',0,bytes.length-1]]){
    const response=await fetch(base+file,{headers:{Range:range}});
    assert.equal(response.status,206,range);
    assert.equal(response.headers.get('content-range'),`bytes ${start}-${end}/${bytes.length}`);
    assert.equal(Number(response.headers.get('content-length')),end-start+1);
    assert.deepEqual(Buffer.from(await response.arrayBuffer()),bytes.subarray(start,end+1));
   }
   for(const range of [`bytes=${bytes.length}-`,`bytes=99-0`,'bytes=-0']){
    const response=await fetch(base+file,{headers:{Range:range}});
    assert.equal(response.status,416,range);
    assert.equal(response.headers.get('content-range'),`bytes */${bytes.length}`);
   }
  }
 }finally{server.kill();}
});
