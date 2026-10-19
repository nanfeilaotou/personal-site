/* NANFEILAOTOU · Global「经由 / VIA」原型
 * 唯一进度源：NF_GLOBAL.render(g,time)。g ∈ [0,6.8] 为 Global 局部进度（1 = 一屏），
 * time 只用于环境动画与换卡局部状态。Canvas 2D 场景 + WebGL 卡片（global-card-adapter.js）
 * + 品牌 DOM 层（正常合成）+ HUD DOM（difference）。 */
(()=>{
'use strict';
const Q=new URLSearchParams(location.search),DEBUG=Q.has('debug');
const REDUCED=Q.has('reduced')||matchMedia('(prefers-reduced-motion: reduce)').matches;
const ASSET=new URL('../../assets/',document.currentScript.src).href;
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),mix=(a,b,t)=>a+(b-a)*t,R=(x,a,b)=>clamp((x-a)/(b-a));
const io=t=>t*t*(3-2*t),eo=t=>1-Math.pow(1-t,3),win=(x,a,b,c,d)=>R(x,a,b)*(1-R(x,c,d));
const hs=n=>{const s=Math.sin(n*127.1+311.7)*43758.5453;return s-Math.floor(s)};
const DEG=Math.PI/180,TAU=Math.PI*2;
const CN='"PingFang SC","Hiragino Sans GB","Microsoft YaHei","Noto Sans SC","Noto Sans CJK SC",sans-serif';
const MONO='"JetBrains Mono","SF Mono",Menlo,Consolas,"Liberation Mono",monospace';
const BLACK='#050505',WHITE='#ecebe8',LIGHT=[237,237,235],DARK=[18,18,17];
const LEN=6.8;
const STOPS=Object.freeze({number:1.40,network:3.30,accounts:4.25,cards:6.12});
const ZONE=Object.freeze({in:5.78,out:6.30});            // 换卡只在稳定区接受
const F=1400;                                             // 拓扑世界焦距

/* ---------- 内容 ---------- */
const DOMAINS=[
 {key:'number',no:'01',title:'号码',en:'CONNECTIVITY',win:[.72,1.64],desc:'以 ClubSIM（香港）与 SMART（菲律宾）为例，理解境外号码与通讯、账号服务之间的关系。注册与验证条件以各平台官方说明为准。',link:'海外号码与通信指南',href:'#guide-connectivity'},
 {key:'network',no:'02',title:'网络',en:'NETWORK',win:[2.24,3.47],desc:'从客户端、代理节点到远程服务器，路由决定一次请求经由哪条路径抵达。四个客户端并列，不分先后。',link:'网络工具与连接指南',href:'#guide-network'},
 {key:'accounts',no:'03',title:'账户与钱包',en:'ACCOUNTS & WALLETS',win:[3.74,4.52],desc:'账户资金服务与钱包快捷支付是两类不同的工具。并列展示，不代表互通、充值或绑卡关系。',link:'账户与资金链路指南',href:'#guide-accounts'},
 {key:'cards',no:'04',title:'支付卡片',en:'PAYMENT CARDS',win:[5.56,6.34],desc:'三种代表性场景：海外实体卡、国内万事达借记卡、数字资产支付卡。选择侧卡，让数据流重组为新的卡面。',link:'支付与银行卡指南',href:'#guide-cards'}
];
const BRANDS=[
 {id:'clubsim',name:'ClubSIM',cap:'香港 · +852',src:'global/brands/clubsim.png',w:96,h:40,d:'number'},
 {id:'smart',name:'SMART',cap:'菲律宾 · +63',src:'global/brands/smart.png',w:104,h:27,d:'number'},
 {id:'whatsapp',name:'WhatsApp',cap:'主要通讯',src:'global/social/whatsapp.svg',w:38,h:38,d:'number'},
 {id:'telegram',name:'Telegram',cap:'主要通讯',src:'global/social/telegram.svg',w:38,h:38,d:'number'},
 {id:'line',name:'LINE',cap:'主要通讯',src:'global/social/line.png',w:38,h:38,d:'number'},
 {id:'instagram',name:'Instagram',cap:'辅助社交',src:'global/social/instagram.png',w:26,h:26,d:'number'},
 {id:'facebook',name:'Facebook',cap:'辅助社交',src:'global/social/facebook.png',w:26,h:26,d:'number'},
 {id:'clash',name:'Clash Verge Rev',cap:'',src:'global/network/clash-verge-rev.png',w:40,h:40,d:'network'},
 {id:'flclash',name:'FlClash',cap:'',src:'global/network/flclash.svg',w:40,h:40,d:'network'},
 {id:'shadowrocket',name:'Shadowrocket',cap:'',src:'global/network/shadowrocket.jpg',w:40,h:40,d:'network'},
 {id:'v2rayn',name:'v2rayN',cap:'',src:'global/network/v2rayn.png',w:40,h:40,d:'network'},
 {id:'ifast',name:'iFAST Global Bank',cap:'银行 · BANK',src:'global/brands/ifast.svg',w:70,h:34,d:'accounts'},
 {id:'wise',name:'Wise',cap:'金融科技 · FINTECH',src:'global/brands/wise.svg',w:84,h:20,d:'accounts',crop:true},
 {id:'paypal',name:'PayPal',cap:'支付平台 · PAYMENTS',src:'global/brands/paypal.svg',w:30,h:30,d:'accounts'},
 {id:'applepay',name:'Apple Pay',cap:'钱包 · WALLET',src:'global/brands/apple-pay.svg',w:58,h:37,d:'accounts'},
 {id:'googlepay',name:'Google Pay',cap:'钱包 · WALLET',src:'global/brands/google-pay.svg',w:58,h:39,d:'accounts'}
];
const CARDS=[
 {id:'starryblu',name:'StarryBlu',short:'StarryBlu',scene:'海外实体卡场景',src:ASSET+'cards/public/starryblu-card-sanitized.png',aspect:1010/608,maxWidth:505,note:'官网同时提及实体卡与虚拟卡；开放地区与条件以官方说明为准。'},
 {id:'cmb',name:'招商银行 万事达人民币 IC 借记卡（普卡）',short:'招商银行 · 万事达借记卡',scene:'国内万事达借记卡场景',src:ASSET+'cards/cmb-mastercard-blue.png',aspect:581/373,maxWidth:290.5,note:'人民币借记卡，不是全币种信用卡。'},
 {id:'bybit',name:'Bybit Card',short:'Bybit Card',scene:'数字资产虚拟支付场景',src:ASSET+'cards/bybit-card.png',aspect:1010/630,maxWidth:505,note:'官方同时提供虚拟卡与实体卡，地区与资格有限制。'}
];
const CARD_BY=Object.fromEntries(CARDS.map(c=>[c.id,c]));

/* ---------- 模块状态 ---------- */
let HOST={};
let el={},ctx=null,W=1,H=1,DPR=1,mobile=false,VX=0,VY=0,E=800,SWA=.17,CARD={x:0,y:0},ACC={x:0,y:0};
let grid=null,paths=[],O={x:0,y:0},X={x:0,y:0},CLIENTS=[],VPS={x:0,y:0},blockDots=[];
let stage=null,ready=false,hover=null,lastTime=null,INK=LIGHT,bgNow='',confirmed='starryblu',slots={left:'cmb',right:'bybit'};
let cardDom={},brandEl={},placed={},lastG=0,stats={frames:0,ms:0};
const portrait=()=>HOST.portraitLayout?.()||null;
const ink=a=>`rgba(${INK[0]},${INK[1]},${INK[2]},${a})`;
const rgba=(c,a)=>`rgba(${c[0]},${c[1]},${c[2]},${a})`;

/* ---------- 2D 工具 ---------- */
function L(x1,y1,x2,y2,a=1,w=1){if(a<=.004)return;ctx.strokeStyle=ink(a);ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();}
function Tx(s,x,y,sz=10,a=1,o={}){if(a<=.005)return;ctx.font=`${o.w||500} ${sz}px ${o.f||MONO}`;ctx.fillStyle=o.c||ink(a);if(o.c)ctx.globalAlpha=a;ctx.textAlign=o.al||'left';ctx.textBaseline=o.bl||'alphabetic';ctx.letterSpacing=(o.ls!=null?o.ls:(o.f===CN?0:sz*.08))+'px';if(o.bg){const w=ctx.measureText(s).width,x0=ctx.textAlign==='right'?x-w:ctx.textAlign==='center'?x-w/2:x,fs=ctx.fillStyle,ga=ctx.globalAlpha;ctx.globalAlpha=1;ctx.fillStyle=o.bg;ctx.fillRect(x0-3,y-sz,w+6,sz+4);ctx.fillStyle=fs;ctx.globalAlpha=ga;}ctx.fillText(s,x,y);ctx.globalAlpha=1;}
function dot(x,y,r,a){if(a<=.004)return;ctx.fillStyle=ink(a);ctx.fillRect(x-r,y-r,r*2,r*2);}
function path(pts,a,w=1,close=false,dash=null){if(a<=.004||pts.length<2)return;ctx.strokeStyle=ink(a);ctx.lineWidth=w;if(dash)ctx.setLineDash(dash);ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));if(close)ctx.closePath();ctx.stroke();if(dash)ctx.setLineDash([]);}
function ticks(x,y,w,h,l,a){if(a<=.004)return;ctx.strokeStyle=ink(a);ctx.lineWidth=1;ctx.beginPath();for(const [px,py,sx,sy] of [[x,y,1,1],[x+w,y,-1,1],[x,y+h,1,-1],[x+w,y+h,-1,-1]]){ctx.moveTo(px+sx*l,py);ctx.lineTo(px,py);ctx.lineTo(px,py+sy*l);}ctx.stroke();}

