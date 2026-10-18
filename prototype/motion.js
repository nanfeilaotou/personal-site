(()=>{
'use strict';
/* ============ 基础 ============ */
const Q=new URLSearchParams(location.search);
const DEBUG=Q.has('debug'), AT=Q.has('at')?parseFloat(Q.get('at')):null, FIXIT=Q.has('it')?parseFloat(Q.get('it')):null;
document.documentElement.classList.toggle('debug-ui',DEBUG);
const REDUCED=matchMedia('(prefers-reduced-motion: reduce)').matches||(DEBUG&&Q.has('reduced'));
const $=id=>document.getElementById(id);
const stage=$('stage'),glc=$('gl'),cv=$('cv'),ctx=cv.getContext('2d');
const clamp=(x,a=0,b=1)=>x<a?a:x>b?b:x, lerp=(a,b,t)=>a+(b-a)*t, R=(x,a,b)=>clamp((x-a)/(b-a));
const io=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2, eo=t=>1-Math.pow(1-t,3), xio=t=>t<=0?0:t>=1?1:t<.5?Math.pow(2,20*t-10)/2:(2-Math.pow(2,-20*t+10))/2;
const hs=n=>{const x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x)};
function rng(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const CN='"PingFang SC","Hiragino Sans GB","Microsoft YaHei","Noto Sans SC","Noto Sans CJK SC",sans-serif';
const MONO='"JetBrains Mono","SF Mono",Menlo,Consolas,"Liberation Mono",monospace';

/* ============ 时间轴（单位：屏）—— 所有画面都是 s 的函数 ============ */
const CLOCK=window.NF_TIMELINE,TIMELINE=CLOCK.scene,TOTAL=CLOCK.total;
const STOP={open:0,...Object.fromEntries(['models','local','agents','global','personal'].map(k=>[k,CLOCK[k].stop])),...Object.fromEntries(Object.entries(CLOCK.globalWorld.stops).map(([k,v])=>['global-'+k,v])),end:TOTAL};
const legacyLocal=s=>lerp(TIMELINE.local.oldStart,TIMELINE.local.oldEnd,R(s,TIMELINE.local.start,TIMELINE.local.end));
const legacyLater=s=>s>=TIMELINE.global.end-.08?CLOCK.personalLegacy(s):s-TIMELINE.legacyOffset;

let W=0,H=0,DPR=1,UNIT=1,SL=0,SR=0,LY=0,fs=36,LWS=1;
let INK=[237,237,235],BG='#050505';
const ink=a=>`rgba(${INK[0]},${INK[1]},${INK[2]},${clamp(a)})`;

/* ============ 自定义几何字体（站名与章节号） ============ */
const S=2.3,r=(x,y,w,h)=>[[x,y],[x+w,y],[x+w,y+h],[x,y+h]];
const GL={
 N:{w:7,a:[r(0,0,S,10),r(7-S,0,S,10),[[0,0],[S,0],[7,10],[7-S,10]]]},
 A:{w:7,a:[r(0,0,7,S),r(0,0,S,10),r(7-S,0,S,10),r(0,5.3,7,S*.85)],s:[[[0,0],[2.7,0],[0,2.7]],[[4.3,0],[7,0],[7,2.7]]]},
 F:{w:6.6,a:[r(0,0,S,10),r(0,0,6.6,S),r(0,4.45,5.3,S*.9)]},
 E:{w:6.8,a:[r(0,0,S,10),r(0,0,6.8,S),r(0,4.45,5.7,S*.9),r(0,10-S,6.8,S)]},
 I:{w:S,a:[r(0,0,S,10)]},
 L:{w:6.4,a:[r(0,0,S,10),r(0,10-S,6.4,S)]},
 O:{w:7,a:[r(0,0,7,S),r(0,10-S,7,S),r(0,0,S,10),r(7-S,0,S,10)],s:[[[5.1,0],[7,0],[7,1.9]],[[0,8.1],[0,10],[1.9,10]]]},
 T:{w:7,a:[r(0,0,7,S),r(3.5-S/2,0,S,10)]},
 U:{w:7,a:[r(0,0,S,10),r(7-S,0,S,10),r(0,10-S,7,S)],s:[[[5.1,10],[7,10],[7,8.1]]]},
 '0':{w:6.4,a:[r(0,0,6.4,S),r(0,10-S,6.4,S),r(0,0,S,10),r(6.4-S,0,S,10)],s:[[[4.5,0],[6.4,0],[6.4,1.9]],[[0,8.1],[0,10],[1.9,10]]]},
 '1':{w:4.3,a:[r(4.3-S,0,S,10),r(0,0,4.3,S)],s:[[[0,0],[1.3,0],[0,1.3]]]},
 '2':{w:6.4,a:[r(0,0,6.4,S),r(6.4-S,0,S,5.4),r(0,4.45,6.4,S*.9),r(0,4.45,S,5.55),r(0,10-S,6.4,S)]},
 '3':{w:6.4,a:[r(0,0,6.4,S),r(1.5,4.45,4.9,S*.9),r(0,10-S,6.4,S),r(6.4-S,0,S,10)]}
};
function pip(x,y,p){let c=false;for(let i=0,j=p.length-1;i<p.length;j=i++){const xi=p[i][0],yi=p[i][1],xj=p[j][0],yj=p[j][1];if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)c=!c}return c}
function inG(g,x,y){if(g.s)for(const p of g.s)if(pip(x,y,p))return false;for(const p of g.a)if(pip(x,y,p))return true;return false}
function lay(str,gap){let x=0;const it=[];for(const ch of str){const g=GL[ch];it.push({g,x});x+=g.w+gap}return{it,w:x-gap}}
const gcache={};
function glyphCanvas(str,u,col){
 const k=str+u.toFixed(1)+col;if(gcache[k])return gcache[k];
 const L=lay(str,1.5),c=document.createElement('canvas'),d=Math.min(2,devicePixelRatio||1);
 c.width=Math.ceil((L.w*u+4)*d);c.height=Math.ceil((10*u+4)*d);const g=c.getContext('2d');g.scale(d,d);g.translate(2,2);
 g.fillStyle=col;for(const it of L.it){g.beginPath();for(const p of it.g.a){g.moveTo((it.x+p[0][0])*u,p[0][1]*u);for(const q of p)g.lineTo((it.x+q[0])*u,q[1]*u);g.closePath()}g.fill();
  if(it.g.s){g.globalCompositeOperation='destination-out';g.beginPath();for(const p of it.g.s){g.moveTo((it.x+p[0][0])*u,p[0][1]*u);for(const q of p)g.lineTo((it.x+q[0])*u,q[1]*u);g.closePath()}g.fill();g.globalCompositeOperation='source-over'}}
 c.cw=L.w*u+4;c.ch=10*u+4;return gcache[k]=c;
}

/* ============ WebGL 点阵 ============ */
const gl=glc.getContext('webgl',{premultipliedAlpha:true,antialias:false,alpha:true});
const VS=`precision highp float;
attribute vec2 aT;attribute vec4 aR;attribute vec3 aM;
uniform vec2 uRes,uC,uMouse;uniform float uDpr,uTime,uIntro,uS,uVel,uPS,uMouseOn;
varying float vA;
float h(float n){return fract(sin(n*127.1+311.7)*43758.5453);}
float xo(float t){return t>=1.?1.:1.-pow(2.,-10.*t);}
float io(float t){return t<.5?4.*t*t*t:1.-pow(-2.*t+2.,3.)/2.;}
void main(){
 float amb=aM.y;vec2 p;float flash=0.,ke=1.;
 if(amb<.5){
  float b=xo(clamp((uIntro-.35)/1.,0.,1.));
  float ang=aR.x*6.28318+b*1.1,rad=pow(aR.y,.5)*min(uRes.x,uRes.y)*.47;
  vec2 burst=uC+vec2(cos(ang),sin(ang)*.86)*rad*b;
  float k=clamp((uIntro-1.05-aM.x*.7-aR.z*.25)/.9,0.,1.);
  ke=xo(k);p=mix(burst,aT,ke);
  flash=smoothstep(.3,.75,k)*(1.-smoothstep(.75,1.,k));
 }else{p=aT+vec2(sin(uTime*.05+aR.x*30.),cos(uTime*.04+aR.y*30.))*16.;}
 p+=vec2(sin(uTime*.9+aR.w*40.),cos(uTime*.8+aR.z*40.))*.4;
 vec2 d=p-uMouse;float dist=length(d);
 float f=smoothstep(170.,0.,dist)*uMouseOn*(1.-amb*.5);
 p+=d/(dist+.001)*f*f*54.;
 float row=floor(p.y/6.),tk=floor(uTime*16.);
 float g=step(.86,h(row*1.7+tk));
 p.x+=(h(row*3.1+tk*.7)-.5)*g*min(abs(uVel),2.5)*90.*(1.-smoothstep(.4,.7,uS));
 float lay=io(clamp((uS-.08)/.4,0.,1.));
 float imp=clamp((uS-.48)/.4,0.,1.);
 vec3 P=vec3(p-uC,aM.z*150.*lay);
 if(amb>.5)P.z=(aR.y-.5)*1400.*(.3+lay);
 float ki=clamp((imp-aR.x*.3)/.7,0.,1.);ki=ki*ki*ki;
 float sw=ki*1.5*(.4+aR.y),cs=cos(sw),sn=sin(sw);
 P.xy=mat2(cs,sn,-sn,cs)*P.xy*(1.-ki);P.z*=(1.-ki);
 float camT=lay*(1.-io(imp));
 float yaw=-.55*camT,pit=.28*camT;
 float c1=cos(yaw),s1=sin(yaw);P=vec3(c1*P.x+s1*P.z,P.y,-s1*P.x+c1*P.z);
 float c2=cos(pit),s2=sin(pit);P=vec3(P.x,c2*P.y-s2*P.z,s2*P.y+c2*P.z);
 float D=1500.,zc=P.z+D-260.*lay,sc=D/max(zc,60.);
 vec2 sp=uC+P.xy*sc;
 float sz=uPS*(.7+aR.w*.65)*clamp(sc,.2,3.)*(1.+flash*.9+f*.5);
 if(amb>.5)sz*=.75;
 gl_PointSize=max(sz*uDpr,1.);
 float a=amb>.5?(.14+.2*aR.z)*smoothstep(.3,2.,uIntro):(.28+.72*ke)*smoothstep(0.,.35,uIntro);
 a*=1.+flash*1.4+f*.6;
 a*=1.-smoothstep(.86,.97,uS);
 if(amb<.5)a*=mix(1.,.5,ki);
 vA=a;
 gl_Position=vec4(sp.x/uRes.x*2.-1.,1.-sp.y/uRes.y*2.,0.,1.);
}`;
const FS=`precision mediump float;varying float vA;void main(){float d=length(gl_PointCoord-.5);float a=smoothstep(.5,.26,d)*vA;gl_FragColor=vec4(a,a,a,a);}`;
let prog,U={},buf,NPTS=0,NGLYPH=0,WM={};
function initGL(){
 if(!gl)return;
 const sh=(t,src)=>{const s=gl.createShader(t);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))console.error(gl.getShaderInfoLog(s));return s};
 prog=gl.createProgram();gl.attachShader(prog,sh(gl.VERTEX_SHADER,VS));gl.attachShader(prog,sh(gl.FRAGMENT_SHADER,FS));gl.linkProgram(prog);gl.useProgram(prog);
 for(const n of['uRes','uC','uMouse','uDpr','uTime','uIntro','uS','uVel','uPS','uMouseOn'])U[n]=gl.getUniformLocation(prog,n);
 buf=gl.createBuffer();gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE);
}
function buildPoints(){
 const L1='NANFEI',L2='LAOTOU',gap=1.5,lg=2.8;
 const l2=lay(L2,gap),w1=lay(L1,gap).w,l1=lay(L1,gap+(l2.w-w1)/(L1.length-1));
 const th=20+lg,u=Math.min(W*.86/l2.w,H*.58/th);
 const ox=(W-l2.w*u)/2,oy=H*.5-th*u/2;
 WM={ox,oy,u,w:l2.w*u,h:th*u,ys:[oy,oy+10*u,oy+(10+lg)*u,oy+th*u]};
 let step=3.2,arr;
 for(let pass=0;pass<3;pass++){
  arr=[];const rnd=rng(11);
  [[l1,0],[l2,1]].forEach(([L,li])=>{const y0=oy+li*(10+lg)*u;
   for(const it of L.it){const gx0=ox+it.x*u,gx1=gx0+it.g.w*u,sx=ox+Math.ceil((gx0-ox)/step)*step;
    for(let x=sx;x<gx1;x+=step)for(let y=y0+step*.5;y<y0+10*u;y+=step){const ux=(x-gx0)/u,uy=(y-y0)/u;
     if(inG(it.g,ux,uy)){const band=Math.floor(uy/1.25)+li*9;arr.push(x,y,rnd(),rnd(),rnd(),rnd(),x/W,0,((band*37)%7)-3)}}}});
  const n=arr.length/9;if(n<=42000)break;step*=Math.sqrt(n/42000)*1.01;
 }
 NGLYPH=arr.length/9;
 const rnd=rng(5);for(let i=0;i<1400;i++){const x=rnd()*W,y=rnd()*H;arr.push(x,y,rnd(),rnd(),rnd(),rnd(),x/W,1,Math.floor(rnd()*7)-3)}
 NPTS=arr.length/9;
 if(!gl)return;
 gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(arr),gl.STATIC_DRAW);
 const at=(n,sz,off)=>{const l=gl.getAttribLocation(prog,n);gl.enableVertexAttribArray(l);gl.vertexAttribPointer(l,sz,gl.FLOAT,false,36,off)};
 at('aT',2,0);at('aR',4,8);at('aM',3,24);
}
function drawGL(s,time,intro,vel,mouse){
 if(!gl)return;
 gl.viewport(0,0,glc.width,glc.height);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);
 if(s>=1)return;
 gl.uniform2f(U.uRes,W,H);gl.uniform2f(U.uC,W/2,H/2);gl.uniform2f(U.uMouse,mouse.x,mouse.y);
 gl.uniform1f(U.uDpr,DPR);gl.uniform1f(U.uTime,time);gl.uniform1f(U.uIntro,intro);gl.uniform1f(U.uS,s);
 gl.uniform1f(U.uVel,vel);gl.uniform1f(U.uPS,1.7);gl.uniform1f(U.uMouseOn,mouse.on);
 gl.drawArrays(gl.POINTS,0,NPTS);
}

