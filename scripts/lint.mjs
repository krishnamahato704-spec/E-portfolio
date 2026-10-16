// Offline static checks: syntax, module targets and unsafe source patterns.
// These do not execute the app or repeat its unit tests.
import fs from 'node:fs/promises';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const root=path.resolve(import.meta.dirname,'..'),files=[];
async function scan(dir){for(const entry of await fs.readdir(path.join(root,dir),{withFileTypes:true})){
 const relative=path.join(dir,entry.name);
 if(entry.isDirectory())await scan(relative);
 else if(/\.(?:m?js|css)$/.test(entry.name))files.push(relative);
}}
for(const directory of ['src','scripts','tests'])await scan(directory);
const failures=[];
for(const file of files){
 const source=await fs.readFile(path.join(root,file),'utf8');
 if(/^(?:<{7}|={7}|>{7})(?: |$)/m.test(source))failures.push(`${file}: unresolved conflict marker`);
 if(/\.(?:m?js)$/.test(file)){
  const result=spawnSync(process.execPath,['--check',path.join(root,file)],{encoding:'utf8',windowsHide:true});
  if(result.status!==0)failures.push(`${file}: ${result.stderr.trim()}`);
  for(const [,specifier] of source.matchAll(/^(?:import|export)\s+(?:[^;\n]*?\sfrom\s*)?['"](\.[^'"]+)['"]/gm)){
   const target=path.resolve(root,path.dirname(file),specifier.split('?')[0]);
   if(!(await fs.stat(target).catch(()=>null))?.isFile())failures.push(`${file}: missing module ${specifier}`);
  }
  if(/\beval\s*\(|\bnew\s+Function\s*\(/.test(source))failures.push(`${file}: dynamic code execution`);
 }
}
for(const config of ['package.json','vercel.json'])try{JSON.parse(await fs.readFile(path.join(root,config),'utf8'));}catch(error){failures.push(`${config}: ${error.message}`);}
if(failures.length){console.error(failures.join('\n'));process.exitCode=1;}else console.log(`Static checks passed for ${files.length} source, script and test files, plus JSON configuration.`);
