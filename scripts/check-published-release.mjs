import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {loadPublishedContent} from './load-published-content.mjs';
import {contentSignature} from '../src/content.js';
import {config} from '../src/config.js';
const release=await loadPublishedContent({remote:true});
await fs.mkdir('outputs/release',{recursive:true});
// Fetch once. Build must use this exact snapshot even if Studio publishes again.
await fs.writeFile('outputs/release/input.json',JSON.stringify(release));
const digest=createHash('sha256').update(contentSignature(release.content)).digest('hex');
let changed=true;
try{const response=await fetch(config.canonical+'release.json',{signal:AbortSignal.timeout(15000)});if(response.ok)changed=(await response.json()).contentDigest!==digest;}catch{}
if(process.env.GITHUB_OUTPUT)await fs.appendFile(process.env.GITHUB_OUTPUT,`changed=${changed}\n`);
console.log(changed?'New published content is ready for validation.':'Published content matches the deployed release.');
