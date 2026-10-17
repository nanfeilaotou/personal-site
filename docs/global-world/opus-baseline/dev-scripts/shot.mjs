import {chromium} from 'playwright';
const [,,w='1440',h='900',list='0',prefix='s',extra='']=process.argv;
const browser=await chromium.launch({executablePath:'/usr/local/bin/chromium',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox','--ignore-gpu-blocklist']});
const page=await browser.newPage({viewport:{width:+w,height:+h},deviceScaleFactor:1});
const errors=[];page.on('console',m=>{if(m.type()==='error'||m.type()==='warning')errors.push(m.type()+': '+m.text());});page.on('pageerror',e=>errors.push('pageerror: '+e.message));
await page.goto('http://127.0.0.1:4173/prototype/experiments/global-world.html?debug'+extra,{waitUntil:'load'});if(process.env.CLEAN)await page.addStyleTag({content:'#gw-debug{display:none!important}'});
await page.waitForFunction(()=>document.documentElement.dataset.ready==='true',null,{timeout:30000});
await page.waitForFunction(()=>window.NF_GLOBAL_DEBUG&&Object.values(NF_GLOBAL_DEBUG.state.card.ready).every(Boolean),null,{timeout:30000});
for(const g of list.split(',')){await page.evaluate(g=>NF_GLOBAL_DEBUG.seek(+g),g);await page.waitForTimeout(350);await page.evaluate(()=>NF_GLOBAL_DEBUG.advance(.05));await page.waitForTimeout(100);
 await page.screenshot({path:`/data/shots/${prefix}-${w}-${g}.png`});}
console.log(JSON.stringify({errors:errors.slice(0,10),state:await page.evaluate(()=>NF_GLOBAL_DEBUG.state.card)}));
await browser.close();
