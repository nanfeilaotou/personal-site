"""After push, verify every handoff link into this branch against Git object bytes."""
import concurrent.futures
import hashlib
import json
from pathlib import Path
import re
import subprocess
import urllib.request

ROOT = Path(__file__).resolve().parents[2]
BLOB = 'https://github.com/nanfeilaotou/personal-site/blob/feat/home-ai-showcase-v2/'
RAW = 'https://raw.githubusercontent.com/nanfeilaotou/personal-site/refs/heads/feat/home-ai-showcase-v2/'


def verify(file):
    # One opener per worker; the proxy is optional and supplied by the local shell.
    with urllib.request.urlopen(RAW + file, timeout=45) as response:
        data = response.read()
        assert response.status == 200
    expected = subprocess.check_output(['git', 'show', 'HEAD:' + file], cwd=ROOT)
    assert data == expected, file + ' differs from committed bytes'
    return {'file': file, 'status': 200, 'sha256': hashlib.sha256(data).hexdigest()}


if __name__ == '__main__':
    text = (ROOT / 'docs/GLOBAL-VISUAL-HANDOFF.md').read_text(encoding='utf-8')
    files = {'docs/GLOBAL-VISUAL-HANDOFF.md', 'assets/global/network/manifest.json',
             'assets/global/network/v2rayn.png', 'assets/global/network/v2rayn.ico',
             'assets/global/network/licenses/v2rayn',
             'prototype/experiments/global-assets.js'}
    for href in re.findall(r'!?\[[^\]]*\]\(([^)]+)\)', text):
        if href.startswith(BLOB):
            files.add(href[len(BLOB):])
        elif href.startswith(RAW):
            files.add(href[len(RAW):])
    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
        results = list(pool.map(verify, sorted(files)))
    print(json.dumps({'completed': True, 'count': len(results), 'files': results}, indent=2))
