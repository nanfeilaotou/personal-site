const {fs,path,assert,BASE,launch,watch,openOnsite,seek,shot,save}=require('./helpers.cjs');
const group=process.env.NAV_TEST_GROUP||'all',want=k=>group==='all'||group===k;
const r={group,date:'2026-10-18',hostMain:'7b7e53b2be1610f18f112f37cd00b58fae4012a1',checks:[],errors:[],failed:[]},pass=(name,detail)=>{r.checks.push({name,detail});console.log('PASS',name)};
(async()=>{const b=await launch();try{
 if(want('desktop')){
 for(const scheme of ['a','b'])for(const [width,height]of [[1920,1080],[1440,900],[1366,768]]){
  const {p,f}=await openOnsite(b,scheme,{viewport:{width,height}},r);
  for(const [name,s,key,tone]of [['opening',0,'open',0],['ai',3.419756076,'ai',0],['flip',9.342,'global',null],['white',10.82,'global',1],['accounts',11.77,'global',1],['cards',13.64,'global',0],['personal',14.7,'personal',0]]){
   await seek(p,f,s);const st=await p.evaluate(()=>NAV.state);assert.equal(st.active,key);assert.equal(st.visual,key);if(tone!==null)assert.ok(Math.abs(st.tone-tone)<.01);assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.equal(await f.locator('#hTL').evaluate(e=>getComputedStyle(e).display),'none');assert.equal(await f.locator('#hTR').evaluate(e=>getComputedStyle(e).display),'none');assert.ok(await p.locator('.nfnav').isVisible());if(width===1440||['ai','white','cards'].includes(name))await shot(p,scheme+'-'+name+'-'+width);
  }
  await seek(p,f,3.419756076);await f.locator('#models-brands [data-id=claude]').hover();assert.ok(await f.locator('#brand-detail').isVisible());await f.locator('#models-brands [data-id=claude]').press('Escape');assert.equal(await f.locator('#brand-detail').isVisible(),false);
  await seek(p,f,13.64);await f.locator('#gw-cardnav [data-card=bybit]').click();await f.evaluate(()=>NF_DEBUG.advance(4));assert.equal(await f.evaluate(()=>NF_GLOBAL.state.confirmed),'bybit');
  await p.close();console.log('onsite',scheme,width,'passed');
 }
 pass('real main / desktop','A/B × three sizes: Opening, AI, flip, warm-white, accounts, three cards, Personal; correct active/tone, old HUD hidden only in iframe; Claude details/Esc and Bybit particle switch work');
 }
 // Real navigation uses the main clock; iframe gestures must interrupt the parent selection lock.
 if(want('input')){
 for(const scheme of ['a','b']){
  const {p,f}=await openOnsite(b,scheme,{},r);await seek(p,f,3.419756076);await f.evaluate(()=>NF_DEBUG.freeze(false));await p.locator('.nfnav__item[data-nav=global]').click();await f.waitForFunction(()=>Math.abs(NF_DEBUG.state.s-NF_DEBUG.state.stops.global)<.003);await p.waitForFunction(()=>NAV.state.active==='global'&&NAV.state.lock===null);
  await p.locator('.nfnav__item[data-nav=personal]').click();await p.waitForTimeout(160);await p.mouse.move(1000,500);await p.mouse.wheel(0,-400);await p.waitForTimeout(350);assert.equal(await p.evaluate(()=>NAV.state.lock),null);await p.waitForFunction(()=>NAV.state.visual===SYNC.key);assert.equal(await f.evaluate(()=>NF_DEBUG.state.navigating),false);
  await p.locator('.nfnav__item[data-nav=ai]').focus();await p.keyboard.press('2');await f.waitForFunction(()=>Math.abs(NF_DEBUG.state.s-NF_DEBUG.state.stops['global-network'])<.003);await p.keyboard.press('Alt+3');await f.waitForFunction(()=>Math.abs(NF_DEBUG.state.s-NF_DEBUG.state.stops.personal)<.003);await p.keyboard.press('0');await f.waitForFunction(()=>NF_DEBUG.state.s<.003);await p.waitForFunction(()=>NAV.state.active==='open');
  await p.locator('.nfnav__theme').click();assert.ok((await p.locator('.nfnav__note').innerText()).includes('开场'));assert.equal(await p.evaluate(()=>NAV.state.sceneKind),'art');
  await p.locator('.nfnav__lang-opt[data-lang=en]').click();await p.waitForTimeout(700);assert.equal(await p.locator('.nfnav__item[data-nav=global] .nfnav__t').first().innerText(),'GLOBAL');assert.ok((await p.locator('.nfnav__note').innerText()).includes('Chinese only'));await p.close();
 }
 pass('real input / preview bridges','AI→Global lands at main stop; wheel in iframe cancels navigation and target lock; parent-focused number keys / Alt+3 / 0 work; opening theme notice and bilingual nav remain honest about Chinese-only main copy');
 }
 if(want('lab')){
 for(const scheme of ['a','b']){
  const p=await b.newPage({viewport:{width:1440,height:900}});watch(p,r);await p.goto(BASE+'/nav/lab/index.html?scheme='+scheme+'&nodock&still&theme=dark&at=2.2');await p.waitForFunction(()=>!!window.LAB?.nav);await p.waitForTimeout(500);const anchor=await p.locator('#ai .panel').evaluate(e=>e.getBoundingClientRect().top);await p.locator('.nfnav__lang-opt[data-lang=en]').click();await p.waitForTimeout(650);assert.equal(await p.evaluate(()=>LAB.nav.state.lang),'en');assert.ok(Math.abs(await p.locator('#ai .panel').evaluate(e=>e.getBoundingClientRect().top)-anchor)<2,'readable panel anchor is preserved even if font metrics adjust scroll by a pixel');await p.evaluate(()=>LAB.seek(8.4));await p.waitForTimeout(300);assert.equal(await p.locator('[data-i18n="lab.pe.d"]').getAttribute('data-i18n-fallback'),'ZH');assert.ok((await p.locator('[data-i18n="lab.pe.d"]').innerText()).includes('英文尚未提供'));
  await p.evaluate(()=>{LAB.seek(2.2);LAB.nav.setTheme('light')});await p.waitForTimeout(600);assert.equal(await p.locator('#p-ai').evaluate(e=>getComputedStyle(e.closest('.panel')).backgroundColor),'rgba(245, 244, 240, 0.92)');await shot(p,scheme+'-lab-light-en');await p.evaluate(()=>LAB.seek(10.4));await p.waitForTimeout(500);assert.equal(await p.evaluate(()=>LAB.nav.state.sceneKind),'page');await p.waitForFunction(()=>LAB.nav.state.tone===1);await shot(p,scheme+'-content-light');await p.evaluate(()=>LAB.nav.setTheme('dark'));await p.waitForTimeout(800);await p.waitForFunction(()=>LAB.nav.state.tone===0);await shot(p,scheme+'-content-dark');
  await p.locator('.nfnav__item[data-nav=ai]').focus();await p.keyboard.press('ArrowRight');assert.equal(await p.evaluate(()=>document.activeElement.dataset.nav),'global');await shot(p,scheme+'-keyboard-focus',{clip:{x:0,y:0,width:1440,height:100}});await p.close();
 }
 pass('lab / language / themes / focus','A/B nav English, real ZH fallback badges, language anchor preserved; example panels/content light/dark, arrow-key focus. Actual main panels remain unthemed by this standalone overlay.');
 }
 if(want('mobile')){
 for(const scheme of ['a','b'])for(const width of [390,360,320]){
  const {p,f}=await openOnsite(b,scheme,{viewport:{width,height:844},isMobile:true,hasTouch:true},r);await seek(p,f,3.419756076);await p.locator('.nfnav__menu').tap();await p.waitForTimeout(450);assert.equal(await p.locator('.nfnav__menu').getAttribute('aria-expanded'),'true');assert.equal(await p.locator('#site').evaluate(e=>e.inert),true);assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  await p.locator('.nfnav__seg-opt[data-lang=en]').tap();await p.locator('.nfnav__seg-opt[data-theme=light]').tap();await p.waitForTimeout(500);assert.equal(await p.evaluate(()=>NAV.state.lang),'en');assert.equal(await p.evaluate(()=>NAV.state.theme),'light');assert.ok(await p.locator('.nfnav__panel').evaluate(e=>e.scrollWidth<=e.clientWidth));await shot(p,scheme+'-mobile-menu-'+width);
  for(let i=0;i<15;i++){await p.keyboard.press('Tab');assert.ok(await p.evaluate(()=>document.activeElement.closest('.nfnav')!==null));}await p.keyboard.press('Escape');await p.waitForTimeout(320);assert.equal(await p.locator('#site').evaluate(e=>e.inert),false);assert.equal(await p.evaluate(()=>document.activeElement.classList.contains('nfnav__menu')),true);await p.locator('.nfnav__menu').tap();await p.waitForTimeout(350);await p.locator('.nfnav__mitem[data-nav=global]').tap();await p.waitForFunction(()=>NAV.state.menu===false);await p.waitForTimeout(350);assert.equal(await p.locator('#site').evaluate(e=>e.inert),false);await p.close();
 }
 pass('mobile menus','A/B at 390/360/320: open/close, language/theme, Tab stays in parent nav, Esc returns menu focus, selection closes, underlying main iframe inert only while menu open; no horizontal overflow');
 }
 if(want('access')){
 for(const scheme of ['a','b']){const {p,f}=await openOnsite(b,scheme,{viewport:{width:1440,height:900},deviceScaleFactor:2,reducedMotion:'reduce'},r);await seek(p,f,13.64);await f.evaluate(()=>NF_DEBUG.freeze(false));await p.locator('.nfnav__item[data-nav=ai]').click();await p.waitForFunction(()=>NAV.state.active==='ai');await shot(p,scheme+'-reduced-dpr2');await p.setViewportSize({width:390,height:844});await p.waitForTimeout(400);assert.equal(await p.evaluate(()=>NAV.state.mobile),true);await p.setViewportSize({width:1440,height:900});await p.waitForTimeout(400);assert.equal(await p.evaluate(()=>NAV.state.mobile),false);await p.close();}
 pass('DPR / reduced / resize','DPR 2 with system reduced motion, real main navigation, desktop↔mobile Resize retains usable header');
 }
 assert.deepEqual(r.errors,[]);assert.deepEqual(r.failed,[]);r.completed=true;
 }finally{save(group==='all'?'results':'results-'+group,r);await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
