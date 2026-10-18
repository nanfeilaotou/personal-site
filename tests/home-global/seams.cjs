const {fs,path,OUT,BASE,launch,ready,worldReady,seek,shot,watch}=require('./helpers.cjs'),assert=require('assert/strict'),{PNG}=require('pngjs');
const report={date:'2026-10-18',frames:[],errors:[],failed:[]};
const groups={entry:[6.79,7.08706,7.13,7.20,7.35,7.52,7.72,7.92,8.12,8.42,8.92],flip:[1.68,1.74,1.82,1.92,2.02,2.12,2.24].map(g=>7.52+g),dive:[4.48,4.58,4.68,4.78,4.88,4.98,5.16].map(g=>7.52+g),exit:[6.48,6.56,6.64,6.70,6.74,6.78,6.80,6.84,6.95,7.10].map(g=>7.52+g)};
(async()=>{fs.mkdirSync(path.join(OUT,'seams'),{recursive:true});const b=await launch();try{const p=await b.newPage({viewport:{width:1440,height:900}});watch(p,report);await p.goto(BASE+'/prototype/prototype-02.html?debug&at=0&it=4&time=10');await ready(p);await p.addStyleTag({content:'*{transition:none!important}#dbg{display:none!important}'});await p.mouse.move(1,1);
 for(const [group,samples] of Object.entries(groups))for(let i=0;i<samples.length;i++){
  const s=samples[i];await seek(p,s);await p.waitForTimeout(40);const file=group+'-'+String(i).padStart(2,'0');await shot(p,'seams/'+file);
  const info=await p.evaluate(()=>({scene:NF_DEBUG.state.sceneS,g:NF_DEBUG.state.global.g,active:NF_DEBUG.state.global.active,background:document.body.style.background,rootOpacity:document.getElementById('global-world').style.opacity,rail:[...document.querySelectorAll('#rail button.on')].map(x=>x.dataset.go)}));
  if(group==='entry')assert.equal(info.background,'rgb(5, 5, 5)','entry has no white Bridge flash');if(group==='exit')assert.equal(info.background,'rgb(5, 5, 5)');
  const image=PNG.sync.read(fs.readFileSync(path.join(OUT,'seams/'+file+'.png')));let sum=0,count=0;for(let y=120;y<740;y+=5)for(let x=420;x<1320;x+=5){const o=(y*1440+x)*4;sum+=image.data[o]+image.data[o+1]+image.data[o+2];count+=3;}report.frames.push({group,s,file:'seams/'+file+'.png',meanCoreLuma:sum/count,...info});
 }
 // Reversal and random pauses use the same mapping and root/background ownership.
 for(const s of [13.2,7.9,12.1,8.7,14.3,10.9,7.3,15.1,7.52,11.77]){await seek(p,s);const target=await p.evaluate(()=>NF_DEBUG.state.sceneS);assert.ok(Number.isFinite(target));}
 await seek(p,14.32);assert.equal(await p.evaluate(()=>NF_DEBUG.state.global.active),false);assert.ok(await p.locator('#rail [data-go=personal]').evaluate(e=>e.classList.contains('on')));
 assert.deepEqual(report.errors,[]);assert.deepEqual(report.failed,[]);report.completed=true;
}finally{fs.writeFileSync(path.join(OUT,'seam-results.json'),JSON.stringify(report,null,2)+'\n');await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
