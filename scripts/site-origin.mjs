import {config} from '../src/config.js';

export function resolveSiteUrl(env=process.env){
 const pages=env.GITHUB_ACTIONS==='true'&&env.GITHUB_REPOSITORY;
 const value=env.SITE_URL||(pages?`https://${env.GITHUB_REPOSITORY.split('/')[0]}.github.io/${env.GITHUB_REPOSITORY.split('/')[1]}/`:config.canonical);
 const url=new URL(value);
 if(url.protocol!=='https:'||url.username||url.password||url.search||url.hash)throw Error('SITE_URL must be an HTTPS site URL without credentials, a query or fragment.');
 return url.href.replace(/\/?$/,'/');
}
