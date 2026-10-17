import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';

const scriptUrl=new URL('../scripts/check-published-release.mjs',import.meta.url).href;
const contentUrl=new URL('../src/content.js',import.meta.url).href;
const sha='709e031bde7e2b04d07a9e20ffd9f3cf3ea4178f';
async function checkRelease(version){
 const folder=await fs.mkdtemp(path.join(os.tmpdir(),'portfolio-release-'));
 try{
  const code=`
   import fs from 'node:fs/promises';
   import {createHash} from 'node:crypto';
   import {defaultContent,contentSignature} from ${JSON.stringify(contentUrl)};
   const digest=createHash('sha256').update(contentSignature(defaultContent)).digest('hex');
   globalThis.fetch=async input=>{
    const url=new URL(input);
    if(url.pathname.endsWith('/portfolio_public'))return new Response(JSON.stringify([{content:defaultContent,updated_at:'2026-10-04T16:30:13.693Z'}]));
    await fs.writeFile('requested-url.txt',url.href);
    return new Response(JSON.stringify({contentDigest:digest,version:${JSON.stringify(version)}+'-'+digest.slice(0,10)}));
   };
   await import(${JSON.stringify(scriptUrl)});
  `;
  const output=path.join(folder,'github-output.txt');
  const result=spawnSync(process.execPath,['--input-type=module','-e',code],{cwd:folder,env:{...process.env,GITHUB_ACTIONS:'true',GITHUB_REPOSITORY:'krishnamahato704-spec/E-portfolio',GITHUB_SHA:sha,GITHUB_OUTPUT:output,BUILD_CONTENT_FILE:'',SITE_URL:''},encoding:'utf8',windowsHide:true});
  assert.equal(result.status,0,result.stderr);
  return {url:await fs.readFile(path.join(folder,'requested-url.txt'),'utf8'),changed:(await fs.readFile(output,'utf8')).includes('changed=true')};
 }finally{await fs.rm(folder,{recursive:true,force:true});}
}

test('Pages checks its own deployed release rather than the primary Vercel address',async()=>{
 const result=await checkRelease(sha.slice(0,12));
 assert.equal(result.url,'https://krishnamahato704-spec.github.io/E-portfolio/release.json');
 assert.equal(result.changed,false);
});
test('A matching content digest cannot hide an older source deployment',async()=>{
 assert.equal((await checkRelease('9419cde0e515')).changed,true);
});
