// Run only in the release workflow after validation. Do not print secret URLs.
import path from 'node:path';
import {fileURLToPath} from 'node:url';
export async function requestContentRebuild({hook,fetcher=fetch}={}){
 if(!hook)return {requested:false,message:'Vercel content trigger is not configured. A database save alone does not confirm a Vercel release.'};
 const url=new URL(hook);
 if(url.protocol!=='https:'||url.hostname!=='api.vercel.com'||!url.pathname.startsWith('/v1/integrations/deploy/'))throw Error('Unexpected Vercel deploy-hook destination.');
 const response=await fetcher(url,{method:'POST',redirect:'error',signal:AbortSignal.timeout(15000)});
 if(!response.ok)throw Error(`Vercel content rebuild request failed (${response.status}).`);
 return {requested:true,message:'Requested the configured Vercel content rebuild. Verify the resulting release before sharing it.'};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const result=await requestContentRebuild({hook:process.env.VERCEL_DEPLOY_HOOK});console.log(result.message);
 if(process.env.GITHUB_STEP_SUMMARY){const fs=await import('node:fs/promises');await fs.appendFile(process.env.GITHUB_STEP_SUMMARY,result.message+'\n');}
}
