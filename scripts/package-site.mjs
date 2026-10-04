import {cp,mkdir,rm,readdir,writeFile,readFile,lstat,realpath} from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {routes} from '../src/views.js';
const root=path.resolve(import.meta.dirname,'..');
export async function packageSite(){
 const output=path.resolve(root,'dist');
 if(path.dirname(output)!==root||path.basename(output)!=='dist')throw Error('Unexpected build output');
 const existing=await lstat(output).catch(()=>null);
 if(existing?.isSymbolicLink())throw Error('Build output must not be a symbolic link');
 if(existing){const resolved=await realpath(output);if(resolved.toLowerCase()!==output.toLowerCase())throw Error('Build output resolved outside the intended directory');}
 // Only the explicitly checked workspace/dist directory is replaced.
 await rm(output,{recursive:true,force:true});
 await mkdir(path.join(output,'src'),{recursive:true});
 for(const entry of await readdir(path.join(root,'src'))){
  if(/\.(js|css|json)$/.test(entry))await cp(path.join(root,'src',entry),path.join(output,'src',entry));
 }
 await cp(path.join(root,'assets'),path.join(output,'assets'),{recursive:true});
 for(const {path:route} of Object.values(routes)){
  const file=route.endsWith('/')||!route?route+'index.html':route;
  await mkdir(path.dirname(path.join(output,file)),{recursive:true});
  await cp(path.join(root,file),path.join(output,file));
 }
 for(const file of ['robots.txt','sitemap.xml'])await cp(path.join(root,file),path.join(output,file));
 await writeFile(path.join(output,'.nojekyll'),'');
const release=JSON.parse(await readFile(path.join(root,'outputs/release/content.json'),'utf8'));
const source=await readFile(path.join(root,'src/content.js'),'utf8');
const helpers=source.slice(source.indexOf('// Merge missing fields only.'));
if(!helpers.startsWith('// Merge missing'))throw Error('Content module boundaries changed');
await writeFile(path.join(output,'src/content.js'),`import {amityJournalResource} from './amity-journal.js?v=editorial-20261004';\nexport const CURRENT_SCHEMA_VERSION = ${release.content.schemaVersion};\nexport const defaultContent = ${JSON.stringify(release.content)};\n${helpers}`);
const digest=createHash('sha256').update(JSON.stringify(release.content,(_,value)=>value&&!Array.isArray(value)&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(key=>[key,value[key]])):value)).digest('hex');
const version=(process.env.GITHUB_SHA||process.env.VERCEL_GIT_COMMIT_SHA||digest).slice(0,12)+'-'+digest.slice(0,10);
async function stamp(dir){for(const entry of await readdir(dir,{withFileTypes:true})){
 const file=path.join(dir,entry.name);
 if(entry.isDirectory())await stamp(file);
 else if(/\.(html|js|css)$/.test(entry.name)){
  const text=await readFile(file,'utf8');
  await writeFile(file,text.replace(/\?v=(?:build|editorial-20261004)\b/g,'?v='+version));
 }
}}
await stamp(output);
await writeFile(path.join(output,'release.json'),JSON.stringify({contentDigest:digest,contentUpdatedAt:release.updatedAt,source:release.source,version}));
 console.log('Packaged the reviewed release into dist.');
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))await packageSite();
