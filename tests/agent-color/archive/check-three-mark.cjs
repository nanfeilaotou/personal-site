const {chromium}=require('playwright'),{PNG}=require('pngjs');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),cp=require('node:child_process'),vm=require('node:vm'),assert=require('node:assert/strict');
const {clock,toScroll}=require('../timeline-fixture.cjs');
const ROOT=path.resolve(__dirname,'../..'),OUT=__dirname,BASE=process.env.PREVIEW_URL||'http://127.0.0.1:4173',HEAD='b47ac3e';
const START_HEAD=cp.execFileSync('git',['rev-parse','HEAD'],{cwd:ROOT,encoding:'utf8'}).trim();
const CHROME=process.env.CHROME_PATH||'C:/Users/28919/AppData/Local/ms-playwright/chromium-1243/chrome-win64/chrome.exe';
const read=f=>fs.readFileSync(path.join(ROOT,f)),old=f=>cp.execFileSync('git',['show',HEAD+':'+f],{cwd:ROOT,maxBuffer:16*1024*1024});
const norm=b=>b.toString().replaceAll('\r\n','\n'),sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const report={date:'2026-10-17',head:START_HEAD,baseline:HEAD,checks:[],modes:[],regression:[],performance:[],errors:[],failedResources:[]};
const record=(name,detail)=>{report.checks.push({name,detail});console.log('PASS',name)};
function data(raw){const scope={window:{}};vm.runInNewContext(raw.toString(),scope);return JSON.parse(JSON.stringify(scope.window));}
function protectedFiles(){
 for(const f of ['prototype/prototype-02.html','prototype/motion.js','prototype/timeline.js','data/models.js','data/global-materials.js'])assert.equal(norm(read(f)),norm(old(f)),f);
 const files=cp.execFileSync('git',['ls-tree','-r','--name-only',HEAD,'assets','prototype/experiments','tests/card-formation'],{cwd:ROOT,encoding:'utf8'}).trim().split('\n');
 for(const f of files)if(!['assets/cards/SOURCES.md','assets/brands/SOURCES.md','prototype/experiments/brand-color.html'].includes(f)){const binary=/\.(png|jpe?g|avif|gif|webp|svg)$/i.test(f);assert.equal(binary?sha(read(f)):norm(read(f)),binary?sha(old(f)):norm(old(f)),f+' must stay unchanged');}
 assert.equal(sha(read('index.html')),'bfc193b140d94b8669327f71a677d68f84db19f573e262119c53894cde4d1711');
 const projection=s=>s.slice(s.indexOf('  function projection('),s.indexOf('  function setGroup('));assert.equal(projection(norm(read('prototype/showcase.js'))),projection(norm(old('prototype/showcase.js'))));
 const drawing=s=>s.slice(s.indexOf('  function setGroup('));assert.equal(drawing(norm(read('prototype/showcase.js'))),drawing(norm(old('prototype/showcase.js'))));
 const before=data(old('data/agents.js')),after=data(read('data/agents.js'));assert.deepEqual(after.NF_LOCAL,before.NF_LOCAL);assert.equal(after.NF_AGENTS.length,10);
 for(const item of after.NF_AGENTS){const previous=before.NF_AGENTS.find(x=>x.id===item.id);if(!['workbuddy','muse','grokbot'].includes(item.id))assert.deepEqual(item,previous);else for(const key of ['name','provider','category','description','officialName','verifiedAt','officialSource','detailUrl'])assert.equal(item[key],previous[key]);assert.ok(fs.existsSync(path.join(ROOT,'assets/brands',item.logo)));}
 assert.equal(clock.total,10.58);assert.equal(cp.spawnSync('git',['diff','--cached','--quiet'],{cwd:ROOT}).status,0);
 record('protected source / assets / uncommitted work','home shader/background/motion, node projection and drawing, timeline 10.58, model/Local data, seven original Agents, Global/Personal and all card files unchanged; HEAD fixed and staging empty');
}
function monitor(p){p.on('pageerror',e=>report.errors.push(e.message));p.on('console',m=>{if(m.type()==='error')report.errors.push(m.text())});p.on('response',r=>{if(r.status()>=400)report.failedResources.push(r.url())})}
async function ready(p){await p.waitForFunction(()=>!!window.NF_DEBUG);await p.evaluate(()=>Promise.all([...document.images].map(i=>i.decode().catch(()=>{}))));await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(60);}
const url=(mode,s=clock.agents.stop)=>BASE+'/prototype/prototype-02.html?debug&agentColor='+mode+'&at='+s+'&it=4&time=10';
async function shot(p,file){await p.evaluate(()=>document.getElementById('dbg').style.display='none');const b=await p.screenshot();fs.writeFileSync(path.join(OUT,file+'.png'),b);return b;}
const filters=p=>p.locator('#agents-brands .agent-logo-shared').evaluateAll(a=>a.map(i=>({id:i.closest('.brand-node').dataset.id,filter:getComputedStyle(i).filter,rect:{x:i.getBoundingClientRect().x,y:i.getBoundingClientRect().y,w:i.getBoundingClientRect().width,h:i.getBoundingClientRect().height}})));
const grey=f=>Number(f.match(/grayscale\(([^)]+)\)/)?.[1]);
function compare(a,b){const A=PNG.sync.read(a),B=PNG.sync.read(b);assert.equal(A.width,B.width);let changed=0,max=0;for(let i=0;i<A.data.length;i++){const d=Math.abs(A.data[i]-B.data[i]);if(d>2)changed++;max=Math.max(max,d)}return {changedChannels:changed,ratio:changed/A.data.length,max};}
function chroma(buffer,r){const im=PNG.sync.read(buffer);let sum=0,n=0;for(let y=Math.floor(r.y);y<r.y+r.height;y++)for(let x=Math.floor(r.x);x<r.x+r.width;x++){const i=(y*im.width+x)*4;sum+=Math.max(...im.data.subarray(i,i+3))-Math.min(...im.data.subarray(i,i+3));n++}return sum/n;}
function stats(a){const s=a.toSorted((a,b)=>a-b);return {samples:a.length,mean:a.reduce((s,x)=>s+x,0)/a.length,p95:s[Math.floor(s.length*.95)],max:s.at(-1)}}
async function baselineRoutes(p){for(const f of ['data/agents.js','prototype/showcase.js','prototype/showcase.css'])await p.route('**/'+f,r=>r.fulfill({contentType:f.endsWith('.css')?'text/css':'application/javascript',body:old(f)}));}
async function main(){
 protectedFiles();const b=await chromium.launch({headless:true,executablePath:CHROME});report.browser=b.version();
 try{
  for(const [width,height] of [[1920,1080],[1440,900],[1366,768]]){
   let expected;
   for(const [letter,mode] of [['A','mono'],['B','interactive'],['C','accent']]){
    const p=await b.newPage({viewport:{width,height}});monitor(p);await p.goto(url(mode));await ready(p);
    const nodes=await p.locator('#agents-brands .brand-node').evaluateAll(a=>a.map(n=>({id:n.dataset.id,name:n.querySelector('.node-name')?.textContent,transform:n.style.transform,rect:{x:n.getBoundingClientRect().x,y:n.getBoundingClientRect().y,w:n.getBoundingClientRect().width,h:n.getBoundingClientRect().height},image:[...n.querySelectorAll('img')].map(i=>({ok:i.complete&&i.naturalWidth>0,fit:getComputedStyle(i).objectFit,pointer:getComputedStyle(i).pointerEvents,filter:getComputedStyle(i).filter}))})));
    assert.equal(nodes.length,10);for(const n of nodes){assert.ok(n.name);assert.equal(n.image.length,1);assert.ok(n.image[0].ok);assert.equal(n.image[0].fit,'contain');assert.equal(n.image[0].pointer,'none');assert.ok(n.rect.x>=0&&n.rect.y>=0&&n.rect.x+n.rect.w<=width&&n.rect.y+n.rect.h<=height);}
    for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){const a=nodes[i].rect,c=nodes[j].rect;assert.ok(a.x+a.w<=c.x||c.x+c.w<=a.x||a.y+a.h<=c.y||c.y+c.h<=a.y,'overlap '+nodes[i].id+' '+nodes[j].id);}
    const positions=await p.evaluate(()=>NF_AGENTS.map(x=>[x.id,NF_DEBUG.positions.get(x.id)]));if(expected)assert.deepEqual(positions,expected);else expected=positions;
    const f=await filters(p);for(const x of f)assert.equal(grey(x.filter),mode==='accent'?0:1);
    for(const n of nodes.filter(n=>!['workbuddy','muse','grokbot'].includes(n.id)))assert.equal(n.image[0].filter,'none');
    report.modes.push({letter,mode,width,height,nodes,filters:f});await shot(p,'agents-'+letter+'-'+width);await p.close();
   }
  }record('A / B / C at three sizes','all ten names and one image per node load; no clipping or overlapping hit targets; all three modes share identical projected positions');
  const p=await b.newPage({viewport:{width:1440,height:900}});monitor(p);
  await p.addInitScript(()=>{window.__listeners=new WeakMap();const add=EventTarget.prototype.addEventListener;EventTarget.prototype.addEventListener=function(t,...a){if(this instanceof HTMLElement&&this.matches('.brand-node')){const counts=__listeners.get(this)||{};counts[t]=(counts[t]||0)+1;__listeners.set(this,counts);}return add.call(this,t,...a)}});
  await p.goto(url('interactive'));await ready(p);const button=p.locator('#agents-brands [data-id=workbuddy]'),mark=button.locator('img');
  const before=await shot(p,'B-before'),rectBefore=await mark.boundingBox(),target=await button.boundingBox();report.colour={before:chroma(before,rectBefore)};
  await button.hover();await p.waitForTimeout(70);const midway=grey(await mark.evaluate(i=>getComputedStyle(i).filter));assert.ok(midway>0&&midway<1,'filter has a real intermediate state');await p.waitForTimeout(240);
  const rectAfter=await mark.boundingBox();assert.deepEqual(rectAfter,rectBefore);assert.equal(grey(await mark.evaluate(i=>getComputedStyle(i).filter)),0);const hovered=await shot(p,'B-hover');report.colour.hover=chroma(hovered,rectAfter);report.colour.midwayGrayscale=midway;assert.ok(report.colour.hover>report.colour.before+10);
  const panel=p.locator('#brand-detail'),panelRect=await panel.boundingBox();await p.mouse.move(panelRect.x+35,panelRect.y+45,{steps:12});await p.waitForTimeout(350);assert.ok(await panel.isVisible());assert.equal(await button.getAttribute('aria-expanded'),'true');assert.equal(grey(await mark.evaluate(i=>getComputedStyle(i).filter)),0);
  await button.click();await p.mouse.move(400,65);await p.waitForTimeout(350);assert.ok(await panel.isVisible());assert.equal(grey(await mark.evaluate(i=>getComputedStyle(i).filter)),0);await shot(p,'B-pinned');await p.keyboard.press('Escape');assert.ok(await panel.isHidden());
  await p.locator('#catalog-open').focus();await p.mouse.move(400,65);await p.waitForTimeout(300);assert.equal(grey(await mark.evaluate(i=>getComputedStyle(i).filter)),1);
  const order=[];await p.locator('#agents-brands .brand-node').first().focus();for(let i=0;i<10;i++){order.push(await p.evaluate(()=>document.activeElement.dataset.id));if(i<9)await p.keyboard.press('Tab')}assert.deepEqual(order,data(read('data/agents.js')).NF_AGENTS.map(x=>x.id));await p.keyboard.press('Escape');assert.ok(await panel.isHidden());
  await p.locator('#agents-brands [data-id=muse]').focus();await p.waitForTimeout(300);assert.equal(grey(await p.locator('#agents-brands [data-id=muse] img').evaluate(i=>getComputedStyle(i).filter)),0);await shot(p,'B-muse-focus');await p.keyboard.press('Escape');
  await p.locator('#agents-brands [data-id=grokbot]').click();assert.ok((await panel.innerText()).includes('用户提供'));await shot(p,'B-grok-selected');await p.keyboard.press('Escape');
  const listeners=await p.locator('#agents-brands .brand-node').evaluateAll(a=>a.map(n=>({id:n.dataset.id,counts:__listeners.get(n)})));
  for(const scene of [0,3.65,5.97,7.42,9.97,11.03,6.8,8.2,7.42]){await p.evaluate(s=>NF_DEBUG.seek(s),toScroll(scene));await p.waitForTimeout(40)}
  for(const [width,height] of [[1366,768],[1920,1080],[1440,900],[1366,768],[1440,900]]){await p.setViewportSize({width,height});await p.waitForTimeout(60)}
  assert.deepEqual(await p.locator('#agents-brands .brand-node').evaluateAll(a=>a.map(n=>({id:n.dataset.id,counts:__listeners.get(n)}))),listeners);assert.equal(await p.locator('#brands .brand-node').count(),21);report.listenerCounts=listeners;await p.close();
  record('smooth colour / panel / click / Escape / Tab','measured intermediate filter value, unchanged image rectangle, mouse handoff into details, pinned colour, ten sequential Tab targets, and original source status');
  record('no event or DOM growth','random scene seeks and five resizes retain the same 21 nodes and one listener of each original interaction type per Agent');
  // Pixel regression against HEAD, with only the three intended Agent marks changed.
  const oldPage=await b.newPage({viewport:{width:1440,height:900}}),newPage=await b.newPage({viewport:{width:1440,height:900}});monitor(oldPage);monitor(newPage);await baselineRoutes(oldPage);
  for(const sceneS of [0,.72,2.8,3.65,4.9,5.3,5.97,6.2,7.42,8.2,8.7,9.2,9.97,10.6,11.03,11.8]){
   const uri=url('interactive',toScroll(sceneS));await oldPage.goto(uri);await newPage.goto(uri);await ready(oldPage);await ready(newPage);
   await oldPage.addStyleTag({content:'*{transition:none!important;animation:none!important}'});await newPage.addStyleTag({content:'*{transition:none!important;animation:none!important}'});
   if(sceneS>=6.18&&sceneS<=8.49){await oldPage.addStyleTag({content:'#brands{opacity:0!important}'});await newPage.addStyleTag({content:'#brands{opacity:0!important}'})}
   await oldPage.evaluate(()=>document.getElementById('dbg').style.display='none');await newPage.evaluate(()=>document.getElementById('dbg').style.display='none');
   const [a,c]=await Promise.all([oldPage.screenshot(),newPage.screenshot()]);const difference=compare(a,c);assert.ok(difference.ratio<.00002,'regression scene '+sceneS+' '+JSON.stringify(difference));report.regression.push({sceneS,...difference,beforeSha:sha(a),afterSha:sha(c)});
   if([0,3.65,5.97,9.97,11.03].includes(sceneS)){fs.writeFileSync(path.join(OUT,'before-'+sceneS+'.png'),a);fs.writeFileSync(path.join(OUT,'after-'+sceneS+'.png'),c)}
  }await oldPage.close();await newPage.close();record('sixteen visual regressions','baseline-vs-current opening, models, Local, bridge, Global and Personal images match; Agent Canvas/WebGL geometry compared with its intentionally changed DOM hidden');
  const nav=await b.newPage({viewport:{width:1440,height:900}});monitor(nav);await nav.goto(BASE+'/prototype/prototype-02.html?debug&agentColor=interactive#agents');await ready(nav);assert.equal(await nav.locator('#agents-brands').getAttribute('data-agent-color'),'interactive');
  for(const key of ['models','global','agents'])await nav.locator('[data-go='+key+']').first().click();await nav.waitForFunction(()=>Math.abs(NF_DEBUG.state.s-NF_DEBUG.state.stops.agents)<.005);assert.equal(new URL(nav.url()).hash,'#agents');
  await nav.reload();await ready(nav);const navState=await nav.evaluate(()=>NF_DEBUG.state);assert.ok(Math.abs(navState.s-navState.stops.agents)<.005);
  await nav.goBack();await nav.waitForFunction(()=>Math.abs(NF_DEBUG.state.s-NF_DEBUG.state.stops.global)<.005);await nav.goForward();await nav.waitForFunction(()=>Math.abs(NF_DEBUG.state.s-NF_DEBUG.state.stops.agents)<.005);
  await nav.mouse.move(400,80);await nav.mouse.wheel(0,350);await nav.waitForFunction(()=>NF_DEBUG.state.s>NF_DEBUG.state.stops.agents+.2);await nav.mouse.wheel(0,-350);await nav.waitForFunction(()=>Math.abs(NF_DEBUG.state.s-NF_DEBUG.state.stops.agents)<.005);
  await nav.close();
  record('navigation / refresh','rapid models→Global→Agents navigation reaches its stable anchor and keeps the selected colour mode on refresh');
  const failure=await b.newPage({viewport:{width:1440,height:900}});await failure.route('**/assets/brands/{workbuddy-color.svg,muse-color.svg,grok-bot-provided.png}',r=>r.fulfill({status:503,body:'intentional missing-logo test'}));
  await failure.goto(url('interactive'));await ready(failure);for(const id of ['workbuddy','muse','grokbot']){const n=failure.locator('#agents-brands [data-id='+id+']');assert.ok(await n.locator('.node-name').isVisible());assert.ok(await n.locator('img').isHidden());await n.click();assert.ok(await failure.locator('#brand-detail').isVisible());await failure.keyboard.press('Escape')}
  await shot(failure,'failed-logos');await failure.close();record('resource failure fallback','three intentionally failed image responses still leave readable, clickable names; expected network failures isolated from normal console results');
  const hd=await b.newPage({viewport:{width:1440,height:900},deviceScaleFactor:2});monitor(hd);await hd.goto(url('accent'));await ready(hd);assert.equal(await hd.evaluate(()=>NF_DEBUG.state.dpr),2);await shot(hd,'agents-C-2x');await hd.close();
  const reduced=await b.newPage({reducedMotion:'reduce'});monitor(reduced);await reduced.goto(url('interactive'));await ready(reduced);await reduced.locator('#agents-brands [data-id=workbuddy]').focus();assert.equal(await reduced.locator('#agents-brands [data-id=workbuddy] img').evaluate(i=>getComputedStyle(i).transitionDuration),'0s');await reduced.close();
  const mobile=await b.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});monitor(mobile);await mobile.goto(url('interactive'));await ready(mobile);await mobile.locator('#agents-brands [data-id=workbuddy]').tap();assert.ok(await mobile.locator('#brand-detail').isVisible());await shot(mobile,'mobile-touch');await mobile.close();record('HiDPI / reduced motion / touch','DPR 2 original-image rendering, zero-transition reduce mode, and touch selection of integrated icons checked');
  // Application RAF CPU only; real performance.now and a warmed stable scene.
  for(const baseline of [true,false]){
   const bench=await b.newPage({viewport:{width:1440,height:900}});monitor(bench);if(baseline)await baselineRoutes(bench);
   await bench.addInitScript(()=>{window.__bench={cpu:[],intervals:[],longTasks:[]};let prev;const raf=requestAnimationFrame.bind(window);window.requestAnimationFrame=cb=>raf(t=>{const start=performance.now();cb(t);if(cb.name==='frame'){if(prev!==undefined)__bench.intervals.push(t-prev);prev=t;__bench.cpu.push(performance.now()-start)}});new PerformanceObserver(l=>{for(const e of l.getEntries())__bench.longTasks.push(e.duration)}).observe({type:'longtask'});});
   await bench.goto(url('interactive'));await ready(bench);await bench.waitForTimeout(250);await bench.evaluate(()=>{__bench.cpu=[];__bench.intervals=[];__bench.longTasks=[]});await bench.waitForFunction(()=>__bench.cpu.length>=200);const m=await bench.evaluate(()=>__bench);report.performance.push({baseline,cpu:stats(m.cpu.slice(0,200)),raf:stats(m.intervals.slice(0,200)),longTasks:m.longTasks});await bench.close();
  }record('performance','200 warmed RAF callback CPU samples for baseline and current stable scene; observed cadence and long tasks retained without FPS guarantees');
  assert.deepEqual(report.errors,[]);assert.deepEqual(report.failedResources,[]);assert.equal(cp.execFileSync('git',['rev-parse','HEAD'],{cwd:ROOT,encoding:'utf8'}).trim(),START_HEAD);report.completed=true;record('console / resources','all normal preview paths have zero browser errors or failed responses; HEAD unchanged during tests');
 }finally{fs.writeFileSync(path.join(OUT,'results.json'),JSON.stringify(report,null,2)+'\n');await b.close()}
}
main().catch(e=>{console.error(e);process.exitCode=1});
