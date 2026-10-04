import {cp,mkdir,rm,readdir,writeFile,lstat,realpath} from 'node:fs/promises';
import path from 'node:path';
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
 console.log('Packaged public pages, modules and assets into dist.');
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))await packageSite();
