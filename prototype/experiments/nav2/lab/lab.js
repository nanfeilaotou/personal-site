/* LENS 实验页的「宿主」：模拟首页时间轴（画布场景、章节停点、hash、语言锚点）。
 * 与正式集成的分工完全一致：
 *   · 顶栏明暗 —— 宿主不提供任何 class；NFSceneProbe 每帧读取顶栏正下方 #stage 画布的真实像素亮度 → nav.setScene({tone})
 *     kind 只告诉导航「这是艺术画面 / 场景画布 / 普通内容页」（内容页跟随主题）
 *   · 章节同步 —— 宿主按滚动位置 nav.setActive(key)
 *   · 点击跳转 —— 导航在光闸完全覆盖画面的那一刻调用 opts.navigate(key)，宿主「瞬时」定位（不滚过其他章节） */
(function () {
  'use strict';
  const Q = new URLSearchParams(location.search), root = document.documentElement;
  if (Q.has('embed')) root.classList.add('embed');
  if (Q.has('nodock')) root.classList.add('nodock');
  const I = window.NFI18n;
  I.extend('zh', {
    'lab.open.hint': '向下滚动', 'lab.open.tag': '00 — 开场艺术视觉（模拟）：不受主题影响',
    'lab.ai.t': '模型生态', 'lab.ai.d': '信息面板属于界面层：跟随用户主题切换深浅；背后的画布颜色保持不变。',
    'lab.ai.l1': '模型生态', 'lab.ai.l2': '本地 AI', 'lab.ai.l3': 'AI 客户端与 Agent',
    'lab.gl.t': '全球数字服务', 'lab.gl.d': '背景在黑场与暖白场之间翻面；顶栏读取自己下方的真实像素亮度自动适配，面板则由主题决定。',
    'lab.gl.l1': '号码', 'lab.gl.l2': '网络', 'lab.gl.l3': '账户与钱包', 'lab.gl.l4': '支付卡片',
    'lab.pe.t': '个人', 'lab.pe.d': '这一段英文尚未提供：切换到 EN 时安静地保持中文（lang="zh-CN"），只给一次轻提示，不在正文里堆角标。',
    'lab.page.crumb': '内容页示例', 'lab.page.t': '未来的内容页：完全跟随主题', 'lab.page.meta': '模拟文章',
    'lab.page.p1': '没有画布的普通页面里，背景本身由主题决定，所以顶栏直接跟随主题：浅色主题是暖白表面与深色文字，深色主题是黑色表面与浅色文字。',
    'lab.page.p2': '这一段是正文示例，英文版本尚未提供，因此在 EN 模式下保持中文。导航本身、语言与主题控制都已经双语。',
    'lab.page.fig': '图 1　内容区的线条与边框同样来自主题变量。',
    'lab.page.p3': '切换语言时，宿主先记录视口里的阅读锚点，替换文案后再把滚动位置恢复到同一段落，不会回到首页。',
    'lab.page.p4': '滚动到页面底部，导航仍保持「个人」选中；点击「首页」会经由光闸直接回到开场，而不是倒着滚过所有章节。', 'lab.page.back': '回到起点 ↑'
  });
  /* 英文只登记真正写好的部分；lab.pe.d 与 lab.page.p2 故意缺失，用于演示回退 */
  I.extend('en', {
    'lab.open.hint': 'Scroll', 'lab.open.tag': '00 — Opening artwork (mock): the theme does not apply here',
    'lab.ai.t': 'Model ecosystem', 'lab.ai.d': 'Info panels are UI: they follow the user theme. The canvas behind them keeps its colours.',
    'lab.ai.l1': 'Model ecosystem', 'lab.ai.l2': 'Local AI', 'lab.ai.l3': 'AI clients & agents',
    'lab.gl.t': 'Global digital services', 'lab.gl.d': 'The background flips between black and warm white; the bar reads the real pixels beneath it, panels follow the theme.',
    'lab.gl.l1': 'Numbers', 'lab.gl.l2': 'Networks', 'lab.gl.l3': 'Accounts & wallets', 'lab.gl.l4': 'Payment cards',
    'lab.pe.t': 'Personal',
    'lab.page.crumb': 'Content page sample', 'lab.page.t': 'Future content pages follow the theme', 'lab.page.meta': 'Mock article',
    'lab.page.p1': 'On a plain page without a canvas the background is defined by the theme, so the bar simply follows it: warm white with dark text in light mode, black with light text in dark mode.',
    'lab.page.fig': 'Fig. 1  Lines and borders in the content area come from theme variables too.',
    'lab.page.p3': 'When the language changes, the host records the reading anchor, swaps the copy and restores the scroll to the same paragraph — it never jumps back home.',
    'lab.page.p4': 'At the bottom of the page “Personal” stays selected; clicking “Home” goes back to the opening through the shutter instead of scrolling backwards through every chapter.', 'lab.page.back': 'Back to start ↑'
  });
  const content = document.getElementById('content');
  const log = [];
  let nav = null;
  const cv = document.getElementById('stage'), ctx = cv.getContext('2d');
  let W = 0, H = 0, DPR = 1, SEC = {}, dots = [];
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), sm = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
  const lerp = (a, b, t) => a + (b - a) * t, mixHex = (a, b, t) => { const p = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)); const A = p(a), B = p(b); return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], t))).join(',')})`; };
  const BLACK = '#050505', WARM = '#ecebe8', PAGE = { dark: '#0b0b0b', light: '#f1f0ec' };
  function layout() {
    W = innerWidth; H = innerHeight; DPR = Math.min(2, devicePixelRatio || 1);
    cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
    document.querySelectorAll('.scene,.page').forEach(s => { SEC[s.id] = { a: s.offsetTop / H, b: (s.offsetTop + s.offsetHeight) / H }; });
    buildDots();
  }
  function buildDots() {
    const off = document.createElement('canvas'), w = Math.round(Math.min(W * .86, 1400)), fs = Math.round(w / 7.4);
    off.width = w; off.height = Math.round(fs * 1.3); const c = off.getContext('2d');
    c.fillStyle = '#fff'; c.font = `800 ${fs}px "Liberation Mono","JetBrains Mono",monospace`; c.textBaseline = 'middle'; c.textAlign = 'center';
    const tw = c.measureText('NANFEILAOTOU').width; c.font = `800 ${fs * w / tw * .98}px "Liberation Mono","JetBrains Mono",monospace`;
    c.fillText('NANFEILAOTOU', w / 2, off.height / 2);
    const d = c.getImageData(0, 0, off.width, off.height).data, step = Math.max(4, Math.round(w / 260)); dots = [];
    for (let y = 0; y < off.height; y += step) for (let x = 0; x < w; x += step) if (d[(y * off.width + x) * 4 + 3] > 128)
      dots.push({ x: x - w / 2, y: y - off.height / 2, r: Math.random(), a: Math.random() * 6.283 });
  }
  let themeMix = null;
  const STILL = Q.has('still'); let drawnKey = '';
  function navH() { return parseFloat(root.style.getPropertyValue('--nf-nav-h')) || 68; }
  /* 像素探针：只看顶栏正下方的那一条画面 */
  const probe = NFSceneProbe.create({ layers: () => [cv], rect: () => ({ x: 0, y: 0, w: W, h: navH() }), base: '#050505' });
  function frameScene(t) {
    const u = scrollY / H, th = nav.state.theme === 'light' ? 1 : 0;
    if (STILL) t = 4000;
    themeMix = themeMix === null ? th : themeMix + (th - themeMix) * .14;
    const gl = SEC.global, g = u - gl.a, pg = SEC.page;
    const hb = Math.min(sm(.6, 1.25, g), 1 - sm(2.9, 3.4, g));        // 翻面光带半高（0..1）
    const pb = sm(pg.a - .2, pg.a, u);                                 // 进入内容页的背景过渡
    const pageBg = mixHex(PAGE.dark, PAGE.light, themeMix);
    const c = ctx, dk = [u.toFixed(4), themeMix.toFixed(3), W, H].join('|'), redraw = !STILL || dk !== drawnKey; drawnKey = dk;
    if (redraw) {
      c.setTransform(DPR, 0, 0, DPR, 0, 0);
      c.fillStyle = pb > 0 ? mixHex(BLACK, rgbToHex(pageBg), pb) : BLACK; c.fillRect(0, 0, W, H);
      if (pb < 1) { c.globalAlpha = 1 - pb; drawOpen(c, u, t); drawAI(c, u, t); drawGlobal(c, g, hb, t); drawPersonal(c, u, t); c.globalAlpha = 1; }
    }
    /* 场景信号：tone = 真实像素；kind = 宿主语义 */
    const kind = u >= pg.a - .02 ? 'page' : u < SEC.ai.a - .05 ? 'art' : 'canvas';
    const pr = probe.sample();
    nav.setScene({ tone: pr.tone, kind });
    nav.setActive(keyAt(u));
    root.classList.toggle('past-open', u > .25);
    return { u, tone: pr.tone, mean: pr.mean, kind, key: keyAt(u), hb };
  }
  function keyAt(u) { return u >= SEC.page.a ? 'personal' : ['personal', 'global', 'ai', 'open'].find(k => u >= SEC[k].a - .001) || 'open'; }
  function rgbToHex(s) { const m = s.match(/\d+/g).map(Number); return '#' + m.slice(0, 3).map(v => v.toString(16).padStart(2, '0')).join(''); }
  function drawOpen(c, u, t) {
    const k = sm(.35, 1.45, u), a = 1 - sm(.9, 1.55, u); if (a <= 0) return;
    const cx = W / 2, cy = H * .5, base = c.globalAlpha;
    /* 按亮度分 6 档批量绘制，避免逐点切换状态 */
    const bins = [[], [], [], [], [], []];
    for (const d of dots) {
      const drift = k * (90 + d.r * 260), ang = d.a + t * .0002;
      const x = cx + d.x + Math.cos(ang) * drift, y = cy + d.y + Math.sin(ang) * drift * .6 - k * 60;
      bins[Math.min(5, (Math.sin(t * .0016 + d.a * 3) ** 2 * 6) | 0)].push(x, y);
    }
    c.fillStyle = '#f2f1ec';
    bins.forEach((b, i) => { c.globalAlpha = base * a * (.55 + .45 * (i + .5) / 6); c.beginPath(); for (let j = 0; j < b.length; j += 2) c.rect(b[j] - .9, b[j + 1] - .9, 1.8, 1.8); c.fill(); });
    c.globalAlpha = base * a * .5; c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 1;
    c.beginPath(); c.moveTo(cx - 8, cy + H * .26); c.lineTo(cx + 8, cy + H * .26); c.moveTo(cx, cy + H * .26 - 8); c.lineTo(cx, cy + H * .26 + 8); c.stroke();
    c.globalAlpha = base;
  }
  function drawAI(c, u, t) {
    const s = SEC.ai, a = sm(s.a - .45, s.a + .15, u) * (1 - sm(s.b - .3, s.b + .1, u)); if (a <= 0) return;
    const base = c.globalAlpha, cx = W * (W > 760 ? .62 : .5), cy = H * .56, R = Math.min(W, H) * .26, rot = t * .00012 + (u - s.a) * .9;
    c.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
      const rx = R * (1 + i * .3), ry = rx * (.3 + i * .03);
      c.globalAlpha = base * a * (.5 - i * .08); c.strokeStyle = '#f2f1ec';
      c.beginPath(); c.ellipse(cx, cy, rx, ry, -.18, 0, 6.2832); c.stroke();
      const n = 7 + i * 3;
      for (let j = 0; j < n; j++) {
        const q = rot * (i % 2 ? -1 : 1) + j / n * 6.2832, x = cx + Math.cos(q) * rx * Math.cos(-.18) - Math.sin(q) * ry * Math.sin(-.18), y = cy + Math.cos(q) * rx * Math.sin(-.18) + Math.sin(q) * ry * Math.cos(-.18);
        c.globalAlpha = base * a * (.45 + .4 * (Math.sin(q) + 1) / 2); c.fillStyle = '#f2f1ec'; c.fillRect(x - 1.5, y - 1.5, 3, 3);
        if (j === 0) { c.font = '500 10px "Liberation Mono",monospace'; c.fillText('M-' + String(i + 1).padStart(2, '0'), x + 8, y - 6); }
      }
    }
    c.globalAlpha = base * a * .7; c.strokeStyle = '#f2f1ec'; c.beginPath(); c.arc(cx, cy, 5, 0, 6.2832); c.stroke();
    c.globalAlpha = base;
  }
  function net(c, ink, t, seed, n, alpha) {
    const pts = []; let s = seed; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < n; i++) pts.push([rnd() * W, H * .12 + rnd() * H * .8, rnd()]);
    c.strokeStyle = ink; c.fillStyle = ink; c.lineWidth = 1;
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
      const dx = pts[i][0] - pts[j][0], dy = pts[i][1] - pts[j][1], d = Math.hypot(dx, dy); if (d > 150) continue;
      c.globalAlpha = alpha * (1 - d / 150) * .55; c.beginPath(); c.moveTo(pts[i][0], pts[i][1]); c.lineTo(pts[j][0], pts[j][1]); c.stroke();
    }
    pts.forEach(p => { c.globalAlpha = alpha * (.5 + .5 * Math.sin(t * .002 + p[2] * 9) ** 2); c.fillRect(p[0] - 1.5, p[1] - 1.5, 3, 3); });
  }
  function drawGlobal(c, g, hb, t) {
    const a = sm(-.4, .1, g) * (1 - sm(3.75, 4.05, g)); if (a <= 0) return;
    const base = c.globalAlpha;
    if (g < 1.3) { c.globalAlpha = base * a; net(c, '#f2f1ec', t, 7, 70, base * a * (1 - sm(.6, 1.1, g))); }
    if (hb > 0) {
      const y0 = H / 2 - hb * H / 2, y1 = H / 2 + hb * H / 2;
      c.save(); c.beginPath(); c.rect(0, y0, W, y1 - y0); c.clip();
      c.globalAlpha = base; c.fillStyle = WARM; c.fillRect(0, y0, W, y1 - y0);
      c.strokeStyle = 'rgba(0,0,0,.09)'; c.lineWidth = 1; c.globalAlpha = base;
      for (let x = (W / 2) % 48; x < W; x += 48) { c.beginPath(); c.moveTo(Math.round(x) + .5, 0); c.lineTo(Math.round(x) + .5, H); c.stroke(); }
      for (let y = (H / 2) % 48; y < H; y += 48) { c.beginPath(); c.moveTo(0, Math.round(y) + .5); c.lineTo(W, Math.round(y) + .5); c.stroke(); }
      net(c, '#121211', t, 11, 64, base * sm(1.0, 1.4, g));
      c.restore();
      c.globalAlpha = base * (1 - sm(.92, 1, hb)); c.fillStyle = '#ffffff'; c.fillRect(0, y0 - .5, W, 1); c.fillRect(0, y1 - .5, W, 1);
    }
    if (g > 3.3) {
      const k = sm(3.3, 3.6, g), cw = Math.min(260, W * .2), chh = cw * .63, gap = 24, tot = 4 * cw + 3 * gap, x0 = (W - tot) / 2;
      c.globalAlpha = base * a * k; c.strokeStyle = '#f2f1ec'; c.lineWidth = 1; c.font = '500 10px "Liberation Mono",monospace'; c.fillStyle = '#f2f1ec';
      for (let i = 0; i < 4; i++) { const x = x0 + i * (cw + gap), y = H * .55 - chh / 2 + Math.sin(t * .001 + i) * 4; c.strokeRect(Math.round(x) + .5, Math.round(y) + .5, cw, chh); c.fillText('CARD ' + String(i + 1).padStart(2, '0'), x + 12, y + 20); c.fillRect(x + 12, y + chh - 26, 28, 18); }
    }
    c.globalAlpha = base;
  }
  function drawPersonal(c, u, t) {
    const s = SEC.personal, a = sm(s.a - .35, s.a + .2, u) * (1 - sm(s.b - .1, s.b + .25, u)); if (a <= 0) return;
    const base = c.globalAlpha; c.lineWidth = 1; c.strokeStyle = '#f2f1ec';
    for (let i = 0; i < 46; i++) {
      const y = H * (.2 + .66 * i / 45); c.globalAlpha = base * a * (.18 + .5 * Math.sin(i / 45 * 3.1416));
      c.beginPath();
      for (let x = 0; x <= W + 16; x += 16) { const w = Math.sin(x * .006 + t * .0007 + i * .21) * 14 * Math.sin(i / 45 * 3.1416) + Math.sin(x * .017 - t * .0011) * 3; x ? c.lineTo(x, y + w) : c.moveTo(x, y + w); }
      c.stroke();
    }
    c.globalAlpha = base;
  }


  /* ---------- 章节停点与瞬时定位 ---------- */
  const OFF = { open: 0, ai: .45, global: .25, personal: .55 };
  const stopY = key => Math.round((SEC[key].a + OFF[key]) * H);
  function place(key) { scrollTo(0, stopY(key)); }
  function navigate(key) {                       /* 由光闸在完全覆盖时调用 */
    place(key);
    if (location.hash !== '#' + key) history.pushState(null, '', '#' + key);
    log.unshift(`navigate → ${key}（瞬时）`); log.length = 3;
  }
  const hashKey = () => { const k = location.hash.slice(1); return k === 'via' ? 'global' : k in OFF ? k : null; };
  addEventListener('popstate', () => { const k = hashKey() || 'open'; nav.go(k); });
  document.addEventListener('click', e => { const j = e.target.closest('[data-jump]'); if (j) { e.preventDefault(); nav.go(j.dataset.jump); } });

  /* ---------- 语言：记录阅读锚点 → 替换文案 → 恢复 ---------- */
  function preserveAnchor(fn) {
    const top = navH();
    const cand = [...content.querySelectorAll('p, h1, h2, .panel, figure')].find(e => { const r = e.getBoundingClientRect(); return r.bottom > top + 4 && r.height > 0; });
    const before = cand ? cand.getBoundingClientRect().top : 0, y0 = scrollY;
    const r = fn();
    if (cand) { const d = cand.getBoundingClientRect().top - before; if (Math.abs(d) > .5) scrollTo(0, scrollY + d); }
    log.unshift(`lang → ${nav.state.lang} · 锚点保持 Δy ${(scrollY - y0).toFixed(0)}px · 回退 ${r.fallbacks}`); log.length = 3;
    return r;
  }

  /* ---------- 控制台 ---------- */
  const dock = document.getElementById('dock'), ro = document.getElementById('readout');
  let TR = Q.get('tr') || 'shutter';
  function syncDock() {
    if (!nav) return; const st = nav.state;
    const set = (ctl, v) => dock.querySelectorAll(`[data-ctl=${ctl}] button`).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v === v)));
    set('theme', st.themePref); set('lang', st.lang); set('tr', TR);
  }
  dock.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    const ctl = b.closest('[data-ctl]')?.dataset.ctl;
    if (ctl === 'theme') nav.setTheme(b.dataset.v);
    if (ctl === 'lang') nav.setLang(b.dataset.v);
    if (ctl === 'tr' && b.dataset.v !== TR) { TR = b.dataset.v; const st = nav.state; nav.destroy(); mountNav(st.visual); }
    if (ctl === 'jump') scrollTo(0, Number(b.dataset.v) * H);
    if (b.id === 'dockMin') dock.classList.toggle('is-min');
    if (b.id === 'mobileBtn') openPhone();
    syncDock();
  });
  const phone = document.getElementById('phone'), pf = document.getElementById('phoneFrame');
  function openPhone() {
    const st = nav.state; pf.src = `${location.pathname}?embed&lang=${st.lang}&theme=${st.themePref}#${st.visual}`;
    phone.style.setProperty('--phone-scale', Math.min(1, (innerHeight - 90) / 844).toFixed(3)); phone.hidden = false; document.getElementById('phoneX').focus();
  }
  document.getElementById('phoneX').addEventListener('click', () => { phone.hidden = true; pf.src = 'about:blank'; });

  /* ---------- 挂载 ---------- */
  function mountNav(active) {
    nav = NFTopNav.mount({
      active, lang: Q.get('lang') || undefined, theme: Q.get('theme') || undefined, persist: !Q.has('embed') && !Q.has('nopersist'), transition: TR,
      navigate, isAt: key => Math.abs(scrollY - stopY(key)) < 4,
      onLangChange: L => { const r = preserveAnchor(() => I.apply(content, L)); syncDock(); return r; },
      onThemeChange: () => syncDock(),
      onMenuToggle: open => { content.inert = open; dock.inert = open; }
    });
    I.apply(content, nav.state.lang);
    window.LAB.nav = nav; syncDock();
  }
  window.LAB = { nav: null, seek(u) { scrollTo(0, u * H); }, get sec() { return SEC; }, stopY, probe, last: null, log };

  /* ---------- 初始位置：刷新恢复 > hash 入口 > ?at ---------- */
  layout();
  const navType = (performance.getEntriesByType('navigation')[0] || {}).type;
  history.scrollRestoration = 'manual';
  let y0 = 0, saved = null;
  try { saved = JSON.parse(sessionStorage.getItem('nf.lab.pos') || 'null'); } catch (e) { }
  if (Q.get('at') !== null) y0 = Number(Q.get('at')) * H;
  else if (saved && navType === 'reload') y0 = saved.u * H;
  else if (hashKey()) y0 = stopY(hashKey());
  scrollTo(0, y0);
  addEventListener('pagehide', () => { try { sessionStorage.setItem('nf.lab.pos', JSON.stringify({ u: scrollY / H })); } catch (e) { } });
  mountNav(keyAt(scrollY / H));

  function loop(t) {
    const last = frameScene(t); window.LAB.last = last;
    if (!dock.classList.contains('is-min') && !root.classList.contains('nodock') && !root.classList.contains('embed')) {
      const st = nav.state;
      ro.textContent = `像素 tone ${last.tone.toFixed(2)} (均亮 ${last.mean.toFixed(2)}) → 顶栏 ${st.tone.toFixed(2)} · ${st.sceneKind}\n章节 ${st.visual}${st.lock ? ' · 锁定→' + st.lock : ''} · 光闸 ${st.shutter.ph}\n主题 ${st.themePref}→${st.theme} · 语言 ${st.lang} · u ${last.u.toFixed(2)}${log[0] ? '\n' + log[0] : ''}`;
    }
    requestAnimationFrame(loop);
  }
  addEventListener('resize', () => { const u = scrollY / H; layout(); scrollTo(0, u * H); });
  requestAnimationFrame(loop);
})();
