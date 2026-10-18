#!/usr/bin/env python3
"""本地预览服务器：站点根目录 = main 首页仓库（/assets 等绝对路径可用），/nav/ 映射到本原型目录。
用法：python3 serve.py [--site ../main] [--port 4180]
  实验页   http://127.0.0.1:4180/nav/lab/index.html
  真实叠加 http://127.0.0.1:4180/nav/onsite/index.html?scheme=a
若原型已放进仓库（如 prototype/experiments/nav/），直接在仓库根目录 python3 -m http.server 即可，onsite 同样可用。"""
import argparse, functools, http.server, os
HERE = os.path.dirname(os.path.abspath(__file__))
ap = argparse.ArgumentParser(); ap.add_argument('--site', default=os.path.join(HERE, '..', 'main')); ap.add_argument('--port', type=int, default=4180)
a = ap.parse_args(); SITE = os.path.abspath(a.site)
class H(http.server.SimpleHTTPRequestHandler):
    def translate_path(self, path):
        p = path.split('?', 1)[0].split('#', 1)[0]
        if p == '/nav' or p.startswith('/nav/'):
            return http.server.SimpleHTTPRequestHandler.translate_path(self, p[4:] or '/').replace(SITE, HERE, 1)
        return super().translate_path(path)
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store'); super().end_headers()
print(f'site={SITE}\nnav={HERE}\nhttp://127.0.0.1:{a.port}/nav/lab/index.html\nhttp://127.0.0.1:{a.port}/nav/onsite/index.html')
http.server.ThreadingHTTPServer(('127.0.0.1', a.port), functools.partial(H, directory=SITE)).serve_forever()