/* ---------- 拓扑世界相机：翻面 / 网络 / 账户 / 下潜共用 ---------- */
let NS=1; // 网络阶段缩放：移动端按宽度缩小，保证 ORIGIN→REMOTE 全部在屏内
const NF_TUNE={psi:18,drift:3,sw:.82,dx:0,dy:0}; // 账户阶段相机：桌面 / 移动端在 layout() 中设定
function cam(g){
 const pm=portrait(),f0=io(R(g,1.72,2.08)),a=io(R(g,pm?2.08:2.45,pm?2.38:2.92)),z=io(R(g,3.48,3.88)),d=io(R(g,4.54,4.80));
 let phi=g<2.2?90*(1-f0):pm?55*io(R(g,2.2,2.52)):55*a;phi=mix(phi,48,z);phi=mix(phi,90,d);
 const T=NF_TUNE;let psi=mix(25*a,T.psi,z)+T.drift*R(g,3.88,4.5);psi=mix(psi,0,d);
 let sw=mix(mix(1,NS,a),SWA*T.sw,z);sw=mix(sw,SWA*.6,d);
 let cx=mix(W/2,VX,a),cy=mix(VY,pm?pm.state.network.cy:mobile?H*.44:H*.56,a);cx=mix(cx,ACC.x+T.dx*W,z);cy=mix(cy,ACC.y+T.dy*H,z);cx=mix(cx,CARD.x,d);cy=mix(cy,CARD.y,d);
 return {phi,psi,sw,cx,cy,ct:Math.cos(phi*DEG),st:Math.sin(phi*DEG),cp:Math.cos(psi*DEG),sp:Math.sin(psi*DEG)};
}
function cs(C,x,y,h=0){x*=C.sw;y*=C.sw;h*=C.sw;const x1=x*C.cp-y*C.sp,y1=x*C.sp+y*C.cp;return [x1,y1*C.ct-h*C.st,-y1*C.st-h*C.ct];}
function pj(C,p){const s=F/(F+p[2]);return [C.cx+p[0]*s,C.cy+p[1]*s,s];}
function P(C,x,y,h=0){const p=cs(C,x,y,h);return p[2]<-F*.8?null:pj(C,p);}
const ZN=-F*.7;
function clipNear(pts){const out=[];for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length],ia=a[2]>=ZN,ib=b[2]>=ZN;if(ia)out.push(a);if(ia!==ib){const t=(ZN-a[2])/(b[2]-a[2]);out.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,ZN]);}}return out;}
function seg(C,x1,y1,x2,y2,a,w=1,h1=0,h2=h1){let p=cs(C,x1,y1,h1),q=cs(C,x2,y2,h2);if(p[2]<ZN&&q[2]<ZN)return;if(p[2]<ZN||q[2]<ZN){const t=(ZN-p[2])/(q[2]-p[2]),m=[p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t,ZN];if(p[2]<ZN)p=m;else q=m;}const A=pj(C,p),B=pj(C,q);L(A[0],A[1],B[0],B[1],a,w);}
function sheet(C,S){const pts=clipNear([[-S,-S],[S,-S],[S,S],[-S,S]].map(([x,y])=>cs(C,x,y)));if(pts.length<3)return null;return pts.map(p=>pj(C,p));}
// Read-only surface geometry; the same camera / paper used by the renderer.
function whiteSurface(g,C){return (g>=2.0&&C.phi<=68&&g<4.5)||(g>=2.12&&g<4.5);}
function surfaceGeometry(){const g=lastG,C=cam(g);return {baseTone:whiteSurface(g,C)?1:0,whitePolygon:((g>=1.70&&g<2.2)||(g>=4.5&&g<4.84))?sheet(C,E*40):null};}
function unproject(C,x,y){const dy=y-C.cy,v=dy/(C.ct+dy*C.st/F),sc=1/(1-v*C.st/F),u=(x-C.cx)/sc;return {x:(u*C.cp+v*C.sp)/C.sw,y:(-u*C.sp+v*C.cp)/C.sw};}
function ground(C,pts){const out=[];for(const [x,y] of pts){const p=P(C,x,y);if(!p)return null;out.push(p);}return out;}

/* ---------- 布局 ---------- */
function layout(){
 LPLAN=null;
 Object.assign(NF_TUNE,W<=760?{psi:45,drift:0,sw:.85,dx:0,dy:.08}:{psi:18,drift:3,sw:.82*Math.min(1,((H/W)/.625)**2),dx:0,dy:.035-Math.max(0,.625-H/W)*.5});
 mobile=W<=760;NS=mobile?Math.min(1,W/(Math.max(W,H)*.62)*.66):Math.min(1,(H/W)/.625);VX=mobile?W*.55:W*.57;VY=mobile?H*(.42+.03*Math.min(1,Math.max(0,(844-H)/104))):H*.5; /* 矮屏手机略下移号码线，给上方 WhatsApp/LINE 留出与运营商 Logo 的间距 */E=Math.max(W,H)*.62;SWA=mobile?.13:.165;
 CARD={x:mobile?W*.5:W*.52,y:mobile?H*.34:H*.45};ACC={x:mobile?W*.5:W*.56,y:mobile?H*.44:H*.53};
 O={x:-.30*E,y:.22*E};X={x:.40*E,y:-.42*E};VPS={x:.48*E,y:.16*E};
 const cr=(mobile?.29:.19)*E; // 移动端网络整体缩小，客户端环半径相应放大，避免 Logo 互相遮挡
 CLIENTS=[45,135,225,315].map((a,i)=>({id:['clash','flclash','shadowrocket','v2rayn'][i],x:O.x+Math.cos(a*DEG)*cr,y:O.y+Math.sin(a*DEG)*cr}));
 const pm=portrait();if(pm){const m=pm.state,r=m.network;Object.assign(NF_TUNE,{drift:0,dy:0});NS=Math.max(r.w/(2*E),r.h/(2*E*Math.cos(55*DEG)))*1.08;VX=r.cx;VY=m.number.y+88;ACC={x:m.accounts.cx,y:m.accounts.cy};CARD={x:m.card.x,y:m.card.y};const C=cam(STOPS.network);O=unproject(C,r.cx,r.y+r.h*.59);X=unproject(C,r.x+r.w*.72,r.bottom-12);VPS=unproject(C,r.x+r.w*.28,r.bottom-12);CLIENTS=['clash','flclash','shadowrocket','v2rayn'].map((id,i)=>({id,...unproject(C,r.x+r.w*(i%2?.75:.25),r.y+(i<2?22:96)+44)}));}
 const N=50,c=2*E/N,pts=[];
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const k=i+j*N,gx=-E+(i+.5)*c,gy=-E+(j+.5)*c,jx=(hs(k*1.31)-.5)*c*.72,jy=(hs(k*2.77+5)-.5)*c*.72,x=gx+jx,y=gy+jy;pts.push({gx,gy,x,y,d:metric(x,y),s:hs(k*.73)});}
 grid={N,c,pts};
 paths=CLIENTS.map((cl,i)=>{const p=astar(nearest(cl.x,cl.y),nearest(X.x,X.y),i+1);const ptsP=[[cl.x,cl.y],...p.map(k=>[pts[k].x,pts[k].y]),[X.x,X.y]];let len=0;const acc=[0];for(let k=1;k<ptsP.length;k++){len+=Math.hypot(ptsP[k][0]-ptsP[k-1][0],ptsP[k][1]-ptsP[k-1][1]);acc.push(len);}return {pts:ptsP,acc,len};});
 blockDots=[];const step=2.5*E;
 for(let bj=-3;bj<=3;bj++)for(let bi=-4;bi<=4;bi++){if(!bi&&!bj)continue;for(let k=0;k<20;k++){const h=hs(bi*91+bj*37+k*7.3);blockDots.push([bi*step+(hs(k*3.1+bi)-.5)*1.8*E,bj*step+(hs(k*5.7+bj*3)-.5)*1.8*E,h,Math.abs(bi)+Math.abs(bj)]);}}
}
function noiseA(t){return .5*Math.sin(3*t+1.3)+.3*Math.sin(5*t-.7)+.2*Math.sin(7*t+2);}
function metric(x,y){const dx=x-O.x,dy=y-O.y;return Math.hypot(dx,dy)*(1+.22*noiseA(Math.atan2(dy,dx)));}
function nearest(x,y){let b=0,bd=1e18;grid.pts.forEach((p,k)=>{const d=(p.x-x)**2+(p.y-y)**2;if(d<bd){bd=d;b=k;}});return b;}
function astar(s,t,seed){
 const {N,pts}=grid,n=N*N,gs=new Float64Array(n).fill(1e18),came=new Int32Array(n).fill(-1),done=new Uint8Array(n),heap=[];
 const field=(x,y)=>.5+.5*Math.sin(x/E*3.3+seed*2.1)*Math.cos(y/E*2.9-seed*1.4);
 const push=(f,k)=>{heap.push([f,k]);let i=heap.length-1;while(i>0){const p=(i-1)>>1;if(heap[p][0]<=heap[i][0])break;[heap[p],heap[i]]=[heap[i],heap[p]];i=p;}};
 const pop=()=>{const top=heap[0],last=heap.pop();if(heap.length){heap[0]=last;let i=0;for(;;){const l=i*2+1,r=l+1;let m=i;if(l<heap.length&&heap[l][0]<heap[m][0])m=l;if(r<heap.length&&heap[r][0]<heap[m][0])m=r;if(m===i)break;[heap[m],heap[i]]=[heap[i],heap[m]];i=m;}}return top;};
 gs[s]=0;push(0,s);const tx=pts[t].x,ty=pts[t].y;
 while(heap.length){const [,k]=pop();if(done[k])continue;done[k]=1;if(k===t)break;const i=k%N,j=(k/N)|0;
  for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++){if(!di&&!dj)continue;const ni=i+di,nj=j+dj;if(ni<0||nj<0||ni>=N||nj>=N)continue;const q=ni+nj*N;if(done[q])continue;
   const a=pts[k],b=pts[q],len=Math.hypot(b.x-a.x,b.y-a.y),c=gs[k]+len*(1+1.6*field((a.x+b.x)/2,(a.y+b.y)/2));if(c<gs[q]){gs[q]=c;came[q]=k;push(c+Math.hypot(tx-b.x,ty-b.y),q);}}}
 const out=[];for(let k=t;k!==-1;k=came[k])out.push(k);return out.reverse();
}
function partial(Pp,frac){const target=Pp.len*frac,out=[Pp.pts[0]];for(let k=1;k<Pp.pts.length;k++){if(Pp.acc[k]<=target){out.push(Pp.pts[k]);continue;}const a=Pp.pts[k-1],b=Pp.pts[k],t=(target-Pp.acc[k-1])/(Pp.acc[k]-Pp.acc[k-1]);out.push([mix(a[0],b[0],t),mix(a[1],b[1],t)]);break;}return out;}

