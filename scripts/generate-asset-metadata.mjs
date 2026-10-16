import fs from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..'),sizes={};
async function scan(directory){for(const entry of await fs.readdir(directory,{withFileTypes:true})){
 const file=path.join(directory,entry.name);
 if(entry.isDirectory())await scan(file);
 // The résumé is regenerated later in the build and has no size label.
 else if(entry.name!=='krishna-mahato-resume.pdf'&&/\.(pdf|pptx|docx)$/i.test(entry.name))sizes[path.relative(root,file).replaceAll('\\','/')]=(await fs.stat(file)).size;
}}
await scan(path.join(root,'assets'));
await fs.writeFile(path.join(root,'src/asset-metadata.js'),'// Generated from local originals. Unknown remote file sizes are not guessed.\nexport const documentBytes = '+JSON.stringify(sizes,null,2)+';\n');
console.log(`Recorded sizes for ${Object.keys(sizes).length} local documents.`);
