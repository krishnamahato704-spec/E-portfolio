import {cp,mkdir,rm,readdir,readFile,writeFile} from 'node:fs/promises';
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
// Inline the local CSS imports in their original order and cascade layers.
// Production can render after one stylesheet request instead of a second chain.
let styles=await readFile(path.join(root,'src/styles.css'),'utf8');
const imports=[...styles.matchAll(/@import url\('\.\/([^']+)'\)(?: layer\(([\w-]+)\))?;/g)];
for(const [statement,url,layer] of imports) {
 const file=path.resolve(root,'src',url.split('?')[0]);
 if(path.dirname(file)!==path.join(root,'src'))throw Error('Unexpected stylesheet import');
 const css=await readFile(file,'utf8');
 if(/@import\b/.test(css))throw Error('Nested stylesheet imports must be flattened explicitly');
 styles=styles.replace(statement,layer?`@layer ${layer} {\n${css}\n}`:css);
}
await writeFile(path.join(output,'src/styles.css'),styles);
for(const {path:route} of Object.values(routes)) {
 const file=route||'index.html';
 await cp(path.join(root,file),path.join(output,file),{recursive:true});
}
for(const file of ['robots.txt','sitemap.xml'])await cp(path.join(root,file),path.join(output,file));
await writeFile(path.join(output,'.nojekyll'),'');
console.log('Packaged the static 2D portfolio into dist.');