/* ============ 2D 工具 ============ */
const win=(s,a,b,c,d)=>R(s,a,b)*(1-R(s,c,d));
const LIGHT=[237,237,235],DARK=[18,18,17];
function L(x1,y1,x2,y2,a=1,w=1){if(a<=0)return;ctx.strokeStyle=ink(a);ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke()}
function T(str,x,y,sz=10,a=1,o={}){if(a<=0.005)return;ctx.font=`${o.w||500} ${sz}px ${o.f||MONO}`;ctx.fillStyle=ink(a);ctx.textAlign=o.al||'left';ctx.textBaseline=o.bl||'alphabetic';ctx.letterSpacing=(o.ls!=null?o.ls:(o.f===CN?0:sz*.08))+'px';ctx.fillText(str,x,y)}
function MW(str,sz,o={}){ctx.font=`${o.w||500} ${sz}px ${o.f||MONO}`;ctx.letterSpacing=(o.ls!=null?o.ls:(o.f===CN?0:sz*.08))+'px';return ctx.measureText(str).width}
function dot(x,y,r,a){if(a<=0)return;ctx.fillStyle=ink(a);ctx.fillRect(x-r,y-r,r*2,r*2)}
function RT(x,y,w,h,a,lw=1,f=1){
 if(a<=0||f<=0)return;ctx.strokeStyle=ink(a);ctx.lineWidth=lw;
 let q=2*(w+h)*clamp(f),cx=x,cy=y;ctx.beginPath();ctx.moveTo(x,y);
 for(const [dx,dy] of [[w,0],[0,h],[-w,0],[0,-h]]){const l=Math.abs(dx+dy),t=Math.min(1,q/l);cx+=dx*t;cy+=dy*t;ctx.lineTo(cx,cy);q-=l;if(q<=0)break}
 ctx.stroke();
}
function corners(x,y,w,h,l,a,lw=1){if(a<=0)return;ctx.strokeStyle=ink(a);ctx.lineWidth=lw;ctx.beginPath();
 [[x,y,1,1],[x+w,y,-1,1],[x,y+h,1,-1],[x+w,y+h,-1,-1]].forEach(([px,py,dx,dy])=>{ctx.moveTo(px+dx*l,py);ctx.lineTo(px,py);ctx.lineTo(px,py+dy*l)});ctx.stroke()}
