const {toScroll}=require('./timeline-fixture.cjs');
/* Targeted checks for touch, HiDPI and resource fallback after desktop suite. */
const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const ROOT=path.resolve(__dirname,'..'),BASE=process.env.PREVIEW_URL||'http://127.0.0.1:4173';
const report=JSON.parse(fs.readFileSync(path.join(__dirname,'results.json'),'utf8'));
const executablePath=process.env.CHROME_PATH||'C:/Users/28919/AppData/Local/ms-playwright/chromium-1243/chrome-win64/chrome.exe';
const errors=[],failures=[];
const record=(name,detail)=>{report.checks=report.checks.filter(x=>x.name!==name);report.checks.push({name,detail});console.log('PASS',name);};
const monitor=p=>{p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});p.on('response',r=>{if(r.status()>=400)failures.push(r.url());});};
const screenshot=async(p,name)=>{await p.evaluate(()=>document.getElementById('dbg').style.display='none');await p.screenshot({path:path.join(__dirname,'screenshots',name+'.png'),animations:'disabled'});};
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath});
 try{
  const mobile=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});monitor(mobile);
  await mobile.goto(BASE+'/prototype/prototype-02.html?debug&at='+toScroll(7.42)+'&it=4');await mobile.waitForTimeout(200);
  await screenshot(mobile,'02-agents-mobile');await mobile.locator('[data-id=grokbot]').tap();assert.ok(await mobile.locator('#brand-detail').isVisible());
  assert.equal(await mobile.locator('[data-id=grokbot]').getAttribute('aria-expanded'),'true');
  await screenshot(mobile,'02-touch-detail');await mobile.locator('#brand-detail button').click();
  await mobile.locator('[data-id=codex]').tap();assert.ok((await mobile.locator('#brand-detail').innerText()).includes('OpenAI Codex'));
  for(const s of [3.65,5.97,7.42]){
    await mobile.evaluate(s=>NF_DEBUG.seek(s),toScroll(s));await mobile.waitForTimeout(80);assert.ok(await mobile.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    const rects=await mobile.locator('.brand-group:not([inert]) .brand-node').evaluateAll(xs=>xs.map(x=>{const r=x.getBoundingClientRect();return {l:r.left,r:r.right,t:r.top,b:r.bottom};}));
    for(const r of rects)assert.ok(r.l>=0&&r.r<=390&&r.t>=0&&r.b<=844);
  }
  await mobile.close();record('390px mobile / touch access','all nodes stay in viewport; tap opens pinned inspector without covering the trigger');
  const hidpi=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:2.5});monitor(hidpi);
  await hidpi.goto(BASE+'/prototype/prototype-02.html?debug&at='+toScroll(3.65)+'&it=4');await hidpi.waitForTimeout(200);
  assert.deepEqual(await hidpi.evaluate(()=>NF_DEBUG.state.canvas),[2880,1800]);assert.equal(await hidpi.evaluate(()=>NF_DEBUG.state.dpr),2);await hidpi.close();record('HiDPI cap','device DPR 2.5 uses canvas DPR 2');
  const p=await browser.newPage({viewport:{width:1440,height:900}});monitor(p);await p.goto(BASE+'/prototype/prototype-02.html?debug&it=4#agents');await p.waitForTimeout(200);
  report.webgl=await p.evaluate(()=>{const gl=document.getElementById('gl').getContext('webgl'),e=gl.getExtension('WEBGL_debug_renderer_info');return {renderer:e?gl.getParameter(e.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER),bufferBytes:gl.getBufferParameter(gl.ARRAY_BUFFER,gl.BUFFER_SIZE),gpuTimerAvailable:!!gl.getExtension('EXT_disjoint_timer_query')};});
  assert.ok(Math.abs(await p.evaluate(()=>NF_DEBUG.state.s)-toScroll(7.42))<.002);await p.evaluate(()=>NF_DEBUG.seek(NF_TIMELINE.local.stop));await p.waitForTimeout(100);await p.reload();await p.waitForTimeout(150);assert.ok(Math.abs(await p.evaluate(()=>NF_DEBUG.state.s)-toScroll(5.97))<.002);record('fresh hash / manual-scroll refresh','hash initially seeks Agent hold; refresh retains subsequent manual Local position');
  // Final screenshots and an additional mouse inspection after the touch fix.
  for(const [s,name] of [[2.75,'02-models-enter-1440'],[3.65,'02-models-1440'],[6.55,'02-agents-enter-1440'],[7.42,'02-agents-1440']]){await p.evaluate(s=>NF_DEBUG.seek(s),toScroll(s));await p.waitForTimeout(80);await screenshot(p,name);}
  await p.locator('[data-id=claude-code]').hover();assert.ok(await p.locator('#brand-detail').isVisible());await p.locator('#brand-detail a').first().hover();await p.waitForTimeout(250);assert.ok(await p.locator('#brand-detail').isVisible());await p.keyboard.press('Escape');record('mouse inspector after touch fix','hover and pointer transfer remain usable');
  for(const [s,name] of [[4.68,'01-models-1440'],[6.06,'01-local-1440'],[7.3,'01-agents-1440'],[9.06,'01-global-1440'],[10.12,'01-personal-1440']]){await p.goto(`${BASE}/prototype/prototype-01.html?debug&at=${s}&it=4`);await p.waitForTimeout(150);await screenshot(p,name);}
  await p.close();
  const file=await browser.newPage();monitor(file);await file.goto('file:///'+path.join(ROOT,'prototype/prototype-02.html').replaceAll('\\','/')+'?debug&at='+toScroll(3.65)+'&it=4');await file.waitForTimeout(200);assert.equal(await file.locator('#models-brands button').count(),8);assert.ok(await file.locator('[data-id=gpt] img').evaluate(x=>x.complete&&x.naturalWidth>0));await file.close();record('file:// direct preview','local data scripts and SVGs load without fetch');
  const broken=await browser.newPage();monitor(broken);await broken.route('**/assets/brands/openai.svg',route=>route.abort());await broken.goto(BASE+'/prototype/prototype-02.html?debug&at='+toScroll(3.65)+'&it=4');await broken.waitForTimeout(150);assert.ok(await broken.locator('[data-id=gpt] .node-name').isVisible());await broken.locator('[data-id=gpt]').click();assert.ok((await broken.locator('#brand-detail').innerText()).includes('OpenAI'));await broken.close();record('logo load failure','visible product name and working inspector remain after an intentionally aborted SVG request');
  // Expected ERR_FAILED above belongs to the intentional broken-image case.
  const unexpected=errors.filter(x=>!x.includes('net::ERR_FAILED'));assert.deepEqual(unexpected,[]);assert.deepEqual(failures,[]);report.errors=unexpected;report.failedResources=failures;record('console / network','no unexpected errors or HTTP failures; broken SVG tested separately');
  report.completed=true;
 }finally{fs.writeFileSync(path.join(__dirname,'results.json'),JSON.stringify(report,null,2)+'\n');await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
