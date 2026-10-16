/* Brand content lives in data/*.js. One projection drives both ink and DOM. */
'use strict';
window.NFShowcase = function ({ctx, viewport, line, dot, text, clamp, lerp, range, ease, timeline}) {
  const root=document.getElementById('brands'), panel=document.getElementById('brand-detail');
  const all=[...window.NF_MODELS,...window.NF_AGENTS,...window.NF_LOCAL];
  const groups={}, positions=new Map();
  let active=null, timer=0, pinned=false;
  const el=(tag,cls,value)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(value)n.textContent=value;return n;};
  const link=(label,url)=>{const a=el('a','',label);a.href=url;a.target='_blank';a.rel='noopener noreferrer';return a;};
  const content={
    models:['01.1 / SEQUENCE','模型生态','八种模型生态，同一片数字空间。','悬停或聚焦节点，查看代表模型','08 / MODELS'],
    agents:['01.3 / PLATFORM','AI 客户端与 Agent','从编程助手到智能体平台，探索不同的 AI 工作方式。','选择一个节点，探索另一种工作方式','10 / PLATFORMS'],
    local:['01.2 / LOCAL','本地 AI','本地模型、推理工具与生成式工作流。','数值方格：权重表示精度示意；去噪图像：独立生成流程。','LOCAL / WORKFLOW']
  };
  for(const [key,data] of [['models',window.NF_MODELS],['agents',window.NF_AGENTS],['local',window.NF_LOCAL]]){
    const group=el('section','brand-group');group.id=key+'-brands';group.setAttribute('aria-label',content[key][1]);group.inert=true;
    const copy=el('div','scene-copy');copy.append(el('div','eyebrow',content[key][0]),el('h2','',content[key][1]),el('p','',content[key][2]));group.append(copy);
    const foot=el('div','scene-foot');foot.append(el('span','',content[key][3]),el('span','',content[key][4]));group.append(foot);
    const nodes=data.map((item,i)=>{
      const b=el('button','brand-node'+(item.logo?'':' text-node'));b.type='button';b.dataset.id=item.id;b.setAttribute('aria-label',item.name+'：查看详情');b.setAttribute('aria-controls','brand-detail');b.setAttribute('aria-expanded','false');
      if(item.logo){const img=el('img');img.src='../assets/brands/'+item.logo;img.alt='';img.width=30;img.height=30;img.draggable=false;img.addEventListener('error',()=>img.hidden=true);b.append(img);}
      else b.append(el('span','wordmark',item.shortName||item.name));
      b.append(el('span','node-name',item.name),el('span','node-meta',item.featuredModels?item.provider:(item.category||item.provider)));
      b.addEventListener('pointerenter',()=>{clearTimeout(timer);if(!pinned)open(item,b,false);});
      b.addEventListener('pointerleave',scheduleClose);
      b.addEventListener('focus',()=>{clearTimeout(timer);open(item,b,false);});
      b.addEventListener('blur',e=>{if(!panel.contains(e.relatedTarget))scheduleClose();});
      b.addEventListener('click',()=>{open(item,b,true);});
      group.append(b);return {item,b,i};
    });
    root.append(group);groups[key]={group,nodes};
  }
  function close(returnFocus=false){
    clearTimeout(timer);if(active){active.b.setAttribute('aria-expanded','false');if(returnFocus)active.b.focus({preventScroll:true});}
    active=null;pinned=false;panel.hidden=true;
  }
  function scheduleClose(){clearTimeout(timer);if(!pinned)timer=setTimeout(()=>{if(!panel.matches(':hover')&&!panel.contains(document.activeElement)&&active?.b!==document.activeElement)close();},220);}
  function locate(b){
    const r=b.getBoundingClientRect(),w=panel.offsetWidth,h=panel.offsetHeight;
    let x=r.right+12;if(x+w>innerWidth-20)x=r.left-w-12;
    panel.style.left=clamp(x,14,innerWidth-w-14)+'px';
    panel.style.top=clamp(r.top+r.height/2-h/2,14,innerHeight-h-14)+'px';
  }
  function open(item,b,pin){
    clearTimeout(timer);if(active?.b===b){pinned=pinned||pin;return;}
    if(active)active.b.setAttribute('aria-expanded','false');active={item,b};pinned=pin;
    panel.replaceChildren();const closeButton=el('button','','×');closeButton.type='button';closeButton.setAttribute('aria-label','关闭详情');closeButton.addEventListener('click',()=>close(true));panel.append(closeButton);
    const title=el('h3','',item.name);title.id='detail-title';
    panel.append(el('div','detail-type',item.category||'模型生态'),title,el('p','provider',item.provider+(item.officialName&&item.officialName!==item.name?' · '+item.officialName:'')));
    if(item.featuredModels){panel.append(el('p','model-names',item.featuredModels.length?item.featuredModels.join(' / '):'代表模型待核验'),el('p','model-scope',item.modelScope));}
    panel.append(el('p','detail-description',item.description),el('p','verified','资料核验 '+(item.verifiedAt||'待确认')));
    const links=el('div','detail-links');if(item.officialSource)links.append(link('官方资料 ↗',item.officialSource));if(item.detailUrl)links.append(link('访问产品 ↗',item.detailUrl));panel.append(links);
    b.setAttribute('aria-expanded','true');panel.hidden=false;locate(b);
  }
  panel.addEventListener('pointerenter',()=>clearTimeout(timer));panel.addEventListener('pointerleave',scheduleClose);
  panel.addEventListener('focusin',()=>clearTimeout(timer));panel.addEventListener('focusout',e=>{if(!panel.contains(e.relatedTarget))scheduleClose();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden){e.preventDefault();close(true);}});
  document.addEventListener('pointerdown',e=>{if(active&&!panel.contains(e.target)&&!active.b.contains(e.target))close();});
  const catalog=document.getElementById('catalog');
  for(const [title,items] of [['模型生态',window.NF_MODELS],['本地 AI',window.NF_LOCAL],['AI 客户端与 Agent',window.NF_AGENTS]]){
    catalog.append(el('h3','',title));const ul=el('ul');
    for(const item of items){const li=el('li');li.append(el('strong','',item.name+' · '+item.provider),el('p','',item.description));
      if(item.featuredModels)li.append(el('p','',(item.modelScope||'代表型号')+'：'+(item.featuredModels.join(' / ')||'待核验')));
      li.append(el('p','','资料核验：'+(item.verifiedAt||'待确认')));const links=el('div','catalog-links');if(item.officialSource)links.append(link('官方资料 ↗',item.officialSource));if(item.detailUrl)links.append(link('产品入口 ↗',item.detailUrl));li.append(links);ul.append(li);
    }catalog.append(ul);
  }
  document.getElementById('catalog-open').addEventListener('click',()=>{close();catalog.showModal();});
  document.querySelector('.skip').addEventListener('click',e=>{e.preventDefault();catalog.showModal();});
  document.getElementById('catalog-close').addEventListener('click',()=>catalog.close());
  catalog.addEventListener('click',e=>{if(e.target===catalog){const r=catalog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)catalog.close();}});

  // Scroll-only camera. No idle node drift, and no pointer-driven hit-target motion.
  function projection(kind,i,n,s){
    const {W,H,SL,SR,FX,FY,FZ}=viewport(),small=W<=760;
    if(kind==='local')return {x:small?W*(.24+i*.27):FX+FZ/2+115,y:small?H*.68:FY-FZ/2+35+i*91,scale:small?.85:1,alpha:1};
    const tl=timeline[kind],enter=ease(range(s,tl.start+i*.024,tl.formed-.08+i*.012)),exit=ease(range(s,tl.holdEnd,tl.end));
    const left=small?W*.09:SL+20,right=small?W*.85:SR-35,aw=right-left,cx=(left+right)/2,cy=H*(small?.52:.52);
    let x,y,z,ang;
    if(kind==='models'){
      ang=-Math.PI/2+i/n*Math.PI*2;z=Math.sin(ang+.6)*.55;
      x=cx+Math.cos(ang)*aw*.38*(1+z*.1);y=cy+Math.sin(ang)*H*(small?.155:.235);
    }else{
      // Two offset, projected trajectories; ten independently readable stations.
      const row=i%2,col=Math.floor(i/2),u=col/4;
      x=small?W*(.28+row*.39):left+aw*(.07+u*.85+row*.04);y=small?H*(.385+col*.073):cy+(row?1:-1)*H*.14+Math.sin(u*Math.PI)*H*.035;
      z=(u-.5)*.55;ang=u*Math.PI;
    }
    const startX=left+aw*(i/(n-1)),startY=H*.58;
    const twist=(1-enter)*Math.PI*.85,dx=x-cx,dy=y-cy;
    x=lerp(startX,cx+(dx*Math.cos(twist)-dy*Math.sin(twist))*(.15+.85*enter),enter);
    y=lerp(startY,cy+(dx*Math.sin(twist)*.5+dy*Math.cos(twist))*(.15+.85*enter),enter);
    // Model exit focuses Qwen into the original Local AI field; Agent exit flattens to the bridge.
    const qx=kind==='models'?FX:W/2,qy=kind==='models'?FY:H/2;
    x=lerp(x,qx,exit);y=lerp(y,qy,exit);
    return {x,y,z,ang,scale:(small?.78:1)*(1+z*.12)*(1-exit*.55),alpha:range(enter,.18,.82)*(1-range(exit,.1,.9)),enter,exit};
  }
  function setGroup(key,s){
    const {W,H,SL,SR}=viewport(),g=groups[key],tl=timeline[key];
    const alpha=key==='local'?range(s,tl.start,tl.start+.18)*(1-range(s,tl.end-.14,tl.end)):range(s,tl.start,tl.start+.18)*(1-range(s,tl.holdEnd,tl.end));
    const visible=alpha>.005;
    g.group.style.visibility=visible?'visible':'hidden';g.group.style.opacity=alpha;
    const interactive=alpha>.65&&(key==='local'||s>tl.formed-.1);g.group.inert=!interactive;
    if(!visible){if(active&&g.group.contains(active.b))close();return;}
    const pts=g.nodes.map(({item,b,i})=>{
      const p=projection(key,i,g.nodes.length,s);positions.set(item.id,p);
      b.style.transform=`translate3d(${p.x}px,${p.y}px,0) translate(-50%,-50%) scale(${p.scale})`;
      b.style.opacity=p.alpha;b.style.pointerEvents=interactive?'auto':'none';b.tabIndex=interactive?0:-1;
      return p;
    });
    if(key==='local')return;
    const cx=(SL+SR)/2,cy=H*.52,fade=alpha;
    // Many quiet, ordered fragments assemble into two layered spatial rails.
    for(let layer=0;layer<3;layer++){
      ctx.beginPath();const count=120;
      for(let k=0;k<=count;k++){
        const u=k/count,angle=u*Math.PI*2,formation=ease(range(s,tl.start+.05,tl.formed));
        const ax=W<=760?W*.47:cx,rx=(W<=760?W*.3:(SR-SL)*.37)*(1-layer*.13),ry=H*(W<=760?.155:.23)*(1-layer*.21);
        let x=ax+Math.cos(angle)*rx,y=cy+Math.sin(angle)*ry;
        if(key==='agents'){x=lerp(W<=760?W*.13:SL+38,W<=760?W*.82:SR-40,u);y=cy+(layer-1)*H*.14+Math.sin(u*Math.PI)*H*.035;}
        const f=ease(range(s,tl.holdEnd,tl.end));x=lerp(lerp(ax+(u-.5)*rx*2,x,formation),W/2+(u-.5)*W,f);y=lerp(lerp(H*.58,y,formation),H/2,f);
        k?ctx.lineTo(x,y):ctx.moveTo(x,y);
      }
      ctx.strokeStyle=`rgba(237,237,235,${fade*(layer===0?.25:.085)})`;ctx.lineWidth=1;ctx.stroke();
    }
    for(let j=0;j<110;j++){
      const u=j/110,ang=u*Math.PI*2,formed=ease(range(s,tl.start,tl.formed));
      const ax=W<=760?W*.47:cx,rx=(W<=760?W*.29:(SR-SL)*.36),ry=H*(W<=760?.15:.23);
      let x=ax+Math.cos(ang)*rx,y=cy+Math.sin(ang)*ry;
      if(key==='agents'){x=lerp(W<=760?W*.13:SL+38,W<=760?W*.82:SR-40,u);y=cy+Math.sin(u*Math.PI)*H*.035+(j%2?1:-1)*H*.14;}
      const ex=ease(range(s,tl.holdEnd,tl.end));
      x=lerp(lerp(SL+u*(SR-SL),x,formed),W/2,ex);y=lerp(lerp(H*.58,y,formed),H/2,ex);
      dot(x,y,j%11===0?1.6:.65,fade*(j%11===0?.55:.18)*(1-ex));
    }
    pts.forEach((p,i)=>{
      const selected=active?.item.id===g.nodes[i].item.id;
      if(key==='models'&&W>760){line(cx,cy,p.x,p.y,.055*fade*p.enter);}
      const span=selected?24:12;line(p.x-span,p.y+56,p.x+span,p.y+56,fade*(selected?.85:.24));
    });
    if(key==='models'&&W>760){text('AI',cx,cy+18,64,.13*fade,{w:300,al:'center',ls:6});text('MODEL CONSTELLATION',cx,cy+45,8,.32*fade,{al:'center'});}
    if(active&&g.group.contains(active.b)&&alpha<.12)close();
  }
  function draw(s){for(const key of ['models','local','agents'])setGroup(key,s);}
  function resize(){if(active)requestAnimationFrame(()=>locate(active.b));}
  return {draw,resize,close,positions};
};
