const {fs,path,ROOT,OUT,BASE,launch,ready,stop,watch}=require('./helpers.cjs'),assert=require('assert/strict');
const report={date:'2026-10-18',checks:[],errors:[],failed:[]},pass=(name,detail)=>{report.checks.push({name,detail});console.log('PASS',name)};
(async()=>{const b=await launch();try{
 const docs=['README.md','docs/HOME-AI-GLOBAL-INTEGRATION.md','docs/GLOBAL-VISUAL-HANDOFF.md','docs/global-world/opus-baseline/README.md','tests/home-global/README.md'];let links=0;
 for(const f of docs)for(const m of fs.readFileSync(path.join(ROOT,f),'utf8').matchAll(/!?\[[^\]]*\]\(([^)]+)\)/g)){
  const href=m[1].split(/[ #]/)[0];if(!href||/^[a-z]+:/i.test(href))continue;
  assert.ok(fs.existsSync(path.resolve(ROOT,path.dirname(f),decodeURIComponent(href))),f+' → '+href);links++;
 }
 pass('local handoff links',links+' relative document/image/source targets exist');
 const review=await b.newPage({viewport:{width:1440,height:900}});watch(review,report);await review.goto(BASE+'/tests/home-global/review.html');
 async function images(){await review.waitForFunction(()=>[...document.images].every(i=>i.complete&&i.naturalWidth>0));}
 await images();for(const w of ['1920','1366','1440']){await review.selectOption('#size',w);await images();assert.equal(await review.locator('#world img').count(),4);}
 for(const key of ['models','local','agents','depth','opening']){await review.selectOption('#ai',key);await images();}
 await review.locator('video').evaluate(v=>new Promise((resolve,reject)=>{if(v.readyState>=1)return resolve();v.onloadedmetadata=resolve;v.onerror=()=>reject(Error('video error'));}));
 const video=await review.locator('video').evaluate(v=>({duration:v.duration,width:v.videoWidth,height:v.videoHeight}));assert.ok(video.duration>40&&video.width===1440&&video.height===900);
 for(const href of await review.locator('a').evaluateAll(aa=>aa.map(a=>a.href))){const r=await review.request.get(href);assert.equal(r.status(),200,href);}
 const head=await review.request.head(BASE+'/tests/home-global/home-ai-global.webm');assert.match(head.headers()['content-type'],/video\/webm/);await review.close();pass('review / video',video);
 const normal=await b.newPage({viewport:{width:1440,height:900}});watch(normal,report);await normal.goto(BASE+'/prototype/prototype-02.html?slow=99999&nogl#global-cards');
 await normal.waitForFunction(()=>NF_GLOBAL.state.card?.webgl&&Object.values(NF_GLOBAL.state.card.ready).every(Boolean));
 assert.deepEqual(await normal.evaluate(()=>[typeof NF_DEBUG,typeof NF_GLOBAL_DEBUG,typeof NF_GLOBAL._probe,typeof NF_GLOBAL._tune]),Array(4).fill('undefined'));await normal.close();pass('normal homepage','no debug globals, one host driver; slow/nogl development flags ignored without debug');
 const p=await b.newPage({viewport:{width:1440,height:900}});watch(p,report);await p.goto(BASE+'/prototype/prototype-02.html?debug#global-cards');await ready(p);
 for(const [key,index]of [['number',0],['network',1],['accounts',2],['cards',3]]){
  await stop(p,'global-'+key);const a=p.locator('.gw-panel .go').nth(index);await a.focus();await p.keyboard.press('Tab');await p.keyboard.press('Shift+Tab');await a.hover();await p.waitForTimeout(250);
  const colors=await a.evaluate(a=>({color:getComputedStyle(a).color,bg:getComputedStyle(a).backgroundColor,text:a.textContent}));assert.equal(colors.color,'rgb(0, 0, 0)');assert.equal(colors.bg,'rgb(255, 255, 255)');
  const y=await p.evaluate(()=>scrollY);await p.keyboard.press('Enter');assert.ok(await p.locator('#catalog').isVisible());assert.equal(await p.evaluate(()=>scrollY),y);await p.keyboard.press('Escape');
 }
 await p.close();pass('guides contrast / focus','four entrance links read black on white when focused/hovered, across black and warm-white stages; Enter opens pending index without moving scroll');
 assert.deepEqual(report.errors,[]);assert.deepEqual(report.failed,[]);report.completed=true;
}finally{fs.writeFileSync(path.join(OUT,'delivery-results.json'),JSON.stringify(report,null,2)+'\n');await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
