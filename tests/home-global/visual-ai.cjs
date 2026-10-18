const {chromium}=require('playwright'),{PNG}=require('pngjs'),fs=require('fs'),path=require('path'),cp=require('child_process'),assert=require('assert/strict');
const ROOT=path.resolve(__dirname,'../..'),OUT=__dirname,BASE='http://127.0.0.1:4173',BASELINE='6c16a2a';
const old=f=>cp.execFileSync('git',['show',BASELINE+':'+f],{cwd:ROOT,maxBuffer:20*1024*1024});
(async()=>{const b=await chromium.launch({headless:true,executablePath:'C:/Users/28919/AppData/Local/ms-playwright/chromium-1243/chrome-win64/chrome.exe'}),report={baseline:BASELINE,comparisons:[],errors:[]};try{
for(const [width,height] of [[1920,1080],[1440,900],[1366,768]]){
 const before=await b.newPage({viewport:{width,height}}),after=await b.newPage({viewport:{width,height}});
 for(const p of [before,after])p.on('pageerror',e=>report.errors.push(e.message));
 for(const f of ['prototype/prototype-02.html','prototype/motion.js','prototype/timeline.js','prototype/showcase.js','prototype/showcase.css'])await before.route('**/'+f+'*',r=>r.fulfill({body:old(f),contentType:f.endsWith('.html')?'text/html':f.endsWith('.css')?'text/css':'application/javascript'}));
 for(const [name,s] of [['opening',0],['depth',.72],['models',3.419756076],['local',5.28],['agents',6.321110608]]){
  const url=BASE+'/prototype/prototype-02.html?debug&at='+s+'&it=4&time=10';for(const p of [before,after]){await p.goto(url);await p.waitForFunction(()=>window.NF_DEBUG);await p.evaluate(()=>document.fonts.ready);await p.evaluate(()=>Promise.all([...document.images].map(i=>i.decode().catch(()=>{}))));await p.addStyleTag({content:'*{transition:none!important}#dbg{display:none!important}'});await p.mouse.move(0,0);await p.waitForTimeout(100);if(p===after)await p.evaluate(()=>NF_DEBUG.freeze());}
  const regions=(await Promise.all([before,after].map(p=>p.locator('#prog,#rfill').evaluateAll(a=>a.map(x=>x.getBoundingClientRect().toJSON()))))).flat();const [a,z]=await Promise.all([before.screenshot(),after.screenshot()]),A=PNG.sync.read(a),Z=PNG.sync.read(z);let changed=0,outside=0,max=0;for(let i=0;i<A.data.length;i++){const d=Math.abs(A.data[i]-Z.data[i]);if(d>2){changed++;const x=Math.floor(i/4)%width,y=Math.floor(i/4/width);if(!regions.some(r=>x>=r.left-2&&x<=r.right+2&&y>=r.top-2&&y<=r.bottom+2))outside++;}max=Math.max(max,d);}report.comparisons.push({name,width,height,changedChannels:changed,outsideProgressChannels:outside,maxDifference:max,intentional:'whole-site progress percentage and rail change with new total length'});
  if(width===1440){fs.writeFileSync(path.join(OUT,'ai-before-'+name+'.png'),a);fs.writeFileSync(path.join(OUT,'ai-after-'+name+'.png'),z);}
  console.log(name,width,changed,'outside progress',outside);assert.ok(outside/A.data.length<.000002,'AI regression '+name+' '+width+' '+changed);
 }
 await before.close();await after.close();
}
assert.deepEqual(report.errors,[]);report.completed=true;
}finally{fs.writeFileSync(path.join(OUT,'ai-visual-results.json'),JSON.stringify(report,null,2)+'\n');await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
