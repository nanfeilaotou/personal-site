// Final Network material audit. No animation or production changes.
const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const ROOT=path.resolve(__dirname,'../..'),BASE='http://127.0.0.1:4173',OUT=__dirname;
const manifest=JSON.parse(fs.readFileSync(path.join(ROOT,'assets/global/network/manifest.json'))),report={date:'2026-10-17',baseline:'9723bd41611888110545dedf2ff75c135ef87ec5',checks:[],views:[],errors:[],failedResources:[]};
const pass=(name,detail)=>{report.checks.push({name,detail});console.log('PASS',name)};
function protect(){
 const files=cp.execFileSync('git',['diff','--name-only',report.baseline,'--','prototype','data','assets/cards','assets/brands','assets/global/brands'],{cwd:ROOT,encoding:'utf8'}).trim().split(/\r?\n/).filter(Boolean);
 assert.deepEqual(files.sort(),['prototype/experiments/global-assets.html','prototype/experiments/global-assets.js']);
 assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT,'index.html'))).digest('hex'),'bfc193b140d94b8669327f71a677d68f84db19f573e262119c53894cde4d1711');
 pass('protected scope','AI 21 entries, all scene / timeline / particle code, card experiment / source images unchanged from 9723bd4; pre-existing index.html SHA256 unchanged');
}
function links(){
 let count=0;
 for(const file of ['docs/GLOBAL-VISUAL-HANDOFF.md','assets/global/network/SOURCES.md']){
  const text=fs.readFileSync(path.join(ROOT,file),'utf8');
  for(const [,href] of text.matchAll(/!?\[[^\]]*\]\(([^)]+)\)/g)){
   let target;
   if(href.startsWith('https://github.com/nanfeilaotou/personal-site/blob/feat/home-ai-showcase-v2/'))target=path.join(ROOT,decodeURIComponent(href.split('/blob/feat/home-ai-showcase-v2/')[1]));
   else if(href.startsWith('https://raw.githubusercontent.com/nanfeilaotou/personal-site/refs/heads/feat/home-ai-showcase-v2/'))target=path.join(ROOT,decodeURIComponent(href.split('/refs/heads/feat/home-ai-showcase-v2/')[1]));
   else if(!/^https?:|^#/.test(href))target=path.resolve(ROOT,path.dirname(file),href.split('#')[0]);
   if(target){assert.ok(fs.existsSync(target),file+': '+href);count++;}
  }
 }
 pass('handoff links',count+' relative and feature-branch file / image targets exist; remote retrieval is checked after push');
}
(async()=>{
 protect();assert.equal(manifest.confirmedFinalChoice,true);assert.deepEqual(manifest.selected.map(x=>x.name),['Clash Verge Rev','FlClash','Shadowrocket','v2rayN']);
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'C:/Users/28919/AppData/Local/ms-playwright/chromium-1243/chrome-win64/chrome.exe'});
 try{
  for(const [width,height] of [[1920,1080],[1440,900],[1366,768]]){
   const p=await browser.newPage({viewport:{width,height},deviceScaleFactor:2});
   p.on('pageerror',e=>report.errors.push(e.message));p.on('console',m=>{if(m.type()==='error')report.errors.push(m.text())});p.on('response',r=>{if(r.status()>=400)report.failedResources.push(r.url())});
   await p.goto(BASE+'/prototype/experiments/global-assets.html');await p.waitForFunction(()=>document.documentElement.dataset.ready==='true');await p.evaluate(()=>Promise.all([...document.images].map(i=>i.decode())));
   assert.equal(await p.locator('.material').count(),12);const section=p.locator('[data-section="02 / NETWORK"]');
   assert.deepEqual(await section.locator('h3').allTextContents(),manifest.selected.map(x=>x.name));assert.equal(await section.locator('img').count(),8);
   assert.equal(await p.locator('[data-asset="assets/global/network/clash-verge.svg"], [data-asset="assets/global/network/v2ray.png"]').count(),0);
   const data=await section.locator('.material').evaluateAll(rows=>rows.map(row=>({name:row.querySelector('h3').textContent,images:[...row.querySelectorAll('img')].map(img=>{const r=img.getBoundingClientRect(),a=img.parentElement.getBoundingClientRect(),cs=getComputedStyle(img);return {src:img.getAttribute('src'),background:img.parentElement.dataset.background,natural:[img.naturalWidth,img.naturalHeight],display:[r.width,r.height],contained:r.left>=a.left&&r.right<=a.right&&r.top>=a.top&&r.bottom<=a.bottom,filter:cs.filter}})})));
   for(const row of data){assert.deepEqual(row.images.map(x=>x.background),['dark','light']);for(const img of row.images){assert.ok(img.natural[0]>0&&img.contained);assert.ok(Math.abs(img.display[0]/img.display[1]-img.natural[0]/img.natural[1])<.01);assert.equal(img.filter,'none');assert.ok(img.display[0]*2<=img.natural[0]&&img.display[1]*2<=img.natural[1]);}}
   assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   for(const href of new Set(await p.locator('a[href]').evaluateAll(a=>a.map(x=>x.href))))if(href.startsWith(BASE+'/'))assert.ok((await p.request.get(href)).ok(),href);
   const screenshot=width===1440?'docs/global-visual/network-final-contrast.png':'tests/network-final/network-'+width+'.png';await section.screenshot({path:path.join(ROOT,screenshot)});
   if(width===1440)await p.screenshot({path:path.join(ROOT,'docs/global-visual/material-library.png'),fullPage:true});
   await p.reload();await p.waitForFunction(()=>document.documentElement.dataset.ready==='true');assert.equal(await p.locator('[data-section="02 / NETWORK"] img').count(),8);
   report.views.push({width,height,dpr:2,icons:data,screenshot});await p.close();
  }
  pass('Network browsers','four final clients / eight original images per view, 1920×1080 / 1440×900 / 1366×768 at DPR 2; native aspect ratio, no cropping, no filters, no upscaling, no horizontal overflow; reload and local links pass');
  assert.deepEqual(report.errors,[]);assert.deepEqual(report.failedResources,[]);pass('console / resources','no console or page errors; no failed requests');links();protect();report.completed=true;
 }finally{fs.writeFileSync(path.join(OUT,'results.json'),JSON.stringify(report,null,2)+'\n');await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