/* ---------- 品牌 DOM 放置（正对屏幕，不透视变形） ---------- */
function place(id,x,y,a,o={}){placed[id]={x,y,a:clamp(a),gray:o.gray||0,dark:!!o.dark,hot:hover===id};}
function applyBrands(){
 for(const b of BRANDS){const e=brandEl[b.id],p=placed[b.id];const a=p?p.a:0;
  if(a<=.01){if(e._v){e._v=0;e._k=null;e._live=false;e.style.visibility='hidden';e.style.opacity=0;e.tabIndex=-1;e.style.pointerEvents='none';}continue;}
  const pm=portrait(),size=pm?pm.brand(b):{w:b.w,h:b.h};if(pm){e.style.width=size.w+'px';e.style.height=size.h+'px';e.style.setProperty('--m-logo-w',size.logoW+'px');e.style.setProperty('--m-logo-h',size.logoH+'px');e.style.setProperty('--m-cap-w',size.capW+'px');}
  const x=Math.round(p.x-size.w/2),y=Math.round(p.y-size.h/2),key=x+','+y+','+a.toFixed(3)+','+p.gray.toFixed(2)+p.dark;
  if(e._k!==key){e._k=key;e._v=1;e.style.visibility='visible';e.style.opacity=a;e.style.transform=`translate3d(${x}px,${y}px,0)`;e.querySelector('img').style.filter=p.gray>.01?`grayscale(${p.gray.toFixed(2)}) contrast(${(1-p.gray*.25).toFixed(2)})`:'';e.classList.toggle('dark',p.dark);}
  const live=a>.6;if(e._live!==live){e._live=live;e.tabIndex=live?0:-1;e.style.pointerEvents=live?'auto':'none';}
 }
}

/* ---------- 00 入境：四个 token 收成一个点 ---------- */
const TOKENS=[['01','一个号码'],['02','一条路径'],['03','一个账户'],['04','一张支付卡']];
function sceneEntry(g,t){
 if(g>.75)return;INK=LIGHT;
 const pm=portrait();if(pm){const a1=1-R(g,.24,.34),cy=(pm.state.header+pm.state.bar.y)/2;Tx('从 AI 出发，',W/2,cy-68,20,a1,{f:CN,w:700,al:'center'});Tx('连接更广阔的数字世界。',W/2,cy-36,20,a1,{f:CN,w:700,al:'center'});const conv=io(R(g,.20,.46)),ta=1-R(g,.38,.48);(HOST.tokens||TOKENS).forEach(([,label],i)=>{const x=W*(i%2?.72:.28),y=cy+20+Math.floor(i/2)*40,px=mix(x,W/2,conv),py=mix(y,VY,conv);Tx(label,px,py,14,ta,{f:CN,al:'center'});});}else{
 const a1=1-R(g,.24,.34);let fs=clamp(W*.023,20,36);if(HOST.entryText){ctx.font=`700 ${fs}px ${CN}`;fs*=Math.min(1,(W-40)/ctx.measureText(HOST.entryText).width);}Tx(HOST.entryText||'要用上这些，你需要',W/2,H/2-74,fs,a1,{f:CN,w:700,al:'center',ls:fs*.06});
 const conv=io(R(g,.20,.46)),ta=1-R(g,.38,.48),sz=clamp(W*.0125,13,19),gap=mobile?18:48;
 const tokens=HOST.tokens||TOKENS;ctx.font=`500 ${sz}px ${CN}`;const ws=tokens.map(([,s])=>ctx.measureText(s).width+(mobile?0:28));const tot=ws.reduce((a,b)=>a+b,0)+gap*3;let x=W/2-tot/2;
 tokens.forEach(([i,s],k)=>{const w=ws[k],ox=x+w/2,oy=mobile?H/2+30+(k%2)*30:H/2+30;x+=w+gap;const px=mix(ox,W/2,conv),py=mix(oy,VY,conv),sc=1-.7*conv;
  ctx.save();ctx.translate(px,py);ctx.scale(sc,sc);if(!mobile)Tx(i,-w/2,0,10,ta*.55);Tx(s,mobile?0:-w/2+28,0,sz,ta,{f:CN,al:mobile?'center':'left'});ctx.restore();
  if(conv>0&&conv<1)L(ox,oy-6,px,py,.18*(1-conv)*ta);});
 }
 const pa=R(g,.36,.46)*(1-R(g,.62,.70));
 if(pa>0){const pul=(t*.55)%1;dot(W/2,VY,2.2,pa);ctx.strokeStyle=ink((1-pul)*.35*pa);ctx.lineWidth=1;ctx.beginPath();ctx.arc(W/2,VY,6+pul*46,0,TAU);ctx.stroke();Tx('你 · YOU',W/2+14,VY-12,9.5,pa*.6*win(g,.42,.5,.58,.66));}
}

/* ---------- 01 号码：点 → 载波；运营商节点；平台作为应用场景出现 ---------- */
function carriers(){const pm=portrait();if(pm)return ['clubsim','smart'].map((id,i)=>({id,x:pm.numberNode(id).x,code:i?'+63':'+852',area:i?'PHILIPPINES':'HONG KONG'}));return mobile?[{id:'clubsim',x:W*.25,code:'+852',area:'HONG KONG'},{id:'smart',x:W*.75,code:'+63',area:'PHILIPPINES'}]:[{id:'clubsim',x:W*.33,code:'+852',area:'HONG KONG'},{id:'smart',x:W*.70,code:'+63',area:'PHILIPPINES'}];}
const PLATFORMS=[
 {id:'whatsapp',d:[.45,-.25],m:[.10,-.20],at:1.00,main:1},{id:'telegram',d:[.56,.24],m:[.46,.19],at:1.05,main:1},{id:'line',d:[.83,-.22],m:[.92,-.21],at:1.10,main:1},
 {id:'instagram',d:[.645,-.35],m:[.52,-.30],at:1.18,main:0},{id:'facebook',d:[.895,.26],m:[.84,.17],at:1.23,main:0}];
