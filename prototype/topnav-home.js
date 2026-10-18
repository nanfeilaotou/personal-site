/* Page navigation, independent of the homepage's chapter rail. */
'use strict';
window.NFHomeTopNav=function({coverage}){
 const I=window.NFI18n;
 I.extend('zh',{'theme.artNote':'首页为固定艺术画面；深浅主题仅用于后续 AI、全球、个人页面。','nav.ai.sub':'AI · 页面筹备中','nav.global.sub':'全球数字服务 · 页面筹备中','nav.personal.sub':'个人 · 页面筹备中'});
 I.extend('en',{'theme.artNote':'The homepage keeps its artwork colours. Theme preferences are for the future AI, Global and Personal pages.','nav.ai.sub':'AI · Coming soon','nav.global.sub':'Global digital services · Coming soon','nav.personal.sub':'Personal · Coming soon'});
 let rect={left:0,right:innerWidth,top:0,bottom:68,width:innerWidth,height:68};
 const query=new URLSearchParams(location.search);
 const nav=NFTopNav.mount({active:'open',lang:query.get('lang')||undefined,theme:query.get('theme')||undefined,persist:!query.has('nopersist'),
  artThemeIndependent:true,isAt:()=>true,navigate:()=>{},canNavigate:key=>key==='open',
  onUnavailable:key=>nav.toast(nav.state.lang==='en'?'This page is not available yet.':'该页面尚未开放。'),
  onLangChange:L=>({fallbacks:L==='en'?1:0}),
  onMenuToggle:open=>{document.getElementById('site-content').inert=open;}
 });
 // No fake chapter hashes or empty href="#" links. Future page URLs belong here.
 for(const a of nav.el.querySelectorAll('a[data-nav]')){
  if(a.dataset.nav==='open'){a.href='/';continue;}
  a.removeAttribute('href');a.tabIndex=0;a.setAttribute('role','link');a.setAttribute('aria-disabled','true');a.title='页面筹备中 · Coming soon';
 }
 nav.el.addEventListener('keydown',e=>{const a=e.target.closest('a[aria-disabled=true]');if(a&&['Enter',' '].includes(e.key)){e.preventDefault();nav.go(a.dataset.nav);}});
 function resize(){const r=nav.el.getBoundingClientRect();rect={left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height};}
 resize();
 return {cancel:nav.cancel,resize,
  update({surface}){nav.setScene({kind:'art',tone:surface?.baseTone===1?1:coverage(surface?.whitePolygon,rect)});},
  get state(){return {...nav.state,rect};}
 };
};
