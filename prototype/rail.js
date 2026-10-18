/* Right-side Module rail. The host ui() supplies progress; no RAF/scroll controller. */
'use strict';
window.NFChapterRail=function({el,clock}){
 const buttons=[...el.querySelectorAll('button')],names=['首页','AI','全球','个人'],progress=document.getElementById('rail-progress');
 const starts=[0,clock.models.start,clock.fromScene(clock.globalWorld.prelude),clock.personal.start],ends=[starts[1],starts[2],starts[3],clock.total];
 let rects=null,current={index:0,progress:0,coverage:[0,0,0,0]},lastValue=-1;
 // Selectively adapted from af647c8 NFNav.rectCoverage (Sutherland–Hodgman).
 function coverage(points,r){
  if(!points||points.length<3||r.width<=0||r.height<=0)return 0;
  let poly=points.map(p=>p.slice(0,2));
  const edges=[[p=>p[0]>=r.left,(a,b)=>{const t=(r.left-a[0])/(b[0]-a[0]);return [r.left,a[1]+t*(b[1]-a[1])]}],
   [p=>p[0]<=r.right,(a,b)=>{const t=(r.right-a[0])/(b[0]-a[0]);return [r.right,a[1]+t*(b[1]-a[1])]}],
   [p=>p[1]>=r.top,(a,b)=>{const t=(r.top-a[1])/(b[1]-a[1]);return [a[0]+t*(b[0]-a[0]),r.top]}],
   [p=>p[1]<=r.bottom,(a,b)=>{const t=(r.bottom-a[1])/(b[1]-a[1]);return [a[0]+t*(b[0]-a[0]),r.bottom]}]];
  for(const [inside,cut]of edges){const out=[];for(let i=0;i<poly.length;i++){const a=poly[(i+poly.length-1)%poly.length],b=poly[i],ia=inside(a),ib=inside(b);if(ib){if(!ia)out.push(cut(a,b));out.push(b)}else if(ia)out.push(cut(a,b));}poly=out;if(poly.length<3)return 0;}
  let a=0;for(let i=0;i<poly.length;i++){const p=poly[i],q=poly[(i+1)%poly.length];a+=p[0]*q[1]-q[0]*p[1];}return Math.min(1,Math.abs(a)/(2*r.width*r.height));
 }
 function resize(){rects=null;}
 function update({index,scroll,surface}){
  if(!rects)rects=buttons.map(b=>{const r=b.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height}});
  const p=Math.max(0,Math.min(1,(scroll-starts[index])/(ends[index]-starts[index]))),tones=rects.map(r=>surface?.baseTone===1?1:coverage(surface?.whitePolygon,r));
  buttons.forEach((b,i)=>{
   const light=b.dataset.surface==='light',t=tones[i];b.dataset.surface=(t>.55||light&&t>=.45)?'light':'dark';
   const value=i===index?p:0;if(b._progress!==value){b._progress=value;b.querySelector('.rail-meter i').style.transform=`scaleY(${value.toFixed(5)})`;}
  });
  const value=Math.round(p*100);if(value!==lastValue||current.index!==index){progress.setAttribute('aria-valuenow',value);progress.setAttribute('aria-label',names[index]+'章节进度');lastValue=value;}
  el.classList.toggle('has-detail',!document.getElementById('brand-detail').hidden);
  current={index,progress:p,coverage:tones,rects};
 }
 el.addEventListener('keydown',e=>{const i=buttons.indexOf(e.target);if(i<0)return;const next=e.key==='ArrowDown'?i+1:e.key==='ArrowUp'?i-1:e.key==='Home'?0:e.key==='End'?3:null;if(next===null)return;e.preventDefault();buttons[(next+4)%4].focus();});
 return {update,resize,coverage,get state(){return current}};
};
