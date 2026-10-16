const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'../..'),mode=process.argv[2]||'before',base=process.env.PREVIEW_URL||(mode==='before'?'http://127.0.0.1:4174':'http://127.0.0.1:4173');
const out=path.join(__dirname,mode);fs.mkdirSync(path.join(out,'frames'),{recursive:true});
const executablePath=process.env.CHROME_PATH||'C:/Users/28919/AppData/Local/ms-playwright/chromium-1243/chrome-win64/chrome.exe';
(async()=>{const browser=await chromium.launch({headless:true,executablePath});try{
 const p=await browser.newPage({viewport:{width:1440,height:900}});await p.goto(base+'/prototype/prototype-02.html?debug&at=0&it=4&time=10');await p.waitForTimeout(150);
 await p.evaluate(()=>document.getElementById('dbg').style.display='none');
 const timeline=await p.evaluate(()=>NF_TIMELINE),data=await p.evaluate(()=>({models:NF_MODELS,agents:NF_AGENTS,local:NF_LOCAL}));
 const frames=[];
 for(let step=0;step<=Math.ceil(timeline.total/.2);step++){
  const s=Math.min(timeline.total,+(step*.2).toFixed(2));await p.evaluate(s=>NF_DEBUG.seek(s),s);await p.waitForTimeout(25);
  const file=`frames/s-${s.toFixed(2)}.jpg`;await p.screenshot({path:path.join(out,file),type:'jpeg',quality:65});
  const state=await p.evaluate(()=>({s:NF_DEBUG.state.s,crumb:document.getElementById('crumb').textContent,visible:[...document.querySelectorAll('.brand-group')].filter(g=>getComputedStyle(g).visibility==='visible').map(g=>({id:g.id,alpha:+g.style.opacity})),interactive:[...document.querySelectorAll('.brand-group:not([inert]) .brand-node')].filter(b=>b.tabIndex===0).length}));
  frames.push({s,file,...state});
 }
 fs.writeFileSync(path.join(out,'audit.json'),JSON.stringify({mode,viewport:[1440,900],timeline,data,frames},null,2)+'\n');
 const html=`<!doctype html><meta charset="utf-8"><title>${mode} / 时间轴审查</title><style>body{background:#111;color:#ddd;font:12px system-ui;margin:20px}.frames{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}img{width:100%;display:block}figure{margin:0}figcaption{padding:6px}a{color:inherit}</style><h1>${mode} / 每 0.2 屏</h1><p>总长 ${timeline.total} 屏 · 停靠点 ${JSON.stringify(timeline)}</p><div class="frames">${frames.map(f=>`<figure><a href="${f.file}"><img loading="lazy" src="${f.file}"></a><figcaption>${f.s.toFixed(2)} · ${f.crumb} · ${f.interactive} 可交互节点</figcaption></figure>`).join('')}</div>`;
 fs.writeFileSync(path.join(out,'index.html'),html);console.log(`${mode}: ${frames.length} frames over ${timeline.total} screens`);
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
