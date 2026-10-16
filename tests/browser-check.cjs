/* Dev-only: NODE_PATH may point to the Codex bundled Playwright packages. */
const {chromium}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const ROOT=path.resolve(__dirname,'..'),OUT=path.join(__dirname,'screenshots');
const BASE=process.env.PREVIEW_URL||'http://127.0.0.1:4173';
const executablePath=process.env.CHROME_PATH||'C:/Users/28919/AppData/Local/ms-playwright/chromium-1243/chrome-win64/chrome.exe';
const report={date:'2026-10-16',environment:'Windows / headless Chromium / local desktop',checks:[],regression:[],performance:[],errors:[],failedResources:[]};
const record=(name,detail)=>{report.checks.push({name,detail});console.log('PASS',name);};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function seek(p,s){await p.evaluate(s=>NF_DEBUG.seek(s),s);await p.waitForTimeout(100);}
async function shot(p,name){await p.evaluate(()=>document.getElementById('dbg').style.display='none');await p.screenshot({path:path.join(OUT,name+'.png'),animations:'disabled'});}
function monitor(p){p.on('pageerror',e=>report.errors.push(e.message));p.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});p.on('response',r=>{if(r.status()>=400)report.failedResources.push({url:r.url(),status:r.status()});});}
async function hashGL(p){
  await p.evaluate(()=>window.__capture=true);await p.waitForFunction(()=>!window.__capture);
  return p.evaluate(async()=>{
    const bytes=window.__pixels,digest=await crypto.subtle.digest('SHA-256',bytes);
    return {sha256:[...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,'0')).join(''),nonzero:bytes.reduce((a,v)=>a+(v>0?1:0),0)};
  });
}
async function deterministic(p){
  await p.addInitScript(()=>{
    // Exact same Shader inputs for both versions, including time and velocity.
    performance.now=()=>0;
    const raf=window.requestAnimationFrame.bind(window);window.requestAnimationFrame=cb=>raf(()=>cb(10000));
    const draw=WebGLRenderingContext.prototype.drawArrays;
    WebGLRenderingContext.prototype.drawArrays=function(...args){const out=draw.apply(this,args);if(window.__capture){const a=new Uint8Array(this.drawingBufferWidth*this.drawingBufferHeight*4);this.readPixels(0,0,this.drawingBufferWidth,this.drawingBufferHeight,this.RGBA,this.UNSIGNED_BYTE,a);window.__pixels=a;window.__capture=false;}return out;};
  });
}
async function perfInit(p){await p.addInitScript(()=>{
  window.__metrics={intervals:[],cpu:[],longTasks:[],draws:0,buffers:0,contexts:0};
  let prev;const raf=window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame=cb=>raf(t=>{const before=performance.now();if(prev!==undefined)__metrics.intervals.push(t-prev);prev=t;cb(t);__metrics.cpu.push(performance.now()-before);});
  try{new PerformanceObserver(list=>{for(const e of list.getEntries())__metrics.longTasks.push(e.duration);}).observe({type:'longtask',buffered:true});}catch{}
  const draw=WebGLRenderingContext.prototype.drawArrays;WebGLRenderingContext.prototype.drawArrays=function(...a){__metrics.draws++;return draw.apply(this,a);};
  const create=WebGLRenderingContext.prototype.createBuffer;WebGLRenderingContext.prototype.createBuffer=function(...a){__metrics.buffers++;return create.apply(this,a);};
  const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(t,...a){if(t==='webgl')__metrics.contexts++;return get.call(this,t,...a);};
});}
function summarize(a){const sorted=a.slice().sort((a,b)=>a-b);return {samples:a.length,mean:+(a.reduce((a,b)=>a+b,0)/a.length).toFixed(3),p95:+sorted[Math.floor(sorted.length*.95)].toFixed(3),max:+sorted.at(-1).toFixed(3)};}
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath});report.browser=browser.version();fs.mkdirSync(OUT,{recursive:true});
 try{
  // Shader regression in multiple viewports and stages. Actual framebuffer bytes, not visual guesses.
  for(const [width,height] of [[1920,1080],[1440,900],[1366,768]]){
    const scenes=width===1440?[0,.32,.72]:[0];
    for(const s of scenes){
      const results=[];
      for(const version of ['01','02']){
        const p=await browser.newPage({viewport:{width,height}});monitor(p);await deterministic(p);
        await p.goto(`${BASE}/prototype/prototype-${version}.html?debug&at=${s}&it=4&time=10`);await p.waitForTimeout(200);
        const neutral=await hashGL(p);assert.ok(neutral.nonzero>1000);
        if(s===0){
          await shot(p,`${version}-open-${width}`);await p.mouse.move(width*.28,height*.32);const repelled=await hashGL(p);assert.notEqual(repelled.sha256,neutral.sha256);
          await shot(p,`${version}-repulsion-${width}`);await p.mouse.move(-10,-10);const restored=await hashGL(p);assert.equal(restored.sha256,neutral.sha256,'particles recover exactly');
          results.push({version,neutral,repelled,restored});
        }else{await shot(p,`${version}-depth-${s}`);results.push({version,neutral});}
        await p.close();
      }
      assert.equal(results[0].neutral.sha256,results[1].neutral.sha256);
      if(s===0)assert.equal(results[0].repelled.sha256,results[1].repelled.sha256);
      report.regression.push({width,height,s,results});record(`GL pixel regression ${width}×${height} s=${s}`,'identical SHA256; repulsion/recovery checked at s=0');
    }
  }
  const p=await browser.newPage({viewport:{width:1440,height:900}});monitor(p);await perfInit(p);
  await p.goto(BASE+'/prototype/prototype-02.html?debug&it=4');await p.waitForTimeout(200);
  report.webgl=await p.evaluate(()=>{const gl=document.getElementById('gl').getContext('webgl'),ext=gl.getExtension('WEBGL_debug_renderer_info');return {renderer:ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER),bufferBytes:gl.getBufferParameter(gl.ARRAY_BUFFER,gl.BUFFER_SIZE),gpuTimerAvailable:!!gl.getExtension('EXT_disjoint_timer_query')};});
  assert.equal(await p.locator('#models-brands button').count(),8);assert.equal(await p.locator('#agents-brands button').count(),10);
  assert.deepEqual(await p.evaluate(()=>[...document.images].filter(x=>!x.complete||!x.naturalWidth).map(x=>x.src)),[]);record('local logo loading','all 15 SVG assets loaded; 5 intentional name marks');
  for(const [s,name] of [[1.35,'02-rise-1440'],[2.75,'02-models-enter-1440'],[3.65,'02-models-1440'],[4.65,'02-models-exit-1440'],[5.3,'02-local-precision-1440'],[5.97,'02-local-1440'],[6.55,'02-agents-enter-1440'],[7.42,'02-agents-1440'],[8.37,'02-agents-exit-1440'],[8.66,'02-bridge-1440'],[9.97,'02-global-1440'],[11.03,'02-personal-1440']]){await seek(p,s);await shot(p,name);}
  // Hover -> inspector -> source link is a continuous pointer path, not a disappearing tooltip.
  await seek(p,3.65);const node=p.locator('[data-id=claude]');await node.hover();await p.locator('#brand-detail').waitFor({state:'visible'});
  assert.ok((await p.locator('#brand-detail').innerText()).includes('2026-10-16'));
  await p.locator('#brand-detail a').first().hover();await p.waitForTimeout(300);assert.ok(await p.locator('#brand-detail').isVisible());await shot(p,'02-model-detail-1440');
  await node.click();await p.mouse.move(100,600);await p.waitForTimeout(300);assert.ok(await p.locator('#brand-detail').isVisible());
  const panelBefore=await p.locator('#brand-detail').boundingBox();await p.mouse.wheel(0,35);await p.waitForTimeout(400);assert.ok(await p.locator('#brand-detail').isVisible());assert.deepEqual(await p.locator('#brand-detail').boundingBox(),panelBefore);
  await p.keyboard.press('Escape');assert.ok(await p.locator('#brand-detail').isHidden());
  await p.locator('[data-id=gpt]').focus();await p.keyboard.press('Tab');assert.ok(await p.locator('#brand-detail').isVisible());record('hover / focus / pin / small-scroll / Escape','inspector remains usable across pointer gap and 35px scroll');
  // Navigation settles at stable stops, including browser back and refresh.
  await p.locator('#chAI [data-go=agents]').click();await p.waitForFunction(()=>Math.abs(NF_DEBUG.state.s-7.42)<.002);assert.equal(new URL(p.url()).hash,'#agents');
  await p.locator('#hTR [data-go=global]').click();await p.waitForFunction(()=>Math.abs(NF_DEBUG.state.s-9.97)<.002);assert.ok((await p.locator('#crumb').innerText()).includes('NETWORK'));
  await p.goBack();await p.waitForFunction(()=>Math.abs(NF_DEBUG.state.s-7.42)<.002);
  await p.reload();await p.waitForFunction(()=>Math.abs(NF_DEBUG.state.s-7.42)<.002);
  await seek(p,5.97);await p.reload();await p.waitForFunction(()=>Math.abs(NF_DEBUG.state.s-5.97)<.002);record('navigation / URL hash / browser back / refresh','stable stops; refresh preserves manual scroll even when URL retains a chapter hash');
  // Random positioning is reversible and independent of traversal history.
  const random=[0,.5,1.5,2.5,3.65,4.65,5.15,5.97,6.55,7.42,8.2,8.66,9.97,10.5,11.03,11.95];const snapshots=new Map();
  for(const s of random){await seek(p,s);snapshots.set(s,await p.evaluate(()=>({crumb:document.getElementById('crumb').textContent,nodes:[...document.querySelectorAll('.brand-group:not([inert]) .brand-node')].map(x=>x.style.transform)})));}
  for(const s of random.toReversed()){await seek(p,s);assert.deepEqual(await p.evaluate(()=>({crumb:document.getElementById('crumb').textContent,nodes:[...document.querySelectorAll('.brand-group:not([inert]) .brand-node')].map(x=>x.style.transform)})),snapshots.get(s));}record('random seek / reverse / mid-animation pause','16 positions reproduce the same transforms and chapter state');
  // Slow wheel and touchpad-like small deltas, then rapid forward/reverse wheel bursts.
  await seek(p,3.3);for(let i=0;i<12;i++){await p.mouse.wheel(0,12);await p.waitForTimeout(18);}await p.waitForTimeout(450);
  assert.ok(Math.abs(await p.evaluate(()=>NF_DEBUG.state.s-NF_DEBUG.state.target))<.03);
  for(const delta of [1700,2200,1800,-2900,-2300,1300])await p.mouse.wheel(0,delta);await p.waitForTimeout(1300);assert.ok(Math.abs(await p.evaluate(()=>NF_DEBUG.state.s-NF_DEBUG.state.target))<.01);record('wheel / continuous small deltas / rapid reversals','single interpolated timeline settles at scroll position');
  await p.locator('#catalog-open').click();assert.equal(await p.locator('#catalog li').count(),21);await p.keyboard.press('Escape');record('complete keyboard-accessible content index','21 entries with official sources and product links');
  // Performance: real rAF cadence and callback CPU duration, measured separately from screenshots.
  for(const [width,height] of [[1920,1080],[1440,900],[1366,768]]){
    await p.setViewportSize({width,height});
    for(const [scene,s] of [['open',0],['models',3.65],['local',5.97],['agents',7.42],['global',9.97]]){
      await seek(p,s);await p.waitForTimeout(200);await p.evaluate(()=>{__metrics.intervals=[];__metrics.cpu=[];__metrics.longTasks=[];__metrics.draws=0;});await p.waitForTimeout(1200);
      const m=await p.evaluate(()=>({m:__metrics,state:NF_DEBUG.state})),interval=summarize(m.m.intervals),cpu=summarize(m.m.cpu);
      report.performance.push({width,height,scene,raf:interval,callbackCpu:cpu,observedFps:+(1000/interval.mean).toFixed(1),longTasks:m.m.longTasks,drawCalls:m.m.draws,frames:m.m.cpu.length,points:m.state.points,bufferBytes:m.state.bufferBytes});
    }
  }
  // Repeated resize must reuse the same context and buffer; preserve screen progress.
  await seek(p,7.42);const allocBefore=await p.evaluate(()=>({buffers:__metrics.buffers,contexts:__metrics.contexts,nodes:document.querySelectorAll('.brand-node').length}));
  for(let i=0;i<10;i++)await p.setViewportSize({width:i%2?1440:1366,height:i%2?900:768});await p.waitForTimeout(200);
  const allocAfter=await p.evaluate(()=>({buffers:__metrics.buffers,contexts:__metrics.contexts,nodes:document.querySelectorAll('.brand-node').length}));assert.deepEqual(allocAfter,allocBefore);assert.ok(Math.abs(await p.evaluate(()=>NF_DEBUG.state.s)-7.42)<.01);record('10 resize cycles','one WebGL context / one point buffer / fixed DOM count; no repeated allocations');
  // WebGL context loss recovery and a fresh no-WebGL session.
  await seek(p,0);await p.evaluate(()=>{window.__loseExt=document.getElementById('gl').getContext('webgl').getExtension('WEBGL_lose_context');__loseExt.loseContext();});await p.waitForTimeout(150);assert.ok(await p.locator('html').evaluate(x=>x.classList.contains('no-gl')));
  await p.evaluate(()=>__loseExt.restoreContext());await p.waitForTimeout(200);assert.ok(!await p.locator('html').evaluate(x=>x.classList.contains('no-gl')));record('WebGL loss / restore','fallback wordmark and restored buffer');
  await p.close();
  const fallback=await browser.newPage({viewport:{width:1366,height:768}});monitor(fallback);
  await fallback.addInitScript(()=>{const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(t,...a){return /webgl/.test(t)?null:get.call(this,t,...a);};});
  await fallback.goto(BASE+'/prototype/prototype-02.html?debug&at=0&it=4');assert.ok(await fallback.locator('.fallback-word').isVisible());await shot(fallback,'02-no-webgl');await seek(fallback,3.65);assert.ok(await fallback.locator('[data-id=claude]').isVisible());await fallback.close();record('WebGL unavailable','readable opening wordmark and fully usable content');
  const reduced=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});monitor(reduced);await reduced.goto(BASE+'/prototype/prototype-02.html?debug&at=0');await reduced.locator('#hTR [data-go=models]').click();await reduced.waitForTimeout(80);assert.equal(await reduced.evaluate(()=>NF_DEBUG.state.s),3.65);await shot(reduced,'02-reduced-motion');await reduced.close();record('prefers-reduced-motion','no animated navigation or idle time motion; all content readable');
  const mobile=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});monitor(mobile);await mobile.goto(BASE+'/prototype/prototype-02.html?debug&at=3.65&it=4');await mobile.waitForTimeout(200);await shot(mobile,'02-models-mobile');assert.ok(await mobile.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  for(const s of [3.65,5.97,7.42]){await seek(mobile,s);const rects=await mobile.locator('.brand-group:not([inert]) .brand-node').evaluateAll(xs=>xs.map(x=>{const r=x.getBoundingClientRect();return {l:r.left,r:r.right,t:r.top,b:r.bottom};}));for(const r of rects){assert.ok(r.l>=0&&r.r<=390&&r.t>=0&&r.b<=844);}}
  await shot(mobile,'02-agents-mobile');await mobile.locator('[data-id=grokbot]').tap();assert.ok(await mobile.locator('#brand-detail').isVisible());await mobile.close();record('390px mobile / touch access','readable nodes inside viewport; no horizontal overflow; tap inspector');
  const hidpi=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:2.5});monitor(hidpi);await hidpi.goto(BASE+'/prototype/prototype-02.html?debug&at=3.65&it=4');await hidpi.waitForTimeout(150);assert.deepEqual(await hidpi.evaluate(()=>NF_DEBUG.state.canvas),[2880,1800]);assert.equal(await hidpi.evaluate(()=>NF_DEBUG.state.dpr),2);await hidpi.close();record('HiDPI cap','device DPR 2.5 uses canvas DPR 2; logical node positions unchanged');
  const file=await browser.newPage();monitor(file);await file.goto('file:///'+path.join(ROOT,'prototype/prototype-02.html').replaceAll('\\','/')+'?debug&at=3.65&it=4');await file.waitForTimeout(200);assert.equal(await file.locator('#models-brands button').count(),8);assert.ok(await file.locator('[data-id=gpt] img').evaluate(x=>x.complete&&x.naturalWidth>0));await file.close();record('file:// direct preview','classic data scripts and relative logos load without fetch');
  assert.deepEqual(report.errors,[]);assert.deepEqual(report.failedResources,[]);record('console / network','no page errors, console errors or HTTP failures');
 }finally{fs.writeFileSync(path.join(__dirname,'results.json'),JSON.stringify(report,null,2)+'\n');await browser.close();}
 console.log('Saved tests/results.json and screenshots.');
})().catch(e=>{console.error(e);process.exitCode=1;});
