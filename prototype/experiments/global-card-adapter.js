/* NFCardStage — Global 三卡粒子舞台（原型适配层）
 * 继承 card-particle.js：FLOW 阈值、320×200 网格 / 种子、transform / pointVS / quadVS / quadFS 原文、
 * 预乘 alpha 混合、DPR≤2、各向异性≤4x。扩展仅限：
 *   1. pointFS 增加材质 B 与 uMix（预乘 alpha 空间插值），只在低 q 时 >0；
 *   2. uCard / uAspect 由 JS 在两张卡尺寸之间插值（同一 m）；
 *   3. 外部控制器：最后一次有效选择优先、低辨识区换材质、高清层只绘制已确认材质。
 * 不修改原实验文件。素材全部为已处理副本，因此不携带运行时 redactions（uPrivacy 恒为 0）。 */
(()=>{
'use strict';
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),mix=(a,b,t)=>a+(b-a)*t,smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a));return t*t*(3-2*t)};
const FLOW=Object.freeze({enterStart:.06,enterEnd:.56,exitStart:.78,exitEnd:1,settled:.80,focusEnd:.88,surfaceEnd:.98,gridX:320,gridY:200});
// 切换参数：qMin = 低辨识数据流；只有有效 q ≤ qMix 时才允许颜色 / 尺寸 / 采样交接。
const SWITCH=Object.freeze({qMin:.025,qMix:.20,qHold:.14,mixTime:.55,wDown:7.2,wUp:6.4});
function formation(q){return {amount:q,settled:q>=FLOW.settled,surfaceMix:smooth(FLOW.focusEnd,FLOW.surfaceEnd,q),focus:Math.sin(smooth(FLOW.settled,FLOW.focusEnd,q)*Math.PI)};}

