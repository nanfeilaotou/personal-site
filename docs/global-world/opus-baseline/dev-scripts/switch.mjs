import {chromium} from 'playwright';
const [,,w='1440',h='900',mode='seq',extra='']=process.argv;
const browser=await chromium.launch({executablePath:'/usr/local/bin/chromium',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox','--ignore-gpu-blocklist']});
const page=await browser.newPage({viewport:{width:+w,height:+h},deviceScaleFactor:1});
const errors=[];page.on('console',m=>{if(m.type()==='error'||m.type()==='warning')errors.push(m.type()+': '+m.text());});page.on('pageerror',e=>errors.push('pageerror: '+e.message));
await page.goto('http://127.0.0.1:4173/prototype/experiments/global-world.html?debug&g=6.12'+extra,{waitUntil:'load'});if(process.env.CLEAN)await page.addStyleTag({content:'#gw-debug{display:none!important}'});
await page.waitForFunction(()=>document.documentElement.dataset.ready==='true',null,{timeout:30000});
const D=(fn,arg)=>page.evaluate(fn,arg);
const st=()=>D(()=>{const s=NF_GLOBAL_DEBUG.state;const c=s.card||{};return {from:c.from,to:c.to,desired:c.desired,m:+(c.m||0).toFixed(3),q:+(c.q||0).toFixed(3),busy:c.busy,token:c.token,confirmed:s.confirmed,slots:s.slots,pressed:[...document.querySelectorAll('#gw-cardnav button')].map(b=>b.dataset.card+':'+b.getAttribute('aria-pressed')+(b.classList.contains('pending')?'*':'')).join(' '),ariaBusy:document.getElementById('gw-cards').getAttribute('aria-busy'),cap:document.getElementById('gw-cap-n').textContent};});
const out={mode,w,h,log:[]};const log=(k,v)=>{out.log.push([k,v]);};
async function settle(){for(let i=0;i<80;i++){const s=await D(()=>{NF_GLOBAL_DEBUG.advance(.1);return NF_GLOBAL_DEBUG.state.card;});if(!s.busy&&s.q>.999)return i*.1;}return -1;}
if(mode!=='nogl'&&mode!=='slow')await page.waitForFunction(()=>Object.values(NF_GLOBAL_DEBUG.state.card.ready).every(Boolean)||!NF_GLOBAL_DEBUG.state.card.webgl,null,{timeout:30000}).catch(()=>log('ready-timeout',true));
await D(()=>{NF_GLOBAL_DEBUG.seek(6.12);NF_GLOBAL_DEBUG.freeze(true);NF_GLOBAL_DEBUG.advance(.3);});
if(mode==='seq'){
 // 逐帧记录 starryblu→bybit→cmb→starryblu，按关键 q/m 截图
 for(const [id,tag] of [['bybit','a'],['cmb','b'],['starryblu','c']]){
  await D(id=>NF_GLOBAL_DEBUG.select(id),id);const tl=[];let shots=new Set();
  for(let i=0;i<200;i++){const s=await D(()=>{NF_GLOBAL_DEBUG.advance(1/60);return NF_GLOBAL_DEBUG.state.card;});tl.push([+(i/60).toFixed(3),+s.m.toFixed(3),+s.q.toFixed(3),s.from,s.to]);
   const want=[['1dissolve',s.m===0&&s.q<.45&&s.to],['2mix',s.m>.3&&s.m<.6],['3reform',!s.to&&s.q>.35&&s.q<.6&&i>10],['4settled',!s.busy&&s.q>.999&&i>10]];
   for(const [k,ok] of want)if(ok&&!shots.has(k)){shots.add(k);await page.waitForTimeout(60);await page.screenshot({path:`/data/shots/sw/${tag}-${w}-${k}.png`});}
   if(!s.busy&&s.q>.999&&i>10)break;}
  const commit=tl.find(r=>r[3]===id);log(id,{frames:tl.length,secs:tl.length/60,commitAt:commit&&commit[0],minQ:Math.min(...tl.map(r=>r[2])),shots:[...shots]});log(id+'-state',await st());
  log(id+'-tl',tl.filter((r,i)=>i%6===0).map(r=>r.slice(0,3).join('/')).join(' '));}
}
if(mode==='robust'){
 // 1 快速连点：只执行最后一次
 await D(()=>{for(const id of ['cmb','bybit','starryblu','cmb','bybit','cmb']){NF_GLOBAL_DEBUG.select(id);NF_GLOBAL_DEBUG.advance(.03);}});log('rapid-mid',await st());log('rapid-settle',await settle());log('rapid-final',await st());
 // 2 点击当前卡：无动作
 const t0=(await st()).token;log('same-ret',await D(()=>NF_GLOBAL_DEBUG.select('cmb')));await D(()=>NF_GLOBAL_DEBUG.advance(.2));const s2=await st();log('same-card',{busy:s2.busy,q:s2.q,tokenChanged:s2.token!==t0});
 // 3 动画中途改选
 await D(()=>{NF_GLOBAL_DEBUG.select('bybit');NF_GLOBAL_DEBUG.advance(.45);});log('mid-before',await st());await D(()=>{NF_GLOBAL_DEBUG.select('starryblu');});log('mid-settle',await settle());log('mid-final',await st());
 // 3b 混合已过半时改选（m≥.5）
 await D(()=>{NF_GLOBAL_DEBUG.select('bybit');for(let i=0;i<120;i++){NF_GLOBAL_DEBUG.advance(1/60);if(NF_GLOBAL_DEBUG.state.card.m>.6)break;}});log('late-before',await st());await D(()=>NF_GLOBAL_DEBUG.select('cmb'));log('late-settle',await settle());log('late-final',await st());
 // 4 切换中滚出停靠区（向下 6.5 / 向上 5.5）再返回
 for(const gOut of [6.5,5.5,6.0]){await D(()=>{NF_GLOBAL_DEBUG.select(NF_GLOBAL_DEBUG.state.card.from==='bybit'?'starryblu':'bybit');NF_GLOBAL_DEBUG.advance(.5);});const sIn=await st();
  await D(g=>{NF_GLOBAL_DEBUG.seek(g);NF_GLOBAL_DEBUG.advance(.05);},gOut);const sOut=await st();await D(()=>{NF_GLOBAL_DEBUG.advance(.4);});const sOut2=await st();
  await D(()=>{NF_GLOBAL_DEBUG.seek(6.12);NF_GLOBAL_DEBUG.advance(.05);});const sBack=await st();const tt=await settle();log('leave-'+gOut,{in:[sIn.from,sIn.to,sIn.m,sIn.q],out:[sOut.from,sOut.to,sOut.m,sOut.q],out2:[sOut2.from,sOut2.to,sOut2.m,sOut2.q,sOut2.desired],back:[sBack.from,sBack.to,sBack.m,sBack.q],settle:tt,final:(await st()).from});}
 // 5 停靠区外点击（不应触发换卡）
 await D(()=>{NF_GLOBAL_DEBUG.seek(5.2);NF_GLOBAL_DEBUG.advance(.1);});log('outside-select',await D(()=>NF_GLOBAL_DEBUG.select('cmb')));await D(()=>NF_GLOBAL_DEBUG.advance(.5));log('outside-state',await st());await D(()=>{NF_GLOBAL_DEBUG.seek(6.12);});log('outside-back-settle',await settle());log('outside-back',await st());
 // 6 切换中丢失 WebGL 上下文
 await D(()=>{NF_GLOBAL_DEBUG.select(NF_GLOBAL_DEBUG.state.card.from==='cmb'?'bybit':'cmb');NF_GLOBAL_DEBUG.advance(.4);NF_GLOBAL_DEBUG.loseContext();});await page.waitForTimeout(600);log('lost',await st());
 await page.waitForTimeout(2500);await D(()=>NF_GLOBAL_DEBUG.advance(.2));log('restored',await st());log('restored-settle',await settle());log('restored-final',await st());
 // 7 切换中 resize
 await D(()=>{NF_GLOBAL_DEBUG.select(NF_GLOBAL_DEBUG.state.card.from==='starryblu'?'bybit':'starryblu');NF_GLOBAL_DEBUG.advance(.4);});await page.setViewportSize({width:1100,height:760});await page.waitForTimeout(300);await D(()=>NF_GLOBAL_DEBUG.advance(.05));log('resize-mid',await st());log('resize-settle',await settle());log('resize-final',await st());await page.screenshot({path:`/data/shots/sw/robust-resize.png`});
}
if(mode==='slow'||mode==='nogl'||mode==='reduced'){
 log('initial',await st());log('ready',await D(()=>NF_GLOBAL_DEBUG.state.card.ready));await D(()=>NF_GLOBAL_DEBUG.select('bybit'));await D(()=>NF_GLOBAL_DEBUG.advance(.3));log('after.3',await st());log('settle',await settle());log('final',await st());
 await page.screenshot({path:`/data/shots/sw/${mode}-${w}.png`});
 await D(()=>{NF_GLOBAL_DEBUG.select('cmb');NF_GLOBAL_DEBUG.advance(.1);NF_GLOBAL_DEBUG.select('starryblu');});log('settle2',await settle());log('final2',await st());
}
if(mode==='fps'){
 // 实时帧率（SwiftShader 软件渲染，仅作相对参考）
 await D(()=>NF_GLOBAL_DEBUG.freeze(false));await page.waitForTimeout(500);
 const r=await D(()=>new Promise(res=>{let n=0,t0=performance.now(),dts=[],lt=t0;NF_GLOBAL_DEBUG.select('bybit');const f=t=>{n++;dts.push(t-lt);lt=t;if(t-t0<3000)requestAnimationFrame(f);else res({frames:n,fps:+(n/((t-t0)/1000)).toFixed(1),p95:+dts.sort((a,b)=>a-b)[Math.floor(dts.length*.95)].toFixed(1),state:NF_GLOBAL_DEBUG.state.card,stats:NF_GLOBAL_DEBUG.state.stats});};requestAnimationFrame(f);}));
 log('fps-switch',r);
}
out.errors=errors.slice(0,12);console.log(JSON.stringify(out,null,1));await browser.close();
