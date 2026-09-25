import {readdir} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
for(const folder of ['src','scripts','tests']) {
 for(const file of await readdir(folder)) {
  if(!/\.m?js$/.test(file))continue;
  const check=spawnSync(process.execPath,['--check',`${folder}/${file}`],{stdio:'inherit',windowsHide:true});
  if(check.status!==0)process.exit(check.status||1);
 }
}
console.log('JavaScript syntax checks passed.');
