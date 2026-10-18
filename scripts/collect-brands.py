"""Download pinned Lobe SVGs; reject active or externally referenced content."""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import urllib.request, re, hashlib, json

ROOT = Path(__file__).resolve().parents[1]
REV = '8a1b2821bb768c484fe8da20c5e1838b6bf551a9'
NAMES = ['openai','claude','grok','gemini','deepseek','zai','qwen','kimi',
         'lmstudio','comfyui','codex','claudecode','hermesagent','antigravity','notion']
BASE = f'https://raw.githubusercontent.com/lobehub/lobe-icons/{REV}/'

def collect(name):
    url = BASE + f'packages/static-svg/icons/{name}.svg'
    raw = urllib.request.urlopen(url, timeout=45).read().decode()
    if not raw.lstrip().startswith('<svg') or re.search(r'<(script|foreignObject|image|use)|\bon\w+\s*=|(?:href|src)\s*=|url\(|<!ENTITY', raw, re.I):
        raise ValueError(f'Unsafe SVG: {name}')
    # Static img elements do not inherit page currentColor. Resolve the upstream
    # monochrome variant to the site's neutral ink without changing paths.
    svg = raw.replace('currentColor', '#ededeb')
    path = ROOT / 'assets/brands' / f'{name}.svg'
    path.write_text(svg, encoding='utf-8')
    return dict(file=path.name, source=url, acquiredAt='2026-10-16',
                license='MIT; original brand trademarks remain with their owners',
                sha256=hashlib.sha256(svg.encode()).hexdigest(),
                modification='currentColor resolved to #ededeb; path geometry unchanged')

if __name__ == '__main__':
    with ThreadPoolExecutor(max_workers=6) as pool:
        records = list(pool.map(collect, NAMES))
    (ROOT/'assets/brands/manifest.json').write_text(json.dumps(records,indent=2)+'\n',encoding='utf-8')
    print(f'Collected and checked {len(records)} SVGs at {REV}')
