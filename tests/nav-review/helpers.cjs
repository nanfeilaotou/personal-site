const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('assert/strict');
const BASE=process.env.NAV_PREVIEW_URL||'http://127.0.0.1:4190',OUT=path.resolve(__dirname,'../../prototype/experiments/nav/review'),CHROME='C:/Users/28919/AppData/Local/ms-playwright/chromium-1243/chrome-win64/chrome.exe';
const launch=()=>chromium.launch({headless:true,executablePath:CHROME});
function watch(p,r){p.on('pageerror',e=>r.errors.push(e.message));p.on('console',m=>{if(m.type()==='error')r.errors.push(m.text())});p.on('response',x=>{if(x.status()>=400)r.failed.push(x.url())});}
async function openOnsite(b,scheme,options={},report){const p=await b.newPage({viewport:{width:1440,height:900},...options});if(report)watch(p,report);await p.goto(BASE+'/nav/onsite/index.html?scheme='+scheme+'&clean&it&at=0');await p.waitForFunction(()=>!!window.SYNC);const f=p.frames().find(f=>f.parentFrame());return {p,f};}
async function seek(p,f,s){await f.evaluate(s=>{NF_DEBUG.freeze();NF_DEBUG.seek(s)},s);if(await f.evaluate(()=>NF_DEBUG.state.global.active)){await f.waitForFunction(()=>NF_DEBUG.state.global.initialized&&Object.values(NF_GLOBAL.state.card.ready).every(Boolean));await f.evaluate(s=>NF_DEBUG.seek(s),s);}await p.waitForTimeout(800);}
async function shot(p,name,opts={}){await p.screenshot({path:path.join(OUT,name+'.png'),...opts});}
const save=(name,r)=>fs.writeFileSync(path.join(OUT,name+'.json'),JSON.stringify(r,null,2)+'\n');
module.exports={chromium,fs,path,assert,BASE,OUT,CHROME,launch,watch,openOnsite,seek,shot,save};
