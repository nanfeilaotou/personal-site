const {chromium}=require('playwright'),fs=require('fs'),path=require('path');
const ROOT=path.resolve(__dirname,'../..'),OUT=__dirname,BASE='http://127.0.0.1:4173',CHROME='C:/Users/28919/AppData/Local/ms-playwright/chromium-1243/chrome-win64/chrome.exe';
const launch=()=>chromium.launch({headless:true,executablePath:CHROME});
const ready=p=>p.waitForFunction(()=>!!window.NF_DEBUG);
async function worldReady(p){await p.waitForFunction(()=>NF_DEBUG.state.global.initialized);await p.waitForFunction(()=>Object.values(NF_GLOBAL.state.card.ready).every(Boolean));}
async function seek(p,s,advance=0){const active=await p.evaluate(s=>{NF_DEBUG.freeze();NF_DEBUG.seek(s);return NF_DEBUG.state.global.active},s);if(active){await worldReady(p);await p.evaluate(s=>NF_DEBUG.seek(s),s);}if(advance)await p.evaluate(sec=>NF_DEBUG.advance(sec),advance);}
async function stop(p,key,advance=.25){await seek(p,await p.evaluate(key=>NF_DEBUG.state.stops[key],key),advance);}
async function shot(p,name){await p.evaluate(()=>document.getElementById('dbg').style.display='none');await p.screenshot({path:path.join(OUT,name+'.png')});}
async function settle(p){await p.evaluate(()=>NF_DEBUG.advance(4));const s=await p.evaluate(()=>NF_GLOBAL.state.card);if(s.busy||s.q!==1)throw Error('not settled '+JSON.stringify(s));return s;}
function watch(p,report){p.on('pageerror',e=>report.errors.push(e.message));p.on('console',m=>{if(m.type()==='error')report.errors.push(m.text())});p.on('response',r=>{if(r.status()>=400)report.failed.push(r.url())});}
module.exports={chromium,fs,path,ROOT,OUT,BASE,CHROME,launch,ready,worldReady,seek,stop,shot,settle,watch};