function waveAt(x,g,t){
 const grow=R(g,.64,.92),flat=1-io(R(g,1.54,1.68)),nodes=R(g,.80,1.0),cs_=carriers();let env=.38;
 for(const c of cs_)env+=.62*nodes*Math.exp(-(((x-c.x)/(W*.11))**2));
 return VY+H*.024*grow*flat*env*Math.sin(x*TAU/(mobile?W*.22:W*.085)-t*1.5-g*9);
}
function sceneNumber(g,t){
 if(g<.55||g>1.84)return;INK=LIGHT;
 const hw=W*.62*eo(R(g,.58,.88)),flat=io(R(g,1.54,1.68)),dotA=1-R(g,1.60,1.70);
 // 载波：点阵（离散）→ 实线（离场时压成一条横线，交给翻面）
 if(hw>0){ctx.fillStyle=ink(.8*dotA);for(let x=W/2-hw;x<=W/2+hw;x+=5){const e=1-Math.pow(Math.abs(x-W/2)/Math.max(1,hw),6);if(e<=0)continue;ctx.globalAlpha=e;ctx.fillRect(x-.65,waveAt(x,g,t)-.65,1.3,1.3);}ctx.globalAlpha=1;
  const la=R(g,1.56,1.68);if(la>0)L(0,VY,W,VY,la,1.2);}
 const nodes=carriers(),fade=1-R(g,1.50,1.62);
 nodes.forEach((n,i)=>{const a=eo(R(g,.80+i*.06,.92+i*.06))*fade;if(a<=0)return;const y=waveAt(n.x,g,t);
  ctx.setLineDash([2,4]);for(let k=0;k<3;k++){const span=portrait()?44:156,r=8+((t*34+k*52)%span),al=(1-r/(span+8))*.36*a;ctx.strokeStyle=ink(al);ctx.lineWidth=1;ctx.beginPath();ctx.arc(n.x,y,r,0,TAU);ctx.stroke();}ctx.setLineDash([]);
  ctx.fillStyle=ink(a);ctx.fillRect(n.x-3,y-3,6,6);L(n.x,y-8,n.x,portrait()?VY-12:VY-52,.5*a);
  if(!portrait()){Tx(n.code,n.x,VY+34,mobile?13:15,a,{al:'center',w:600});Tx(n.area+' · CARRIER 0'+(i+1),n.x,VY+50,8.5,a*.5,{al:'center'});
  }
  const np=portrait()?.numberNode(n.id);place(n.id,np?np.x:n.x,np?np.y:VY-(mobile?80:98),a);
  if(i===0&&!portrait()){const ea=a*R(g,.96,1.06),ex=n.x+(mobile?-6:-104),ey=VY+(mobile?72:36);if(ea>0){ctx.strokeStyle=ink(.7*ea);ctx.lineWidth=1;ctx.beginPath();ctx.roundRect(ex-11,ey-8,22,16,3);ctx.stroke();L(ex-11,ey,ex+11,ey,.45*ea);L(ex-3,ey-8,ex-3,ey+8,.45*ea);L(ex+4,ey-8,ex+4,ey+8,.45*ea);Tx('eSIM',ex,ey+22,8.5,ea*.6,{al:'center'});}}
  if(i===1&&!portrait()){const oa=a*R(g,1.0,1.1),ox=n.x+(mobile?-30:84),oy=VY+(mobile?72:34);if(oa>0){Tx('SMS · OTP',ox,oy-10,8.5,oa*.55);for(let k=0;k<6;k++){const on=REDUCED?1:((t*1.6)%7)>k;ctx.strokeStyle=ink(.55*oa);ctx.strokeRect(ox+k*11,oy-2,8,10);if(on)dot(ox+k*11+4,oy+3,1.4,.8*oa);}}}
 });
 // 号码在载波上传输：少量数据包，两种方向，不画运营商与平台之间的连线
 const pk=R(g,.96,1.08)*fade*(1-flat);
 if(pk>0&&!REDUCED){for(let j=0;j<7;j++){const dir=j%2?-1:1,span=W*.9,u=((t*.07*(1+j*.13)+j*.137)%1),x=dir>0?W*.05+u*span:W*.95-u*span;const y=waveAt(x,g,t),a=pk*Math.sin(u*Math.PI)*.8;dot(x,y,1.6,a);Tx((j%2?'+63':'+852').charAt(Math.floor(u*4)%4)||'+',x+4,y-6,8,a*.6);}}
 // 平台：被载波波前触及后，从载波“接收”出现；主要 / 辅助以尺寸与线型区分
 for(const p of PLATFORMS){const np=portrait()?.numberNode(p.id),f=mobile?p.m:p.d,x=np?np.x:f[0]*W,y=np?np.y:VY+(mobile&&p.main&&f[1]<0?Math.min(f[1]*H,-172):f[1]*H),r=eo(R(g,p.at,p.at+.09))*fade;if(r<=0)continue;
  const wy=waveAt(x,g,t),dir=Math.sign(y-wy),end=y-dir*(p.main?26:19),cur=mix(wy,end,r),hot=hover===p.id;
  path([[x,wy],[x,cur]],(p.main?.55:.32)*r*(hot?1.6:1),hot?1.4:1,false,p.main?null:[2,3]);L(x-5,wy,x+5,wy,.7*r);
  place(p.id,x,y,R(r,.55,1));}
}

/* ---------- 01→02 翻面：横线即平面侧边，绕横轴翻转，铺满后才切白底 ---------- */
function sceneFlip(g,C){
 if(g<1.70||g>2.32)return;
 const sh=sheet(C,E*40);
 if(sh&&g<2.2){ctx.fillStyle=WHITE;ctx.beginPath();sh.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();ctx.fill();}
 // 平面网格：翻转中保持，正对后转为路由点阵
 INK=DARK;const ga=.11*R(g,1.78,1.90)*(1-R(g,2.12,2.24));
 if(ga>0){const N=grid.N,c=grid.c;for(let k=0;k<=N;k+=2){const v=-E+k*c;seg(C,-E,v,E,v,ga);seg(C,v,-E,v,E,ga);}}
 // 侧边亮线在翻开初段仍可见
 const ea=1-R(g,1.74,1.84);if(ea>0){INK=LIGHT;L(0,C.cy,W,C.cy,ea,1.2);}
}

/* ---------- 02 网络：路由扩散、等时线、路径锁定、远程节点抬升 ---------- */
function sceneNetwork(g,t,C){
 if(g<2.1||g>4.6)return;INK=DARK;
 const fade=(1-R(g,3.52,3.86)*.72)*(1-R(g,4.56,4.72)),jit=io(R(g,2.12,2.30)),pa=R(g,2.12,2.24);
 const Rd=2.6*E*eo(R(g,portrait()?2.48:2.22,2.86)),lock=io(R(g,2.80,3.10)),cube=eo(R(g,2.96,3.18)),late=1-R(g,3.46,3.62);
 // 点阵
 for(const p of grid.pts){const x=mix(p.gx,p.x,jit),y=mix(p.gy,p.y,jit),q=P(C,x,y);if(!q||q[0]<-4||q[0]>W+4||q[1]<-4||q[1]>H+4)continue;
  const lead=Rd-p.d,on=lead>0,front=on&&lead<.09*E;let a=(on?.42:.13)*pa*fade,r=.75*Math.min(1.4,q[2]);if(front){a=.9*pa;r*=1.7;}dot(q[0],q[1],r,a);}
 // 等时线
 const ia=pa*(1-.6*lock)*late;
 if(ia>0)for(let k=1;k<=8;k++){const D=k*.24*E;if(D>Rd)break;const ka=ia*.32*R((Rd-D)/(.12*E),0,1),pts=[];for(let s=0;s<=120;s++){const th=s/120*TAU,r=D/(1+.22*noiseA(th)),x=O.x+Math.cos(th)*r,y=O.y+Math.sin(th)*r;if(Math.abs(x)>E||Math.abs(y)>E){if(pts.length>1)path(pts,ka,1,false,[3,4]);pts.length=0;continue;}const q=P(C,x,y);if(q)pts.push(q);}path(pts,ka,1,false,[3,4]);
  if(k%2===0&&!portrait()){const th=-.62,r=D/(1+.22*noiseA(th)),q=P(C,O.x+Math.cos(th)*r,O.y+Math.sin(th)*r);if(q)Tx('+'+k*6+' ms',q[0]+6,q[1]-4,8.5,ka*1.6);}}
 const o=P(C,O.x,O.y);
 if(o&&pa>0){dot(o[0],o[1],2.6,pa*late);const pul=REDUCED?.4:(t*.5)%1;ctx.strokeStyle=ink((1-pul)*.4*pa*late);ctx.beginPath();ctx.arc(o[0],o[1],5+pul*26,0,TAU);ctx.stroke();Tx('ORIGIN · 你',o[0]+10,o[1]+18,8.5,.6*pa*late);
  const lr=R(g,2.5,2.62)*late*(1-lock*.5),lq=P(C,O.x+.62*E,O.y+.02*E);if(lq&&lr>0&&!portrait())Tx('ROUTING · 等时线扩散',lq[0],lq[1]+16,8.5,.7*lr);}
 // 候选路径 → 锁定。四条等权，不分主次；悬停高亮对应路径束
 const hotI=CLIENTS.findIndex(c=>c.id===hover),cand=R(g,2.62,2.72)*(1-lock)*late;
 paths.forEach((pp,i)=>{const dim=hotI>=0&&hotI!==i?.22:1;
  if(cand>0)path(ground(C,pp.pts)||[],.28*cand,1,false,[2,3]);
  if(lock>0){const part=ground(C,partial(pp,lock));if(part){path(part,.85*dim*late,hotI===i?2.6:1.3);if(hotI===i)for(let k=0;k<pp.pts.length;k+=3){const q=P(C,...pp.pts[k]);if(q&&pp.acc[k]<=pp.len*lock)dot(q[0],q[1],1.8,.9*late);}}}});
 if(lock>.5&&late>0&&!portrait()){const mid=paths[1].pts[Math.floor(paths[1].pts.length*.45)],q=P(C,mid[0],mid[1]);if(q){L(q[0],q[1],q[0]+28,q[1]-22,.5*late*R(lock,.5,1));Tx('PROXY · 代理',q[0]+32,q[1]-24,8.5,.75*late*R(lock,.5,1));}}
 // 远程节点：线框立方体抬升
 const cubes=[{p:X,s:.06*E,h:.13*E*cube,lab:'REMOTE · 远程',sub:'IP 203.0.113.24'},{p:VPS,s:.036*E,h:.07*E*eo(R(g,3.02,3.22)),lab:'VPS',sub:'NODE · 02'}];
 for(const cb of cubes){if(cb.h<=.5||late<=0)continue;const {x,y}=cb.p,s=cb.s,V=[[-s,-s],[s,-s],[s,s],[-s,s]];const bot=V.map(([dx,dy])=>P(C,x+dx,y+dy,0)),top=V.map(([dx,dy])=>P(C,x+dx,y+dy,cb.h));if(bot.some(v=>!v)||top.some(v=>!v))continue;
  ctx.fillStyle=`rgba(236,235,232,${.9*late})`;ctx.beginPath();top.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();ctx.fill();
  path([...bot,bot[0]],.5*late);path([...top,top[0]],.9*late,1.2);for(let k=0;k<4;k++)L(bot[k][0],bot[k][1],top[k][0],top[k][1],.7*late);
  const c0=P(C,x,y,cb.h);const la=R(cb.h/(cb===cubes[0]?.13*E:.07*E),.6,1)*late;const pm=portrait(),rt=pm?cb===cubes[0]:c0[0]+120>W,lx=pm?(rt?pm.state.network.right:pm.state.network.x):rt?c0[0]-6:c0[0]+6,al=rt?'right':'left';let st=Math.min(c0[1]-30,Math.min(...top.map(p=>p[1]))-16); /* 标签抬到顶面最高点之上，避免顶面远边穿过文字 */L(c0[0],c0[1],portrait()?lx:c0[0],st,.5*la);const kb=`rgba(236,235,232,${(.9*la).toFixed(3)})`;Tx(cb.lab,lx,st-4,portrait()?11:9,la,{w:600,al,bg:kb});Tx(cb.sub,lx,st+(portrait()?11:8),portrait()?10.5:8.5,la*.55,{al,bg:kb});}
 // 客户端环形入口：灰阶出现，被波前扫过后显色；Logo 正对屏幕
 const ca=R(g,portrait()?2.48:2.24,portrait()?2.58:2.34)*(1-R(g,3.44,3.54));
 for(const cl of CLIENTS){const q=P(C,cl.x,cl.y);if(!q)continue;const gray=1-R(Rd-metric(cl.x,cl.y),0,.06*E);
  if(ca>0){L(q[0],q[1],q[0],q[1]-22,.5*ca);dot(q[0],q[1],2,.8*ca);}place(cl.id,q[0],q[1]-44,ca,{gray,dark:true});}
}