function anno(ax,ay,lx,ly,p,t1,t2){
 if(p<=0)return;
 const sx=lx>=ax?1:-1,dy=ly-ay,ex=ax+sx*Math.min(Math.abs(dy),Math.abs(lx-ax));
 const s1=Math.hypot(ex-ax,dy),s2=Math.abs(lx-ex),q=eo(R(p,0,.55))*(s1+s2);
 ctx.strokeStyle=ink(.55);ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(ax,ay);
 if(s1>0&&q<=s1)ctx.lineTo(ax+(ex-ax)*q/s1,ay+dy*q/s1);else{ctx.lineTo(ex,ly);ctx.lineTo(ex+sx*Math.max(0,q-s1),ly)}
 ctx.stroke();dot(ax,ay,2,.9*R(p,0,.12));
 const ta=R(p,.4,.85);if(ta<=0)return;
 const n=Math.ceil(t1.length*R(p,.4,.75)),al=sx>0?'left':'right',tx=lx+sx*8;
 T(t1.slice(0,n)+(n<t1.length?'_':''),tx,ly+4,10.5,ta,{w:600,al});
 if(t2)T(t2,tx,ly+24,13,ta*.72,{f:CN,al});
}
function bigTitle(no,s,a,b,t1,t2,line){
 if(s<=a||s>=b)return;
 const p=R(s,a,b),hh=H*.34,u=hh/10,g=glyphCanvas(no,u,`rgb(${INK.join(',')})`);
 const rise=eo(R(p,0,.34)),sh=io(R(p,.6,.97)),sc=lerp(1,9.5/hh,sh);
 const x=lerp(SL,30,sh),y=lerp(LY-hh,99,sh)+(1-rise)*hh*1.06;
 if(line)L(SL-24,LY,SR,LY,.7*win(p,0,.1,.7,.85));
 ctx.save();if(sh<.01){ctx.beginPath();ctx.rect(0,0,W,LY);ctx.clip()}
 ctx.globalAlpha=1-R(p,.9,1);ctx.drawImage(g,x-2*sc,y-2*sc,g.cw*sc,g.ch*sc);ctx.restore();
 const sa=win(p,.16,.32,.5,.62);
 T(t1,SL,LY+46,26,sa,{f:CN,w:700});T(t2,SL,LY+70,10.5,sa*.6);
 if(DEBUG)T('CH.'+no,SR,LY+46,10.5,sa*.5,{al:'right'});
}
function sig(x,y,r,seed,a,t){
 if(a<=0)return;
 const h1=hs(seed*3.1),h2=hs(seed*7.7),h3=hs(seed*1.3),n=3+Math.floor(h2*5);
 ctx.save();ctx.translate(x,y);ctx.rotate(h1*6.28+t*.12*(h2-.5));
 ctx.strokeStyle=ink(a);ctx.fillStyle=ink(a);ctx.lineWidth=1;ctx.beginPath();
 for(let i=0;i<n;i++){const an=i/n*6.283,l=r*(.55+.45*hs(seed+i*1.7));ctx.moveTo(Math.cos(an)*r*.3,Math.sin(an)*r*.3);ctx.lineTo(Math.cos(an)*l,Math.sin(an)*l);ctx.fillRect(Math.cos(an)*l-1,Math.sin(an)*l-1,2,2)}
 ctx.stroke();ctx.beginPath();
 if(h3>.55)ctx.arc(0,0,r*.62,0,6.283);else if(h3>.25)ctx.rect(-r*.36,-r*.36,r*.72,r*.72);else{ctx.moveTo(-r,0);ctx.lineTo(r,0)}
 ctx.stroke();ctx.fillRect(-1.5,-1.5,3,3);ctx.restore();
}

/* ============ 布局（resize 时计算） ============ */
let STARS=[],FX,FY,FZ,PE=[];
function layout(){
 SL=W<=760?W*.1:W*.3;SR=W-(W<=760?40:78);LY=H*.58;fs=clamp(W*.026,22,46);
 const r2=rng(9);STARS=[];for(let i=0;i<190;i++)STARS.push([(r2()-.5)*W*1.6,(r2()-.5)*H*1.4,(r2()-.5)*W*1.1,r2()]);
 FZ=Math.min(H*(W<=760?.24:.42),(SR-SL)*.43);FX=W<=760?W*.44:SL+(SR-SL)*.32;FY=H*(W<=760?.49:.5);
 PE=[...document.querySelectorAll('#pe .t')].map(el=>{const r=el.getBoundingClientRect();return{x:r.left,y:r.top+r.height/2,w:r.width,h:r.height}});
 for(const k in DIFF)delete DIFF[k];
}

