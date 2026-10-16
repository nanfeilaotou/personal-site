(()=>{
'use strict';
const $=id=>document.getElementById(id),Q=new URLSearchParams(location.search),reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),mix=(a,b,t)=>a+(b-a)*t,smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a));return t*t*(3-2*t)};
const canvas=$('particles'),ink=$('structure'),ctx=ink.getContext('2d'),gl=canvas.getContext('webgl',{alpha:true,antialias:false,premultipliedAlpha:false,powerPreference:'low-power'});
let W=0,H=0,dpr=1,raf=0,last=performance.now(),ready=false,mode=['void','layer','portal'].includes(Q.get('view'))?Q.get('view'):'void',selected=Math.max(0,NF_CARD_MATERIALS.findIndex(c=>c.id===(Q.get('card')||'monzo'))),progress=0,target=0,play=null,tilt={x:0,y:0,tx:0,ty:0};
const assets=[],textures=[],programs={},buffers={},metrics={frames:0,draws:0,pointDraws:0,quadDraws:0,points:0,textureBytes:0,bufferBytes:0,errors:[]};
let capture=null;
const state={cx:0,cy:0,cw:0,ch:0};
const precision=gl&&gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER,gl.HIGH_FLOAT).precision?'highp':'mediump';
const transform=`
uniform vec2 uRes,uCard,uCenter,uTilt;uniform float uP,uDpr,uLight;
vec4 project(vec3 P){
 float f=smoothstep(.08,.50,uP),yaw=.48*(1.-f)+uTilt.x,pitch=-.18*(1.-f)+uTilt.y;
 float cy=cos(yaw),sy=sin(yaw),cx=cos(pitch),sx=sin(pitch);
 P=vec3(cy*P.x+sy*P.z,P.y,-sy*P.x+cy*P.z);P=vec3(P.x,cx*P.y-sx*P.z,sx*P.y+cx*P.z);
 float z=1200./max(350.,1200.+P.z);vec2 p=uCenter+P.xy*z;
 float w=1./z;return vec4((p.x/uRes.x*2.-1.)*w,(1.-p.y/uRes.y*2.)*w,0.,w);
}
float sm(float a,float b,float x){return smoothstep(a,b,x);}
`;
const sample=`
uniform sampler2D uTex;uniform float uAspect,uPrivacy;uniform mat3 uSample;uniform vec4 uPrivacyRects[2];
vec4 material(vec2 uv){vec3 p=uSample*vec3(uv,1.);vec4 color=texture2D(uTex,p.xy/p.z);if(uPrivacy>.5){for(int i=0;i<2;i++){vec4 r=uPrivacyRects[i];if(uv.x>r.x&&uv.x<r.x+r.z&&uv.y>r.y&&uv.y<r.y+r.w)color=vec4(.0314,.0549,.102,1.);}}return color;}
float rounded(vec2 uv){vec2 q=abs((uv-.5)*vec2(uAspect,1.))-vec2(uAspect*.5-.043,.5-.043);float d=length(max(q,0.))+min(max(q.x,q.y),0.)-.043;return 1.-smoothstep(-.0015,.0015,d);}
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float scan(vec2 uv,float r){float threshold=uv.x*.70+uv.y*.13+hash(floor(uv*vec2(110.,70.)))*.15;return smoothstep(threshold-.018,threshold+.018,r);}
`;
const pointVS=`precision ${precision} float;attribute vec4 aData;${transform}
varying vec2 vUV;varying float vA;
void main(){
 vec2 uv=aData.xy;float seed=aData.z,lane=floor(uv.y*11.)/10.;vUV=uv;
 float e=sm(.08+seed*.06,.44+seed*.04,uP),leave=sm(.78+uv.y*.05,.99,uP);
 vec3 dest=vec3((uv-.5)*uCard,0.);
 vec3 flow=vec3((uv.x-.5)*uCard.x*2.4,sin(uv.x*7.+lane*2.7)*uCard.y*.25+(lane-.5)*uCard.y*.85,(lane-.5)*620.+sin(uv.x*6.+lane)*100.);
 vec3 P=mix(flow,dest,e);P.y+=sin(e*3.14159265)*sin(uv.x*9.+seed*2.)*uCard.y*.16;
 vec3 end=vec3(dest.x+uCard.x*(.6+seed*1.9),sin(uv.x*12.+leave*4.)*uCard.y*.22+(uv.y-.5)*uCard.y*.75,(seed-.5)*950.);
 P=mix(P,end,leave);gl_Position=project(P);
 gl_PointSize=(1.35+seed*.65)*uDpr*(1.+sin(e*3.14159)*.25);
 vA=(.18+.65*e)*(1.-sm(.93,1.,uP));
}`;
const pointFS=`precision ${precision} float;${sample}
uniform float uP,uLight;varying vec2 vUV;varying float vA;
void main(){vec4 col=material(vUV);float reveal=sm(.35,.57,uP);float cover=scan(vUV,reveal);float outScan=scan(vUV,sm(.78,.91,uP));float keep=1.-cover+outScan;
 float disc=1.-smoothstep(.31,.5,length(gl_PointCoord-.5));float a=clamp(keep,0.,1.)*vA*disc*rounded(vUV)*col.a;
 vec3 neutral=mix(vec3(.72),vec3(.12),uLight);vec3 rgb=mix(neutral,col.rgb,sm(.36,.57,uP));gl_FragColor=vec4(rgb,a);
}`.replaceAll('sm(', 'smoothstep(');
const quadVS=`precision ${precision} float;attribute vec4 aData;${transform}
varying vec2 vUV;
void main(){vUV=aData.xy;gl_Position=project(vec3((aData.xy-.5)*uCard,0.));}`;
const quadFS=`precision ${precision} float;${sample}
uniform float uP,uLight;uniform vec2 uTilt;varying vec2 vUV;
void main(){vec4 col=material(vUV);float cover=scan(vUV,smoothstep(.35,.57,uP));float vanish=scan(vUV,smoothstep(.78,.91,uP));
 float a=col.a*rounded(vUV)*cover*(1.-vanish);float reflection=pow(max(0.,1.-abs(vUV.x-.5-uTilt.x*1.5)*4.),20.)*min(.035,length(uTilt)*.3);
 gl_FragColor=vec4(col.rgb+reflection,a);
}`;
function makeProgram(vs,fs){
 const compile=(type,source)=>{const sh=gl.createShader(type);gl.shaderSource(sh,source);gl.compileShader(sh);if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS)){const error=gl.getShaderInfoLog(sh);metrics.errors.push(error);throw Error(error);}return sh;};
 const v=compile(gl.VERTEX_SHADER,vs),f=compile(gl.FRAGMENT_SHADER,fs),p=gl.createProgram();gl.attachShader(p,v);gl.attachShader(p,f);gl.linkProgram(p);gl.deleteShader(v);gl.deleteShader(f);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(p));
 return {p,attr:gl.getAttribLocation(p,'aData'),u:Object.fromEntries(['uRes','uCard','uCenter','uTilt','uP','uDpr','uLight','uAspect','uTex','uPrivacy','uSample','uPrivacyRects'].map(n=>[n,gl.getUniformLocation(p,n==='uPrivacyRects'?n+'[0]':n)]))};
}
function initGL(){
 if(!gl)return;programs.points=makeProgram(pointVS,pointFS);programs.quad=makeProgram(quadVS,quadFS);
 const grid=[];for(let y=0;y<152;y++)for(let x=0;x<240;x++){const seed=((x*73+y*137)%997)/997;grid.push((x+.5)/240,(y+.5)/152,seed,(x+y)%7);}
 const quad=[0,0,0,0,1,0,0,0,0,1,0,0,0,1,0,0,1,0,0,0,1,1,0,0];
 for(const [name,data] of [['points',grid],['quad',quad]]){buffers[name]=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffers[name]);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.STATIC_DRAW);metrics.bufferBytes+=data.length*4;}
 metrics.points=grid.length/4;gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
}
function addTexture(surface){const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,surface);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);const ext=gl.getExtension('EXT_texture_filter_anisotropic');if(ext)gl.texParameterf(gl.TEXTURE_2D,ext.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(4,gl.getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT)));metrics.textureBytes+=(surface.naturalWidth||surface.width)*(surface.naturalHeight||surface.height)*4;return t;}
function drawPass(name,primitive,count){
 const {p,u,attr}=programs[name];gl.useProgram(p);gl.bindBuffer(gl.ARRAY_BUFFER,buffers[name]);gl.enableVertexAttribArray(attr);gl.vertexAttribPointer(attr,4,gl.FLOAT,false,16,0);
 gl.uniform2f(u.uRes,W,H);gl.uniform2f(u.uCard,state.cw,state.ch);gl.uniform2f(u.uCenter,state.cx,state.cy);gl.uniform2f(u.uTilt,tilt.x,tilt.y);gl.uniform1f(u.uP,progress);gl.uniform1f(u.uDpr,dpr);gl.uniform1f(u.uLight,mode==='layer'?1:0);gl.uniform1f(u.uAspect,NF_CARD_MATERIALS[selected].aspect);gl.uniform1i(u.uTex,0);gl.uniform1f(u.uPrivacy,NF_CARD_MATERIALS[selected].redactions?1:0);gl.uniformMatrix3fv(u.uSample,false,assets[selected].sampleMatrix);gl.uniform4fv(u.uPrivacyRects,assets[selected].privacyRects);gl.drawArrays(primitive,0,count);metrics.draws++;metrics[name==='points'?'pointDraws':'quadDraws']++;
}
function sizeCard(){const m=NF_CARD_MATERIALS[selected];state.cx=W<=800?W*.5:W*.65;state.cy=H*(W<=800?.475:.48);state.cw=Math.min(W*(W<=800?.8:.46),H*(W<=800?.29:.48)*m.aspect,m.maxWidth);if(mode==='layer'&&W>800){state.cw*=.72;state.cy=mix(H*.535,H*.34,smooth(.18,.57,progress));}state.ch=state.cw/m.aspect;const hit=$('card-hit');Object.assign(hit.style,{left:state.cx+'px',top:state.cy+'px',width:state.cw+'px',height:state.ch+'px'});}
function resize(){W=innerWidth;H=innerHeight;dpr=Math.min(2,devicePixelRatio||1);for(const c of [canvas,ink]){c.width=Math.round(W*dpr);c.height=Math.round(H*dpr);}ctx.setTransform(dpr,0,0,dpr,0,0);sizeCard();schedule();}
function line(x,y,x2,y2,alpha=1,width=1){ctx.strokeStyle=mode==='void'?`rgba(225,230,230,${alpha})`:`rgba(20,26,26,${alpha})`;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x2,y2);ctx.stroke();}
function label(s,x,y,alpha=1,size=10){ctx.font=`${size}px Consolas,monospace`;ctx.fillStyle=mode==='void'?`rgba(225,230,230,${alpha})`:`rgba(20,26,26,${alpha})`;ctx.fillText(s,x,y);}
function drawStructure(){
 ctx.clearRect(0,0,W,H);
 if(mode==='void'){
  for(let i=0;i<34;i++){const x=((i*7919)%997)/997*W,y=((i*3571)%991)/991*H;ctx.fillStyle='rgba(215,224,224,.13)';ctx.fillRect(x,y,.65,.65);}
  const a=(1-smooth(.38,.65,progress))*.22+smooth(.80,.96,progress)*.10;
  for(let k=0;k<3;k++){ctx.strokeStyle=`rgba(220,230,230,${a*(1-k*.22)})`;ctx.lineWidth=.8;ctx.beginPath();ctx.ellipse(state.cx,state.cy,state.cw*(.72+k*.16),state.ch*(.55+k*.14),-.12+k*.12,0,Math.PI*2);ctx.stroke();}
 }else{
  const portal=mode==='portal',a=Math.min(W*(portal?.08:.22),H*.23),cx=W*(portal?.18:.65),cy=H*(portal?.46:.48),gap=H*(portal?.05:.095),ct=Math.cos(.74),st=Math.sin(.74),sp=Math.sin(.44),cp=Math.cos(.44),z=[1.5,.5,-.5,-1.5].map(v=>v*gap);
  const project=(x,y,z)=>[cx+(x*ct-y*st)*a,cy+(x*st+y*ct)*a*sp-z*cp];
  for(let i=3;i>=0;i--){const P=[[-1,-1],[1,-1],[1,1],[-1,1]].map(([x,y])=>project(x,y,z[i]));ctx.fillStyle='#ecebe8';ctx.strokeStyle=`rgba(18,24,24,${portal?.32:.22})`;ctx.beginPath();P.forEach((p,j)=>j?ctx.lineTo(...p):ctx.moveTo(...p));ctx.closePath();ctx.fill();ctx.stroke();
   for(const v of [-.5,0,.5]){const p=project(-1,v,z[i]),q=project(1,v,z[i]),r=project(v,-1,z[i]),s=project(v,1,z[i]);line(...p,...q,.065);line(...r,...s,.065);}
   const p=project(1,-1,z[i]);label(['01 / 号码','02 / 路径','03 / 账户','04 / 资金'][i],p[0]+10,p[1],.55,portal?9:10);
  }
  const from=project(-.35,.4,z[2]),to=project(.6,-.2,z[3]);line(...from,...to,.6,1.3);ctx.fillStyle='#1c2424';for(const p of [from,to])ctx.fillRect(p[0]-2,p[1]-2,4,4);
  if(portal){const x=W*.33,y=H*.14,w=W*.63,h=H*.57;ctx.fillStyle='#050505';ctx.fillRect(x,y,w,h);ctx.strokeStyle='#59605e';ctx.lineWidth=.7;ctx.strokeRect(x,y,w,h);line(from[0],from[1],x,from[1],.5);label('ACCOUNT / FOCUS',x+12,y-10,.55,9);}
 }
 // Registration marks are intentionally quiet; the card remains the visual focus.
 const x=state.cx-state.cw/2-22,y=state.cy-state.ch/2-22,w=state.cw+44,h=state.ch+44,al=.22*(1-smooth(.7,.98,progress));
 if(mode!=='portal')for(const [px,py,sx,sy] of [[x,y,1,1],[x+w,y,-1,1],[x,y+h,1,-1],[x+w,y+h,-1,-1]]){line(px,py,px+sx*13,py,al);line(px,py,px,py+sy*13,al);}
}
function render(){
 if(!ready)return;metrics.frames++;sizeCard();drawStructure();
 if(gl&&!gl.isContextLost()){
  gl.viewport(0,0,canvas.width,canvas.height);gl.disable(gl.SCISSOR_TEST);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);
  if(mode==='portal'){gl.enable(gl.SCISSOR_TEST);gl.scissor(Math.round(W*.33*dpr),Math.round(H*(1-.14-.57)*dpr),Math.round(W*.63*dpr),Math.round(H*.57*dpr));}
  gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,textures[selected]);
  if(!reduced&&(progress<.59||progress>.78))drawPass('points',gl.POINTS,metrics.points);
  if(progress>.34&&progress<.93)drawPass('quad',gl.TRIANGLES,6);
  if(capture){const resolve=capture;capture=null;const pixels=new Uint8Array(canvas.width*canvas.height*4);gl.readPixels(0,0,canvas.width,canvas.height,gl.RGBA,gl.UNSIGNED_BYTE,pixels);crypto.subtle.digest('SHA-256',pixels).then(h=>resolve(Array.from(new Uint8Array(h),b=>b.toString(16).padStart(2,'0')).join('')));}
 }else{if(!assets[selected].fallbackUrl)assets[selected].fallbackUrl=assets[selected].canvas.toDataURL();$('fallback').src=assets[selected].fallbackUrl;$('fallback').hidden=false;}
 const hold=progress>=.58&&progress<=.78;$('card-hit').classList.toggle('active',hold);$('card-hit').tabIndex=hold?0:-1;
 const phase=progress<.16?0:progress<.57?1:progress<.79?2:3;
 const phases=[['01 / DATA','数据流','向下滚动，让轨迹逐渐收束。'],['02 / ASSEMBLY','聚合成面','相同的采样点，回到各自的位置。'],['03 / SURFACE','清晰展示','鼠标可轻微倾斜，点击或聚焦查看素材来源。'],['04 / RELEASE','回到数据流','继续滚动，或反向回到任意阶段。']];
 ['phase-index','phase-title','phase-description'].forEach((id,i)=>{$(id).textContent=phases[phase][i];});$('percent').value=String(Math.round(progress*100)).padStart(3,'0')+' / 100';$('progress').value=Math.round(target*1000);
 if(Q.has('debug')){$('debug').hidden=false;$('debug').textContent=`p ${progress.toFixed(3)} · ${metrics.points} pts · ${mode}`;}
}
function schedule(){if(!raf)raf=requestAnimationFrame(frame);}
function maxScroll(){return Math.max(1,document.documentElement.scrollHeight-H);}
function seek(p){play=null;setScroll(p);schedule();}
function setScroll(p){scrollTo(0,clamp(p)*maxScroll());target=clamp(scrollY/maxScroll());}
function frame(now){
 raf=0;const dt=clamp((now-last)/1000,.001,.05);last=now;
 if(play){const f=clamp((now-play.start)/play.duration);setScroll(mix(play.from,play.to,smooth(0,1,f)));if(f===1)play=null;}
 progress=reduced?target:mix(progress,target,1-Math.exp(-dt*10));if(Math.abs(progress-target)<.00005)progress=target;
 const active=progress>.4&&progress<.84;const tx=active?tilt.tx:0,ty=active?tilt.ty:0;
 tilt.x=reduced?0:mix(tilt.x,tx,1-Math.exp(-dt*11));tilt.y=reduced?0:mix(tilt.y,ty,1-Math.exp(-dt*11));
 if(Math.abs(tilt.x-tx)<.00002)tilt.x=tx;if(Math.abs(tilt.y-ty)<.00002)tilt.y=ty;render();
 if(play||Math.abs(progress-target)>.00001||Math.abs(tilt.x-tx)>.00001||Math.abs(tilt.y-ty)>.00001)schedule();
}
function select(index){selected=index;const m=NF_CARD_MATERIALS[index];sizeCard();$('material-label').textContent=m.name.toUpperCase()+' / '+m.variant;$('surface-note').textContent=m.description+(m.id==='monzo'?' · 1230×786 原图直接采样':m.id==='bybit'?' · 受摄影取样像素限制，高清正面待补':'');document.querySelectorAll('[data-material]').forEach((b,i)=>b.setAttribute('aria-pressed',i===index));closeDetail();schedule();}
function changeMode(value){mode=value;document.body.classList.toggle('light',mode!=='void');document.body.classList.toggle('portal-mode',mode==='portal');document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.view===mode));$('mode-label').textContent=mode==='void'?'滚动 / 拖动进度 · 鼠标靠近卡面可倾斜':mode==='layer'?'集成草案 A · 卡面从账户层浮出，四层保持白底黑线':'集成草案 B · 保留白底网络，在局部暗场中展示卡面';schedule();}
function openDetail(){const m=NF_CARD_MATERIALS[selected];$('detail-heading').textContent=m.name;$('detail-description').textContent=m.description;$('detail-privacy').textContent=m.privacy;$('detail-source').href=m.sourcePage;$('material-detail').hidden=false;$('card-hit').setAttribute('aria-expanded','true');}
function closeDetail(){$('material-detail').hidden=true;$('card-hit').setAttribute('aria-expanded','false');}
for(const [i,m] of NF_CARD_MATERIALS.entries()){const b=document.createElement('button');b.type='button';b.dataset.material=i;b.innerHTML='<span></span><span></span>';b.children[0].textContent=String(i+1).padStart(2,'0');b.children[1].textContent=m.name;b.addEventListener('click',()=>select(i));$('material-select').append(b);}
document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>changeMode(b.dataset.view)));document.querySelectorAll('[data-progress]').forEach(b=>b.addEventListener('click',()=>seek(Number(b.dataset.progress))));
$('progress').addEventListener('input',e=>seek(Number(e.target.value)/1000));$('pause').addEventListener('click',()=>{play=null;});
function playTo(to){if(reduced){seek(to);return;}if(Math.abs(target-to)<.001)seek(to===1?0:1);play={from:target,to,start:performance.now(),duration:Math.max(2500,Math.abs(to-target)*12000)};schedule();}
$('play-forward').addEventListener('click',()=>playTo(1));$('play-backward').addEventListener('click',()=>playTo(0));
addEventListener('scroll',()=>{target=clamp(scrollY/maxScroll());schedule();},{passive:true});addEventListener('wheel',()=>{play=null;},{passive:true});addEventListener('touchstart',()=>{play=null;},{passive:true});
addEventListener('pointermove',e=>{if(e.pointerType!=='mouse'||reduced)return;const inside=Math.abs(e.clientX-state.cx)<state.cw*.65&&Math.abs(e.clientY-state.cy)<state.ch*.75;tilt.tx=inside?(e.clientX-state.cx)/state.cw*.19:0;tilt.ty=inside?-(e.clientY-state.cy)/state.ch*.13:0;schedule();});
document.addEventListener('mouseleave',()=>{tilt.tx=tilt.ty=0;schedule();});$('reset-tilt').addEventListener('click',()=>{tilt.tx=tilt.ty=0;schedule();});
$('card-hit').addEventListener('click',openDetail);$('card-hit').addEventListener('focus',openDetail);$('detail-close').addEventListener('click',()=>{closeDetail();$('card-hit').focus({preventScroll:true});closeDetail();});
addEventListener('keydown',e=>{if(e.key==='Escape'){closeDetail();play=null;}if(['ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' '].includes(e.key))play=null;});
addEventListener('resize',()=>{const p=target;resize();setScroll(p);});
canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();$('fallback').hidden=false;schedule();});
canvas.addEventListener('webglcontextrestored',()=>{metrics.bufferBytes=metrics.textureBytes=0;initGL();textures.length=0;for(const a of assets)textures.push(addTexture(a.image));$('fallback').hidden=true;schedule();});
(async()=>{
 if(location.protocol==='file:'){
  resize();$('fallback').src='../../assets/global/cards/monzo-perks.avif';$('fallback').hidden=false;
  $('loading').textContent='动态实验需要 HTTP：在仓库根目录运行 node scripts/serve.mjs，再打开 http://127.0.0.1:4173/prototype/experiments/card-particle.html';
  $('loading').style.cssText='left:5%;right:5%;top:auto;bottom:18%;transform:none;line-height:1.9';
  $('phase-title').textContent='静态素材预览';$('phase-description').textContent='浏览器限制 file:// 的像素读取与 WebGL 贴图，请使用本地 HTTP 预览。';
  document.querySelectorAll('#hud button,#progress').forEach(b=>b.disabled=true);document.documentElement.dataset.ready='requires-http';return;
 }
 try{initGL();const loaded=await Promise.all(NF_CARD_MATERIALS.map(m=>NFCardSurface.load(m)));for(const a of loaded){a.sampleMatrix=new Float32Array(a.sampleMatrix);a.privacyRects=new Float32Array(a.item.redactions?a.item.redactions.flat():[0,0,0,0,0,0,0,0]);}assets.push(...loaded);if(gl)for(const a of assets)textures.push(addTexture(a.image));ready=true;resize();select(selected);changeMode(mode);$('loading').hidden=true;
  const initial=Q.has('p')?clamp(Number(Q.get('p'))):reduced?.66:0;setScroll(initial);progress=target;schedule();document.documentElement.dataset.ready='true';
  if(Q.has('debug'))window.NF_CARD_DEBUG={get state(){return {progress,target,mode,card:NF_CARD_MATERIALS[selected].id,dpr,ready,metrics:{...metrics},framePending:!!raf,cardRect:{...state},webgl:!!gl};},seek(p){setScroll(p);progress=target;tilt.tx=tilt.ty=tilt.x=tilt.y=0;schedule();},select(id){const i=NF_CARD_MATERIALS.findIndex(m=>m.id===id);if(i>=0)select(i);},view:changeMode,capture(){return new Promise(resolve=>{capture=resolve;schedule();});}};
 }catch(e){metrics.errors.push(e.message);$('loading').textContent='素材加载失败：'+e.message;console.error(e);}
})();
})();
