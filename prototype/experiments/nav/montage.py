import sys
from PIL import Image, ImageDraw, ImageFont
# python3 montage.py out.png [--cols N] [--gap 8] [--label-w 0] label=path ...
args=sys.argv[1:]; out=args.pop(0); cols=1; gap=10; lw=150; title=None
while args and args[0].startswith('--'):
    k=args.pop(0)
    if k=='--cols': cols=int(args.pop(0))
    elif k=='--gap': gap=int(args.pop(0))
    elif k=='--lw': lw=int(args.pop(0))
    elif k=='--title': title=args.pop(0)
items=[a.split('=',1) for a in args]
ims=[Image.open(p).convert('RGB') for _,p in items]
F='/usr/share/fonts/google-noto-cjk/NotoSansCJK-Regular.ttc'
try: font=ImageFont.truetype(F,22)
except Exception:
    import glob; c=glob.glob('/usr/share/fonts/**/NotoSans*CJK*SC*.*',recursive=True)+glob.glob('/usr/share/fonts/**/*CJK*.tt*',recursive=True); font=ImageFont.truetype(c[0],22)
cw=max(i.width for i in ims)+lw; rows=(len(ims)+cols-1)//cols
rh=[max(ims[r*cols+c].height for c in range(cols) if r*cols+c<len(ims)) for r in range(rows)]
th=56 if title else 0
W=cols*cw+(cols+1)*gap; H=sum(rh)+(rows+1)*gap+th
can=Image.new('RGB',(W,H),(17,17,17)); d=ImageDraw.Draw(can)
if title: d.text((gap+4,14),title,fill=(230,230,230),font=font)
y=gap+th
for r in range(rows):
    for c in range(cols):
        i=r*cols+c
        if i>=len(ims): break
        x=gap+c*(cw+gap)
        if lw: d.text((x+6,y+8),items[i][0],fill=(160,160,160),font=font)
        can.paste(ims[i],(x+lw,y))
    y+=rh[r]+gap
can.save(out); print(out,can.size)
