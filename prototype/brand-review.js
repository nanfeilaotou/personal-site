'use strict';
(async()=>{
 const rows=[...NF_MODELS,...NF_AGENTS,...NF_LOCAL].filter((d,i,all)=>all.findIndex(x=>x.logo&&d.logo?x.logo===d.logo:x.id===d.id)===i);
 const make=(tag,cls,text)=>{const x=document.createElement(tag);if(cls)x.className=cls;if(text)x.textContent=text;return x;};
 const metadata=await fetch('../assets/brands/manifest.json').then(r=>r.json());
 for(const item of rows){
  const row=make('article','review-row');row.dataset.id=item.id;const label=make('div','review-label');label.append(make('strong','',item.name),make('p','',item.provider));
  if(item.logo){const svg=await fetch('../assets/brands/'+item.logo).then(r=>r.text());label.append(make('p','',`${item.logo} / viewBox ${svg.match(/viewBox="([^"]+)"/)?.[1]||'未标注'}`));}
  row.append(label);
  for(const mode of ['original','final']){const samples=make('div','samples '+mode);
   for(const size of [30,40,48]){const sample=make('div','sample');sample.style.setProperty('--sample-size',size+'px');sample.style.setProperty('--mark-size',size+'px');
    const wrapper=mode==='final'?make('div','brand-node'+(item.logo?'':' text-node')):make('div','raw');wrapper.dataset.id=item.id;
    if(item.logo){const img=make('img');img.src='../assets/brands/'+item.logo;img.alt=item.name;const slot=make('span','brand-mark');slot.append(img);wrapper.append(slot);}
    else wrapper.append(make('span','wordmark',item.shortName||item.name));
    if(mode==='final'&&(item.logo||item.shortName))wrapper.append(make('span','node-name',item.name));sample.append(wrapper,make('small','',size+'px'));samples.append(sample);
   }row.append(samples);
  }
  const notes=make('div','notes'),source=metadata.find(m=>m.file===item.logo);
  notes.append(make('p','',item.logo?item.logoNote||'沿用现有资源；保持比例，无裁切。':item.logoStatus||'名称标识'));
  const a=make('a','source','资源来源 ↗');a.href=source?.source||item.officialSource;a.target='_blank';a.rel='noopener noreferrer';notes.append(a);
  notes.append(make('p','',source?.license||'未确认可复用的专用标志，保留文字。'));row.append(notes);document.getElementById('review').append(row);
  if(item.logo){const scale=getComputedStyle(row.querySelector('.final .brand-node')).getPropertyValue('--logo-scale').trim()||'1';notes.append(make('p','',`CSS 视觉尺寸 ×${scale}；固定标识槽对齐，不改变图形比例。`));}
  if(item.id==='dsh'){const ref=make('div','wordmark-reference'),img=make('img');img.src='../assets/brands/dsh-wordmark.svg';img.alt='官方 DeepSeek Harness 完整字标';ref.append(img,make('p','','官方 BrandWordmark 核对参考；节点使用 FishLogo 配产品全称。'));notes.append(ref);}
 }
 document.documentElement.dataset.ready='true';
})();
