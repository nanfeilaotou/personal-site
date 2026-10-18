"""Compose original browser captures without changing the design or source assets."""
from pathlib import Path
from PIL import Image, ImageDraw

out = Path(__file__).resolve().parents[2] / 'prototype/experiments/nav/review'
for scheme in ['a', 'b']:
    frames = [0, 60, 120, 180, 260, 360, 520, 900]
    sheet = Image.new('RGB', (840, len(frames) * 110), '#080808')
    draw = ImageDraw.Draw(sheet)
    for i, ms in enumerate(frames):
        src = Image.open(out / f'{scheme}-sequence-{ms}.png').convert('RGB')
        src.thumbnail((840, 80), Image.Resampling.LANCZOS)
        draw.text((8, i * 110 + 4), f'{scheme.upper()} | {ms} ms', fill='#aaaaaa')
        sheet.paste(src, (0, i * 110 + 24))
    sheet.save(out / f'{scheme}-sequence-contact.png')

stages = ['opening', 'ai', 'flip', 'white', 'accounts', 'cards', 'personal']
sheet = Image.new('RGB', (1440, len(stages) * 475), '#080808')
draw = ImageDraw.Draw(sheet)
for i, stage in enumerate(stages):
    for j, scheme in enumerate(['a', 'b']):
        src = Image.open(out / f'{scheme}-{stage}-1440.png').convert('RGB')
        src.thumbnail((720, 450), Image.Resampling.LANCZOS)
        draw.text((j * 720 + 8, i * 475 + 4), f'{scheme.upper()} | {stage}', fill='#aaaaaa')
        sheet.paste(src, (j * 720, i * 475 + 22))
sheet.save(out / 'onsite-ab-contact.png')
print('Built A/B real-home comparison and two frame contact sheets')
