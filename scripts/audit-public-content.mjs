import fs from 'node:fs/promises';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {loadContent} from '../src/cloud.js';
import {mergeContent,validateContent} from '../src/content.js';
const root=path.resolve(import.meta.dirname,'..');
const row=await loadContent();
const content=validateContent(mergeContent(row.content));
await fs.mkdir(path.join(root,'outputs'),{recursive:true});
await fs.writeFile(path.join(root,'outputs/public-content-audit.json'),JSON.stringify(row,null,2));
const urls=new Set([...content.gallery.map(x=>x.image),...content.certificates.flatMap(x=>[x.image,x.url]),...content.resources.flatMap(x=>[x.url,x.thumbnail,x.originalUrl])].filter(Boolean));
const restored=[];
for(const url of urls){
 const prefix='https://krishnamahato704-spec.github.io/E-portfolio/';
 if(!url.startsWith(prefix))continue;
 const relative=url.slice(prefix.length);
 if(!relative.startsWith('assets/')||relative.includes('..'))throw Error('Unexpected asset path');
 const target=path.join(root,relative);
 try{await fs.access(target);continue;}catch{}
 await fs.mkdir(path.dirname(target),{recursive:true});
 let bytes;
 try{bytes=execFileSync('git',['-c','safe.directory='+root.replaceAll('\\','/'),'show','HEAD:'+relative],{cwd:root,windowsHide:true,maxBuffer:30*1024*1024,stdio:['ignore','pipe','ignore']});}
 catch{const response=await fetch(url);if(!response.ok)throw Error('Missing public asset: '+url);bytes=Buffer.from(await response.arrayBuffer());}
 await fs.writeFile(target,bytes);restored.push(relative);
}
// Refresh only the public snapshot. Compatibility and validation code is retained.
const file=path.join(root,'src/content.js');
const source=await fs.readFile(file,'utf8');
const start=source.indexOf('export const defaultContent =');
const end=source.indexOf('// Merge missing fields only.');
await fs.writeFile(file,source.slice(0,start)+'export const defaultContent = '+JSON.stringify(content,null,2)+';\n\n'+source.slice(end));
console.log(JSON.stringify({updated_at:row.updated_at,resources:content.resources.length,credentials:content.certificates.length,gallery:content.gallery.length,restored},null,2));
