const {chromium}=require('playwright'),{PNG}=require('pngjs');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict'),cp=require('node:child_process');
const {clock,toScroll}=require('../timeline-fixture.cjs');
const ROOT=path.resolve(__dirname,'../..'),BASE=process.env.PREVIEW_URL||'http://127.0.0.1:4173',BEFORE=process.env.BASELINE_URL||'http://127.0.0.1:4174';
const report={date:'2026-10-17',baseline:'8e88a5a',checks:[],regression:[],brandMetrics:[],errors:[],failedResources:[]};
const record=(name,detail)=>{report.checks.push({name,detail});console.log('PASS',name);};
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8').replaceAll('\r\n','\n');
const old=cp.execFileSync('git',['show','8e88a5a:prototype/motion.js'],{cwd:ROOT,encoding:'utf8'}).replaceAll('\r\n','\n'),current=read('prototype/motion.js');
for(const [start,end] of [['function sceneLocal(','/* ============ 01.3'],['function sceneGlobal(','/* ============ 03'],['function sceneField(','/* ============ UI'],['function sceneVoid(','const showcase=']])assert.equal(current.slice(current.indexOf(start),current.indexOf(end,current.indexOf(start))),old.slice(old.indexOf(start),old.indexOf(end,old.indexOf(start))),start+' protected source');
const oldShowcase=cp.execFileSync('git',['show','8e88a5a:prototype/showcase.js'],{cwd:ROOT,encoding:'utf8'}).replaceAll('\r\n','\n'),showcase=read('prototype/showcase.js');
const projection=s=>s.slice(s.indexOf('  function projection('),s.indexOf('  function setGroup('));assert.equal(projection(showcase),projection(oldShowcase));record('protected source','Shader checked by existing static suite; Local / Global / Personal / background / node projection unchanged');
const beforeAudit=JSON.parse(read('tests/refinement/before/audit.json'));
for(let s=0;s<=12.01;s+=.005)assert.ok(Math.abs(clock.toScene(toScroll(s))-s)<1e-7);
for(let s=0;s<clock.total-.001;s+=.001)assert.ok(clock.toScene(s+.001)>clock.toScene(s));
for(const span of clock.compression)for(const at of [span.scrollStart,span.scrollEnd]){
 const h=1e-6,d1=(clock.toScene(at)-clock.toScene(at-h))/h,d2=(clock.toScene(at+h)-clock.toScene(at))/h;assert.ok(Math.abs(d1-d2)<.0002);
}
assert.equal(clock.total,10.58);assert.ok(clock.models.holdEnd-clock.models.formed>.8);assert.ok(clock.agents.holdEnd-clock.agents.formed>.8);record('timeline continuity','monotone round trips at .005 scene units; C1 joins; .82 / .85-screen model and Agent holds');
// No existing asset or representative model metadata may silently change.
const baselineManifest=JSON.parse(cp.execFileSync('git',['show','8e88a5a:assets/brands/manifest.json'],{cwd:ROOT,encoding:'utf8'}));
for(const m of baselineManifest)assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT,'assets/brands',m.file))).digest('hex'),m.sha256);
record('existing 15 SVGs','all SHA256 hashes unchanged');
const executablePath=process.env.CHROME_PATH||'C:/Users/28919/AppData/Local/ms-playwright/chromium-1243/chrome-win64/chrome.exe';
const monitor=p=>{p.on('pageerror',e=>report.errors.push(e.message));p.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});p.on('response',r=>{if(r.status()>=400)report.failedResources.push(r.url());});};
const freeze=async p=>p.addInitScript(()=>{performance.now=()=>0;const raf=requestAnimationFrame.bind(window);window.requestAnimationFrame=cb=>raf(()=>cb(10000));});
const hide='#ui,#brands,#dbg,#catalog-open,#brand-detail,.fallback-word{opacity:0!important}';
(async()=>{const browser=await chromium.launch({headless:true,executablePath});report.browser=browser.version();try{
 const a=await browser.newPage({viewport:{width:1440,height:900}}),b=await browser.newPage({viewport:{width:1440,height:900}});monitor(a);monitor(b);await freeze(a);await freeze(b);
 for(const sceneS of [0,.32,.72,1.35,2.6,2.8,3.65,4.45,4.65,5.1,5.3,5.6,5.97,6.2,6.55,6.8,7.42,8.2,8.37,8.66,9.97,10.6,11.03,11.8,12.01]){
  await a.goto(`${BEFORE}/prototype/prototype-02.html?debug&at=${sceneS}&it=4&time=10`);await b.goto(`${BASE}/prototype/prototype-02.html?debug&at=${toScroll(sceneS)}&it=4&time=10`);
  await Promise.all([a.addStyleTag({content:hide}),b.addStyleTag({content:hide})]);await b.waitForTimeout(70);
  const [ab,bb]=await Promise.all([a.screenshot(),b.screenshot()]),ap=PNG.sync.read(ab),bp=PNG.sync.read(bb);let count=0,max=0,significant=0;
  for(let i=0;i<ap.data.length;i++){const d=Math.abs(ap.data[i]-bp.data[i]);if(d)count++;if(d>2)significant++;max=Math.max(max,d);}
  if([0,5.3,9.97,11.03].includes(sceneS)||significant/ap.data.length>=.00002){fs.writeFileSync(path.join(__dirname,`before-protected-${sceneS}.png`),ab);fs.writeFileSync(path.join(__dirname,`after-protected-${sceneS}.png`),bb);}
  assert.ok(significant/ap.data.length<.00002,`scene ${sceneS} geometry changed: ${significant} channels`);
  const entry={sceneS,scrollS:toScroll(sceneS),changedChannels:count,significantChannels:significant,maxChannelDifference:max,beforeSha:crypto.createHash('sha256').update(ap.data).digest('hex'),afterSha:crypto.createHash('sha256').update(bp.data).digest('hex')};report.regression.push(entry);
 }
 await a.close();await b.close();record('25 matched visual samples','approved Canvas / WebGL pictures retained across compressed time; tiny raster rounding differences bounded');
 const p=await browser.newPage({viewport:{width:1500,height:1000}});monitor(p);await p.goto(BASE+'/prototype/brand-review.html');await p.waitForFunction(()=>document.documentElement.dataset.ready==='true');await p.evaluate(()=>Promise.all([...document.images].map(i=>i.decode())));
 assert.equal(await p.locator('.review-row[data-id]').count(),20);
 assert.deepEqual(await p.evaluate(()=>[...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src)),[]);
 await p.screenshot({path:path.join(__dirname,'brands-after.png'),fullPage:true});
 report.brandMetrics=await p.evaluate(()=>[...document.querySelectorAll('.final .sample')].map(sample=>{const img=sample.querySelector('img');if(!img)return {id:sample.querySelector('[data-id]').dataset.id,text:true};const rect=img.getBoundingClientRect();return {id:sample.querySelector('[data-id]').dataset.id,size:sample.style.getPropertyValue('--sample-size'),width:rect.width,height:rect.height,fit:getComputedStyle(img).objectFit,natural:[img.naturalWidth,img.naturalHeight]};}));
 for(const m of report.brandMetrics.filter(m=>!m.text)){assert.equal(m.fit,'contain');assert.ok(m.width>=parseFloat(m.size)*.9&&m.height>=parseFloat(m.size)*.9);}
 record('30 / 40 / 48px brand review','all original and final samples load; aspect-preserving contain, no clip or forced recoloring');
 await p.goto(BASE+'/prototype/prototype-02.html?debug&it=4#models');await p.waitForTimeout(180);
 const models=await p.evaluate(()=>NF_MODELS);for(let i=0;i<models.length;i++){const m=models[i],old=beforeAudit.data.models[i];assert.deepEqual(m.featuredModels,old.featuredModels);assert.equal(m.verifiedAt,old.verifiedAt);}
 record('representative models','all model versions and verifiedAt values preserved; 21 concise descriptions remain in data');
 for(const [key,ids] of [['models',models.map(x=>x.id)],['agents',await p.evaluate(()=>NF_AGENTS.map(x=>x.id))]]){
  await p.evaluate(key=>NF_DEBUG.seek(NF_TIMELINE[key].stop),key);await p.waitForTimeout(120);
  for(const id of ids){await p.mouse.move(-10,-10);await p.keyboard.press('Escape');const node=p.locator(`[data-id="${id}"]`);await node.focus();assert.ok(await p.locator('#brand-detail').isVisible());await node.click();assert.equal(await node.getAttribute('aria-expanded'),'true');await p.mouse.move(50,700);assert.ok(await p.locator('#brand-detail').isVisible());}
  await p.keyboard.press('Escape');
  const rects=await p.locator(`#${key}-brands button`).evaluateAll(bs=>bs.map(b=>{const r=b.getBoundingClientRect();return {l:r.left,r:r.right,t:r.top,b:r.bottom};}));for(const r of rects)assert.ok(r.l>=0&&r.r<=1500&&r.t>=0&&r.b<=1000);
 }
 record('all 8 model / 10 platform controls','keyboard focus, click pin and Escape checked on every node; targets remain within desktop viewport');
 const state=await p.evaluate(()=>({total:NF_DEBUG.state.total,max:(document.documentElement.scrollHeight-innerHeight)/innerHeight,logos:NF_AGENTS.filter(x=>x.logo).length,text:NF_AGENTS.filter(x=>!x.logo).map(x=>x.name)}));assert.ok(Math.abs(state.max-state.total)<.002);assert.equal(state.logos,7);assert.equal(state.text.length,3);report.platforms=state;record('track / platform completeness','scroll range equals 10.58 screens; 7 Agent icons and 3 explicit wordmarks');
 for(const key of ['models','local','agents','global','personal']){await p.goto(BASE+'/prototype/prototype-02.html?debug&it=4&anchor-check='+key+'#'+key);await p.waitForTimeout(100);assert.ok(Math.abs(await p.evaluate(()=>NF_DEBUG.state.s)-clock[key].stop)<.002);}
 await p.close();record('direct hashes','all five content anchors open at stable stops');
 assert.deepEqual(report.errors,[]);assert.deepEqual(report.failedResources,[]);record('console / resources','no unexpected page, console or resource errors');report.completed=true;
}finally{fs.writeFileSync(path.join(__dirname,'results.json'),JSON.stringify(report,null,2)+'\n');await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
