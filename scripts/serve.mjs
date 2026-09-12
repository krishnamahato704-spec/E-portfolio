import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const port=Number(process.env.PORT||3000);
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.webp':'image/webp','.svg':'image/svg+xml','.xml':'application/xml','.txt':'text/plain','.woff2':'font/woff2'};
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
  const data=await fs.readFile(target);res.writeHead(200,{'Content-Type':types[path.extname(target)]||'application/octet-stream','Cache-Control':'no-cache'});res.end(data);
 }catch{res.writeHead(404,{'Content-Type':'text/html'});res.end(await fs.readFile(path.join(root,'404.html')))}
}).listen(port,'0.0.0.0',()=>console.log(`Server running on http://0.0.0.0:${port}/`));
