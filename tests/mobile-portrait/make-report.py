"""Build QA contact sheets from browser evidence, without modifying product artwork."""
from pathlib import Path
import json, math
from PIL import Image, ImageDraw, ImageFont

root = Path(__file__).parent
before = json.loads((root / 'before-audit.json').read_text(encoding='utf-8'))
after = json.loads((root / 'after-audit.json').read_text(encoding='utf-8'))
font = ImageFont.truetype('C:/Windows/Fonts/consola.ttf', 11)
large = ImageFont.truetype('C:/Windows/Fonts/consola.ttf', 16)
(root / 'contacts').mkdir(exist_ok=True)
order = ['opening', 'depth', 'models-enter', 'models', 'models-local', 'local-quant', 'local', 'local-agents', 'agents', 'bridge', 'via-entry', 'number', 'flip', 'network-enter', 'network', 'accounts', 'dive', 'card-form', 'cards', 'seam', 'personal', 'end']

for w, h in [(320,568),(360,740),(375,667),(390,844),(430,932)]:
    tw = 200
    th = round(h * tw / w)
    ch = th + 24
    out = Image.new('RGB', (tw*4, ch*11), '#0c1016')
    d = ImageDraw.Draw(out)
    for i, scene in enumerate(order):
        for j, label in enumerate(['before','after']):
            frame = next(f for f in (before if label=='before' else after)['frames'] if f['w']==w and f['h']==h and f['dpr']==1 and f['name']==scene)
            im = Image.open(root / label / frame['file']).convert('RGB').resize((tw,th),Image.Resampling.LANCZOS)
            x, y = ((i%2)*2+j)*tw, (i//2)*ch
            out.paste(im,(x,y+24))
            d.text((x+6,y+5),f'{label.upper()} {scene}',font=font,fill='#dce8fa')
    out.save(root/'contacts'/f'{w}x{h}.webp',quality=90,method=6)

out = Image.new('RGB',(960,1188),'#0c1016')
d = ImageDraw.Draw(out)
for row,label in enumerate(['before','after']):
    for col,scene in enumerate(['agents','local','cards']):
        im = Image.open(root/label/f'320x568-d1-{scene}.png').convert('RGB')
        out.paste(im,(col*320,row*594+26))
        d.text((col*320+8,row*594+5),f'{label.upper()} / {scene}',font=large,fill='#dce8fa')
out.save(root/'comparison-320.png')

f = next(f for f in after['frames'] if f['w']==320 and f['dpr']==1 and f['name']=='cards')
im = Image.open(root/'after'/f['file']).convert('RGB');d=ImageDraw.Draw(im)
for box in f['nodes']:
    c = '#ed94de' if box['type']=='card' else '#5aa9ff'
    d.rectangle((box['left'],box['top'],box['right'],box['bottom']),outline=c,width=1)
    d.text((max(1,box['left']+2),max(1,box['top']-12)),box['id'][:22],font=font,fill=c)
im.save(root/'annotated-cards-320.png')
print('Generated five full-scene contact sheets, 320px comparison and an annotated example.')