/* ============ 00 开场叠加层 ============ */
function sceneOpen(s,intro){
 if(s>.95)return;
 const a0=1-R(s,.03,.2),ca=R(intro,2.3,3.1)*a0;
 if(ca>0){
  const p=18,x0=WM.ox-p,x1=WM.ox+WM.w+p,y0=WM.oy-p,y1=WM.oy+WM.h+p;
  corners(x0,y0,x1-x0,y1-y0,16*eo(R(intro,2.3,3)),.85*ca);
  ['0','10U','12.8U','22.8U'].forEach((l,i)=>{const y=WM.ys[i];L(x0-42,y,x0-12,y,.35*ca);if(DEBUG)T(l,x0-48,y+3,9,.45*ca,{al:'right'})});
  if(DEBUG)T('NANFEILAOTOU / 自定义几何字形',x0,y1+24,9.5,.5*ca,{w:600});
  if(DEBUG)T(`${NGLYPH.toLocaleString('en')} PTS`,x1,y1+24,9.5,.5*ca,{al:'right'});
 }
 const sp=R(intro,1.45,2.1),sa=win(intro,1.4,1.5,2.05,2.3)*a0;
 if(sa>0){const sx=WM.ox-20+(WM.w+40)*sp;L(sx,WM.oy-46,sx,WM.oy+WM.h+46,.75*sa);if(DEBUG)T('LOCK '+String(Math.round(sp*100)).padStart(3,'0'),sx+7,WM.oy-36,9,.65*sa)}
 const pa=1-R(intro,.28,.5);
 if(pa>0&&s<.05){const c=10,X=W/2,Y=H/2;L(X-c,Y,X-4,Y,.6*pa);L(X+4,Y,X+c,Y,.6*pa);L(X,Y-c,X,Y-4,.6*pa);L(X,Y+4,X,Y+c,.6*pa);if(DEBUG)T('0, 0',X+14,Y-12,9,.5*pa)}
 const la=win(s,.12,.2,.4,.48);
 if(la>0){if(DEBUG)T('Z · 7 LAYERS',WM.ox,WM.oy-34,9.5,.6*la,{w:600});T('进入数字空间',WM.ox,WM.oy-16,12,.5*la,{f:CN})}
 const ia=win(s,.56,.64,.8,.88);
 if(DEBUG&&ia>0){T('COLLAPSE',W/2+22,H/2-22,9.5,.6*ia,{w:600});T(`${NGLYPH.toLocaleString('en')} → 1`,W/2+22,H/2-6,9.5,.4*ia)}
}

/* ============ 00→01 点 → 线 ============ */
function sceneRise(s){
 if(s<.84||s>=1.95)return;
 const X=W/2,Y=H/2,rot=io(R(s,1.1,1.78)),fall=io(R(s,1.78,1.95)),Z=W*.5,D=1600;
 const pa=R(s,.84,.93);
 if(rot<=0){
  const g=ctx.createRadialGradient(X,Y,0,X,Y,34);g.addColorStop(0,ink(.5*pa));g.addColorStop(1,ink(0));ctx.fillStyle=g;ctx.fillRect(X-34,Y-34,68,68);
  dot(X,Y,2.2,pa);
  for(const [a,b] of [[.88,1.06],[.93,1.12]]){const rp=R(s,a,b);if(rp>0&&rp<1){ctx.strokeStyle=ink((1-rp)*.55);ctx.lineWidth=1;ctx.beginPath();ctx.arc(X,Y,eo(rp)*H*.36,0,6.283);ctx.stroke()}}
  anno(X+4,Y-4,X+H*.15,Y-H*.15,win(s,.94,1.0,1.08,1.13),'POINT','一切，从这里开始');
  return;
 }
 const th=rot*Math.PI/2,pt=Math.sin(rot*Math.PI)*.24,ct=Math.cos(th),st=Math.sin(th),cp=Math.cos(pt),sp=Math.sin(pt);
 const P=(x,y,z)=>{const x1=x*ct+z*st,z1=-x*st+z*ct,y1=y*cp-z1*sp,z2=y*sp+z1*cp,sc=D/Math.max(60,D+z2);return[X+x1*sc,Y+y1*sc,sc]};
 const fx=v=>lerp(X+v,SL-24+(v+Z)/(2*Z)*(SR-SL+24),fall),fy=lerp(Y,LY,fall),ga=1-fall;
 // 星点
 for(const st_ of STARS){const q=P(st_[0],st_[1],st_[2]);dot(q[0],lerp(q[1],q[1]+(fy-Y),fall),.5+st_[3]*q[2]*.7,(.12+.3*st_[3])*ga*R(s,1.1,1.25))}
 // 平行格线
 for(const [ox,oy,a] of [[0,-150,.12],[0,150,.12],[0,-300,.06],[0,300,.06],[-260,0,.07],[260,0,.07]]){
  const q0=P(ox,oy,-Z),q1=P(ox,oy,Z);L(q0[0],q0[1],q1[0],q1[1],a*ga*R(s,1.12,1.3))}
 // 主线与刻度
 if(fall<=0){
  const q0=P(0,0,-Z),q1=P(0,0,Z);L(q0[0],q0[1],q1[0],q1[1],.9,1.2);
  let i=0;for(let z=-Z;z<=Z;z+=60,i++){const mj=i%5===0,h=mj?11:4,a=P(0,-h,z),b=P(0,h,z);L(a[0],a[1],b[0],b[1],mj?.75:.4)}
  const tip=P(0,0,Z*.38);
  anno(tip[0],tip[1],tip[0]+H*.13,tip[1]-H*.13,win(s,1.56,1.66,1.86,1.94),'SEQUENCE','让想法，开始连接');
 }else{
  L(fx(-Z),fy,fx(Z),fy,.9,1.2);
  let i=0;for(let z=-Z;z<=Z;z+=60,i++){const mj=i%5===0,h=(mj?11:4)*(1-fall*.6);L(fx(z),fy-h,fx(z),fy+h,(mj?.75:.4)*(1-fall*.5))}
  const tx=fx(Z*.38);anno(tx,fy,tx+H*.13,fy-H*.13,win(s,1.56,1.66,1.86,1.94),'SEQUENCE','让想法，开始连接');
 }
 dot(fx(-Z)*fall+(1-fall)*P(0,0,-Z)[0],fy,2,.8*fall);
}

/* Models and Agents are projected in showcase.js; data is independent. */
let mx=0,my=0;