/* ---------- 03 账户与钱包：拉远到世界格网区块；锚点形态区分机构类型 ---------- */
const ANCHORS=[ // b：桌面区块坐标；m：移动端区块坐标（均为整数区块中心，账户一排、钱包一排，中间是收缩成区块的网络平面）
 {id:'ifast',type:'bank',b:[-1,-1],m:[-2,-1],at:3.74},{id:'wise',type:'fintech',b:[0,-1],m:[-1,-1],at:3.80},{id:'paypal',type:'relay',b:[1,-1],m:[0,-1],at:3.86},
 {id:'applepay',type:'wallet',b:[0,1],m:[0,1],at:3.96},{id:'googlepay',type:'wallet',b:[1,1],m:[1,1],at:4.02}];
function anchorPos(a){const pm=portrait();if(pm){const n=pm.accountNode(a.id),b=BRANDS.find(b=>b.id===a.id);return unproject(cam(STOPS.accounts),n.x-b.w/2-22,n.y+16);}const step=2.5*E,b=mobile?a.m:a.b;return {x:b[0]*step,y:b[1]*step};}
const GROUPS=[{id:'acc',ids:['ifast','wise','paypal'],lab:'ACCOUNTS · 账户资金服务',labM:'账户资金服务'},{id:'wal',ids:['applepay','googlepay'],lab:'WALLETS · 钱包快捷支付',labM:'钱包快捷支付'}];
function groupRect(gr){const ps=gr.ids.map(id=>anchorPos(ANCHORS.find(a=>a.id===id))),m=1.12*E,x0=Math.min(...ps.map(p=>p.x))-m,x1=Math.max(...ps.map(p=>p.x))+m,y0=Math.min(...ps.map(p=>p.y))-m,y1=Math.max(...ps.map(p=>p.y))+m;return [[x0,y0],[x1,y0],[x1,y1],[x0,y1]];}
// 分组标签避让：在停靠点相机下，依次尝试矩形各顶点 × 左/右对齐 × 上/下偏移，取第一个不压品牌、不出屏、不压说明面板的位置；每次 layout 只算一次，避免逐帧跳动
let LPLAN=null;const CAPH=36; /* 账户品牌整体上移一个说明高度：立杆 → 端点 → 名称 → Logo，立杆不再穿过文字 */
function labelPlan(){
 if(LPLAN)return LPLAN;LPLAN={};const C=cam(STOPS.accounts),boxes=[];
 for(const an of ANCHORS){const {x,y}=anchorPos(an),tp=P(C,x,y,(an.type==='wallet'?.7:.95)*E);if(!tp)continue;const b=BRANDS.find(q=>q.id===an.id),cy=tp[1]-b.h/2-10-CAPH,hw=Math.max(b.w/2,64)+6;boxes.push([tp[0]-hw,cy-b.h/2-6,tp[0]+hw,cy+b.h/2+40]);const bs=P(C,x,y);if(bs)boxes.push([Math.min(bs[0],tp[0])-14,tp[1],Math.max(bs[0],tp[0])+14,bs[1]+14]);}
 ctx.font=`600 9px ${MONO}`;ctx.letterSpacing='.72px';
 for(const gr of GROUPS){const q=ground(C,groupRect(gr));if(!q)continue;const tw=ctx.measureText(mobile?gr.labM:gr.lab).width+4,order=q.map((p,i)=>i).sort((a,b)=>q[a][1]-q[b][1]);
  outer:for(const vi of order)for(const [al,dx,dy] of [['right',-10,4],['left',8,-8],['left',8,16],['right',-8,-8],['right',-8,16],['left',10,4]]){
   const v=q[vi],x0=al==='right'?v[0]+dx-tw:v[0]+dx,r=[x0,v[1]+dy-10,x0+tw,v[1]+dy+3];
   if(r[0]<16||r[2]>W-16||r[1]<(mobile?150:90)||r[3]>H-24)continue;
   if(mobile?r[3]>H*.74:(r[0]<470&&r[3]>H-300))continue;
   if(boxes.some(b=>!(r[2]<b[0]||r[0]>b[2]||r[3]<b[1]||r[1]>b[3])))continue;
   LPLAN[gr.id]={v:vi,al,dx,dy};boxes.push(r);break outer;}}
 ctx.letterSpacing='0px';return LPLAN;
}
function sceneAccounts(g,t,C){
 if(g<3.5||g>4.75)return;INK=DARK;
 const z=io(R(g,3.48,3.88)),out=1-R(g,4.50,4.62),step=2.5*E,tt=REDUCED?0:t;
 // 区块与街道（街道在下潜时成为汇聚的路线）
 const ba=R(g,3.46,3.72);
 for(let bj=-3;bj<=3;bj++)for(let bi=-4;bi<=4;bi++){const cx=bi*step,cy=bj*step,a=ba*R(z,.12+(Math.abs(bi)+Math.abs(bj))*.08,.75)*.32*out;if(a<=0)continue;const q=ground(C,[[cx-E,cy-E],[cx+E,cy-E],[cx+E,cy+E],[cx-E,cy+E]]);if(q)path([...q,q[0]],a*(bi||bj?1:.6));}
 for(const d of blockDots){const q=P(C,d[0],d[1]);if(!q)continue;dot(q[0],q[1],.8,.28*ba*R(z,.2+d[3]*.06,.85)*out);}
 // 分组区域：账户资金服务 / 钱包快捷支付；品牌之间不连线
 for(const gr of GROUPS){const pm=portrait();if(pm){const r=pm.state.accounts,split=pm.accountNode('applepay').y-36,y0=gr.id==='acc'?r.y:split,y1=gr.id==='acc'?split-8:r.bottom,ga=R(g,3.92,4.08)*out;path([[r.x,y1],[r.x,y0],[r.right,y0],[r.right,y1]],.25*ga,1,false,[4,5]);Tx(gr.labM,r.x+6,y0+13,11,ga*.8,{f:CN,w:600});continue;}const q=ground(C,groupRect(gr));const ga=R(g,3.92,4.08)*out;if(!q||ga<=0)continue;path([...q,q[0]],.42*ga,1,false,[5,5]);
  const pl=labelPlan()[gr.id];if(pl){const v=q[pl.v];Tx(mobile?gr.labM:gr.lab,v[0]+pl.dx,v[1]+pl.dy,9,.8*ga,{w:600,al:pl.al});}}
 // 锚点
 for(const an of ANCHORS){const a=eo(R(g,an.at,an.at+.14))*out;if(a<=0)continue;const {x,y}=anchorPos(an),hot=hover===an.id,k=hot?1.5:1,hgt=(portrait()?.12:an.type==='wallet'?.7:.95)*E*a;
  if(an.type==='bank'){const s=.2*E,q=ground(C,[[x-s,y-s],[x+s,y-s],[x+s,y+s],[x-s,y+s]]);if(q){ctx.fillStyle=ink(.85*a);ctx.beginPath();q.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();ctx.fill();}const s2=.34*E,q2=ground(C,[[x-s2,y-s2],[x+s2,y-s2],[x+s2,y+s2],[x-s2,y+s2]]);if(q2)path([...q2,q2[0]],.5*a*k);}
  if(an.type==='fintech'){const rot=tt*.15+g*.6;for(let i=0;i<48;i++){const th=i/48*TAU+rot,r0=.42*E,r1=r0+(i%4?.07:.16)*E,p=P(C,x+Math.cos(th)*r0,y+Math.sin(th)*r0),q=P(C,x+Math.cos(th)*r1,y+Math.sin(th)*r1);if(p&&q)L(p[0],p[1],q[0],q[1],.6*a*k);}const ring=[];for(let i=0;i<=64;i++){const th=i/64*TAU,p=P(C,x+Math.cos(th)*.3*E,y+Math.sin(th)*.3*E);if(p)ring.push(p);}path(ring,.4*a*k);}
  if(an.type==='relay'){const s=.13*E;for(const sx of [-1,1]){const cx=x+sx*.36*E,q=ground(C,[[cx-s,y-s],[cx+s,y-s],[cx+s,y+s],[cx-s,y+s]]);if(q)path(q,.85*a*k,1.2);}for(const dy of [-.05*E,.05*E])seg(C,x-.23*E,y+dy,x+.23*E,y+dy,.55*a*k);if(!REDUCED)for(let i=0;i<3;i++){const u=((tt*.45+i/3)%1),px=x+mix(-.23,.23,i%2?1-u:u)*E,q=P(C,px,y+(i%2?.05:-.05)*E);if(q)dot(q[0],q[1],1.6,.9*a*Math.sin(u*Math.PI));}}
  if(an.type==='wallet'){for(let i=0;i<3;i++){const ph=REDUCED?0:((tt*.5)%1)*.12*E,r=(.18+i*.15)*E+ph,arc=[];for(let s=0;s<=24;s++){const th=-.75+s/24*1.5,p=P(C,x+Math.cos(th)*r,y+Math.sin(th)*r);if(p)arc.push(p);}path(arc,(.65-i*.16)*a*k);}const s=.09*E,q=ground(C,[[x-s*1.4,y-s*2],[x+s*.2,y-s*2],[x+s*.2,y+s*2],[x-s*1.4,y+s*2]]);if(q)path([...q,q[0]],.7*a*k);}
  const b=P(C,x,y,0),tp=P(C,x,y,hgt);if(b&&tp){L(b[0],b[1],tp[0],tp[1],.7*a*k,an.type==='bank'?1.6:1);dot(tp[0],tp[1],1.8,a);if(an.type==='bank')L(tp[0]-7,tp[1],tp[0]+7,tp[1],.8*a);
   const br=BRANDS.find(q=>q.id===an.id),np=portrait()?.accountNode(an.id);if(np)L(tp[0],tp[1],np.x-br.w/2-4,np.y,.45*a);place(an.id,np?np.x:tp[0],np?np.y:tp[1]-br.h/2-10-CAPH,R(a,.55,1),{dark:true});}
 }
}

