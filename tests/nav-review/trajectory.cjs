const {assert,BASE,launch,watch,shot,save}=require('./helpers.cjs');
const r={date:'2026-10-18',fixedStepHz:60,cases:[],errors:[],failed:[]};
(async()=>{const b=await launch();try{for(const scheme of ['a','b']){
 const p=await b.newPage({viewport:{width:1440,height:900}});watch(p,r);await p.goto(BASE+'/nav/lab/index.html?scheme='+scheme+'&nodock&still&noscroll&at=0&theme=dark');await p.waitForFunction(()=>!!window.LAB?.nav);await p.waitForTimeout(700);await p.evaluate(()=>LAB.nav.debug.pause());
 for(const target of ['personal','open']){
  const start=await p.evaluate(()=>LAB.nav.state.indicator);await p.locator('.nfnav__item[data-nav='+target+']').click();await p.mouse.move(1000,300);
  const samples=await p.evaluate(()=>{const out=[];for(let i=0;i<=90;i++){if(i)LAB.nav.debug.step(1000/60);const s=LAB.nav.state;out.push({ms:i*1000/60,edges:s.indicator,visual:s.visual});}return out;});
  const end=samples.at(-1).edges,forward=end[0]>start[0];let maxOvershoot=0,backtrack=0;for(let j=0;j<2;j++)for(let i=0;i<samples.length;i++){const x=samples[i].edges[j];maxOvershoot=Math.max(maxOvershoot,forward?x-end[j]:end[j]-x);if(i)backtrack=Math.max(backtrack,forward?samples[i-1].edges[j]-x:x-samples[i-1].edges[j]);}
  assert.ok(maxOvershoot<.1);assert.ok(backtrack<.1);assert.deepEqual([...new Set(samples.map(s=>s.visual))],[target]);r.cases.push({scheme,target,start,end,maxOvershoot,backtrack,samples});
 }
 await p.close();console.log('PASS',scheme,'60Hz navigation: no overshoot / intermediate-label flashes');
 const shots=await b.newPage({viewport:{width:1440,height:900},deviceScaleFactor:2});watch(shots,r);await shots.goto(BASE+'/nav/lab/index.html?scheme='+scheme+'&nodock&still&noscroll&at=0&theme=dark');await shots.waitForFunction(()=>!!window.LAB?.nav);await shots.waitForTimeout(600);await shots.evaluate(()=>LAB.nav.debug.pause());await shots.locator('.nfnav__item[data-nav=personal]').click();await shots.mouse.move(1100,300);let time=0;for(const ms of [0,60,120,180,260,360,520,900]){while(time<ms){await shots.evaluate(()=>LAB.nav.debug.step(1000/60));time+=1000/60;}await shot(shots,scheme+'-sequence-'+ms,{clip:{x:300,y:0,width:840,height:80}});}await shots.close();
 }assert.deepEqual(r.errors,[]);assert.deepEqual(r.failed,[]);r.completed=true;}finally{save('trajectory-results',r);await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
