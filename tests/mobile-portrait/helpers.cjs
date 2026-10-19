const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('assert/strict');
const ROOT=path.resolve(__dirname,'../..'),OUT=process.env.UI_OUT||__dirname,BASE=process.env.UI_BASE||'http://127.0.0.1:4202',CHROME='C:/Users/28919/AppData/Local/ms-playwright/chromium-1243/chrome-win64/chrome.exe';
fs.mkdirSync(OUT,{recursive:true});
const launch=()=>chromium.launch({headless:true,executablePath:CHROME});
function watch(p,r){p.on('pageerror',e=>r.errors.push(e.message));p.on('console',m=>{if(m.type()==='error')r.errors.push(m.text())});p.on('response',x=>{if(x.status()>=400)r.failed.push(x.url())});}
async function seek(p,s,time=10){await p.evaluate(({s,time})=>{NF_DEBUG.freeze();NF_DEBUG.seek(s)}, {s,time});if(await p.evaluate(()=>NF_DEBUG.state.global.active)){await p.waitForFunction(()=>NF_DEBUG.state.global.initialized&&Object.values(NF_GLOBAL.state.card.ready).every(Boolean));await p.evaluate(s=>NF_DEBUG.seek(s),s);}await p.waitForTimeout(50);}
const stats=a=>{const s=a.toSorted((x,y)=>x-y);return {n:s.length,mean:a.reduce((x,y)=>x+y,0)/a.length,p95:s[Math.floor(s.length*.95)],max:s.at(-1)}};
const save=(name,r)=>fs.writeFileSync(path.join(OUT,name+'.json'),JSON.stringify(r,null,2)+'\n');
module.exports={chromium,fs,path,assert,ROOT,OUT,BASE,CHROME,launch,watch,seek,stats,save};
