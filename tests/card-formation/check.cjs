/* Browser regression for the image-coloured particle handoff; no production edits. */
const {chromium}=require('playwright');
const {PNG}=require('pngjs');
const vm=require('node:vm');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const crypto=require('node:crypto'),cp=require('node:child_process');
const ROOT=path.resolve(__dirname,'../..'),OUT=process.env.CARD_TEST_OUT||__dirname,BASE=process.env.PREVIEW_URL||'http://127.0.0.1:4173';
const CHROME=process.env.CHROME_PATH||'C:/Users/28919/AppData/Local/ms-playwright/chromium-1243/chrome-win64/chrome.exe';
fs.mkdirSync(OUT,{recursive:true});
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const report={date:'2026-10-17',baseline:'317032c',checks:[],gates:[],symmetry:[],performance:[],errors:[],failedResources:[]};
function record(name,detail){report.checks.push({name,detail});console.log('PASS',name);}
function protect(){
 for(const file of ['prototype/prototype-02.html','prototype/motion.js','prototype/timeline.js','prototype/experiments/card-particle.html','prototype/experiments/card-particle.js','prototype/experiments/card-particle.css','prototype/experiments/card-surface.js','data/global-materials.js'])assert.equal(fs.readFileSync(path.join(ROOT,file),'utf8').replaceAll('\r\n','\n'),cp.execFileSync('git',['show','b47ac3e:'+file],{cwd:ROOT,encoding:'utf8'}).replaceAll('\r\n','\n'),file);
 // Homepage logo metadata may evolve; product content and card module may not.
 for(const file of ['data/models.js','data/agents.js']){
  const scope={window:{}},oldScope={window:{}};vm.runInNewContext(fs.readFileSync(path.join(ROOT,file),'utf8'),scope);vm.runInNewContext(cp.execFileSync('git',['show','b47ac3e:'+file],{cwd:ROOT,encoding:'utf8'}),oldScope);
  const clean=window=>JSON.parse(JSON.stringify(window,(k,v)=>k.startsWith('logo')?undefined:v));assert.deepEqual(clean(scope.window),clean(oldScope.window));
 }
 assert.equal(sha(fs.readFileSync(path.join(ROOT,'index.html'))),'bfc193b140d94b8669327f71a677d68f84db19f573e262119c53894cde4d1711');
 for(const manifest of ['assets/brands/manifest.json','assets/global/manifest.json','assets/cards/manifest.json'])for(const item of JSON.parse(fs.readFileSync(path.join(ROOT,manifest),'utf8'))){const file=manifest==='assets/brands/manifest.json'?'assets/brands/'+item.file:item.file;assert.equal(sha(fs.readFileSync(path.join(ROOT,file))),item.sha256,file);}
 const source=fs.readFileSync(path.join(ROOT,'prototype/experiments/card-particle.js'),'utf8');assert.ok(!source.includes('scan('));assert.ok(!source.includes('outScan'));assert.ok(!source.includes('float leave='));
 record('protected home / original assets','approved motion/timeline and complete card module unchanged; product content unchanged apart from allowed logo metadata; user index and source assets retained');
}
function monitor(p){p.on('pageerror',e=>report.errors.push(e.message));p.on('console',m=>{if(m.type()==='error')report.errors.push(m.text())});p.on('response',r=>{if(r.status()>=400)report.failedResources.push({url:r.url(),status:r.status()})});}
async function ready(p){await p.waitForFunction(()=>document.documentElement.dataset.ready==='true');await idle(p);}
async function idle(p){await p.waitForFunction(()=>!NF_CARD_DEBUG.state.framePending);}
async function qseek(p,q,exit=false){await p.evaluate(({q,exit})=>NF_CARD_DEBUG.seekFormation(q,exit),{q,exit});await idle(p);}
async function shot(p,name){await p.evaluate(()=>document.getElementById('debug').style.display='none');await p.screenshot({path:path.join(OUT,name+'.png')});}
function stats(values){const a=values.toSorted((a,b)=>a-b);return {samples:a.length,mean:a.reduce((s,v)=>s+v,0)/a.length,p95:a[Math.floor(a.length*.95)],max:a.at(-1)};}
function brightness(buffer,rect,dpr){const im=PNG.sync.read(buffer);let sum=0,n=0;for(let y=Math.ceil((rect.cy-rect.ch*.10)*dpr);y<(rect.cy+rect.ch*.30)*dpr;y++)for(let x=Math.ceil((rect.cx-rect.cw*.20)*dpr);x<(rect.cx+rect.cw*.20)*dpr;x++){const o=(y*im.width+x)*4;sum+=(im.data[o]+im.data[o+1]+im.data[o+2])/3;n++;}return sum/n;}
async function main(){
 protect();const browser=await chromium.launch({headless:true,executablePath:CHROME});report.browser=browser.version();
 try{
  const p=await browser.newPage({viewport:{width:1440,height:1250}});monitor(p);
  await p.goto(BASE+'/prototype/experiments/card-particle.html?debug&p=.46');await ready(p);
  report.renderer=await p.evaluate(()=>{const gl=document.getElementById('particles').getContext('webgl'),ext=gl.getExtension('WEBGL_debug_renderer_info');return ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER)});
  const samples=[0,.12,.30,.52,.70,.80,.84,.88,.90,.94,.98,1];
  for(const id of ['starryblu','bybit','cmb']){
   await p.evaluate(id=>NF_CARD_DEBUG.select(id),id);await idle(p);
   for(const q of samples){
    const before=await p.evaluate(()=>NF_CARD_DEBUG.state.metrics);await qseek(p,q);
    const state=await p.evaluate(()=>NF_CARD_DEBUG.state),hash=await p.evaluate(()=>NF_CARD_DEBUG.capture());
    const draws=state.metrics.quadDraws-before.quadDraws;
    if(state.formation.surfaceMix===0)assert.equal(draws,0,'no surface draw before arrival + focus: '+id+' q '+q);
    if(state.formation.surfaceMix>0)assert.ok(state.formation.settled,'native surface requires all particles settled');
    if(q===.80)assert.equal(state.formation.surfaceMix,0);
    report.gates.push({id,q,amount:state.formation.amount,settled:state.formation.settled,surfaceMix:state.formation.surfaceMix,surfaceDraws:draws});
    await shot(p,id+'-q'+String(q).replace('.','_'));
    await qseek(p,q,true);assert.equal(await p.evaluate(()=>NF_CARD_DEBUG.capture()),hash,'same formation on entry / exit '+id+' '+q);
    report.symmetry.push({id,q,matching:true});
   }
   console.log('PASS particle gates and entry/exit symmetry',id);
  }
  record('three cards / 36 gates / 36 symmetric pairs','no native draw until all point targets are settled and focus interval is complete; entry and departure use identical WebGL frames at equal formation');
  // Both render layers can be isolated; the surface pass must really be empty at B.
  const only=await browser.newPage({viewport:{width:1440,height:1250}});monitor(only);
  await only.goto(BASE+'/prototype/experiments/card-particle.html?debug&card=bybit&pass=surface&p=.46');await ready(only);
  assert.equal(await only.evaluate(()=>NF_CARD_DEBUG.capture()),sha(Buffer.alloc(1440*1250*4)));
  await qseek(only,.94);assert.notEqual(await only.evaluate(()=>NF_CARD_DEBUG.capture()),sha(Buffer.alloc(1440*1250*4)));await only.close();
  record('isolated native layer','surface-only framebuffer is completely empty in settled particle stage; appears only during C handoff');
  await p.setViewportSize({width:1440,height:900});await p.evaluate(()=>NF_CARD_DEBUG.select('bybit'));await qseek(p,1);
  const steady=await p.evaluate(()=>NF_CARD_DEBUG.state.metrics);await p.waitForTimeout(650);assert.deepEqual(await p.evaluate(()=>NF_CARD_DEBUG.state.metrics),steady);
  record('idle hold','no scheduled frames or GPU draws during a 650ms stable hold');
  const progress=await p.evaluate(()=>NF_CARD_DEBUG.state.progress),rect=await p.locator('#card-hit').boundingBox();
  await p.mouse.move(rect.x+rect.width*.75,rect.y+rect.height*.4);await idle(p);assert.equal(await p.evaluate(()=>NF_CARD_DEBUG.state.progress),progress);await shot(p,'bybit-tilt');
  await p.locator('#card-hit').click();assert.ok(await p.locator('#material-detail').isVisible());await p.keyboard.press('Escape');await p.locator('#play-forward').focus();await p.locator('#card-hit').focus();assert.ok(await p.locator('#material-detail').isVisible());await p.keyboard.press('Escape');await p.mouse.move(-5,-5);await idle(p);
  await p.locator('#progress').evaluate(e=>{e.value='420';e.dispatchEvent(new Event('input',{bubbles:true}))});await p.waitForFunction(()=>Math.abs(NF_CARD_DEBUG.state.progress-.42)<.002&&!NF_CARD_DEBUG.state.framePending);
  await p.mouse.move(100,450);await p.mouse.wheel(0,600);await p.waitForFunction(()=>NF_CARD_DEBUG.state.target>.43);await idle(p);await p.mouse.wheel(0,-600);await p.waitForFunction(()=>Math.abs(NF_CARD_DEBUG.state.target-.42)<.005);await idle(p);
  await p.locator('#play-forward').click();await p.waitForTimeout(250);const fwd=await p.evaluate(()=>NF_CARD_DEBUG.state.target);await p.locator('#pause').click();await p.locator('#play-backward').click();await p.waitForTimeout(250);const rev=await p.evaluate(()=>NF_CARD_DEBUG.state.target);await p.locator('#pause').click();assert.ok(rev<fwd);
  record('interaction / reverse playback','mouse tilt preserves scroll; keyboard/click details, Escape, range, wheel, forward/reverse play and pause tested');
  for(const view of ['layer','portal']){await p.evaluate(v=>NF_CARD_DEBUG.view(v),view);await qseek(p,1);await shot(p,view+'-hold');}await p.evaluate(()=>NF_CARD_DEBUG.view('void'));
  const alloc=await p.evaluate(()=>NF_CARD_DEBUG.state.metrics);for(let i=0;i<8;i++)await p.setViewportSize({width:i%2?1440:1366,height:i%2?900:768});await idle(p);const resized=await p.evaluate(()=>NF_CARD_DEBUG.state.metrics);assert.equal(resized.bufferBytes,alloc.bufferBytes);assert.equal(resized.textureBytes,alloc.textureBytes);await p.close();record('integration studies / resize','both independent white-layer studies render; eight resizes reuse buffers and textures');
  const hd=await browser.newPage({viewport:{width:1440,height:1250},deviceScaleFactor:2});monitor(hd);await hd.goto(BASE+'/prototype/experiments/card-particle.html?debug&p=.46');await ready(hd);
  report.native=[];
  for(const id of ['starryblu','bybit','cmb']){await hd.evaluate(id=>NF_CARD_DEBUG.select(id),id);for(const [name,q] of [['assembly',.52],['particles',.8],['native',1]]){await qseek(hd,q);await shot(hd,id+'-'+name);}const s=await hd.evaluate(()=>NF_CARD_DEBUG.state);const dims=await hd.evaluate(()=>({w:document.getElementById('particles').width,h:document.getElementById('particles').height,source:NF_CARD_MATERIALS.find(m=>m.id===NF_CARD_DEBUG.state.card).asset}));assert.equal(dims.w,2880);assert.equal(dims.h,2500);const max={starryblu:1010,bybit:1010,cmb:581}[id];assert.ok(s.cardRect.cw*2<=max);report.native.push({id,widthCSS:s.cardRect.cw,heightCSS:s.cardRect.ch,dpr:2,...dims});}
  await hd.evaluate(()=>NF_CARD_DEBUG.select('bybit'));report.handoffBrightness=[];
  for(const q of [.8,.84,.88,.9,.94,.98,1]){await qseek(hd,q);const s=await hd.evaluate(()=>NF_CARD_DEBUG.state),png=await hd.screenshot();report.handoffBrightness.push({q,mean:brightness(png,s.cardRect,2)});}
  const means=report.handoffBrightness.map(x=>x.mean);assert.ok(Math.min(...means)>Math.max(...means)*.97,'no dark opacity dip across whole-surface handoff');
  await qseek(hd,1);await hd.evaluate(()=>{window.__loss=document.getElementById('particles').getContext('webgl').getExtension('WEBGL_lose_context');__loss.loseContext()});await hd.waitForTimeout(150);assert.ok(await hd.locator('#fallback').isVisible());await hd.evaluate(()=>__loss.restoreContext());await hd.waitForTimeout(250);assert.ok(await hd.locator('#fallback').isHidden());assert.deepEqual(await hd.evaluate(()=>NF_CARD_DEBUG.state.metrics.errors),[]);await hd.close();
  record('DPR 2 / white handoff / context restoration','all source widths respect device-pixel budget; white-card brightness has no opacity dip; lost context restores original textures');
  // Capture the previous shader with the SAME new Bybit source, so the comparison isolates motion.
  const old=await browser.newPage({viewport:{width:1440,height:900}});monitor(old);const oldJS=cp.execFileSync('git',['show','317032c:prototype/experiments/card-particle.js'],{cwd:ROOT,encoding:'utf8'});await old.route('**/prototype/experiments/card-particle.js',r=>r.fulfill({contentType:'application/javascript',body:oldJS}));await old.goto(BASE+'/prototype/experiments/card-particle.html?debug&card=bybit&p=.42');await ready(old);await shot(old,'old-bybit-early-surface');report.old=await old.evaluate(()=>NF_CARD_DEBUG.state.metrics);assert.ok(report.old.quadDraws>0);await old.close();
  record('before / after evidence','baseline 317032c shader rendered with the same supplied Bybit front; old native surface is drawn at p .42');
  for(const [width,height] of [[1920,1080],[1440,900],[1366,768]]){
   const bench=await browser.newPage({viewport:{width,height}});monitor(bench);
   await bench.addInitScript(()=>{const raf=requestAnimationFrame.bind(window);window.__bench={cpu:[],intervals:[],longTasks:[]};let prev;window.requestAnimationFrame=cb=>raf(t=>{const start=performance.now();cb(t);if(cb.name==='frame'){if(prev!==undefined)__bench.intervals.push(t-prev);prev=t;__bench.cpu.push(performance.now()-start)}});new PerformanceObserver(l=>{for(const e of l.getEntries())__bench.longTasks.push(e.duration)}).observe({type:'longtask'});});
   await bench.goto(BASE+'/prototype/experiments/card-particle.html?debug&card=bybit&p=.12');await ready(bench);await bench.evaluate(()=>{__bench.cpu=[];__bench.intervals=[];__bench.longTasks=[]});
   await bench.evaluate(async()=>{for(let i=0;i<150;i++){NF_CARD_DEBUG.seek(.12+i/149*.42);await new Promise(requestAnimationFrame)}});await idle(bench);
   const m=await bench.evaluate(()=>({bench:__bench,state:NF_CARD_DEBUG.state}));const cadence=stats(m.bench.intervals.filter(x=>x>0&&x<50));report.performance.push({width,height,cpu:stats(m.bench.cpu),raf:cadence,observedRafPerSecond:1000/cadence.mean,longTasks:m.bench.longTasks,metrics:m.state.metrics});await qseek(bench,1);await shot(bench,'hold-'+width);await bench.close();
  }record('desktop performance','150 driven aggregation/handoff frames per desktop resolution; actual callback timing and long-task observation recorded');
  const brands=await browser.newPage({viewport:{width:1440,height:1100}});monitor(brands);await brands.goto(BASE+'/prototype/experiments/global-brands.html');await brands.evaluate(()=>Promise.all([...document.images].map(i=>i.decode())));assert.equal(await brands.locator('#brands img').count(),6);await brands.screenshot({path:path.join(OUT,'global-brands.png'),fullPage:true});await brands.goto(BASE+'/prototype/experiments/global-materials.html');await brands.waitForFunction(()=>document.documentElement.dataset.ready==='true');assert.equal(await brands.locator('#cards canvas').count(),3);await brands.evaluate(()=>Promise.all([...document.images].map(i=>i.decode())));await brands.screenshot({path:path.join(OUT,'materials.png'),fullPage:true});await brands.close();record('assets / brand colour','three card sources and six transparent brand resources load, original colours retained');
  const reduced=await browser.newPage({reducedMotion:'reduce'});monitor(reduced);await reduced.goto(BASE+'/prototype/experiments/card-particle.html?debug');await ready(reduced);assert.equal(await reduced.evaluate(()=>NF_CARD_DEBUG.state.metrics.pointDraws),0);await shot(reduced,'reduced');await reduced.close();
  const noGL=await browser.newPage();monitor(noGL);await noGL.addInitScript(()=>{const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(t,...a){return /webgl/.test(t)?null:get.call(this,t,...a)}});await noGL.goto(BASE+'/prototype/experiments/card-particle.html?debug&p=.66');await ready(noGL);assert.ok(await noGL.locator('#fallback').isVisible());await shot(noGL,'no-webgl');await noGL.close();
  const mobile=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});monitor(mobile);await mobile.goto(BASE+'/prototype/experiments/card-particle.html?debug&p=.66');await ready(mobile);assert.ok(await mobile.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await mobile.locator('#card-hit').tap();assert.ok(await mobile.locator('#material-detail').isVisible());await mobile.locator('#detail-close').tap();await shot(mobile,'mobile');await mobile.close();
  const file=await browser.newPage();monitor(file);await file.goto('file:///'+path.join(ROOT,'prototype/experiments/card-particle.html').replaceAll('\\','/'));await file.waitForFunction(()=>document.documentElement.dataset.ready==='requires-http');await file.locator('#fallback').evaluate(i=>i.decode());assert.ok(await file.locator('#fallback').isVisible());await file.close();record('fallback / reduced / mobile','static readable fallback, reduce-motion, 390px touch, and file:// startup guidance checked');
  assert.deepEqual(report.errors,[]);assert.deepEqual(report.failedResources,[]);report.completed=true;record('console / resources','no browser errors or HTTP resource failures');
 }finally{fs.writeFileSync(path.join(OUT,'results.json'),JSON.stringify(report,null,2)+'\n');await browser.close()}
}
main().catch(e=>{console.error(e);process.exitCode=1});
