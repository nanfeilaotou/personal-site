"""Build contact sheets from actual browser captures; no source artwork edits."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

root = Path(__file__).parent
font = ImageFont.truetype('C:/Windows/Fonts/consola.ttf', 17)

def contact(name, columns, rows, width=480):
    cell_h = 328
    out = Image.new('RGB', (width * columns, cell_h * len(rows)), '#101216')
    draw = ImageDraw.Draw(out)
    for j, row in enumerate(rows):
        for i, (file, label) in enumerate(row):
            img = Image.open(root / file).convert('RGB')
            img.thumbnail((width - 12, cell_h - 36))
            out.paste(img, (i * width + 6, j * cell_h + 30))
            draw.text((i * width + 9, j * cell_h + 5), label, font=font, fill='#dce8f6')
    out.save(root / name)

contact('seam-contact.png', 3, [
    [(f'before-seam-{g}.png', f'BEFORE / g={g.replace("-", ".")}') for g in ['6-72', '6-74', '6-78']],
    [(f'after-seam-{g}.png', f'AFTER / g={g.replace("-", ".")}') for g in ['6-72', '6-74', '6-78']],
])
contact('desktop-contact.png', 3, [
    [(f'rail-hover-{w}.png', f'{w} / AI + hover') for w in [1366, 1440, 1920]],
    [(f'after-network-{w}.png', f'{w} / warm white') for w in [1366, 1440, 1920]],
    [(f'after-cards-{w}.png', f'{w} / three cards') for w in [1366, 1440, 1920]],
])
contact('ui-before-after.png', 2, [
    [(f'{k}-{scene}-1440.png', f'{k.upper()} / {scene}') for k in ['before', 'after']]
    for scene in ['opening', 'models', 'network', 'personal']
])