/* ============ 01.2 本地 AI：量化 + 扩散 ============ */
const DIFF={},BAYER=[0,32,8,40,2,34,10,42,48,16,56,24,50,18,58,26,12,44,4,36,14,46,6,38,60,28,52,20,62,30,54,22,3,35,11,43,1,33,9,41,51,19,59,27,49,17,57,25,15,47,7,39,13,45,5,37,63,31,55,23,61,29,53,21];
function target(u,v){
 const dx=u-.5,dy=v-.5,rr=.26,ca=Math.cos(-.34),sa=Math.sin(-.34),rx=dx*ca-dy*sa,ry=(dx*sa+dy*ca)/.3,rd=Math.hypot(rx,ry);
 const ring=rd>.36&&rd<.45?.82-(rd-.36)*4:-1;let val=.02+.035*v;
 if(dx*dx+dy*dy<rr*rr){const nx=dx/rr,ny=dy/rr,nz=Math.sqrt(Math.max(0,1-nx*nx-ny*ny)),l=clamp(-nx*.5-ny*.62+nz*.6);val=.04+.92*Math.pow(l,1.3);if(ring>0&&ry>0)val=ring}
 else if(ring>0)val=ring*(ry<0?.6:1);
 return val;
}
function diffImg(k){
 if(DIFF[k])return DIFF[k];
 const N=144,c=document.createElement('canvas');c.width=c.height=N;const g=c.getContext('2d'),im=g.createImageData(N,N),d=im.data;
 const f=k/30,amp=Math.pow(1-f,1.35),b=Math.max(1,Math.round(lerp(18,1,Math.pow(f,.5))));
 for(let y=0;y<N;y++)for(let x=0;x<N;x++){
  const bx=Math.floor(x/b),by=Math.floor(y/b),t=target((bx+.5)*b/N,(by+.5)*b/N),n=hs(bx*91.3+by*17.9+b*3.1);
  const v=t*(1-amp)+n*amp,on=v>(BAYER[(y&7)*8+(x&7)]+.5)/64,o=(y*N+x)*4;
  d[o]=LIGHT[0];d[o+1]=LIGHT[1];d[o+2]=LIGHT[2];d[o+3]=on?255:0}
 g.putImageData(im,0,0);return DIFF[k]=c;
}
const MV=[];for(let i=0;i<576;i++){const r=Math.floor(i/24),c=i%24;MV.push(clamp(.5+.3*Math.sin(c*.55+r*.31)*Math.cos(r*.42-c*.12)+(hs(i*1.7)-.5)*.55))}
const QS=[[16,'FP16','15.2 GB'],[8,'Q8_0','8.1 GB'],[4,'Q4_K_M','4.7 GB'],[2,'Q2_K','3.0 GB']],QT=[[5.26,5.36],[5.38,5.48],[5.5,5.6]];
function sceneLocal(s,time){
 if(s<4.98||s>6.36)return;
 const A=1-R(s,6.22,6.34),fa=eo(R(s,5.0,5.15))*A,x0=FX-FZ/2,y0=FY-FZ/2;
 const sz=lerp(FZ*1.3,FZ,fa);corners(FX-sz/2,FY-sz/2,sz,sz,FZ*.07,.9*fa,1.2);
 if(DEBUG){T('LOCAL · 127.0.0.1',x0,y0-14,9.5,.6*fa,{w:600});T(`${FZ|0} × ${FZ|0}`,x0+FZ,y0-14,9.5,.4*fa,{al:'right'});}
 const mq=R(s,5.12,5.24)*(1-R(s,5.6,5.7))*A,cell=FZ/24;
 let stage=0;QT.forEach(([a,b],i)=>{if(s>=a)stage=i+1});
 if(mq>0){
  for(let i=0;i<576;i++){const r=Math.floor(i/24),c=i%24,dn=Math.hypot(r-11.5,c-11.5)/16.3,ap=clamp((R(s,5.12,5.26)*1.5-dn)/.5);
   if(ap<=0)continue;if(s>5.6&&hs(i*3.3)<R(s,5.6,5.68))continue;
   let bits=16;QT.forEach(([a,b],j)=>{if(R(s,a,b)>r/24)bits=QS[j+1][0]});
   const lv=bits>=16?0:Math.pow(2,bits)-1,v=lv?Math.round(MV[i]*lv)/lv:MV[i],e=cell*(.12+.78*v)*eo(ap);
   ctx.fillStyle=ink((.35+.6*v)*mq);ctx.fillRect(x0+c*cell+(cell-e)/2,y0+r*cell+(cell-e)/2,e,e)}
  QT.forEach(([a,b],j)=>{const p=R(s,a,b);if(p>0&&p<1){const y=y0+p*FZ;L(x0-12,y,x0+FZ+12,y,.95*mq,1.2);T('→ '+QS[j+1][1],x0+FZ+18,y+3,9.5,.9*mq,{w:600})}});
  anno(x0+FZ*.2,y0+FZ*.8,x0-H*.08,y0+FZ*.8+H*.08,win(s,5.24,5.32,5.52,5.6),'WEIGHT PRECISION','权重数值的表示精度 · 非图像质量演示');
 }
 // 扩散
 const da=R(s,5.6,5.68)*A,k=Math.round(R(s,5.68,6.0)*30);
 if(da>0){ctx.save();ctx.globalAlpha=da;ctx.imageSmoothingEnabled=false;ctx.drawImage(diffImg(k),x0,y0,FZ,FZ);ctx.restore();
  ctx.fillStyle=BG;ctx.fillRect(x0+4,y0+8,96,17);T(`STEP ${String(k).padStart(2,'0')} / 30`,x0+10,y0+20,9.5,.85*da,{w:600});
  const ny=y0+FZ+30,bw=(FZ-36)/4,act=k<30?2:3,ca=R(s,5.64,5.74)*A;
  [['模型','CHECKPOINT'],['提示词','PROMPT'],['采样','KSAMPLER'],['解码','VAE DECODE']].forEach(([a,b],i)=>{const x=x0+i*(bw+12),on=i===act||(i<act&&k>0);
   RT(x,ny,bw,40,ca*(i===act?.95:.35),i===act?1.4:1);T(a,x+9,ny+17,12,ca*(i===act?1:.5),{f:CN,w:600});T(b,x+9,ny+32,8,ca*(i===act?.7:.35));
   if(i<3)L(x+bw,ny+20,x+bw+12,ny+20,ca*.5)});
  anno(x0+FZ*.8,y0+FZ*.8,x0+FZ+H*.05,y0+FZ*.8+H*.05,win(s,5.72,5.8,5.94,6.0),'DIFFUSION','从噪声开始，一步步去噪成图');
 }
}

/* ============ 01.3 Agents / MCP ============ */
function bez(p0,p1,p2,p3,t){const u=1-t;return[u*u*u*p0[0]+3*u*u*t*p1[0]+3*u*t*t*p2[0]+t*t*t*p3[0],u*u*u*p0[1]+3*u*u*t*p1[1]+3*u*t*t*p2[1]+t*t*t*p3[1]]}
function poly(pts,t){let tot=0;const ls=[];for(let i=1;i<pts.length;i++){const l=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);ls.push(l);tot+=l}
 let q=t*tot;for(let i=0;i<ls.length;i++){if(q<=ls[i]||i===ls.length-1){const f=ls[i]?clamp(q/ls[i]):0;return[lerp(pts[i][0],pts[i+1][0],f),lerp(pts[i][1],pts[i+1][1],f)]}q-=ls[i]}}
/* ============ 01 → 02 过渡 ============ */
function sceneBridge(s){
 if(s<7.44||s>=8.06)return;
 const lw=eo(R(s,7.45,7.64)),th=io(R(s,7.9,8.06)),h=lerp(1.2,H+2,th);
 ctx.fillStyle='#ecebe8';ctx.fillRect(W/2-W/2*lw,H/2-h/2,W*lw,h);
}

