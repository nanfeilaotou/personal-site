const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path');
(async()=>{
 const b=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'C:/Users/28919/AppData/Local/ms-playwright/chromium-1243/chrome-win64/chrome.exe'});
 const result=JSON.parse(fs.readFileSync(path.join(__dirname,'results.json'),'utf8'));result.gpuDraw=[];
 try{
  const p=await b.newPage();
  for(const [width,height] of [[1920,1080],[1440,900],[1366,768]]){
   await p.setViewportSize({width,height});await p.goto('http://127.0.0.1:4173/prototype/prototype-02.html?debug&at=0&it=4');await p.waitForTimeout(250);
   const timing=await p.evaluate(async()=>{
    const gl=document.getElementById('gl').getContext('webgl'),ext=gl.getExtension('EXT_disjoint_timer_query');if(!ext)return {available:false};
    const original=gl.drawArrays,pending=[],samples=[];let count=0,disjoint=false;
    gl.drawArrays=function(...args){
     if(count>=120)return original.apply(gl,args);
     const q=ext.createQueryEXT();ext.beginQueryEXT(ext.TIME_ELAPSED_EXT,q);const r=original.apply(gl,args);ext.endQueryEXT(ext.TIME_ELAPSED_EXT);pending.push(q);count++;return r;
    };
    const started=performance.now();
    try{
     while((count<120||pending.length)&&performance.now()-started<8000){
      await new Promise(r=>setTimeout(r,16));
      if(gl.getParameter(ext.GPU_DISJOINT_EXT)){disjoint=true;break;}
      for(let i=pending.length-1;i>=0;i--)if(ext.getQueryObjectEXT(pending[i],ext.QUERY_RESULT_AVAILABLE_EXT)){samples.push(ext.getQueryObjectEXT(pending[i],ext.QUERY_RESULT_EXT)/1e6);ext.deleteQueryEXT(pending[i]);pending.splice(i,1);}
     }
    }finally{gl.drawArrays=original;for(const q of pending)ext.deleteQueryEXT(q);}
    samples.sort((a,b)=>a-b);
    return {available:true,disjoint,samples:samples.length,meanMs:samples.reduce((a,b)=>a+b,0)/samples.length,p95Ms:samples[Math.floor(samples.length*.95)],maxMs:samples.at(-1)};
   });
   result.gpuDraw.push({width,height,...timing});console.log(width,height,timing);
  }
  result.checks.push({name:'GPU timer query',detail:'120 point-draw samples per desktop resolution; draw-only GPU timing excludes clear/compositing'});
  fs.writeFileSync(path.join(__dirname,'results.json'),JSON.stringify(result,null,2)+'\n');
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
