import {readdir,readFile} from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
// Only public media/font URLs are versioned. Content records, original PDFs,
// remote uploads and metadata keep their existing identities.
const media=/\.(?:avif|webp|png|jpe?g|svg|woff2|mp4|mp3)$/i;
export async function assetFingerprints(directory){
 const hashes=new Map();
 async function scan(folder){for(const entry of await readdir(folder,{withFileTypes:true})){
  const file=path.join(folder,entry.name);
  if(entry.isDirectory())await scan(file);
  else if(media.test(entry.name))hashes.set(path.relative(directory,file).replaceAll('\\','/'),createHash('sha256').update(await readFile(file)).digest('hex').slice(0,12));
 }}
 await scan(directory);return hashes;
}
export function fingerprintUrls(source,hashes){
 return source.replace(/(["'(,\s])((?:\.\.?\/)*assets\/([^\s"'()<>?#,]+))(?:\?[^\s"'()<>#,]*)?/g,(match,boundary,url,key)=>{
  const hash=hashes.get(key);return hash?`${boundary}${url}?v=${hash}`:match;
 });
}