/* ---- Shader：transform / pointVS / quadVS / quadFS 与 card-particle.js 原文一致 ---- */
const transform=`
uniform vec2 uRes,uCard,uCenter,uTilt;uniform float uFormation,uSurface,uFocus,uDpr;
vec4 project(vec3 P){
 float f=smoothstep(0.,.80,uFormation);
 vec2 tilt=uTilt*smoothstep(.88,.98,uFormation);
 float yaw=.48*(1.-f)+tilt.x,pitch=-.18*(1.-f)+tilt.y;
 float cy=cos(yaw),sy=sin(yaw),cx=cos(pitch),sx=sin(pitch);
 P=vec3(cy*P.x+sy*P.z,P.y,-sy*P.x+cy*P.z);P=vec3(P.x,cx*P.y-sx*P.z,sx*P.y+cx*P.z);
 float scale=1200./max(350.,1200.+P.z);vec2 p=uCenter+P.xy*scale;
 float w=1./scale;return vec4((p.x/uRes.x*2.-1.)*w,(1.-p.y/uRes.y*2.)*w,0.,w);
}
`;
const sample=`
uniform sampler2D uTex;uniform float uAspect,uPrivacy;uniform mat3 uSample;uniform vec4 uPrivacyRects[2];
vec4 material(vec2 uv){
 if(uPrivacy>.5){for(int i=0;i<2;i++){vec4 r=uPrivacyRects[i];
  if(uv.x>r.x&&uv.x<r.x+r.z&&uv.y>r.y&&uv.y<r.y+r.w)uv.y-=r.w+.018;
 }}
 vec3 p=uSample*vec3(uv,1.);return texture2D(uTex,p.xy/p.z);
}
float rounded(vec2 uv){vec2 q=abs((uv-.5)*vec2(uAspect,1.))-vec2(uAspect*.5-.043,.5-.043);float d=length(max(q,0.))+min(max(q.x,q.y),0.)-.043;return 1.-smoothstep(-.0015,.0015,d);}
`;
// 新增：材质 B（已处理副本，无运行时隐私规则），只在 uMix>0 时采样。
const sampleB=`
uniform sampler2D uTexB;uniform mat3 uSampleB;uniform float uMix;
vec4 materialB(vec2 uv){vec3 p=uSampleB*vec3(uv,1.);return texture2D(uTexB,p.xy/p.z);}
`;
const precisionOf=gl=>gl&&gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER,gl.HIGH_FLOAT).precision?'highp':'mediump';
const pointVS=p=>`precision ${p} float;attribute vec4 aData;${transform}
uniform vec2 uGrid;varying vec2 vUV;varying float vArrival;
void main(){
 vec2 uv=aData.xy;float seed=aData.z,lane=floor(uv.y*11.)/10.;vUV=uv;
 float arrival=smoothstep(seed*.10,.72+seed*.08,uFormation);vArrival=arrival;
 vec3 dest=vec3((uv-.5)*uCard,0.);
 vec3 flow=vec3((uv.x-.5)*uCard.x*2.4,
   sin(uv.x*7.+lane*2.7)*uCard.y*.25+(lane-.5)*uCard.y*.85,
   (lane-.5)*620.+sin(uv.x*6.+lane)*100.);
 flow.y+=sin(uFormation*5.+seed*6.28)*uCard.y*.20;
 vec3 P=mix(flow,dest,arrival);
 P.y+=sin(arrival*3.14159265)*sin(uv.x*9.+seed*2.)*uCard.y*.16;
 gl_Position=project(P);
 float cell=max(uCard.x/uGrid.x,uCard.y/uGrid.y);
 gl_PointSize=mix((.9+seed*.6)*uDpr,cell*uDpr+1.,smoothstep(.55,.80,uFormation));
}`;
const pointFS=p=>`precision ${p} float;${sample}${sampleB}
uniform float uFormation,uFocus;varying vec2 vUV;varying float vArrival;
void main(){
 vec4 col=material(vUV);
 // 扩展：低 q 颜色交接在预乘 alpha 空间插值，避免透明角 / 白卡出现脏灰。
 if(uMix>0.){vec4 b=materialB(vUV);vec4 pm=mix(vec4(col.rgb*col.a,col.a),vec4(b.rgb*b.a,b.a),uMix);col=vec4(pm.a>.0001?pm.rgb/pm.a:vec3(0.),pm.a);}
 float disc=1.-smoothstep(.30,.5,length(gl_PointCoord-.5));
 float coverage=mix(disc,1.,smoothstep(.55,.80,uFormation));
 float alpha=mix(.24,1.,vArrival)*coverage*rounded(vUV)*col.a;
 vec3 rgb=col.rgb+(1.-col.rgb)*uFocus*.018;
 gl_FragColor=vec4(rgb,alpha);
}`;
const quadVS=p=>`precision ${p} float;attribute vec4 aData;${transform}
varying vec2 vUV;
void main(){vUV=aData.xy;gl_Position=project(vec3((aData.xy-.5)*uCard,0.));}`;
const quadFS=p=>`precision ${p} float;${sample}
uniform float uSurface;uniform vec2 uTilt;varying vec2 vUV;
void main(){
 vec4 col=material(vUV);
 float reflection=pow(max(0.,1.-abs(vUV.x-.5-uTilt.x*1.5)*4.),20.)*min(.025,length(uTilt)*.2);
 gl_FragColor=vec4(col.rgb+reflection,col.a*rounded(vUV)*uSurface);
}`;
const UNIFORMS=['uRes','uCard','uCenter','uTilt','uFormation','uSurface','uFocus','uGrid','uDpr','uAspect','uTex','uPrivacy','uSample','uPrivacyRects','uTexB','uSampleB','uMix'];
const IDENTITY=new Float32Array([1,0,0,0,1,0,0,0,1]),NO_RECTS=new Float32Array(8);

/* JS 版 project()：与着色器同式，用于 Canvas 2D 绘制 11 条与 q=0 精确对齐的数据流。 */
function projectJS(P,q,tilt,c){
 const f=smooth(0,.8,q),tl=smooth(.88,.98,q),yaw=.48*(1-f)+tilt.x*tl,pitch=-.18*(1-f)+tilt.y*tl;
 const cy=Math.cos(yaw),sy=Math.sin(yaw),cx=Math.cos(pitch),sx=Math.sin(pitch);
 let x=cy*P[0]+sy*P[2],y=P[1],z=-sy*P[0]+cy*P[2];const y2=cx*y-sx*z,z2=sx*y+cx*z;
 const s=1200/Math.max(350,1200+z2);return [c.x+x*s,c.y+y2*s,s];
}

