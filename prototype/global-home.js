/* Integrates the approved Opus scene without another scroll handler or RAF clock. */
'use strict';
window.NFGlobalHome=function({clock,setBackground,kick}){
 const $=id=>document.getElementById(id),root=$('global-world'),Q=new URLSearchParams(location.search),debug=Q.has('debug');
 const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)),range=(x,a,b)=>clamp((x-a)/(b-a));
 let initialized=false,initializing=false,active=false,dirty=true,needsFrame=true,lastG=null,destroyed=false,initCount=0,panelLayoutKey='';
 const guides=window.NF_GLOBAL_GUIDES,global=window.NF_GLOBAL;
 const els={stage:$('gw-stage'),cv:$('gw-cv'),gl:$('gw-gl'),fallback:$('gw-fallback'),brands:$('gw-brands'),cards:$('gw-cards'),cardNavWrap:$('gw-cardnav'),cap:$('gw-cardcap'),capK:$('gw-cap-k'),capN:$('gw-cap-n'),capD:$('gw-cap-d'),
  chap:$('gw-chap'),crumb:document.createElement('span'),panels:[...root.querySelectorAll('.gw-panel')],nav:[...root.querySelectorAll('#gw-nav button')],prog:$('gw-prog'),hint:$('gw-hint'),fill:$('gw-fill'),live:$('gw-live'),debug:$('gw-debug')};
 const catalog=$('catalog'),section=document.createElement('section');section.id='global-content';
 const heading=document.createElement('h3');heading.textContent='全球数字服务 / 内容索引';section.append(heading);
 for(const guide of guides){
  const item=document.createElement('section');item.id='guide-'+guide.id;item.className='global-guide-index';item.tabIndex=-1;
  const h=document.createElement('h4');h.textContent=guide.title;const status=document.createElement('p');status.className='guide-status';status.textContent=guide.url?'已配置内容入口':guide.status;item.append(h,status);
  const d=global.DOMAINS.find(x=>x.key===guide.domain),p=document.createElement('p');p.textContent=d.desc;item.append(p);
  const names=document.createElement('p');names.textContent=(guide.domain==='cards'?global.CARDS:global.BRANDS.filter(b=>b.d===guide.domain)).map(b=>b.name).join(' · ');item.append(names);
  if(guide.url){const a=document.createElement('a');a.href=guide.url;a.textContent='阅读指南 ↗';item.append(a);}
  section.append(item);const panel=els.panels.find(p=>p.getAttribute('aria-label')===d.title),a=panel.querySelector('a');a.textContent=guide.title+' ↗';if(guide.url){a.href=guide.url;a.removeAttribute('data-guide');}
 }
 const help=document.createElement('p');help.className='global-shortcuts';help.textContent='Global 中数字 1–4 切换领域；Alt+0–3 切换全站章节。';section.append(help);catalog.append(section);
 function invalidate(){if(destroyed)return;dirty=true;kick();}
 function init(){
  if(initialized||initializing||destroyed)return;initializing=true;initCount++;
  global.init({el:els,W:innerWidth,H:innerHeight,dpr:devicePixelRatio,kick:invalidate,isActive:()=>active,
   entryText:'从 AI 出发，连接更广阔的数字世界。',tokens:[['01','号码'],['02','网络'],['03','账户与钱包'],['04','支付卡片']],
   suppressExitLabels:true,guides,onCardCommit(id){
    if(!active||document.activeElement?.closest('.gw-card')?.dataset.card!==id)return;
    queueMicrotask(()=>{if(!active)return;const target=innerWidth>760?els.cardNavWrap.querySelector('[data-card="'+id+'"]'):els.nav[3];target.focus({preventScroll:true});});
   },setBackground:(bg,white)=>{setBackground(bg);document.body.classList.toggle('on-white',white);},
   brandSources:{instagram:new URL('../assets/global/social/derived/instagram-512.png',document.currentScript?.src||new URL('global-home.js',location.href)).href},
   noWebGL:debug&&Q.has('nogl'),slowLoad:debug?Number(Q.get('slow'))||0:0,
  }).then(()=>{if(destroyed)return;initialized=true;initializing=false;invalidate();}).catch(error=>{initializing=false;els.live.textContent='Global 素材准备失败：'+error.message;console.error(error);});
 }
 function render(scrollS,time){
  const s=clock.toScene(scrollS),start=clock.globalWorld.sceneStart,end=start+clock.globalWorld.length,prelude=clock.globalWorld.prelude;
  if(s>=clock.scene.agents.end)init();
  const ownsStage=s>=prelude&&s<end,g=clock.globalProgress(scrollS);
  if(!ownsStage){
   if(active){active=false;if(initialized){global.render(global.LEN,time);global.stage?.clear();}root.inert=true;root.setAttribute('aria-hidden','true');root.style.visibility='hidden';document.body.classList.remove('global-active','on-white');lastG=null;}
   return {active:false,g,personalUnderlay:false};
  }
  active=true;root.inert=false;root.setAttribute('aria-hidden','false');root.style.visibility='visible';document.body.classList.add('global-active');
  const fadeIn=range(s,prelude,prelude+.14),fieldBlend=range(g,global.LEN-.08,global.LEN);
  root.style.opacity=(fadeIn*(1-fieldBlend)).toFixed(5);
  if(initialized&&(dirty||needsFrame||lastG!==g)){dirty=false;needsFrame=global.render(g,time).needsFrame;lastG=g;}
  const mobile=innerWidth<=760,di=global.domainAt(g),key=di+':'+innerWidth+':'+innerHeight;
  if(mobile&&key!==panelLayoutKey){panelLayoutKey=key;root.style.setProperty('--global-panel-height',els.panels[di].offsetHeight+'px');}
  const introAlpha=range(g,.70,.84)*(1-range(g,mobile?.92:1.48,mobile?1:1.60));$('gw-intro').style.opacity=introAlpha.toFixed(3);$('gw-intro').style.visibility=introAlpha>.01?'visible':'hidden';
  $('gw-loading').hidden=!(g>=4.96&&g<6.72&&(!initialized||!global.state.card?.ready[global.state.card.from]));
  return {active:true,g,personalUnderlay:fieldBlend>0};
 }
 function openGuide(id){const guide=guides.find(x=>x.id===id);if(!guide||guide.url)return false;if(!catalog.open)catalog.showModal();$('guide-'+id).focus({preventScroll:true});$('guide-'+id).scrollIntoView({block:'center'});return true;}
 function resize(){if(initialized)global.resize(innerWidth,innerHeight,devicePixelRatio);invalidate();}
 function destroy(){destroyed=true;if(initialized||initializing)global.destroy();root.inert=true;root.style.visibility='hidden';active=false;}
 return {render,resize,destroy,openGuide,request(id){const ok=global.request(id);invalidate();return ok;},invalidate,
  get state(){return {active,initialized,initializing,initCount,g:lastG,needsFrame,global:initialized?global.state:null};}};
};
