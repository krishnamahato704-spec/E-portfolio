import {defaultContent,mergeContent,validateContent,CURRENT_SCHEMA_VERSION} from '../src/content.js';
import {config} from '../src/config.js';
import {execFileSync} from 'node:child_process';
import fs from 'node:fs/promises';
export function sourceDate(){
 const epoch=process.env.SOURCE_DATE_EPOCH;
 const date=epoch?new Date(Number(epoch)*1000):new Date(execFileSync('git',['-c',`safe.directory=${process.cwd().replaceAll('\\','/')}`,'log','-1','--format=%cI','--','src/content.js','src/views.js'],{encoding:'utf8',windowsHide:true}).trim());
 if(!Number.isFinite(date.getTime()))throw Error('Invalid source date');
 return date.toISOString();
}
export async function loadPublishedContent({remote=(process.env.BUILD_CONTENT_SOURCE||(process.env.VERCEL?'supabase':'repository'))==='supabase',fetcher=fetch,inputFile=fetcher===fetch?process.env.BUILD_CONTENT_FILE:undefined}={}){
 if(remote&&inputFile){
  const release=JSON.parse(await fs.readFile(inputFile,'utf8'));
  if(release.content?.schemaVersion!==CURRENT_SCHEMA_VERSION||!Number.isFinite(Date.parse(release.updatedAt)))throw Error('Invalid release input.');
  return {...release,content:validateContent(mergeContent(release.content))};
 }
 if(!remote)return {content:validateContent(structuredClone(defaultContent)),updatedAt:sourceDate(),source:'repository'};
 const response=await fetcher(`${config.restUrl}portfolio_public?id=eq.1&select=content,updated_at`,{headers:{apikey:config.key,Accept:'application/json'},signal:AbortSignal.timeout(15000)});
 if(!response.ok)throw Error(`Published content could not be loaded (${response.status}); deployment stopped.`);
 const rows=await response.json();
 if(rows?.length!==1||!rows[0].content||!Number.isFinite(Date.parse(rows[0].updated_at)))throw Error('Published content or its update date is missing.');
 if(rows[0].content.schemaVersion!==CURRENT_SCHEMA_VERSION)throw Error('Published content schema does not match this build.');
 const content=validateContent(mergeContent(rows[0].content));
 return {content,updatedAt:rows[0].updated_at,source:'supabase'};
}