/* ---------- 03→04 下潜：路线汇聚、穿过平面、细线分成 11 条彩色数据流 ---------- */
function diveSheet(g,C){
 if(g<4.5||g>=4.84)return;const sh=sheet(C,E*40);if(sh){ctx.fillStyle=WHITE;ctx.beginPath();sh.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();ctx.fill();}
 INK=DARK;const step=2.5*E,ra=R(g,4.5,4.58)*(1-R(g,4.74,4.82));
 for(let k=-6;k<=6;k++){const v=(k+.5)*step;seg(C,-12*step,v,12*step,v,.32*ra);seg(C,v,-12*step,v,12*step,.32*ra);}
}
function sceneDive(g,t,C){
 if(g<4.5||g>5.16)return;
 if(g<4.84){INK=LIGHT;const la=R(g,4.70,4.80);if(la>0)L(0,C.cy,W,C.cy,la,1.2);}
 // 穿过后：一条横线 → 11 条与粒子 q=0 状态对齐的彩色流
 const sp=io(R(g,4.80,4.97)),fa=1-R(g,5.02,5.14);if(g<4.78||fa<=0||!stage)return;
 const snap=stage.snapshot(0),lanes=stage.lanesAt(0,snap);drawLanes(lanes,sp,fa,0,0);
}
function drawLanes(lanes,sp,alpha,white,field,t=0){
 const n=lanes.length?lanes[0].pts.length:0;
 for(const ln of lanes){const pts=[];for(let i=0;i<n;i++){const u=i/(n-1),sx=mix(-W*.02,W*1.02,u),sy=CARD.y;const p=ln.pts[i];pts.push([mix(sx,p[0],sp),mix(sy,p[1],sp)]);}
  const col=ln.color.map(v=>Math.round(mix(237,mix(v,237,white),sp)));ctx.strokeStyle=rgba(col,.9*alpha);ctx.lineWidth=1.15;ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.stroke();}
}

