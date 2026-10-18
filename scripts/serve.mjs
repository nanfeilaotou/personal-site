import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const port=Number(process.env.PORT||4173);
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.json':'application/json; charset=utf-8','.png':'image/png','.webp':'image/webp','.avif':'image/avif','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webm':'video/webm','.md':'text/plain; charset=utf-8'};
http.createServer(async(req,res)=>{
  try{
    const url=new URL(req.url,'http://localhost'),decoded=decodeURIComponent(url.pathname);
    if(decoded==='/favicon.ico'){res.writeHead(204);return res.end();}
    const name=decoded==='/'?'/prototype/prototype-02.html':decoded;
    const file=path.resolve(root,'.'+name);
    if(!file.startsWith(root+path.sep)||!((await stat(file)).isFile())){res.writeHead(404);return res.end('Not found');}
    const body=await readFile(file);res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(body);
  }catch{res.writeHead(404);res.end('Not found');}
}).listen(port,'127.0.0.1',()=>console.log(`Prototype 02: http://127.0.0.1:${port}/prototype/prototype-02.html`));