/* Historical Prototype 01 Global: retained for comparison only, no render caller. */
function sceneGlobal(s,time){
 if(s<8.04||s>9.46)return;
 const col=s<9.3;
 if(!col){const h=lerp(H+2,1.2,io(R(s,9.3,9.45)));ctx.fillStyle='#ecebe8';ctx.fillRect(0,H/2-h/2,W,h)}
 INK=DARK;BG='#ecebe8';
 bigTitle('02',s,8.06,8.55,'链路','NETWORK · 全球数字服务',true);
 const A=R(s,8.3,8.36)*(1-R(s,9.24,9.34)),tp=io(R(s,8.36,8.72));
 if(A<=0){INK=LIGHT;BG='#0d0d0c';return}
 const th=lerp(0,.74,tp),ph=lerp(Math.PI/2,.44,tp),ct=Math.cos(th),st=Math.sin(th),sp=Math.sin(ph),cp=Math.cos(ph);
 const a=Math.min((SR-SL)*.17,H*.25),gap=H*.11/.9*tp,cx=SL+(SR-SL)*.4,cy=H*.5;
 const P=(x,y,z)=>[cx+(x*ct-y*st)*a,cy+(x*st+y*ct)*a*sp-z*cp];
 const zs=[1.5,.5,-.5,-1.5].map(v=>v*gap);
 const LAY=[['01','号码','ClubSIM · DITO · eSIM'],['02','路径','IP · Proxy · VPS · Remote'],['03','账户','境外账户 · 虚拟卡 · 银行卡'],['04','资金','StarryBlu · Bybit · PayPal']];
 const path=[[-.65,-.55],[.2,-.6],[.55,.15],[-.15,.5],[.5,.62]];
 const poly4=(z,pts)=>{ctx.beginPath();pts.forEach((p,i)=>{const q=P(p[0],p[1],z);i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1])})};
 for(let li=3;li>=0;li--){
  const z=zs[li],la=A*(li===0?1:R(tp,.15+li*.08,.5+li*.08));if(la<=0)continue;
  poly4(z,[[-1,-1],[1,-1],[1,1],[-1,1]]);ctx.closePath();ctx.fillStyle=`rgba(236,235,232,${.82*la})`;ctx.fill();ctx.strokeStyle=ink(.8*la);ctx.lineWidth=1;ctx.stroke();
  // 网格
  for(let g=-.5;g<=.5;g+=.5){const p0=P(g,-1,z),p1=P(g,1,z),q0=P(-1,g,z),q1=P(1,g,z);L(p0[0],p0[1],p1[0],p1[1],.1*la);L(q0[0],q0[1],q1[0],q1[1],.1*la)}
  const ma=la*R(s,8.66+li*.04,8.78+li*.04);
  if(ma>0){
   if(li===0){for(let k=0;k<6;k++){const u=-.75+k*.18,q=[[u,.15],[u+.13,.15],[u+.13,.38],[u,.38]];poly4(z,q);ctx.closePath();ctx.strokeStyle=ink(.7*ma);ctx.stroke();
     if(k<Math.floor(R(s,8.8,9.0)*7)){const c=P(u+.065,.265,z);dot(c[0],c[1],1.6,ma)}}
    ['ClubSIM','DITO','eSIM'].forEach((n,k)=>{const c=P(.35+k*.2,-.25,z);dot(c[0],c[1],2.2,ma);T(n,c[0]+6,c[1]-5,8,ma*.6)})}
   if(li===1){const r=[[-.8,.6],[-.35,.1],[.05,.35],[.4,-.3],[.8,-.15]];poly4(z,r);ctx.strokeStyle=ink(.8*ma);ctx.lineWidth=1.3;ctx.stroke();ctx.lineWidth=1;
    ['IP','Proxy','VPS','Remote'].forEach((n,k)=>{const c=P(r[k+1][0],r[k+1][1],z);RT(c[0]-3,c[1]-3,6,6,ma);T(n,c[0]+7,c[1]+12,8,ma*.6)})}
   if(li===2){const cw=.62,chh=cw/1.586;poly4(z,[[-.8,-.1],[-.8+cw,-.1],[-.8+cw,-.1+chh],[-.8,-.1+chh]]);ctx.closePath();ctx.strokeStyle=ink(.85*ma);ctx.stroke();
    ctx.setLineDash([3,3]);poly4(z,[[-.62,-.4],[-.62+cw,-.4],[-.62+cw,-.4+chh],[-.62,-.4+chh]]);ctx.closePath();ctx.stroke();ctx.setLineDash([]);
    const c=P(.3,.55,z);T('VIRTUAL / PHYSICAL',c[0],c[1],8,ma*.55)}
   if(li===3){ctx.setLineDash([10,6]);ctx.lineDashOffset=-time*30;[.5,1.2,2.4,.8,1.6].forEach((w,k)=>{const v=-.7+k*.32,p0=P(-.95,v,z),p1=P(.95,v,z);L(p0[0],p0[1],p1[0],p1[1],.7*ma,w)});ctx.setLineDash([]);ctx.lineDashOffset=0}
  }
  // 标签
  const lab=la*R(s,8.58+li*.04,8.7+li*.04),rv=P(1,-1,z),lx=Math.max(rv[0],P(1,1,z)[0])+34;
  if(lab>0){L(rv[0]+4,rv[1],lx-6,rv[1],.4*lab);T(LAY[li][0],lx,rv[1]-4,9.5,lab*.6,{w:600});T(LAY[li][1],lx+26,rv[1]+1,16,lab,{f:CN,w:700});T(LAY[li][2],lx,rv[1]+20,9,lab*.6)}
 }
 // 穿层路径：你 → 服务
 const pp=R(s,8.76,9.06);
 if(pp>0){const pts=[P(path[0][0],path[0][1],zs[0]+gap*.5)];
  for(let li=0;li<4;li++){pts.push(P(path[li][0],path[li][1],zs[li]));pts.push(P(path[li+1][0],path[li+1][1],zs[li]))}
  pts.push(P(path[4][0],path[4][1],zs[3]-gap*.5));
  ctx.strokeStyle=ink(A);ctx.lineWidth=2;ctx.beginPath();const N=120;for(let k=0;k<=N*pp;k++){const q=poly(pts,k/N);k?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1])}ctx.stroke();ctx.lineWidth=1;
  for(let k=1;k<pts.length-1;k++)if(k/(pts.length-1)<=pp)dot(pts[k][0],pts[k][1],2.5,A);
  const s0=pts[0],s1=pts[pts.length-1];dot(s0[0],s0[1],4,A);T('你',s0[0]-12,s0[1]+6,16,A,{f:CN,w:700,al:'right'});T('YOU',s0[0]-12,s0[1]+22,8.5,A*.5,{al:'right'});
  if(pp>=1){ctx.fillStyle=ink(A);ctx.fillRect(s1[0]-5,s1[1]-5,10,10);T('服务',s1[0]+14,s1[1]+6,16,A,{f:CN,w:700});T('AI · 订阅 · 平台',s1[0]+14,s1[1]+22,8.5,A*.55);
   const q=poly(pts,(time*.25)%1);dot(q[0],q[1],3,A)}
 }
 anno(P(-1,1,zs[3])[0],P(-1,1,zs[3])[1],P(-1,1,zs[3])[0]-H*.08,P(-1,1,zs[3])[1]+H*.08,win(s,8.82,8.92,9.18,9.26),'NETWORK','四层叠起来，才连成一条路径');
 INK=LIGHT;BG='#0d0d0c';
}

/* ============ 03 场 ============ */
const PEW=[9.88,10.12,10.32];
function peFill(s,k){return R(s,PEW[k]-.13,PEW[k]+.03)}
function sceneField(s,time){
 if(s<9.44)return;
 INK=LIGHT;
 bigTitle('03',s,9.44,9.86,'场','FIELD · 个人',false);
 const N=46,spread=io(R(s,9.45,9.74)),flat=io(R(s,10.55,10.8)),shr=io(R(s,10.8,10.95));
 const act=[0,1,2].map(k=>peFill(s,k)*(k<2?1-peFill(s,k+1):1-R(s,10.48,10.6)));
 const peA=win(s,9.72,9.84,10.5,10.6);
 if(shr<=0){
  for(let i=0;i<N;i++){
   const b0=H*.07+i*(H*.86/(N-1)),base=lerp(lerp(H/2,b0,spread),H/2,flat),amp=H*.011*(1-flat)*(.6+.4*Math.sin(i*.7));
   let la=(.14+.22*hs(i*2.3))*R(s,9.45,9.5);
   ctx.beginPath();
   for(let x=0;x<=W+12;x+=12){
    let y=base+amp*(Math.sin(x*.004+i*.33+time*.25)*.6+Math.sin(x*.0093-i*.21-time*.17)*.4);
    for(let k=0;k<3;k++){const e=PE[k];if(!e||act[k]<=0)continue;
     const d=(base-e.y)/(e.h*.95),gx=Math.exp(-Math.pow(Math.max(0,Math.abs(x-(e.x+e.w/2))-e.w/2)/150,2));
     y+=e.h*.95*Math.tanh(d*2.2)*Math.exp(-d*d*.35)*gx*act[k]*peA*(1-flat)}
    x?ctx.lineTo(x,y):ctx.moveTo(x,y)}
   ctx.strokeStyle=ink(la*(1+flat*1.5));ctx.lineWidth=1;ctx.stroke();
  }
  if(DEBUG&&peA>0){const k=act.indexOf(Math.max(...act));T(`FIELD · ${N} LINES`,SR,H*.8,9,.5*peA,{al:'right'});T(`03.${k+1} / 3`,SR,H*.8-16,9,.5*peA,{al:'right',w:600})}
 }else{
  const hw=W/2*(1-shr);if(hw>1)L(W/2-hw,H/2,W/2+hw,H/2,.9,1.2);
  const pa=R(shr,.85,1),pul=(time*.6)%1;
  if(pa>0){const g=ctx.createRadialGradient(W/2,H/2,0,W/2,H/2,30);g.addColorStop(0,ink(.45*pa));g.addColorStop(1,ink(0));ctx.fillStyle=g;ctx.fillRect(W/2-30,H/2-30,60,60);dot(W/2,H/2,2.2,pa);
   ctx.strokeStyle=ink((1-pul)*.4*pa);ctx.beginPath();ctx.arc(W/2,H/2,8+pul*60,0,6.283);ctx.stroke();
   if(DEBUG)T('回到起点',W/2+18,H/2-14,9.5,.55*pa,{f:CN})}
 }
}

