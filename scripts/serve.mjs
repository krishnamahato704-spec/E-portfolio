import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
const workspace=path.resolve(import.meta.dirname,'..');
const root=process.argv.includes('--dist')?path.join(workspace,'dist'):workspace;
const port=Number(process.env.PORT||3000);
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.webp':'image/webp','.jpg':'image/jpeg','.pdf':'application/pdf','.mp4':'video/mp4','.mp3':'audio/mpeg','.svg':'image/svg+xml','.xml':'application/xml','.txt':'text/plain','.vtt':'text/vtt; charset=utf-8','.woff2':'font/woff2'};
http.createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,'http://localhost');
  let pathname=decodeURIComponent(url.pathname).replace(/^\/E-portfolio(?=\/|$)/,'');
  if(!pathname.startsWith('/'))pathname='/'+pathname;
  let target=path.resolve(root,'.'+pathname);
  if(!target.startsWith(root+path.sep)&&target!==root) {res.writeHead(403);res.end();return;}
  if(pathname.includes('/.')) {res.writeHead(403);res.end();return;}
  const stat=await fs.stat(target).catch(()=>null);
  if(stat?.isDirectory()){
   if(!url.pathname.endsWith('/')){
    res.writeHead(301,{'Location':url.pathname+'/'+url.search});
    res.end();
    return;
   }
   target=path.join(target,'index.html');
  }
  const data=await fs.readFile(target);
  // WebKit upgrades loopback HTTP resources when this production-only CSP
  // directive is present. Keep every other CSP restriction in local previews.
  const body=path.extname(target)==='.html'?data.toString().replace('; upgrade-insecure-requests',''):data;
  const headers={'Content-Type':types[path.extname(target)]||'application/octet-stream','Cache-Control':'no-cache'};
  // Native media engines use byte ranges to buffer and seek through the film.
  if(/\.(mp4|mp3)$/.test(target)){
   headers['Accept-Ranges']='bytes';
   if(req.headers.range){
    const match=/^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
    let start=0,end=data.length-1;
    if(match&&(match[1]||match[2])){
     if(match[1]){start=Number(match[1]);if(match[2])end=Math.min(Number(match[2]),end);}
     else start=Math.max(0,data.length-Number(match[2]));
    }
    if(!match||!(match[1]||match[2])||!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start<0||start>=data.length||end<start){
     res.writeHead(416,{...headers,'Content-Range':`bytes */${data.length}`});res.end();return;
    }
    const chunk=data.subarray(start,end+1);
    res.writeHead(206,{...headers,'Content-Range':`bytes ${start}-${end}/${data.length}`,'Content-Length':chunk.length});res.end(chunk);return;
   }
  }
  res.writeHead(200,{...headers,'Content-Length':Buffer.byteLength(body)});res.end(body);
 }catch{res.writeHead(404,{'Content-Type':'text/html'});res.end(await fs.readFile(path.join(root,'404.html')))}
}).listen(port,'0.0.0.0',()=>console.log(`Server running on http://0.0.0.0:${port}/`));
