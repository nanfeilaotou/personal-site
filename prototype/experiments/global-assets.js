'use strict';
(async()=>{
 const loading=document.getElementById('loading'),root=document.getElementById('library');
 if(location.protocol==='file:'){loading.textContent='素材来源审查需要 HTTP：在仓库运行 node scripts/serve.mjs，再打开 http://127.0.0.1:4173/prototype/experiments/global-assets.html。GitHub 交接文档同时提供截图。';return;}
 const read=async file=>{const r=await fetch('../../'+file);if(!r.ok)throw Error(file+' '+r.status);return r.json()};
 try{
  const [network,existing,cards,publicCards]=await Promise.all(['assets/global/network/manifest.json','assets/global/manifest.json','assets/cards/manifest.json','assets/cards/public/manifest.json'].map(read));
  const find=file=>[...existing,...cards,...publicCards].find(x=>x.file===file);
  const brand=item=>({name:item.name,file:'assets/'+item.asset,sourcePage:item.sourcePage,note:item.note,background:item.background,padded:item.padded,...{license:find('assets/'+item.asset)?.license||'权利保留，见来源记录'}});
  const connectivity=NF_GLOBAL_BRANDS.filter(x=>['Club Sim','SMART'].includes(x.name)).map(brand);
  const banking=NF_GLOBAL_BRANDS.filter(x=>['iFAST Global Bank','Wise','PayPal'].includes(x.name)).map(brand);
  for(const item of banking)if(item.name==='Wise')item.note='金融科技服务 / 多币种资金与支付；不是传统银行。 '+item.note;
  const payment=NF_CARD_MATERIALS.map(m=>({name:m.id==='cmb'?'招商银行 · 万事达人民币 IC 借记卡（普卡）':m.name,file:m.id==='starryblu'?'assets/cards/public/starryblu-card-sanitized.png':'assets/'+m.asset,original:'assets/'+m.asset,sourcePage:m.id==='cmb'?m.sourcePage:'../../assets/cards/SOURCES.md',note:m.id==='starryblu'?'直接使用已处理副本，印刷号码与姓名已在像素中替换；不是浏览器遮罩。':m.privacy,license:find('assets/'+m.asset)?.license||'见卡面来源记录',status:m.id==='cmb'?'人民币借记卡，不是全币种信用卡。':'卡面用于视觉识别，不推断相同产品类型、发卡关系或开户条件。',card:true}));
  const sections=[['01 / CONNECTIVITY','号码 / Connectivity','保留两个运营商品牌；SIM / eSIM、短信验证可以由后续通用数字结构表达。',connectivity],['02 / NETWORK','路径 / Network','四个指定项目，共五份候选文件；Clash Verge 原项目与 Rev 分列，等待命名确认。',network.candidates],['03 / BANKING','账户 / Banking','账户与支付服务并列，不将所有机构都称为银行。',banking],['04 / PAYMENTS','资金 / Payments','三张卡面保持原始比例。它们是视觉素材，不是对真实业务流程的等同。',payment]];
  const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text)n.textContent=text;return n};
  for(const [key,title,description,items] of sections){
   const section=el('section','asset-section');section.dataset.section=key;section.append(el('div','mono',key),el('h2','',title),el('p','section-note',description));const grid=el('div','asset-grid');
   for(const item of items){const row=el('article','material'+(item.card?' card':''));row.dataset.asset=item.file;const art=el('div','art'+(item.background==='light'?' light':'')),img=new Image();img.src='../../'+item.file;img.alt=item.name;img.loading='eager';if(item.padded)img.className='padded';if(item.name==='Club Sim')img.style.maxWidth='105px';if(item.name==='SMART')img.style.maxWidth='149.5px';if(item.name==='iFAST Global Bank')img.style.width='150px';art.append(img);
    const dimensions=el('p','dimensions','正在核对尺寸…');img.addEventListener('load',()=>{dimensions.textContent=img.naturalWidth+'×'+img.naturalHeight+' · '+item.file.split('.').pop().toUpperCase()+(item.hasAlpha===false?' · 原始应用底色 / 非透明':'')});img.addEventListener('error',()=>{img.hidden=true;dimensions.textContent='图片加载失败；名称与来源仍可阅读';});
    row.append(art,el('h3','',item.name),dimensions,el('p','status',item.status||item.developer&&'App Store 开发者：'+item.developer||''),el('p','',item.note||''),el('p','path',item.file),el('p','',item.license));const links=el('div','links');for(const [label,href] of [['来源 ↗',item.sourcePage],['本地文件', '../../'+item.file],...(item.licenseFile?[['上游许可','../../'+item.licenseFile]]:[])])if(href){const a=el('a','',label);a.href=href;if(href.startsWith('https://')){a.target='_blank';a.rel='noopener noreferrer'}links.append(a)}row.append(links);grid.append(row);
   }section.append(grid);if(key.startsWith('02'))section.append(el('p','concepts',network.concepts.join(' / ')));root.append(section);
  }
  await Promise.all([...root.querySelectorAll('img')].map(i=>i.decode()));loading.hidden=true;document.documentElement.dataset.ready='true';
 }catch(error){loading.textContent='素材记录读取失败：'+error.message;console.error(error)}
})();