/* ============ UI ============ */
const E=id=>$(id),hTL=E('hTL'),hTR=E('hTR'),hBL=E('hBL'),hBR=E('hBR'),hint=E('hint'),rail=E('rail'),rfill=E('rfill'),dbg=E('dbg');
const chAI=E('chAI'),chGL=E('chGL'),chPE=E('chPE'),enM=E('enModels'),enL=E('enLocal'),enA=E('enAgents'),enG=E('enGlobal'),b1=E('b1'),pe=E('pe'),endEl=E('end');
const b2=[...document.querySelectorAll('#bridge .l2 span')],peT=[...document.querySelectorAll('#pe .t')],railB=[...rail.querySelectorAll('button')],aiLi=[...chAI.querySelectorAll('li')];
function show(el,a,dy=0){a=clamp(a);a=Math.round(a*1000)/1000;if(el._a===a&&el._dy===dy)return;el._a=a;el._dy=dy;
 el.style.opacity=a;el.style.visibility=a>.01?'visible':'hidden';el.style.transform=dy?`translateY(${dy.toFixed(1)}px)`:'';}
const setT=(el,t)=>{if(el._t!==t){el._t=t;el.textContent=t}};
function ui(s,intro,scrollS=s,world={active:false,g:0}){
 const hud=AT!==null||REDUCED?1:R(intro,1.7,2.8),old=legacyLater(s),M=TIMELINE.models,A=TIMELINE.agents;
 show(hTL,hud);show(hTR,hud);show(hBR,hud*(1-R(s,.03,.14)));show(rail,hud);show(hBL,hud*(1-R(s,.1,.28)));
 hint.style.opacity=1-R(s,.02,.12);
 const section=world.active?'global':s<M.start?'open':s<TIMELINE.local.start?'models':s<A.start?'local':s<TIMELINE.bridge.start?'agents':s<TIMELINE.global.start?'bridge':s<TIMELINE.personal.start?'global':'personal';
 const ri=world.active?2:s<M.start?0:s<TIMELINE.global.start?1:s<TIMELINE.personal.start?2:3;
 railB.forEach((b,i)=>{b.classList.toggle('on',i===ri);if(i===ri)b.setAttribute('aria-current','location');else b.removeAttribute('aria-current');});
 rfill.style.height=((rail.offsetHeight+28)*scrollS/TOTAL).toFixed(1)+'px';
 show(chAI,win(s,2.36,2.44,TIMELINE.bridge.start,TIMELINE.bridge.start+.1));
 aiLi.forEach((l,i)=>{const on=i===(section==='models'?0:section==='local'?1:2);l.classList.toggle('on',on);const a=l.querySelector('a');if(on)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});
 show(chGL,0);show(chPE,world.active?0:win(old,9.82,9.88,10.62,10.72));
 show(enM,win(s,M.formed,M.formed+.1,M.holdEnd,M.end-.1));
 show(enL,win(s,TIMELINE.local.start+.25,TIMELINE.local.start+.35,A.start,A.start+.12));
 show(enA,win(s,A.formed,A.formed+.1,A.holdEnd,A.end-.1));
 show(enG,0);
 show(b1,0); // One shared Canvas entry caption owns Bridge and VIA.
 b2.forEach(el=>show(el,0));
 show(pe,world.active?0:win(old,9.72,9.84,10.5,10.6));peT.forEach((el,k)=>{const v=(peFill(old,k)*100).toFixed(1)+'%';if(el._p!==v){el._p=v;el.style.setProperty('--p',v)}});
 show(endEl,world.active?0:R(old,10.95,11.05));
 document.querySelector('.fallback-word').style.opacity=1-R(s,.1,.5);
}

/* ============ 尺寸 / 噪点 ============ */
function resize(){
 W=innerWidth;H=innerHeight;DPR=Math.min(2,devicePixelRatio||1);UNIT=H;
 for(const c of [glc,cv]){c.width=Math.round(W*DPR);c.height=Math.round(H*DPR)}
 ctx.setTransform(DPR,0,0,DPR,0,0);
 $('track').style.height=(TOTAL*UNIT+H)+'px';
 for(const k in gcache)delete gcache[k];layout();buildPoints();showcase.resize();globalHome.resize();
}
function sceneVoid(s){
 if(s>=TIMELINE.global.start&&s<TIMELINE.global.start+1.26)return;
 // Seeded, sparse, scroll-parallax only. No blinking or random frame noise.
 for(let i=0;i<48;i++){const d=.3+hs(i*3)*.7,x=hs(i+80)*W,y=((hs(i+250)*H-s*H*.014*d)%H+H)%H;dot(x,y,.35+hs(i+120)*.35,.045+hs(i+33)*.085)}
}
const showcase=window.NFShowcase({ctx,viewport:()=>({W,H,SL,SR,FX,FY,FZ}),line:L,dot,text:T,clamp,lerp,range:R,ease:io,timeline:TIMELINE});

/* ============ 渲染 ============ */
let curBG='';
function setBackground(bg){
 BG=bg;if(bg===curBG)return;curBG=bg;
 stage.style.background=bg;document.documentElement.style.background=bg;document.body.style.background=bg;
}
const globalHome=window.NFGlobalHome({clock:CLOCK,setBackground,kick:()=>schedule()});
function render(scrollS,time,intro,vel){
 const s=CLOCK.toScene(scrollS),old=legacyLater(s),world=globalHome.render(scrollS,time);
 INK=LIGHT;ctx.clearRect(0,0,W,H);glc.style.visibility=world.active?'hidden':'visible';
 if(world.active){
  // Only the final matching line field overlaps; no second Global renderer runs.
  if(world.personalUnderlay){BG='#050505';sceneField(CLOCK.globalWorld.fieldLegacyStart,time);}
  showcase.draw(s);ui(s,intro,scrollS,world);return;
 }
 setBackground('#050505');document.body.classList.remove('on-white');
 drawGL(s,time,intro,vel,mouse);sceneVoid(s);
 sceneOpen(s,intro);sceneRise(s);
 bigTitle('01',s,1.85,2.42,'序列','SEQUENCE · AI',false);
 if(s>=TIMELINE.local.start&&s<=TIMELINE.local.end)sceneLocal(legacyLocal(s),time);
 showcase.draw(s);
 if(s>=TIMELINE.personal.start)sceneField(old,time);
 ui(s,intro,scrollS,world);
}

