"""Fetch only the reviewed public product assets. Never crawl private card pages."""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import urllib.request, hashlib, json, re
from PIL import Image

ROOT=Path(__file__).resolve().parents[1]
OP=urllib.request.build_opener(urllib.request.ProxyHandler({'https':'http://127.0.0.1:7890'}))
ASSETS=[
 ('assets/brands/workbuddy-color.svg','https://assets.workbuddy.cn/web/workbuddy/ec2f30bd9f775bc9a298ca138ab307c7be52a810/assets/logo.svg','https://www.workbuddy.cn/','Tencent WorkBuddy'),
 ('assets/brands/muse-color.svg','https://introducing.muse.ai/landing/MuseLogo.svg','https://introducing.muse.ai/','Muse / Meta'),
 ('assets/global/cards/starryblu-starry.png','https://h2static.wotransfer.com/test/blue/home/home_card1.png','https://www.starryblu.com/','Starryblu / Starry 官网样张'),
 ('assets/global/cards/bybit-georgia.png','https://www.bybit.com/common-static/fht-static/cms/cs-assets/blt4ef4a5078d90ca4d/ade0ec3552025470444595d320c19982.png','https://www.bybit.com/press/post/bybit-expands-payment-solutions-with-launch-of-bybit-card-in-georgia-blt19fb415e399f34d8','Bybit Card / Georgia 官方发布图'),
 ('assets/global/cards/monzo-perks.avif','https://images.ctfassets.net/ro61k101ee59/1gemwJqJIKJLaGCyjWB4Fk/f84de96a473328b454dfa34bc6f173e4/blue-coral-card-overlay.avif','https://monzo.com/current-account','Monzo Perks / Mastercard 官网卡面'),
 ('assets/global/brands/clubsim.png','https://www.clubsim.com.hk/en/Common/btn_menu_logo@2x.png','https://www.clubsim.com.hk/en/','Club Sim / HKT'),
 ('assets/global/brands/smart.png','https://store.smart.com.ph/on/demandware.static/-/Sites-smart-Library/default/dw67fc73eb/images/homepage/header/smart-logo.png','https://store.smart.com.ph/','Smart Communications / Philippines')
]
def collect(v):
 file,url,page,name=v
 raw=OP.open(urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'}),timeout=35).read()
 p=ROOT/file;p.parent.mkdir(parents=True,exist_ok=True)
 if p.suffix=='.svg':
  s=raw.decode('utf-8')
  if re.search(r'<(script|foreignObject|image|use)|\bon\w+\s*=|(?:href|src)\s*=|url\((?!#[\w-]+\))|<!ENTITY',s,re.I):raise ValueError('Active/external SVG: '+file)
  for ref in re.findall(r'url\(#([\w-]+)\)',s):
   if f'id="{ref}"' not in s:raise ValueError('Missing local SVG reference: '+ref)
 p.write_bytes(raw)
 result=dict(file=file,name=name,source=url,sourcePage=page,acquiredAt='2026-10-17',sha256=hashlib.sha256(raw).hexdigest(),bytes=len(raw),license='Official public product/marketing asset; rights retained by the respective owner. No open reuse licence found. Local visual research only; public release requires review.',modification='Original bytes; no recoloring, redrawing or file-level cropping')
 if p.suffix!='.svg':
  im=Image.open(p);result.update(width=im.width,height=im.height,mode=im.mode,hasAlpha='A' in im.getbands() or 'transparency' in im.info)
 return result
if __name__=='__main__':
 with ThreadPoolExecutor(max_workers=5) as pool:records=list(pool.map(collect,ASSETS))
 (ROOT/'assets/global/manifest.json').write_text(json.dumps(records,ensure_ascii=False,indent=2)+'\n',encoding='utf-8',newline='\n')
 print('Saved',len(records),'reviewed assets; existing prototype assets untouched.')