function create(canvas,materials,opts={}){
 const reduced=!!opts.reduced,onCommit=opts.onCommit||(()=>{}),slow=opts.slowLoad||0;
 let gl=opts.noWebGL?null:canvas.getContext('webgl',{alpha:true,antialias:false,premultipliedAlpha:true,powerPreference:'low-power'});
 const mats=new Map(materials.map(m=>[m.id,{...m,ready:false,failed:false,texture:null,image:null,lanes:null,sampleMatrix:IDENTITY}]));
 const programs={},buffers={},metrics={frames:0,pointDraws:0,quadDraws:0,points:0,textureBytes:0,bufferBytes:0,uploads:0,errors:[]};
 let W=1,H=1,dpr=1,lost=false,destroyed=false,anisotropy=null;
 const first=materials[0].id;
 // 控制器：from=已确认材质；to=正在交接的目标；desired=最后一次有效请求；m=交接进度；q/v=局部成形量与速度。
 const ctl={from:first,to:null,desired:first,m:0,q:1,v:0,token:0,busy:false};
 const tilt={x:0,y:0,tx:0,ty:0};
 let layoutFn=()=>({x:W/2,y:H/2,cw:300,ch:190});
 let snap=null;

 function makeProgram(vs,fs){
  const compile=(type,src)=>{const sh=gl.createShader(type);gl.shaderSource(sh,src);gl.compileShader(sh);if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS)){const e=gl.getShaderInfoLog(sh);metrics.errors.push(e);throw Error(e);}return sh;};
  const v=compile(gl.VERTEX_SHADER,vs),f=compile(gl.FRAGMENT_SHADER,fs),p=gl.createProgram();gl.attachShader(p,v);gl.attachShader(p,f);gl.linkProgram(p);gl.deleteShader(v);gl.deleteShader(f);
  if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(p));
  return {p,attr:gl.getAttribLocation(p,'aData'),u:Object.fromEntries(UNIFORMS.map(n=>[n,gl.getUniformLocation(p,n==='uPrivacyRects'?n+'[0]':n)]))};
 }
 function initGL(){
  if(!gl)return;const p=precisionOf(gl);
  programs.points=makeProgram(pointVS(p),pointFS(p));programs.quad=makeProgram(quadVS(p),quadFS(p));
  // 与原实验完全相同的 UV / 种子缓冲。
  const grid=[];for(let y=0;y<FLOW.gridY;y++)for(let x=0;x<FLOW.gridX;x++){const seed=((x*73+y*137)%997)/997;grid.push((x+.5)/FLOW.gridX,(y+.5)/FLOW.gridY,seed,(x+y)%7);}
  const quad=[0,0,0,0,1,0,0,0,0,1,0,0,0,1,0,0,1,0,0,0,1,1,0,0];metrics.bufferBytes=0;
  for(const [name,data] of [['points',grid],['quad',quad]]){buffers[name]=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffers[name]);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.STATIC_DRAW);metrics.bufferBytes+=data.length*4;}
  metrics.points=grid.length/4;anisotropy=gl.getExtension('EXT_texture_filter_anisotropic');
 }
 function upload(m){
  if(!gl||!m.image)return;const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,m.image);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  if(anisotropy)gl.texParameterf(gl.TEXTURE_2D,anisotropy.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(4,gl.getParameter(anisotropy.MAX_TEXTURE_MAX_ANISOTROPY_EXT)));
  m.texture=t;metrics.uploads++;metrics.textureBytes+=m.image.naturalWidth*m.image.naturalHeight*4;
 }
 // 11 条数据流的代表色：每条 lane 对应 uv.y ∈ [k/11,(k+1)/11)，按 alpha 加权平均并混入高亮像素。
 function laneColors(img){
  const c=document.createElement('canvas'),w=96,h=66;c.width=w;c.height=h;const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(img,0,0,w,h);const d=g.getImageData(0,0,w,h).data,out=[];
  for(let k=0;k<11;k++){let r=0,gg=0,b=0,a=0;const px=[];for(let y=Math.floor(k*h/11);y<Math.floor((k+1)*h/11);y++)for(let x=0;x<w;x++){const o=(y*w+x)*4,al=d[o+3]/255;if(al<.5)continue;r+=d[o]*al;gg+=d[o+1]*al;b+=d[o+2]*al;a+=al;px.push([d[o],d[o+1],d[o+2],d[o]*.3+d[o+1]*.59+d[o+2]*.11]);}
   if(!a){out.push([200,200,200]);continue;}px.sort((p,q)=>q[3]-p[3]);const top=px.slice(0,Math.max(1,px.length*.12|0));const hi=[0,1,2].map(i=>top.reduce((s,p)=>s+p[i],0)/top.length);
   let col=[r/a,gg/a,b/a].map((v,i)=>mix(v,hi[i],.55));const lum=col[0]*.3+col[1]*.59+col[2]*.11;if(lum<110)col=col.map(v=>Math.min(255,v*110/Math.max(20,lum)));out.push(col.map(Math.round));}
  return out;
 }
 async function load(m){
  try{if(slow&&m.id!==first)await new Promise(r=>setTimeout(r,slow));const img=new Image();img.decoding='async';img.src=m.src;await img.decode();if(destroyed)return;
   m.image=img;m.lanes=laneColors(img);upload(m);m.ready=true;opts.onReady&&opts.onReady(m.id);}
  catch(e){m.failed=true;metrics.errors.push('load '+m.id+': '+e.message);if(ctl.desired===m.id)ctl.desired=ctl.from;}
 }
 const loadAll=()=>{if(gl)initGL();return Promise.all([...mats.values()].map(load));};

 function rectFor(id){return layoutFn(mats.get(id));}
 // 公开请求：只记录“最后一次有效选择”，不排队；异步加载回调不会直接改变画面。
 function request(id,env){
  if(!mats.has(id)||mats.get(id).failed)return false;if(env&&!env.interactive)return false;
  if(id===ctl.desired)return false;ctl.desired=id;ctl.token++;
  if(reduced||!gl||lost){if(mats.get(id).ready||!gl){ctl.from=id;ctl.to=null;ctl.m=0;ctl.q=1;ctl.v=0;onCommit(id);}}
  return true;
 }
 function commit(){ctl.from=ctl.to;ctl.to=null;ctl.m=0;onCommit(ctl.from);}
 // 每帧推进局部状态（dt 为秒）；env.qNarr 是叙事 q，局部 q 只能比它更低（min），滚动永远优先。
 function step(dt,env){
  dt=clamp(dt,0,.05);
  if(!env.visible){ // 已离屏：立即收束到最近的确认材质，停止局部调度
   if(ctl.to&&ctl.m>=.5)commit();ctl.to=null;ctl.m=0;ctl.desired=ctl.from;ctl.q=1;ctl.v=0;return false;
  }
  if(reduced||!gl||lost){ctl.q=1;ctl.v=0;return false;}
  if(!env.interactive&&(ctl.to||ctl.desired!==ctl.from))ctl.desired=(ctl.to&&ctl.m>=.5)?ctl.to:ctl.from; // 离开稳定区：交还最近状态
  if(ctl.to&&ctl.desired!==ctl.to&&ctl.m<=0)ctl.to=ctl.desired===ctl.from?null:ctl.desired; // 未开始换色：直接重定向
  if(!ctl.to&&ctl.desired!==ctl.from){ctl.to=ctl.desired;ctl.m=0;}
  const qe=Math.min(env.qNarr,ctl.q),toward=ctl.to&&ctl.desired===ctl.to;
  if(ctl.to&&qe<=SWITCH.qMix){
   if(toward&&mats.get(ctl.to).ready)ctl.m=Math.min(1,ctl.m+dt/SWITCH.mixTime);
   else if(!toward)ctl.m=Math.max(0,ctl.m-dt/SWITCH.mixTime);
  }
  if(ctl.to&&ctl.m>=1)commit();
  if(ctl.to&&!toward&&ctl.m<=0)ctl.to=ctl.desired===ctl.from?null:ctl.desired;
  let goal=1;if(ctl.to)goal=(toward&&ctl.m>=.5)?SWITCH.qHold:SWITCH.qMin;
  // 临界阻尼弹簧：目标改变时速度连续，不会突然重置 q。
  const w=goal<ctl.q?SWITCH.wDown:SWITCH.wUp,n=4;for(let i=0;i<n;i++){const h=dt/n,a=w*w*(goal-ctl.q)-2*w*ctl.v;ctl.v+=a*h;ctl.q+=ctl.v*h;if(ctl.q<0){ctl.q=0;ctl.v=0;}if(ctl.q>1){ctl.q=1;ctl.v=0;}}
  if(!ctl.to&&Math.abs(1-ctl.q)<.0004&&Math.abs(ctl.v)<.002){ctl.q=1;ctl.v=0;}
  ctl.busy=!!ctl.to||ctl.q<1;
  // 倾斜：只在已确认材质完整显示后跟随指针
  const hold=!ctl.to&&Math.min(env.qNarr,ctl.q)>=.98,tx=hold?tilt.tx:0,ty=hold?tilt.ty:0;const k=1-Math.exp(-dt*11);tilt.x=mix(tilt.x,tx,k);tilt.y=mix(tilt.y,ty,k);if(Math.abs(tilt.x-tx)<.00002)tilt.x=tx;if(Math.abs(tilt.y-ty)<.00002)tilt.y=ty;
  return ctl.busy||tilt.x!==tx||tilt.y!==ty;
 }
 // 每帧唯一材质快照：点层、高清层、2D 数据流共用。
 function snapshot(qNarr){
  const a=mats.get(ctl.from),b=ctl.to?mats.get(ctl.to):null,mm=b?smooth(0,1,ctl.m):0,ra=rectFor(a.id),rb=b?rectFor(b.id):ra;
  const q=reduced?1:Math.min(qNarr,ctl.q),f=formation(q);
  snap={from:a.id,to:b?b.id:null,m:mm,q,x:mix(ra.x,rb.x,mm),y:mix(ra.y,rb.y,mm),cw:mix(ra.cw,rb.cw,mm),ch:mix(ra.ch,rb.ch,mm),
   surface:reduced?1:(mm>0?0:f.surfaceMix),focus:mm>0?0:f.focus,tilt:{x:tilt.x,y:tilt.y},matA:a,matB:b};
  return snap;
 }
 function drawPass(name,primitive,count,s){
  const {p,u,attr}=programs[name];gl.useProgram(p);gl.bindBuffer(gl.ARRAY_BUFFER,buffers[name]);gl.enableVertexAttribArray(attr);gl.vertexAttribPointer(attr,4,gl.FLOAT,false,16,0);
  gl.uniform2f(u.uRes,W,H);gl.uniform2f(u.uCard,s.cw,s.ch);gl.uniform2f(u.uCenter,s.x,s.y);gl.uniform2f(u.uTilt,s.tilt.x,s.tilt.y);gl.uniform1f(u.uFormation,s.q);gl.uniform1f(u.uSurface,s.surface);gl.uniform1f(u.uFocus,s.focus);gl.uniform2f(u.uGrid,FLOW.gridX,FLOW.gridY);gl.uniform1f(u.uDpr,dpr);
  gl.uniform1f(u.uAspect,s.cw/s.ch);gl.uniform1i(u.uTex,0);gl.uniform1f(u.uPrivacy,0);gl.uniformMatrix3fv(u.uSample,false,s.matA.sampleMatrix);gl.uniform4fv(u.uPrivacyRects,NO_RECTS);
  if(u.uTexB){gl.uniform1i(u.uTexB,1);gl.uniformMatrix3fv(u.uSampleB,false,(s.matB||s.matA).sampleMatrix);gl.uniform1f(u.uMix,s.matB?s.m:0);}
  gl.drawArrays(primitive,0,count);metrics[name==='points'?'pointDraws':'quadDraws']++;
 }
 // 绘制：保存 / 恢复会被修改的全局 GL 状态，便于未来与开场点阵共享 Context。
 function draw(s=snap){
  if(!gl||lost||!s||!s.matA.texture)return false;metrics.frames++;
  const prev={blend:gl.isEnabled(gl.BLEND),program:gl.getParameter(gl.CURRENT_PROGRAM),buffer:gl.getParameter(gl.ARRAY_BUFFER_BINDING),active:gl.getParameter(gl.ACTIVE_TEXTURE),src:gl.getParameter(gl.BLEND_SRC_RGB),dst:gl.getParameter(gl.BLEND_DST_RGB),srcA:gl.getParameter(gl.BLEND_SRC_ALPHA),dstA:gl.getParameter(gl.BLEND_DST_ALPHA)};
  gl.viewport(0,0,canvas.width,canvas.height);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);
  gl.enable(gl.BLEND);gl.blendFuncSeparate(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA,gl.ONE,gl.ONE_MINUS_SRC_ALPHA);
  gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,(s.matB&&s.matB.texture)||s.matA.texture);
  gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,s.matA.texture);
  if(!reduced&&s.surface<1)drawPass('points',gl.POINTS,metrics.points,s);
  if(s.surface>0)drawPass('quad',gl.TRIANGLES,6,s);
  gl.activeTexture(prev.active);gl.useProgram(prev.program);gl.bindBuffer(gl.ARRAY_BUFFER,prev.buffer);gl.blendFuncSeparate(prev.src,prev.dst,prev.srcA,prev.dstA);if(!prev.blend)gl.disable(gl.BLEND);
  return true;
 }
 function clear(){if(gl&&!lost){gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);}}
 // 11 条 lane 在 q 时的屏幕折线（种子项取均值 0），颜色来自快照（交接中按 m 插值）。
 function lanesAt(q,s=snap,samples=44){
  if(!s)return [];const out=[],c={x:s.x,y:s.y},la=s.matA.lanes,lb=s.matB&&s.matB.lanes;
  for(let k=0;k<11;k++){const lane=k/10,pts=[];for(let i=0;i<=samples;i++){const u=i/samples;
    const P=[(u-.5)*s.cw*2.4,Math.sin(u*7+lane*2.7)*s.ch*.25+(lane-.5)*s.ch*.85,(lane-.5)*620+Math.sin(u*6+lane)*100];
    pts.push(projectJS(P,q,{x:0,y:0},c));}
   const ca=la?la[k]:[220,220,220],cb=lb?lb[k]:ca;out.push({lane:k,pts,color:ca.map((v,i)=>Math.round(mix(v,cb[i],s.m))),band:s.ch*.2});}
  return out;
 }
 function resize(w,h,d){W=w;H=h;dpr=Math.min(2,d||1);canvas.width=Math.round(W*dpr);canvas.height=Math.round(H*dpr);}
 function onLost(e){e.preventDefault();lost=true;opts.onLost&&opts.onLost();}
 function onRestored(){lost=false;metrics.textureBytes=0;initGL();for(const m of mats.values())if(m.image)upload(m);opts.onRestored&&opts.onRestored();}
 canvas.addEventListener('webglcontextlost',onLost);canvas.addEventListener('webglcontextrestored',onRestored);
 function destroy(){destroyed=true;canvas.removeEventListener('webglcontextlost',onLost);canvas.removeEventListener('webglcontextrestored',onRestored);if(gl&&!lost){for(const m of mats.values())if(m.texture)gl.deleteTexture(m.texture);for(const b of Object.values(buffers))gl.deleteBuffer(b);for(const p of Object.values(programs))gl.deleteProgram(p.p);}}
 return {FLOW,SWITCH,formation,load:loadAll,request,step,snapshot,draw,clear,lanesAt,resize,destroy,
  setLayout(fn){layoutFn=fn;},setTilt(x,y){tilt.tx=x;tilt.ty=y;},rectFor,
  get state(){return {from:ctl.from,to:ctl.to,desired:ctl.desired,m:+ctl.m.toFixed(3),q:+ctl.q.toFixed(3),busy:ctl.busy,token:ctl.token,webgl:!!gl&&!lost,ready:Object.fromEntries([...mats].map(([k,v])=>[k,v.ready]))};},
  get snap(){return snap;},get metrics(){return {...metrics};},get webgl(){return !!gl&&!lost;},material:id=>mats.get(id),
  loseContext(){const e=gl&&gl.getExtension('WEBGL_lose_context');if(e){e.loseContext();setTimeout(()=>e.restoreContext(),1200);}}};
}
window.NFCardStage={create,FLOW,SWITCH,formation,projectJS};
})();