/* ---------- 04 支付卡片：叙事 q（滚动）与局部换卡 q（点击）取 min ---------- */
function qNarr(g){if(REDUCED)return g>=5.0&&g<6.62?1:0;if(g<5.0)return 0;if(g<5.7)return (g-5.0)/.7;if(g<6.3)return 1;if(g<6.62)return (6.62-g)/.32;return 0;}
function cardLayout(m){const pm=portrait();if(pm){const r=pm.state.card,cw=Math.min(m.maxWidth,r.mainMaxW);return {x:r.x,y:r.y,cw,ch:cw/m.aspect};}const cw=Math.min(m.maxWidth,mobile?W*.80:W*.34,H*(mobile?.30:.44)*m.aspect);return {x:CARD.x,y:CARD.y,cw,ch:cw/m.aspect};}
function slotPos(key){const pm=portrait();if(pm){const m=pm.state;return {x:m.global.cards.x+m.global.cards.w*(key==='left'?.25:.75),y:m.card.sideY,rot:0};}const ref=cardLayout(CARDS[0]),sw=sideW();if(mobile)return {x:key==='left'?W*.27:W*.73,y:CARD.y+ref.ch/2+104+sw/1.6/2,rot:key==='left'?12:-12}; /* 移动端：侧卡让出主卡说明（约 3 行） */return {x:CARD.x+(key==='left'?-1:1)*(ref.cw/2+56+sw/2),y:CARD.y+8,rot:key==='left'?24:-24};}
const sideW=()=>portrait()?portrait().state.card.sideW:mobile?W*.36:Math.min(232,W*.155);
function sceneCards(g,t,dt){
 const qn=qNarr(g),visible=g>=4.96&&g<6.72,inter=g>=ZONE.in&&g<=ZONE.out;
 if(!stage)return {busy:false};
 const busy=stage.step(dt,{qNarr:qn,interactive:inter,visible});const s=stage.snapshot(qn);
 el.gl.style.opacity=(R(g,4.97,5.06)*(1-R(g,6.60,6.68))).toFixed(3);
 if(visible&&stage.webgl){stage.draw(s);el.fallback.hidden=true;}else{stage.clear();}
 if(!stage.webgl&&visible){const m=CARD_BY[s.from],r=cardLayout(m);Object.assign(el.fallback.style,{left:(r.x-r.cw/2)+'px',top:(r.y-r.ch/2)+'px',width:r.cw+'px',opacity:R(g,5.0,5.4)*(1-R(g,6.3,6.6))});if(el.fallback.dataset.id!==m.id){el.fallback.src=m.src;el.fallback.alt=m.name;el.fallback.dataset.id=m.id;}el.fallback.hidden=false;}else if(!stage.webgl)el.fallback.hidden=true;
 // 卡面注册角标（安静）
 if(visible){INK=LIGHT;const al=.22*R(s.q,.3,.8)*(1-s.surface)*(1-R(g,6.3,6.4));ticks(s.x-s.cw/2-20,s.y-s.ch/2-20,s.cw+40,s.ch+40,12,al);}
 // 换卡时的低 q 引导线：与粒子 flow 同式的 11 条 lane，颜色按 m 从旧卡过渡到新卡，让“低辨识换色”可读
 if(visible&&stage.webgl&&qn>.98&&!REDUCED){const st=stage.state,la=(1-R(s.q,.05,.5))*.5;if(la>.01&&(st.to||st.q<.999))drawLanes(stage.lanesAt(s.q,s),1,la,0,0);}
 updateCardDom(dt,g,s,inter);
 // 离场：卡解构回 11 条流 → 褪白 → 展开成 Personal 水平线场
 if(g>6.48&&g<=LEN+.01){const lanes=stage.lanesAt(0,s),la=R(g,6.52,6.60),wh=io(R(g,6.60,6.68)),sp=io(R(g,6.64,6.80));sceneExit(lanes,la,wh,sp,t);}
 return {busy:busy&&visible};
}
function sceneExit(lanes,la,wh,sp,t){
 const N=46,n=lanes[0].pts.length,amp=j=>H*.011*(.6+.4*Math.sin(j*.7));
 for(let j=0;j<N;j++){const k=Math.round(j/(N-1)*10),isLane=Math.round(k*(N-1)/10)===j,ln=lanes[k],base=H*.07+j*(H*.86/(N-1));
  const a=isLane?mix(.9*la,.14+.22*hs(j*2.3),sp):sp*(.14+.22*hs(j*2.3));if(a<=.004)continue;
  const col=isLane?ln.color.map(v=>Math.round(mix(v,237,wh))):LIGHT;ctx.strokeStyle=rgba(col,a);ctx.lineWidth=1;ctx.beginPath();
  for(let i=0;i<n;i++){const u=i/(n-1),fx=-12+u*(W+24),fy=base+amp(j)*(Math.sin(fx*.004+j*.33+t*.25)*.6+Math.sin(fx*.0093-j*.21-t*.17)*.4),p=ln.pts[i];const x=mix(p[0],fx,sp),y=mix(p[1],fy,sp);i?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();}
 if(sp>.6&&!HOST.suppressExitLabels){INK=LIGHT;Tx('FIELD · 46 LINES',W-(mobile?20:78),H*.86,9,.5*R(sp,.6,1),{al:'right'});Tx('→ 03 场 · 个人',W-(mobile?20:78),H*.86-16,10,.6*R(sp,.7,1),{al:'right',f:CN});}
}
function updateCardDom(dt,g,s,inter){
 const vis=R(g,5.64,5.80)*(1-R(g,6.27,6.38)),st=stage.state,sw=sideW(),k=REDUCED?1:1-Math.exp(-dt*8);
 for(const c of CARDS){const d=cardDom[c.id],key=slots.left===c.id?'left':slots.right===c.id?'right':null;let tg;
  if(c.id===st.from)tg={x:s.x,y:s.y,sc:.92,rot:0,op:0,br:.6};
  if(key&&c.id!==st.from){const sp=slotPos(key);tg={x:sp.x,y:sp.y,sc:1,rot:sp.rot,op:1,br:1};if(c.id===st.to)tg={x:mix(sp.x,s.x,.42),y:mix(sp.y,s.y,.3),sc:.78,rot:sp.rot*.5,op:0,br:.6};if(c.id===d.recent)tg.op=R(s.q,.35,.85);}
  if(!tg)tg={x:s.x,y:s.y,sc:.9,rot:0,op:0,br:.6};
  if(d.recent&&s.q>=.999&&!st.to)d.recent=null;
  const cu=d.cur;for(const p of ['x','y','sc','rot','op','br'])cu[p]=d.init?mix(cu[p],tg[p],k):tg[p];d.init=true;
  const op=cu.op*vis,live=inter&&op>.7&&c.id!==st.from&&c.id!==st.to,hot=hover===c.id;
  const tr=`translate3d(${(cu.x-sw/2).toFixed(1)}px,${(cu.y-sw/c.aspect/2).toFixed(1)}px,0) perspective(900px) rotateY(${cu.rot.toFixed(2)}deg) scale(${(cu.sc*(hot&&live?1.04:1)).toFixed(3)})`;
  if(d._tr!==tr){d._tr=tr;d.el.style.transform=tr;}d.el.style.opacity=op.toFixed(3);d.el.style.visibility=op>.01?'visible':'hidden';d.img.style.filter=`brightness(${(portrait()?mix(.72,.86,cu.br)+(hot&&live?.06:0):mix(.5,.62,cu.br)+(hot&&live?.22:0)).toFixed(2)})`;
  if(d._live!==live){d._live=live;d.el.tabIndex=live?0:-1;d.el.style.pointerEvents=live?'auto':'none';d.el.setAttribute('aria-hidden',live?'false':'true');}
 }
 // 主卡说明：只描述已确认材质；交接中显示重组状态
 const m=CARD_BY[st.from],to=st.to&&CARD_BY[st.to],capA=vis*(to?1:R(s.q,.86,1));
 el.cap.style.opacity=capA.toFixed(3);el.cap.style.visibility=capA>.01?'visible':'hidden';
 const top=portrait()?portrait().state.card.capY:s.y+s.ch/2+(mobile?14:22);el.cap.style.transform=`translate3d(${Math.round(s.x)}px,${Math.round(top)}px,0)`;
 const txt=to?['REASSEMBLING · 数据流重组',to.short,'']:[m.scene,portrait()?(m.id==='cmb'?'招行 Mastercard':m.short):m.name,m.note];if(el.cap._t!==txt.join()){el.cap._t=txt.join();el.capK.textContent=txt[0];el.capN.textContent=txt[1];el.capD.textContent=txt[2];}
 el.cards.setAttribute('aria-busy',st.busy?'true':'false');
 for(const b of el.cardNav){const on=b.dataset.card===st.from;b.setAttribute('aria-pressed',on);b.classList.toggle('pending',b.dataset.card===st.to);b.disabled=!inter;}
 el.cardNavWrap.style.opacity=(vis*(mobile?0:1)).toFixed(3);el.cardNavWrap.style.visibility=vis>.01&&!mobile?'visible':'hidden';
}
function onCommit(id){const prev=confirmed;if(prev===id)return;const key=slots.left===id?'left':slots.right===id?'right':null;if(key)slots[key]=prev;for(const c of CARDS)cardDom[c.id]&&(cardDom[c.id].recent=null);if(cardDom[prev])cardDom[prev].recent=prev;confirmed=id;if(el.live)el.live.textContent='已切换至 '+CARD_BY[id].name+' · '+CARD_BY[id].scene;if(HOST.onCardCommit)HOST.onCardCommit(id);}
function requestCard(id){if(!stage)return false;const g=lastG;return stage.request(id,{interactive:g>=ZONE.in&&g<=ZONE.out});}

/* ---------- HUD ---------- */
function show(e,a,dy=0){a=Math.round(clamp(a)*1000)/1000;if(e._a===a&&e._dy===dy)return;e._a=a;e._dy=dy;e.style.opacity=a;e.style.visibility=a>.01?'visible':'hidden';e.style.transform=dy?`translateY(${dy.toFixed(1)}px)`:'';}
function domainAt(g){return g<1.75?0:g<3.5?1:g<4.6?2:3;}
function hud(g){
 show(el.chap,win(g,.40,.52,6.62,6.72));
 const di=domainAt(g),crumb=g<.5?'01 → 02':'02.'+(di+1)+' — '+DOMAINS[di].title+' '+DOMAINS[di].en;if(el.crumb._t!==crumb){el.crumb._t=crumb;el.crumb.textContent=crumb;}
 DOMAINS.forEach((d,i)=>{const a=win(g,d.win[0],d.win[0]+.08,d.win[1]-.08,d.win[1]);show(el.panels[i],a,(1-R(g,d.win[0],d.win[0]+.08))*10);el.panels[i].querySelector('a').tabIndex=a>.5?0:-1;
  const on=g>=.5&&di===i;el.nav[i].classList.toggle('on',on);if(on)el.nav[i].setAttribute('aria-current','step');else el.nav[i].removeAttribute('aria-current');});
 const stopKey=Object.entries(STOPS).find(([,v])=>Math.abs(v-g)<.06);const p=`G ${g.toFixed(2)} / ${LEN.toFixed(2)}`+(stopKey?' · STOP':'');if(el.prog._t!==p){el.prog._t=p;el.prog.textContent=p;}
 el.hint.style.opacity=1-R(g,.03,.14);el.fill.style.transform=`scaleY(${(g/LEN).toFixed(4)})`;
}

/* ---------- 主渲染：g 是唯一叙事进度 ---------- */
function render(g,time){
 if(!ready)return {needsFrame:false};const t0=performance.now();
 g=clamp(g,0,LEN);const dt=lastTime==null?0:clamp(time-lastTime,0,.1);lastTime=time;lastG=g;const t=REDUCED?0:time;
 const C=cam(g);
 const white=whiteSurface(g,C);
 const bg=white?WHITE:BLACK;if(bg!==bgNow){bgNow=bg;if(HOST.setBackground)HOST.setBackground(bg,white);else{el.stage.style.background=bg;document.documentElement.style.background=bg;document.body.classList.toggle('on-white',white);}}
 ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);placed={};
 if(!white){INK=LIGHT;for(let i=0;i<40;i++){const d=.3+hs(i*3)*.7,x=hs(i+80)*W,y=((hs(i+250)*H-g*H*.02*d)%H+H)%H;dot(x,y,.35+hs(i+120)*.35,(.04+hs(i+33)*.07)*(g>4.9?.6:1));}}
 sceneEntry(g,t);sceneNumber(g,t);sceneFlip(g,C);diveSheet(g,C);sceneNetwork(g,t,C);sceneAccounts(g,t,C);sceneDive(g,t,C);
 const cards=sceneCards(g,t,dt);applyBrands();hud(g);
 const ambient=!REDUCED&&((g>.36&&g<1.72)||(g>2.1&&g<2.9)||(g>3.7&&g<4.62)||(g>6.62));
 stats.frames++;stats.ms=mix(stats.ms,performance.now()-t0,.1);
 if(DEBUG){const s=stage&&stage.state;el.debug.textContent=`g ${g.toFixed(3)} · domain ${DOMAINS[domainAt(g)].key} · φ ${C.phi.toFixed(1)}° ψ ${C.psi.toFixed(1)}° · qNarr ${qNarr(g).toFixed(3)}`+(s?` · card ${s.from}${s.to?'→'+s.to:''} m ${s.m} q ${s.q} desired ${s.desired} busy ${s.busy}`:'')+` · frame ${stats.ms.toFixed(1)}ms`;}
 return {needsFrame:ambient||cards.busy};
}
function resize(w,h,dpr){W=w;H=h;DPR=Math.min(2,dpr||1);el.cv.width=Math.round(W*DPR);el.cv.height=Math.round(H*DPR);ctx.setTransform(DPR,0,0,DPR,0,0);layout();if(stage){stage.resize(W,H,DPR);stage.setLayout(m=>cardLayout(m));}
 if(!portrait())for(const b of BRANDS){const e=brandEl[b.id];if(e){e.style.width=b.w+'px';e.style.height=b.h+'px';e._k=null;}}
 const sw=sideW();for(const c of CARDS){const d=cardDom[c.id];if(d){d.el.style.width=sw+'px';d.el.querySelector('.nm').textContent=portrait()&&c.id==='cmb'?'招行 Mastercard':c.short;d.init=false;}}}

