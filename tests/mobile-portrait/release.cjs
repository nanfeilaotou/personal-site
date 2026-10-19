// Production verification is separate from the immutable feature-preview report.
const {request}=require('playwright'),fs=require('fs'),path=require('path'),crypto=require('crypto'),assert=require('assert/strict');
const ROOT=path.resolve(__dirname,'../..'),BASE=process.env.RELEASE_BASE||'https://personal-site-7xv.pages.dev',OUT=process.env.RELEASE_OUT||path.join(__dirname,'release'),meta=JSON.parse(fs.readFileSync(path.join(__dirname,'run-metadata.json'),'utf8'));
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const r={date:'2026-10-19',base:BASE,files:[],checks:[],physicalDeviceTested:false};
(async()=>{fs.mkdirSync(OUT,{recursive:true});const c=await request.newContext();try{
 for(const [file,hash] of Object.entries(meta.sourceSHA256)){
  const url=BASE+(file==='index.html'?'/':'/'+file);const res=await c.get(url,{timeout:45000});assert.equal(res.status(),200,file);
  assert.equal(sha(Buffer.from((await res.text()).replaceAll('\r\n','\n'))),hash,file+' released source');r.files.push({file,status:res.status(),sha256:hash});
 }
 for(const file of ['tests/mobile-portrait/review.html','tests/mobile-portrait/after-audit.json','tests/mobile-portrait/contacts/320x568.webp','tests/mobile-portrait/video/card-switching.webm']){
  const res=await c.get(BASE+'/'+file);assert.equal(res.status(),200,file);const remote=await res.body(),local=fs.readFileSync(path.join(ROOT,file));const norm=b=>/\.(html|json)$/.test(file)?Buffer.from(b.toString('utf8').replaceAll('\r\n','\n')):b;assert.equal(sha(norm(remote)),sha(norm(local)),file+' review bytes');r.files.push({file,status:res.status()});
 }
 r.checks.push('production root and all modified runtime sources match approved implementation','current review JSON, contact sheet and video match local evidence');r.completed=true;console.log('PASS production root, approved runtime hashes and review resources');
 }finally{await c.dispose();fs.writeFileSync(path.join(OUT,'deployment-results.json'),JSON.stringify(r,null,2)+'\n');}})().catch(e=>{console.error(e);process.exitCode=1});
