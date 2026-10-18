#!/usr/bin/env python3
"""本地预览服务器：站点根目录 = main 仓库（/assets、/prototype 等绝对路径可用），/nav2/ 映射到本原型目录。
用法：python3 serve.py [--site ../main] [--port 4181]
  实验页   http://127.0.0.1:4181/nav2/lab/index.html
  真实叠加 http://127.0.0.1:4181/nav2/onsite/index.html
若把原型放进仓库（如 prototype/experiments/nav2/），直接在仓库根目录 python3 -m http.server 即可。"""
import argparse, functools, http.server, os
HERE = os.path.dirname(os.path.abspath(__file__))
ap = argparse.ArgumentParser(); ap.add_argument('--site', default=os.path.normpath(os.path.join(HERE, '..', '..', '..'))); ap.add_argument('--port', type=int, default=4181)
a = ap.parse_args(); SITE = os.path.abspath(a.site); PRE = '/nav2'
class H(http.server.SimpleHTTPRequestHandler):
    def translate_path(self, path):
        p = path.split('?', 1)[0].split('#', 1)[0]
        if p == PRE or p.startswith(PRE + '/'):
            return http.server.SimpleHTTPRequestHandler.translate_path(self, p[len(PRE):] or '/').replace(SITE, HERE, 1)
        return super().translate_path(path)
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store'); super().end_headers()
    def log_message(self, *a): pass
print(f'site={SITE}\nnav2={HERE}\nhttp://127.0.0.1:{a.port}{PRE}/lab/index.html\nhttp://127.0.0.1:{a.port}{PRE}/onsite/index.html', flush=True)
http.server.ThreadingHTTPServer(('127.0.0.1', a.port), functools.partial(H, directory=SITE)).serve_forever()