function buildDom(){
 for(const b of BRANDS){const e=document.createElement('button');e.type='button';e.className='gw-brand'+(b.crop?' crop':'');e.dataset.id=b.id;e.dataset.domain=b.d;e.style.width=b.w+'px';e.style.height=b.h+'px';e.tabIndex=-1;e.setAttribute('aria-label',b.name+(b.cap?'，'+b.cap:''));
  e.innerHTML='<span class="logo"><img alt="" draggable="false"></span><span class="cap"><b></b><i></i></span>';const img=e.querySelector('img');img.src=HOST.brandSources?.[b.id]||ASSET+b.src;img.alt=b.name;e.querySelector('b').textContent=b.name;e.querySelector('i').textContent=b.cap||'';
  const on=()=>{hover=b.id;kick();},off=()=>{if(hover===b.id){hover=null;kick();}};e.addEventListener('pointerenter',on);e.addEventListener('pointerleave',off);e.addEventListener('focus',on);e.addEventListener('blur',off);
  el.brands.append(e);brandEl[b.id]=e;}
 for(const c of CARDS){const e=document.createElement('button');e.type='button';e.className='gw-card';e.dataset.card=c.id;e.tabIndex=-1;e.setAttribute('aria-label','切换主卡：'+c.name+'，'+c.scene);
  e.innerHTML='<img alt="" draggable="false"><span class="nm"></span><span class="sc"></span>';const img=e.querySelector('img');img.src=c.src;img.alt=c.name;e.querySelector('.nm').textContent=c.short;e.querySelector('.sc').textContent=c.scene;
  e.addEventListener('click',()=>{requestCard(c.id);kick();});e.addEventListener('pointerenter',()=>{hover=c.id;kick();});e.addEventListener('pointerleave',()=>{if(hover===c.id)hover=null;kick();});
  el.cards.append(e);cardDom[c.id]={el:e,img,cur:{x:0,y:0,sc:1,rot:0,op:0,br:1},init:false,recent:null};}
 el.cardNav=CARDS.map((c,i)=>{const b=document.createElement('button');b.type='button';b.dataset.card=c.id;b.innerHTML=`<span>0${i+1}</span>${c.short}`;b.addEventListener('click',()=>{requestCard(c.id);kick();});el.cardNavWrap.append(b);return b;});
}
let kick=()=>{};
let onPtr=null;
const NF_GLOBAL={LEN,STOPS,ZONE,DOMAINS,CARDS,BRANDS,domainAt,
 get surface(){return surfaceGeometry();},
 async init(opts){
  HOST=opts;if(opts.guides)for(const d of DOMAINS){const guide=opts.guides.find(g=>g.domain===d.key);if(guide){d.link=guide.title;d.href=guide.url||'#guide-'+guide.id;}}el=opts.el;ctx=el.cv.getContext('2d');kick=opts.kick||kick;buildDom();
  stage=NFCardStage.create(el.gl,CARDS,{reduced:REDUCED,onCommit,noWebGL:opts.noWebGL??Q.has('nogl'),slowLoad:opts.slowLoad??(Number(Q.get('slow'))||0),onReady:()=>kick(),onLost:()=>kick(),onRestored:()=>kick()});
  resize(opts.W,opts.H,opts.dpr);
    onPtr=e=>{if(e.pointerType!=='mouse'||REDUCED||!stage.snap||(HOST.isActive&&!HOST.isActive()))return;const s=stage.snap,inside=Math.abs(e.clientX-s.x)<s.cw*.6&&Math.abs(e.clientY-s.y)<s.ch*.7&&lastG>=ZONE.in&&lastG<=ZONE.out;stage.setTilt(inside?(e.clientX-s.x)/s.cw*.19:0,inside?-(e.clientY-s.y)/s.ch*.13:0);kick();};addEventListener('pointermove',onPtr,{passive:true});
  ready=true;stage.load().then(kick); // 不阻塞：首张卡就绪即可交互，其余纹理后台加载（未就绪时换卡保持低 q 等待）
  kick();return true;
 },
 render,resize,
 request:requestCard,
 destroy(){ready=false;if(onPtr)removeEventListener('pointermove',onPtr);onPtr=null;stage&&stage.destroy();stage=null;el.brands.textContent='';el.cards.textContent='';el.cardNavWrap.textContent='';},
 get state(){return {g:lastG,card:stage&&stage.state,slots:{...slots},confirmed,hover,stats:{...stats},metrics:stage&&stage.metrics,reduced:REDUCED,brands:Object.fromEntries(Object.entries(placed).filter(([,v])=>v.a>.01).map(([k,v])=>[k,[Math.round(v.x),Math.round(v.y),+v.a.toFixed(2)]]))};},
 get stage(){return stage;}
};
/* 开发探针：世界坐标（以区块步长为单位）→ 屏幕坐标，便于检查布局 */
if(DEBUG){NF_GLOBAL._tune=NF_TUNE;NF_GLOBAL._probe=(bx,by,g,h=0)=>{const C=cam(g),q=P(C,bx*2.5*E,by*2.5*E,h*E);return q&&[Math.round(q[0]),Math.round(q[1])];};}
window.NF_GLOBAL=NF_GLOBAL;

/* ---------- 独立原型驱动：scrollY / H → g（集成时由 NF_TIMELINE 替换） ---------- */
if(document.documentElement.dataset.globalHost==='home')return;
const $=id=>document.getElementById(id);
if(!$('gw-stage'))return;
const els={stage:$('gw-stage'),cv:$('gw-cv'),gl:$('gw-gl'),fallback:$('gw-fallback'),brands:$('gw-brands'),cards:$('gw-cards'),cardNavWrap:$('gw-cardnav'),cap:$('gw-cardcap'),capK:$('gw-cap-k'),capN:$('gw-cap-n'),capD:$('gw-cap-d'),
 chap:$('gw-chap'),crumb:$('gw-crumb'),panels:[...document.querySelectorAll('.gw-panel')],nav:[...document.querySelectorAll('#gw-nav button')],prog:$('gw-prog'),hint:$('gw-hint'),fill:$('gw-fill'),live:$('gw-live'),debug:$('gw-debug')};
let gT=0,gV=0,raf=0,last=performance.now(),clock=0,anim=null,unit=innerHeight;
function maxScroll(){return LEN*unit;}
function setTrack(){unit=innerHeight;$('gw-track').style.height=(LEN*unit+innerHeight)+'px';}
let frozen=false; // 调试：冻结实时循环，仅由 advance() 推进（用于逐帧截图）
function schedule(){if(!raf&&!frozen)raf=requestAnimationFrame(frame);}
function frame(now){raf=0;if(frozen)return;const dt=clamp((now-last)/1000,0,.05);last=now;clock+=dt;
 if(anim){const f=clamp((now-anim.t0)/anim.dur);scrollTo(0,mix(anim.y0,anim.y1,io(f)));if(f>=1)anim=null;}
 gT=clamp(scrollY/unit,0,LEN);gV=REDUCED?gT:mix(gV,gT,1-Math.exp(-dt*9));if(Math.abs(gV-gT)<.0004)gV=gT;
 const r=NF_GLOBAL.render(gV,clock);if(anim||gV!==gT||r.needsFrame)schedule();}
function goTo(g){const y1=clamp(g,0,LEN)*unit;if(REDUCED){anim=null;scrollTo(0,y1);schedule();return;}anim={y0:scrollY,y1,t0:performance.now(),dur:clamp(Math.abs(y1-scrollY)/unit*260,450,2400)};schedule();}
els.nav.forEach(b=>b.addEventListener('click',()=>goTo(STOPS[b.dataset.go])));
addEventListener('scroll',schedule,{passive:true});for(const ev of ['wheel','touchstart'])addEventListener(ev,()=>{anim=null;},{passive:true});
addEventListener('keydown',e=>{if(e.target.closest&&e.target.closest('input,textarea'))return;const k=['1','2','3','4'].indexOf(e.key);if(k>=0&&!e.metaKey&&!e.ctrlKey){goTo(STOPS[DOMAINS[k].key]);}if(['ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' '].includes(e.key))anim=null;});
addEventListener('resize',()=>{const g=gT;setTrack();NF_GLOBAL.resize(innerWidth,innerHeight,devicePixelRatio);scrollTo(0,g*unit);gV=gT=g;schedule();});
document.querySelectorAll('.gw-panel a').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();els.live.textContent=a.textContent.replace('↗','').trim()+'：教程页尚未接入（原型）';}));
(async()=>{
 if(location.protocol==='file:'){$('gw-http').hidden=false;document.documentElement.dataset.ready='requires-http';return;}
 setTrack();if(DEBUG)els.debug.hidden=false;
 if(Q.has('g')){const g=clamp(Number(Q.get('g'))||0,0,LEN);scrollTo(0,g*unit);gT=gV=g;}
 try{await NF_GLOBAL.init({el:els,W:innerWidth,H:innerHeight,dpr:devicePixelRatio,kick:schedule});}catch(e){console.error(e);els.live.textContent='素材加载失败：'+e.message;}
 gT=gV=clamp(scrollY/unit,0,LEN);schedule();document.documentElement.dataset.ready='true';
 window.NF_GLOBAL_DEBUG={seek(g){anim=null;scrollTo(0,g*unit);gT=gV=clamp(g,0,LEN);NF_GLOBAL.render(gV,clock);schedule();},
  select(id){const ok=NF_GLOBAL.request(id);schedule();return ok;},
  advance(sec,fps=60){const n=Math.round(sec*fps);for(let i=0;i<n;i++){clock+=1/fps;NF_GLOBAL.render(gV,clock);}return NF_GLOBAL.state.card;},
  get state(){return {...NF_GLOBAL.state,gT,gV,raf:!!raf};},stops:STOPS,loseContext(){NF_GLOBAL.stage.loseContext();},
  freeze(on){frozen=!!on;if(!frozen){last=performance.now();schedule();}return frozen;}};
})();
})();
