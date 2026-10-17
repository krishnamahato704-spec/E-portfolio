import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {loadPublishedContent} from './load-published-content.mjs';
import {contentSignature} from '../src/content.js';
import {resolveSiteUrl} from './site-origin.mjs';
const release=await loadPublishedContent({remote:true});
await fs.mkdir('outputs/release',{recursive:true});
// Fetch once. Build must use this exact snapshot even if Studio publishes again.
await fs.writeFile('outputs/release/input.json',JSON.stringify(release));
const digest=createHash('sha256').update(contentSignature(release.content)).digest('hex');
let changed=true;
const expectedCommit=process.env.GITHUB_SHA?.slice(0,12);
try{
 const response=await fetch(resolveSiteUrl()+'release.json',{cache:'no-store',signal:AbortSignal.timeout(15000)});
 if(response.ok){
  const deployed=await response.json();
  changed=deployed.contentDigest!==digest||!!expectedCommit&&!deployed.version?.startsWith(expectedCommit+'-');
 }
}catch{}
if(process.env.GITHUB_OUTPUT)await fs.appendFile(process.env.GITHUB_OUTPUT,`changed=${changed}\n`);
console.log(changed?'Published content or source differs from this site; validation and deployment are required.':'Published content and source match this site’s deployed release.');
