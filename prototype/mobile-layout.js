/* Portrait layout contract. CSS, Canvas scenes, logos and cards share these rectangles. */
(()=>{'use strict';
 const root=document.documentElement,$=id=>document.getElementById(id),rect=(x,y,w,h)=>({x,y,w,h,right:x+w,bottom:y+h,cx:x+w/2,cy:y+h/2});
 const probe=document.createElement('i');probe.id='mobile-insets';probe.setAttribute('aria-hidden','true');document.body.append(probe);
 const summaries=['境外号码、通讯与账号服务；条件以官方说明为准。','客户端、代理与远程服务器，组成连接路径。','账户服务与钱包并列，不代表资金互通。','点按侧卡，以粒子解构与重组切换主卡。'];
 document.querySelectorAll('.gw-panel').forEach((p,i)=>{const s=document.createElement('span');s.className='mobile-summary';s.textContent=summaries[i];p.querySelector('.d').after(s);});
 let state={active:false,view:rect(0,0,innerWidth,innerHeight)};
 function viewport(){const v=visualViewport;return {w:innerWidth,h:v&&Math.abs(v.scale-1)<.01?Math.min(innerHeight,v.height):innerHeight};}
 function refresh(w=viewport().w,h=viewport().h){
  const active=w<=760&&h>w;root.dataset.mobileLayout=active?'portrait':'other';
  if(!active){root.dataset.mobileCompact='false';root.dataset.mobileTiny='false';state={active:false,view:rect(0,0,w,h)};return state;}
  const s=getComputedStyle(probe),safe={top:parseFloat(s.paddingTop)||0,bottom:parseFloat(s.paddingBottom)||0,left:parseFloat(s.paddingLeft)||0,right:parseFloat(s.paddingRight)||0};
  const effective=h-safe.top-safe.bottom,compact=effective<560;root.dataset.mobileCompact=String(compact);root.dataset.mobileTiny=String(effective<=500);
  const x=Math.max(16,safe.left+10),right=Math.max(16,safe.right+10),width=w-x-right,bottom=safe.bottom+12;
  const header=$('nf-topnav')?.getBoundingClientRect().bottom||58+safe.top;
  const set=(key,value)=>root.style.setProperty('--m-'+key,value+'px');
  set('vh',h);set('x',x);set('right',right);set('width',width);set('bottom',bottom);set('header',header);set('tabs-y',header+6);set('title-y',header+(effective<650?54:60));set('node-w',(width-12)/2);set('global-chap-y',header+(compact?16:8));set('global-nav-x',x+(compact?42:0));set('global-nav-y',header+(compact?6:42));set('personal-caption-y',header+12);
  const copies=[...document.querySelectorAll('.scene-copy')],copyH=Math.max(26,...copies.map(e=>e.offsetHeight));
  const top=header+(effective<650?54:60)+copyH+6,bar=rect(x,h-bottom-44,width,44),ai=rect(x,top,width,bar.y-34-top),local=rect(x,top,width,bar.y-54-top);
  set('ai-top',ai.y);set('ai-bottom',ai.bottom);set('local-bottom',local.bottom);set('personal-top',header+52);
  const size=Math.min(width*.53,local.h-96,210),blockH=size+92,blockY=local.y+Math.max(0,(local.h-blockH)/2),toolW=width-size-12;
  const localSquare=rect(x,blockY,size,size),localTools=rect(x+size+12,blockY,toolW,blockH);set('local-node-w',toolW);
  const globalTop=$('gw-nav').getBoundingClientRect().bottom+(compact?10:14);
  const panels=[...document.querySelectorAll('.gw-panel')],domains=['number','network','accounts','cards'],global={};
  for(let i=0;i<4;i++){const panelH=panels[i]?.offsetHeight||128,area=rect(x,globalTop,width,h-bottom-panelH-12-globalTop);global[domains[i]]=area;}
  const frame=(r,maxH)=>rect(r.x,r.y+Math.max(0,(r.h-Math.min(r.h,maxH))/2),r.w,Math.min(r.h,maxH));
  const number=frame(global.number,360),network=frame(global.network,width*.96),accounts=frame(global.accounts,360),cards=global.cards;
  const aspects=window.NF_GLOBAL?.CARDS.map(c=>c.aspect)||[1.55],minAspect=Math.min(...aspects);
  const sideW=Math.min(width*.43,164),sideH=sideW/minAspect+25,capH=24,gap=12,mainH=Math.min(width*.90/minAspect,cards.h-sideH-capH-gap),mainMaxW=Math.max(120,mainH*minAspect);
  const groupH=mainH+capH+gap+sideH,groupY=cards.y+(cards.h-groupH)/2,card={x:cards.cx,y:groupY+mainH/2,mainMaxW,mainH,capY:groupY+mainH+8,sideW,sideY:groupY+mainH+capH+gap+sideW/minAspect/2};set('card-y',card.y);
  state={active,view:rect(0,0,w,h),safe,header,pad:x,bar,ai,local,localSquare,localTools,global,number,network,accounts,card,personal:rect(x,header+52,width,h-bottom-62-header-52)};
  state.aiNodes={};for(const kind of ['models','agents']){const nodes=[...document.querySelectorAll('#'+kind+'-brands .brand-node')],rows=Math.ceil(nodes.length/2),heights=Array.from({length:rows},(_,j)=>Math.max(...nodes.slice(j*2,j*2+2).map(e=>e.offsetHeight),44));const gap=Math.max(2,Math.min(kind==='agents'?36:56,(ai.h-heights.reduce((a,b)=>a+b,0))/(rows-1))),total=heights.reduce((a,b)=>a+b,0)+gap*(rows-1);state.aiNodes[kind]=nodes.map((_,i)=>{const row=Math.floor(i/2);return {x:ai.x+ai.w*(i%2?.75:.25),y:ai.cy-total/2+heights.slice(0,row).reduce((a,b)=>a+b,0)+gap*row+heights[row]/2,h:heights[row]};});}
  return state;
 }
 function node(kind,i,n){
  if(kind==='local'){const r=state.localTools;return {x:r.cx,y:r.y+28+(r.h-56)*i/Math.max(1,n-1)};}
  return state.aiNodes[kind][i];
 }
 function numberNode(id){const r=state.number,extra=Math.max(0,r.h-228),p={clubsim:[.25,22],smart:[.75,22],whatsapp:[1/6,116+extra*.45],telegram:[.5,116+extra*.45],line:[5/6,116+extra*.45],instagram:[.32,184+extra],facebook:[.68,184+extra]}[id];return {x:r.x+r.w*p[0],y:r.y+p[1]};}
 function accountNode(id){const r=state.accounts,p={ifast:[.25,34],wise:[.75,34],paypal:[.5,Math.min(142,r.h*.45)],applepay:[.25,r.h-58],googlepay:[.75,r.h-58]}[id];return {x:r.x+r.w*p[0],y:r.y+p[1]};}
 function brand(b){const logoW=b.d==='number'&&b.w<50?Math.min(b.w,34):b.d==='network'?34:b.w,logoH=b.d==='number'&&b.h<40?Math.min(b.h,34):b.d==='network'?34:b.h;return {logoW,logoH,w:Math.max(44,logoW),h:Math.max(44,logoH),capW:b.d==='number'&&!['clubsim','smart'].includes(b.id)?state.ai.w/3-8:state.ai.w/2-10};}
 window.NF_MOBILE={viewport,refresh,node,numberNode,accountNode,brand,get state(){return state;}};
})();