/* ============ 主循环与交互 ============ */
const mouse={x:-9999,y:-9999,on:0};
let sd=0,userMoved=false,last=performance.now(),T0=last,vel=0,anim=null,fpsA=60,raf=0,frozen=false,debugClock=null;
function schedule(){if(!raf&&!frozen)raf=requestAnimationFrame(frame);}
function goTo(s){userMoved=true;if(REDUCED){anim=null;sd=s;scrollTo(0,s*UNIT);return;}const y0=scrollY,y1=s*UNIT,d=Math.abs(y1-y0)/UNIT;anim={y0,y1,t0:performance.now(),dur:clamp(d*240,500,2600)}}
function frame(now){
 raf=0;if(frozen)return;
 const dt=Math.min(.05,Math.max(.001,(now-last)/1000));last=now;fpsA=lerp(fpsA,1/dt,.05);
 if(anim){const t=R(now,anim.t0,anim.t0+anim.dur);scrollTo(0,lerp(anim.y0,anim.y1,io(t)));if(t>=1)anim=null}
 const tgt=clamp((AT!==null&&!userMoved)?AT:scrollY/UNIT,0,TOTAL),prev=sd;
 sd=REDUCED?tgt:sd+(tgt-sd)*(1-Math.exp(-dt*7.5));if(Math.abs(tgt-sd)<1e-4)sd=tgt;
 vel=lerp(vel,(sd-prev)/dt,.2);
 const time=Math.max(0,(now-T0)/1000),intro=FIXIT!==null?FIXIT:((AT!==null&&AT>0)||REDUCED)?10:time;
 const tx=mouse.on?(mouse.x/W-.5)*2:0,ty=mouse.on?(mouse.y/H-.5)*2:0;mx=lerp(mx,tx,.06);my=lerp(my,ty,.06);
 render(sd,REDUCED?0:debugClock!==null?debugClock:Q.has('time')?Number(Q.get('time')):time,intro,REDUCED?0:vel);
 if(DEBUG)dbg.textContent=`s ${sd.toFixed(3)} · ${fpsA.toFixed(0)} fps · ${NPTS} pts`;
 schedule();
}
addEventListener('mousemove',e=>{if(!REDUCED){mouse.x=e.clientX;mouse.y=e.clientY;mouse.on=1}});
document.addEventListener('mouseleave',()=>{mouse.on=0});
const stop=()=>{anim=null;userMoved=true};
addEventListener('wheel',stop,{passive:true});addEventListener('touchstart',stop,{passive:true});
addEventListener('keydown',e=>{
 if(e.target.closest('input,textarea,select,[contenteditable],dialog')||e.ctrlKey||e.metaKey)return;
 const local=globalHome.state.active&&!e.altKey&&['1','2','3','4'].includes(e.key);
 const m=local?'global-'+['number','network','accounts','cards'][Number(e.key)-1]:({'0':'open','1':'models','2':'global','3':'personal'})[e.key];
 if(m){e.preventDefault();userMoved=true;navigate(m);}else if(!e.target.closest('button,a')&&['ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' '].includes(e.key))anim=null;
});
function navigate(key){if(!(key in STOP))return;history.pushState(null,'','#'+key);goTo(STOP[key]);}
function fromHash(){const key=location.hash.slice(1);if(key==='ai')return 'models';if(key==='via')return 'global';const guide=window.NF_GLOBAL_GUIDES.find(g=>'guide-'+g.id===key);return guide?'global-'+guide.domain:key;}
function restoreHash(){const key=fromHash();if(key in STOP)goTo(STOP[key]);else goTo(0);const guide=location.hash.match(/^#guide-(.+)$/);if(guide)globalHome.openGuide(guide[1]);}
addEventListener('popstate',restoreHash);addEventListener('hashchange',restoreHash);
let toastT=0;const toast=document.createElement('div');
toast.style.cssText='position:absolute;left:50%;bottom:30px;transform:translateX(-50%);font:500 11px '+MONO+';letter-spacing:.1em;padding:9px 14px;border:1px solid #fff;opacity:0;transition:opacity .3s;white-space:nowrap';
$('ui').appendChild(toast);
document.addEventListener('click',e=>{
 const guide=e.target.closest('[data-guide]');if(guide&&globalHome.openGuide(guide.dataset.guide)){e.preventDefault();return;}
 const g=e.target.closest('[data-go]');if(g){e.preventDefault();navigate(g.dataset.go);return}
 if(e.target.closest('#rewind')){e.preventDefault();navigate('open');return}
 const a=e.target.closest('.entry,#pe a');if(a){e.preventDefault();const t=(a.querySelector('.t')||a).textContent.trim();toast.textContent=`「${t}」子页面将在后续原型中搭建`;toast.style.opacity=1;clearTimeout(toastT);toastT=setTimeout(()=>toast.style.opacity=0,1800)}
});
addEventListener('resize',()=>{const s=sd;anim=null;resize();scrollTo(0,s*UNIT)});
if(DEBUG)dbg.style.display='block';
if('scrollRestoration' in history)history.scrollRestoration='manual';
document.documentElement.classList.toggle('no-gl',!gl);
glc.addEventListener('webglcontextlost',e=>{e.preventDefault();document.documentElement.classList.add('no-gl')});
glc.addEventListener('webglcontextrestored',()=>{initGL();buildPoints();document.documentElement.classList.remove('no-gl')});
initGL();resize();
let restored=null;
const positionKey=()=>location.pathname+location.search+location.hash;
try{
 const saved=JSON.parse(sessionStorage.getItem('nf-prototype-02-position'));
 const navigation=performance.getEntriesByType('navigation')[0]?.type;
 if(saved&&saved.url===positionKey()&&saved.total===TOTAL&&['reload','back_forward'].includes(navigation)&&Number.isFinite(saved.s))restored=saved.s;
}catch{}
const initial=AT!==null?AT:restored!==null?restored:(fromHash() in STOP?STOP[fromHash()]:0);
sd=clamp(initial,0,TOTAL);scrollTo(0,sd*UNIT);
if(location.hash.startsWith('#guide-'))queueMicrotask(()=>globalHome.openGuide(location.hash.slice(7)));
addEventListener('pagehide',e=>{if(!e.persisted)globalHome.destroy();try{sessionStorage.setItem('nf-prototype-02-position',JSON.stringify({s:scrollY/UNIT,url:positionKey(),total:TOTAL}))}catch{}});
if(DEBUG)window.NF_DEBUG={get state(){return {s:sd,sceneS:CLOCK.toScene(sd),total:TOTAL,target:scrollY/UNIT,points:NPTS,glyphPoints:NGLYPH,dpr:DPR,webgl:!!gl,bufferBytes:NPTS*36,canvas:[glc.width,glc.height],stops:STOP,navigating:!!anim,global:globalHome.state};},
 seek(s){userMoved=true;anim=null;sd=clamp(s,0,TOTAL);scrollTo(0,sd*UNIT);globalHome.invalidate();render(sd,debugClock??Number(Q.get('time')||10),FIXIT??10,0);},
 freeze(on=true){frozen=on;if(frozen){if(raf)cancelAnimationFrame(raf);raf=0;}else{last=performance.now();schedule();}return frozen;},
 advance(sec,fps=60){frozen=true;if(raf)cancelAnimationFrame(raf);raf=0;if(debugClock===null)debugClock=Number(Q.get('time')||10);for(let i=0;i<Math.round(sec*fps);i++){debugClock+=1/fps;render(sd,debugClock,10,0);}return globalHome.state;},
 select(id){return globalHome.request(id);},navigate,positions:showcase.positions};
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>{for(const k in gcache)delete gcache[k];layout()});
schedule();
})();
