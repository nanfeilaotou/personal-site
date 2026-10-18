"""Build contact sheets from actual browser captures; no source art edits."""
from pathlib import Path
import json
from PIL import Image, ImageDraw, ImageFont

root = Path(__file__).resolve().parent
report = json.loads((root / 'seam-results.json').read_text(encoding='utf-8'))
font = ImageFont.truetype('C:/Windows/Fonts/consola.ttf', 15)
for group in ['entry', 'flip', 'dive', 'exit']:
    frames = [x for x in report['frames'] if x['group'] == group]
    width, height, columns = 480, 300, 3
    sheet = Image.new('RGB', (columns * width, ((len(frames)+columns-1)//columns)*(height+28)), (14,14,14))
    draw = ImageDraw.Draw(sheet)
    for i, frame in enumerate(frames):
        image = Image.open(root / frame['file']).convert('RGB')
        image.thumbnail((width, height), Image.Resampling.LANCZOS)
        x, y = i % columns * width, i // columns * (height+28)
        sheet.paste(image, (x, y+28))
        draw.text((x+8, y+5), f"{group} | scroll {frame['s']:.3f} | g {max(0,frame['s']-7.52):.2f}", font=font, fill=(225,225,225))
    sheet.save(root / f'seam-{group}-contact.png')
print('Built four contact sheets from browser keyframes')
