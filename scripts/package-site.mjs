import {cp,mkdir,rm,readdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {routes} from '../src/views.js';
const root=path.resolve(import.meta.dirname,'..');
const output=path.resolve(root,'dist');
if(output!==path.join(root,'dist'))throw Error('Unexpected build output');
await rm(output,{recursive:true,force:true});
await mkdir(path.join(output,'src'),{recursive:true});
for(const entry of await readdir(path.join(root,'src'))) {
 if(/\.(js|css|json)$/.test(entry))await cp(path.join(root,'src',entry),path.join(output,'src',entry));
}
await cp(path.join(root,'assets'),path.join(output,'assets'),{recursive:true});
for(const {path:route} of Object.values(routes)) {
 const file=route||'index.html';
 await cp(path.join(root,file),path.join(output,file),{recursive:true});
}
for(const file of ['robots.txt','sitemap.xml'])await cp(path.join(root,file),path.join(output,file));
await writeFile(path.join(output,'.nojekyll'),'');
console.log('Packaged the static 2D portfolio into dist.');
