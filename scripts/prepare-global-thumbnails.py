"""Prepare handoff thumbnails from reviewed files; never read the raw StarryBlu."""
from pathlib import Path
import hashlib
import json
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'docs/global-visual/cards'
OUT.mkdir(parents=True, exist_ok=True)
record = json.loads((ROOT / 'assets/cards/public/manifest.json').read_text(encoding='utf-8'))[0]
safe = ROOT / record['file']
assert hashlib.sha256(safe.read_bytes()).hexdigest() == record['sha256'], 'Sanitized master changed; review it before generating thumbnails'
items = [
    ('starryblu.png', safe),
    ('bybit.png', ROOT / 'assets/cards/bybit-card.png'),
    ('cmb-mastercard.png', ROOT / 'assets/cards/cmb-mastercard-blue.png'),
]
for name, source in items:
    image = Image.open(source).convert('RGBA')
    image.thumbnail((480, 360), Image.Resampling.LANCZOS)
    image.save(OUT / name)
    print(name, image.size)
