/* NFNav — NANFEILAOTOU 全站顶部导航（原型 v0.1）
 * 两种视觉方案共用一个状态核心：
 *   A「刻度 Gauge」：全宽轻表面 + 底部刻度尺 + 卡尺式选中标识（前沿先行、后沿跟随）
 *   B「舱窗 Module」：三块分离的发丝框模块 + 取景框选中标识 + 实时读数
 * 两条输入通道严格分开：
 *   场景通道 setScene({tone, kind})  —— 宿主（时间轴）每帧告诉导航「顶栏下面的背景有多亮」
 *   偏好通道 theme / lang             —— 用户手动选择，持久化，只影响可主题化的 UI 与内容页
 * 无依赖。不读画布像素，不使用 mix-blend-mode。 */
(function (global) {
  'use strict';
  const I = global.NFI18n;
  const ITEMS = [
    { key: 'open', idx: '00', label: 'nav.home', meta: 'nav.home.meta' },
    { key: 'ai', idx: '01', label: 'nav.ai', meta: 'nav.ai.meta' },
    { key: 'global', idx: '02', label: 'nav.global', meta: 'nav.global.meta' },
    { key: 'personal', idx: '03', label: 'nav.personal', meta: 'nav.personal.meta' }
  ];
  /* 调色板：dark = 顶栏下是黑场；light = 顶栏下是暖白场（#ecebe8 一类）。
   * light.accent #1E63C6 对 #ecebe8 对比度约 4.9:1（文本级），dark.accent #5AA9FF 对 #050505 约 8.6:1。 */
  const PAL = {
    dark: {
      ink: [238, 237, 233, 1], ink2: [238, 237, 233, .62], ink3: [238, 237, 233, .36], line: [255, 255, 255, .12], line2: [255, 255, 255, .3],
      surface: [6, 6, 6, .46], solid: [10, 10, 10, 1], accent: [90, 169, 255, 1], accentSoft: [90, 169, 255, .14], glow: [90, 169, 255, .55], hover: [255, 255, 255, .055], shadow: [0, 0, 0, .0]
    },
    light: {
      ink: [17, 17, 16, 1], ink2: [17, 17, 16, .66], ink3: [17, 17, 16, .42], line: [0, 0, 0, .13], line2: [0, 0, 0, .34],
      surface: [237, 236, 232, .58], solid: [242, 241, 237, 1], accent: [30, 99, 198, 1], accentSoft: [30, 99, 198, .1], glow: [30, 99, 198, .26], hover: [0, 0, 0, .045], shadow: [0, 0, 0, .0]
    }
  };
  const VARS = Object.keys(PAL.dark);
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const smooth = x => x * x * (3 - 2 * x);
  const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
  const rgba = c => `rgba(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])},${(+c[3]).toFixed(3)})`;
  const reduced = () => global.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch (e) { } }
  };

  /* 临界阻尼弹簧：无过冲、无回弹。k 越大越快。 */
  function Spring(x, k) { this.x = x; this.v = 0; this.t = x; this.k = k; }
  Spring.prototype.step = function (dt) { const c = 2 * Math.sqrt(this.k), a = this.k * (this.t - this.x) - c * this.v; this.v += a * dt; this.x += this.v * dt; };
  Spring.prototype.done = function () { return Math.abs(this.t - this.x) < .08 && Math.abs(this.v) < .5; };
  Spring.prototype.snap = function (v) { this.x = this.t = v; this.v = 0; };

  const SVG_THEME = `<svg class="nfnav__ticon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <g class="nfnav__sun" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round">
      <circle cx="12" cy="12" r="4.1"/>
      <path d="M12 2.6v2.3M12 19.1v2.3M2.6 12h2.3M19.1 12h2.3M5.35 5.35l1.62 1.62M17.03 17.03l1.62 1.62M5.35 18.65l1.62-1.62M17.03 6.97l1.62-1.62"/>
    </g>
    <g class="nfnav__moon" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linejoin="round">
      <path d="M19.2 14.6A7.6 7.6 0 0 1 9.4 4.8a7.6 7.6 0 1 0 9.8 9.8z"/>
      <path class="nfnav__star" d="M16.6 5.2v2.6M15.3 6.5h2.6" stroke-linecap="round"/>
    </g>
  </svg>`;

  function markup(o) {
    const L = o.lang, t = k => I.t(k, L);
    const items = ITEMS.map((it, i) => `<li class="nfnav__li"><a class="nfnav__item" href="#${it.key}" data-nav="${it.key}" data-i="${i}">
        <span class="nfnav__idx" aria-hidden="true">${it.idx}</span><span class="nfnav__label"><span class="nfnav__t" data-k="${it.label}">${t(it.label)}</span></span>
        <span class="nfnav__scan" aria-hidden="true"></span><span class="nfnav__focus" aria-hidden="true"></span></a></li>`).join('');
    const mitems = ITEMS.map((it, i) => `<li><a class="nfnav__mitem" href="#${it.key}" data-nav="${it.key}" data-i="${i}">
        <span class="nfnav__midx" aria-hidden="true">${it.idx}</span><span class="nfnav__mlabel"><span class="nfnav__t" data-k="${it.label}">${t(it.label)}</span></span>
        <span class="nfnav__mmeta"><span class="nfnav__t" data-k="${it.meta}">${t(it.meta)}</span></span><span class="nfnav__mmark" aria-hidden="true"></span></a></li>`).join('');
    const seg = (name, opts) => opts.map(([v, k, extra]) => `<button type="button" class="nfnav__seg-opt" data-${name}="${v}" ${extra || ''}><span class="nfnav__t" data-k="${k}">${t(k)}</span></button>`).join('');
    return `
  <div class="nfnav__surface" aria-hidden="true"></div>
  <div class="nfnav__bar">
    <a class="nfnav__brand nfnav__mod" href="#open" data-nav="open" aria-label="${t('brand.home')}" data-i18n-attr="aria-label:brand.home">
      <span class="nfnav__logo" data-slot="logo" title="${t('logo.slot')}" aria-hidden="true"><i></i></span>
      <span class="nfnav__word">NANFEILAOTOU</span>
    </a>
    <nav class="nfnav__primary nfnav__mod" aria-label="${t('nav.label')}">
      <ul class="nfnav__list" role="list">${items}</ul>
      <span class="nfnav__ind" aria-hidden="true"><span class="nfnav__ind-bar"></span><span class="nfnav__ind-dot"></span></span>
      <span class="nfnav__hl" aria-hidden="true"></span>
      <span class="nfnav__readout" aria-hidden="true"><span class="nfnav__ro-a">00</span><span class="nfnav__ro-b">/03</span><span class="nfnav__ro-p">000</span></span>
    </nav>
    <div class="nfnav__tools nfnav__mod">
      <div class="nfnav__lang" role="group" aria-label="${t('lang.group')}">
        <button type="button" class="nfnav__lang-opt" data-lang="zh" lang="zh-CN" aria-label="${t('lang.toZh')}">中</button><span class="nfnav__lang-sep" aria-hidden="true"></span><button type="button" class="nfnav__lang-opt" data-lang="en" lang="en" aria-label="${t('lang.toEn')}">EN</button>
        <span class="nfnav__lang-ind" aria-hidden="true"></span>
      </div>
      <button type="button" class="nfnav__theme" aria-label="${t('theme.toLight')}"><span class="nfnav__dial" aria-hidden="true"></span>${SVG_THEME}</button>
      <button type="button" class="nfnav__menu" aria-expanded="false" aria-controls="${o.id}-panel" aria-label="${t('menu.open')}">
        <span class="nfnav__chip" aria-hidden="true"><span class="nfnav__chip-idx">00</span><span class="nfnav__chip-t"><span class="nfnav__t">${t('nav.home')}</span></span></span>
        <span class="nfnav__burger" aria-hidden="true"><i></i><i></i></span>
      </button>
    </div>
  </div>
  <canvas class="nfnav__ruler" aria-hidden="true"></canvas>
  <p class="nfnav__note" role="status" aria-live="polite"></p>
  <div class="nfnav__scrim" hidden></div>
  <div class="nfnav__panel" id="${o.id}-panel" role="dialog" aria-modal="true" aria-label="${t('menu.title')}" hidden>
    <ol class="nfnav__mlist" role="list">${mitems}</ol>
    <div class="nfnav__prefs">
      <div class="nfnav__prow"><span class="nfnav__plabel"><span class="nfnav__t" data-k="lang.group">${t('lang.group')}</span></span>
        <div class="nfnav__seg" role="group" aria-label="${t('lang.group')}">${seg('lang', [['zh', 'lang.zh', 'lang="zh-CN"'], ['en', 'lang.en', 'lang="en"']])}</div></div>
      <div class="nfnav__prow"><span class="nfnav__plabel"><span class="nfnav__t" data-k="theme.group">${t('theme.group')}</span></span>
        <div class="nfnav__seg" role="group" aria-label="${t('theme.group')}">${seg('theme', [['light', 'theme.light'], ['dark', 'theme.dark'], ['system', 'theme.auto']])}</div></div>
    </div>
  </div>`;
  }

  function mount(opts) {
    const o = Object.assign({
      scheme: 'a', parent: document.body, id: 'nf-nav', lang: null, theme: null, persist: true,
      mobileQuery: '(max-width: 760px)',
      onNavigate: () => { }, onLangChange: () => { }, onThemeChange: () => { }, onMenuToggle: () => { }
    }, opts || {});
    const root = document.documentElement;
    const S = {
      scheme: o.scheme,
      lang: o.lang || (o.persist && store.get('nf.lang')) || 'zh',
      themePref: o.theme || (o.persist && store.get('nf.theme')) || 'system',
      sceneTone: 0, sceneKind: 'art', tone: 0, solid: 0, ink: 0, side: 0,
      active: 'open', visual: 'open', progress: 0, prog: 0, lock: null, lockUntil: 0,
      hoverX: null, hoverAmp: 0, hoverItem: -1, focusItem: -1, scan: null,
      menu: false, mobile: false, raf: 0, last: 0, painted: '', destroyed: false
    };
    if (!I.LANGS.includes(S.lang)) S.lang = 'zh';
    const mq = matchMedia('(prefers-color-scheme: light)'), mm = matchMedia(o.mobileQuery);
    const resolvedTheme = () => S.themePref === 'system' ? (mq.matches ? 'light' : 'dark') : S.themePref;

    const el = document.createElement('header');
    el.className = `nfnav nfnav--${S.scheme}`; el.id = o.id; el.setAttribute('data-scheme', S.scheme);
    el.innerHTML = markup({ id: o.id, lang: S.lang });
    o.parent.prepend(el);
    const $ = s => el.querySelector(s), $$ = s => [...el.querySelectorAll(s)];
    const E = {
      primary: $('.nfnav__primary'), list: $('.nfnav__list'), items: $$('.nfnav__item'), ind: $('.nfnav__ind'), hl: $('.nfnav__hl'),
      dot: $('.nfnav__ind-dot'), ruler: $('.nfnav__ruler'), langOpts: $$('.nfnav__lang-opt'), langInd: $('.nfnav__lang-ind'), langGroup: $('.nfnav__lang'),
      theme: $('.nfnav__theme'), menu: $('.nfnav__menu'), chipIdx: $('.nfnav__chip-idx'), chipT: $('.nfnav__chip-t'), panel: $('.nfnav__panel'), scrim: $('.nfnav__scrim'),
      mitems: $$('.nfnav__mitem'), segLang: $$('.nfnav__seg-opt[data-lang]'), segTheme: $$('.nfnav__seg-opt[data-theme]'), note: $('.nfnav__note'),
      roA: $('.nfnav__ro-a'), roP: $('.nfnav__ro-p'), readout: $('.nfnav__readout')
    };
    const ctx = E.ruler.getContext('2d');
    /* 选中标识：左右两条边各一只临界阻尼弹簧。移动方向上的前沿刚度高、后沿刚度低 → 先拉伸后收拢，绝不回弹。 */
    const edge = { L: new Spring(0, 420), R: new Spring(0, 420) };
    const K_LEAD = 700, K_TRAIL = 300, K_BOX = 420;
    const hl = { x: new Spring(0, 520), w: new Spring(0, 520), o: 0 };
    let geo = [], W = 0, H = 0, dpr = 1, lastToneWrite = -1, lastSolidWrite = -1, lastInkWrite = -1, noteT = 0;

    /* ---------- 文案 ---------- */
    function swapText(span, text, delay) {
      if (span.textContent === text) return;
      if (reduced() || !span.isConnected || !span.offsetParent) { span.textContent = text; return; }
      const host = span.parentNode, ghost = span.cloneNode(true);
      ghost.className = 'nfnav__t nfnav__t--out'; ghost.removeAttribute('data-k');
      host.appendChild(ghost); span.textContent = text;
      span.classList.remove('nfnav__t--in'); void span.offsetWidth; span.style.animationDelay = ghost.style.animationDelay = (delay || 0) + 'ms';
      span.classList.add('nfnav__t--in');
      setTimeout(() => { ghost.remove(); span.classList.remove('nfnav__t--in'); span.style.animationDelay = ''; }, 460 + (delay || 0));
    }
    function applyLang(animate) {
      const L = S.lang, t = k => I.t(k, L);
      root.setAttribute('lang', I.HTML_LANG[L]); el.setAttribute('data-lang', L);
      $$('.nfnav__t[data-k]').forEach((sp, i) => animate ? swapText(sp, t(sp.dataset.k), (sp.closest('.nfnav__item,.nfnav__mitem')?.dataset.i | 0) * 38) : (sp.textContent = t(sp.dataset.k)));
      E.primary.setAttribute('aria-label', t('nav.label'));
      $('.nfnav__brand').setAttribute('aria-label', t('brand.home')); $('.nfnav__logo').title = t('logo.slot');
      E.langGroup.setAttribute('aria-label', t('lang.group'));
      E.langOpts[0].setAttribute('aria-label', t('lang.toZh')); E.langOpts[1].setAttribute('aria-label', t('lang.toEn'));
      E.panel.setAttribute('aria-label', t('menu.title'));
      $$('.nfnav__seg').forEach((g, i) => g.setAttribute('aria-label', t(i ? 'theme.group' : 'lang.group')));
      [...E.langOpts, ...E.segLang].forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === L)));
      updateChip(animate); updateThemeUI(); updateMenuLabel();
      requestAnimationFrame(() => { measure(); kick(); });
    }
    function updateChip(animate) {
      const it = ITEMS.find(x => x.key === S.visual) || ITEMS[0];
      E.chipIdx.textContent = it.idx;
      const sp = E.chipT.querySelector('.nfnav__t:not(.nfnav__t--out)'), txt = I.t(it.label, S.lang);
      animate ? swapText(sp, txt, 0) : (sp.textContent = txt);
    }
    function updateMenuLabel() { E.menu.setAttribute('aria-label', I.t(S.menu ? 'menu.close' : 'menu.open', S.lang)); }

    /* ---------- 主题（用户偏好通道）---------- */
    function updateThemeUI() {
      const th = resolvedTheme();
      root.setAttribute('data-nf-theme', th); root.setAttribute('data-nf-theme-pref', S.themePref);
      el.setAttribute('data-theme', th);
      E.theme.setAttribute('aria-label', I.t(th === 'dark' ? 'theme.toLight' : 'theme.toDark', S.lang));
      E.theme.setAttribute('title', I.t(th === 'dark' ? 'theme.toLight' : 'theme.toDark', S.lang));
      E.segTheme.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.theme === S.themePref)));
    }
    function setTheme(pref, why) {
      if (!['light', 'dark', 'system'].includes(pref)) return;
      S.themePref = pref; if (o.persist) store.set('nf.theme', pref === 'system' ? null : pref);
      updateThemeUI(); kick();
      if (why === 'user' && S.sceneKind === 'art' && !S.menu) note(I.t('theme.artNote', S.lang));
      o.onThemeChange(resolvedTheme(), pref);
    }
    function note(text) {
      E.note.textContent = text; el.classList.add('has-note'); clearTimeout(noteT);
      noteT = setTimeout(() => el.classList.remove('has-note'), 3200);
    }
    /* ---------- 语言 ---------- */
    function setLang(L, why) {
      if (!I.LANGS.includes(L) || L === S.lang) return;
      S.lang = L; if (o.persist) store.set('nf.lang', L);
      applyLang(why === 'user'); o.onLangChange(L);
    }

    /* ---------- 场景（自动适配通道）---------- */
    /* tone: 0 = 顶栏下方背景为黑场，1 = 暖白场；kind: 'art' 开场艺术区 | 'canvas' 画布章节 | 'page' 普通内容页 */
    function setScene(sc) {
      if (S.firstScene) { /* 首帧直接对齐场景，避免页面打开时顶栏从黑淡入白 */
        S.firstScene = false; if (sc.kind) S.sceneKind = sc.kind; if (typeof sc.tone === 'number') S.sceneTone = clamp(sc.tone);
        S.tone = toneTarget(); S.side = S.ink = S.tone > .5 ? 1 : 0; el.setAttribute('data-scene', S.sceneKind); root.setAttribute('data-nf-scene', S.sceneKind); writePalette(); kick(); return;
      }
      if (sc.kind && sc.kind !== S.sceneKind) { S.sceneKind = sc.kind; el.setAttribute('data-scene', sc.kind); root.setAttribute('data-nf-scene', sc.kind); kick(); }
      if (typeof sc.tone === 'number' && Math.abs(sc.tone - S.sceneTone) > 1e-4) { S.sceneTone = clamp(sc.tone); kick(); }
    }
    function toneTarget() {
      const themeTone = resolvedTheme() === 'light' ? 1 : 0;
      if (S.menu) return themeTone;                 // 展开的菜单是实体 UI 面板 → 跟随主题
      if (S.sceneKind === 'page') return themeTone; // 内容页背景本身由主题决定
      return S.sceneTone;                           // 画布区：只跟随背景亮度，与主题无关
    }

    /* ---------- 章节同步 ---------- */
    function setActive(key, progress) {
      if (!ITEMS.some(x => x.key === key)) return;
      S.active = key; if (typeof progress === 'number') S.progress = clamp(progress);
      if (S.lock) {
        if (key === S.lock || performance.now() > S.lockUntil) S.lock = null; else { kick(); return; }
      }
      setVisual(key); kick();
    }
    function setVisual(key) {
      if (key === S.visual && geo.length) return;
      const from = ITEMS.findIndex(x => x.key === S.visual), to = ITEMS.findIndex(x => x.key === key);
      S.visual = key;
      [...E.items, ...E.mitems].forEach(a => a.dataset.nav === key ? a.setAttribute('aria-current', 'location') : a.removeAttribute('aria-current'));
      el.setAttribute('data-active', key);
      const dir = Math.sign(to - from);
      edge.L.k = dir > 0 ? K_TRAIL : K_LEAD; edge.R.k = dir > 0 ? K_LEAD : K_TRAIL;
      if (S.scheme === 'b') { edge.L.k = edge.R.k = K_BOX; }
      targetIndicator(); updateChip(true);
      E.roA.textContent = ITEMS[to].idx;
    }
    function go(key, src) {
      const already = key === S.visual && !S.lock;
      S.lock = key; S.lockUntil = performance.now() + 3600; S.progress = key === S.active ? S.progress : 0;
      setVisual(key); kick();
      if (S.menu) closeMenu(src !== 'pointer');
      o.onNavigate(key, { already });
    }
    const unlock = () => { if (S.lock) { S.lock = null; setVisual(S.active); kick(); } };

    /* ---------- 几何 ---------- */
    function measure() {
      const pr = E.primary.getBoundingClientRect();
      geo = E.items.map(a => {
        const r = a.getBoundingClientRect(), lab = a.querySelector('.nfnav__label').getBoundingClientRect(), ix = a.querySelector('.nfnav__idx').getBoundingClientRect();
        return { l: r.left - pr.left, r: r.right - pr.left, cl: Math.min(lab.left, ix.left) - pr.left, cr: lab.right - pr.left, pl: pr.left };
      });
      const hr = el.getBoundingClientRect(); dpr = Math.min(2, devicePixelRatio || 1);
      const rr = E.ruler.getBoundingClientRect();
      if (Math.round(rr.width * dpr) !== E.ruler.width || Math.round(rr.height * dpr) !== E.ruler.height) { E.ruler.width = Math.round(rr.width * dpr); E.ruler.height = Math.round(rr.height * dpr); }
      W = rr.width; H = rr.height; S.painted = '';
      root.style.setProperty('--nf-nav-h', Math.round(hr.height) + 'px');
      targetIndicator(true);
    }
    function targetIndicator(instant) {
      const i = ITEMS.findIndex(x => x.key === S.visual), g = geo[i]; if (!g) return;
      const pad = S.scheme === 'a' ? 0 : 0, l = S.scheme === 'a' ? g.cl - 6 : g.l, r = S.scheme === 'a' ? g.cr + 6 : g.r;
      edge.L.t = l - pad; edge.R.t = r + pad;
      if (instant === true && !S.indInit) { edge.L.snap(edge.L.t); edge.R.snap(edge.R.t); S.indInit = true; }
      if (reduced()) { edge.L.snap(edge.L.t); edge.R.snap(edge.R.t); }
      kick();
    }

    /* ---------- 帧循环（只在有东西在动时运行）---------- */
    function kick() { if (!S.raf && !S.destroyed && !S.paused) { S.last = performance.now(); S.raf = requestAnimationFrame(frame); } }
    function frame(now) {
      S.raf = 0; if (S.destroyed) return;
      let dt = Math.min(.05, Math.max(.001, (now - S.last) / 1000)); S.last = now;
      let busy = false;
      /* 1. 场景色调：指数平滑（τ≈90ms，无过冲），在开场/黑白翻面等宿主过渡上再叠一层柔化 */
      const tt = toneTarget(), a = 1 - Math.exp(-dt / .09);
      S.tone += (tt - S.tone) * a; if (Math.abs(tt - S.tone) < .002) S.tone = tt; else busy = true;
      const st = S.menu ? 1 : 0; S.solid += (st - S.solid) * (1 - Math.exp(-dt / .07)); if (Math.abs(st - S.solid) < .003) S.solid = st; else busy = true;
      /* 文字侧：以表面实际明度为准的二值目标（回差 0.47 / 0.53），再以 τ≈50ms 交叉淡化 */
      const sx = smooth(clamp(S.tone)); S.side = sx > .53 ? 1 : sx < .47 ? 0 : S.side;
      S.ink += (S.side - S.ink) * (1 - Math.exp(-dt / .05)); if (Math.abs(S.side - S.ink) < .003) S.ink = S.side; else busy = true;
      if (Math.abs(S.tone - lastToneWrite) > .0015 || Math.abs(S.solid - lastSolidWrite) > .003 || Math.abs(S.ink - lastInkWrite) > .003 || lastToneWrite < 0) writePalette();
      /* 2. 选中标识弹簧 */
      if (reduced()) { edge.L.snap(edge.L.t); edge.R.snap(edge.R.t); }
      for (let n = Math.ceil(dt / (1 / 240)), h = dt / n, i = 0; i < n; i++) { edge.L.step(h); edge.R.step(h); hl.x.step(h); hl.w.step(h); }
      if (!edge.L.done() || !edge.R.done()) busy = true; else { edge.L.snap(edge.L.t); edge.R.snap(edge.R.t); }
      const tp = S.lock ? 0 : S.progress; S.prog += (tp - S.prog) * (1 - Math.exp(-dt / .12)); if (Math.abs(tp - S.prog) > .001) busy = true; else S.prog = tp;
      const L = edge.L.x, R = Math.max(L + 2, edge.R.x);
      E.ind.style.transform = `translate3d(${L.toFixed(2)}px,0,0)`; E.ind.style.width = (R - L).toFixed(2) + 'px';
      E.ind.style.setProperty('--p', S.prog.toFixed(4));
      E.roP.textContent = String(Math.round(S.prog * 100)).padStart(3, '0');
      /* 3. 悬停光斑（B：读数高亮框；A：刻度抬升） */
      const hovering = S.hoverX !== null || S.focusItem >= 0, ht = hovering ? 1 : 0;
      S.hoverAmp += (ht - S.hoverAmp) * (1 - Math.exp(-dt / (hovering ? .06 : .14))); if (Math.abs(ht - S.hoverAmp) > .003) busy = true; else S.hoverAmp = ht;
      if (S.scheme === 'b') {
        if (!hl.x.done() || !hl.w.done()) busy = true;
        E.hl.style.transform = `translate3d(${hl.x.x.toFixed(2)}px,0,0)`; E.hl.style.width = Math.max(0, hl.w.x).toFixed(2) + 'px'; E.hl.style.opacity = S.hoverAmp.toFixed(3);
      }
      if (S.scan && now - S.scan.t0 < S.scan.dur) busy = true;
      if (S.scheme === 'a') drawRuler(now);
      if (busy || S.hoverX !== null && S.scheme === 'a' && S.hoverAmp < 1) kick();
    }
    /* 调色：表面材质随 tone 连续过渡；文字/线条/强调色按「表面当前偏亮还是偏暗」二选一，并做 ~150ms 交叉淡化。
     * 过渡区间内表面临时加厚（接近实体板），保证任何一帧上文字对其背板都有足够对比，不会出现灰字压灰底。 */
    function writePalette() {
      lastToneWrite = S.tone; lastSolidWrite = S.solid; lastInkWrite = S.ink;
      const x = smooth(clamp(S.tone)), y = smooth(clamp(S.ink)), P = {};
      VARS.forEach(k => { P[k] = mix(PAL.dark[k], PAL.light[k], y); });
      const sd = PAL.dark.surface, sl = PAL.light.surface, sf = mix(sd, sl, x);
      sf[3] = sf[3] + (.9 - sf[3]) * Math.sin(Math.PI * x);
      const so = mix(PAL.dark.solid, PAL.light.solid, x);
      P.surface = mix(sf, so, smooth(S.solid)); P.solid = mix(PAL.dark.solid, PAL.light.solid, y);
      VARS.forEach(k => el.style.setProperty('--nf-' + k, rgba(P[k])));
      el.style.setProperty('--nf-tone', x.toFixed(4)); el.style.setProperty('--nf-solidity', S.solid.toFixed(3));
      el.setAttribute('data-tone', y > .5 ? 'light' : 'dark');
      S.pal = P; S.painted = '';
    }
    /* A 方案刻度尺：Canvas 画 1 条基线 + 8px 间距刻度；悬停/聚焦处高斯抬升，光点跟随；悬停项上一次局部扫描。 */
    function drawRuler(now) {
      if (!W || !S.pal) return;
      const fx = S.hoverX !== null ? S.hoverX : (S.focusItem >= 0 && geo[S.focusItem] ? (geo[S.focusItem].l + geo[S.focusItem].r) / 2 + geo[S.focusItem].pl : null);
      const scanOn = S.scan && now - S.scan.t0 < S.scan.dur;
      const sig = [S.tone.toFixed(3), fx === null ? 'n' : fx.toFixed(1), S.hoverAmp.toFixed(3), scanOn ? now : 0, W].join('|');
      if (sig === S.painted) return; S.painted = sig;
      const P = S.pal, c = ctx; c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, W, H);
      const base = H - .5, step = 8, amp = S.hoverAmp, sigma = 46;
      c.lineWidth = 1;
      c.strokeStyle = rgba(P.line); c.beginPath(); c.moveTo(0, base); c.lineTo(W, base); c.stroke();
      for (let x = 4, i = 0; x < W; x += step, i++) {
        const major = i % 10 === 0, mid = i % 5 === 0;
        let h = major ? 5 : mid ? 3.5 : 2, g = 0;
        if (fx !== null && amp > 0) { const d = x - fx; g = Math.exp(-(d * d) / (2 * sigma * sigma)) * amp; h += g * 4.5; }
        const px = Math.round(x) + .5;
        c.strokeStyle = g > .08 ? rgba(mix(P.line2, P.accent, clamp(g * 1.15))) : rgba(major ? P.line2 : P.line);
        c.beginPath(); c.moveTo(px, base); c.lineTo(px, base - h); c.stroke();
      }
      if (fx !== null && amp > .02) {
        const gr = c.createRadialGradient(fx, base, 0, fx, base, 22);
        gr.addColorStop(0, rgba([...P.glow.slice(0, 3), P.glow[3] * amp])); gr.addColorStop(1, rgba([...P.glow.slice(0, 3), 0]));
        c.fillStyle = gr; c.fillRect(fx - 22, base - 12, 44, 13);
        c.fillStyle = rgba([...P.accent.slice(0, 3), amp]); c.fillRect(Math.round(fx) - 1, base - 1.5, 2, 2);
      }
      if (scanOn) {
        const k = (now - S.scan.t0) / S.scan.dur, e = 1 - Math.pow(1 - k, 3), x0 = S.scan.l, x1 = S.scan.r, hx = x0 + (x1 - x0) * e, tail = 34;
        const gr = c.createLinearGradient(hx - tail, 0, hx, 0);
        gr.addColorStop(0, rgba([...P.accent.slice(0, 3), 0])); gr.addColorStop(1, rgba([...P.accent.slice(0, 3), .9 * (1 - k * .6)]));
        c.fillStyle = gr; c.fillRect(Math.max(x0, hx - tail), base - .5, Math.min(tail, hx - x0), 1);
      }
    }

    /* ---------- 菜单（移动端）---------- */
    let lastFocus = null;
    function openMenu() {
      if (S.menu) return; S.menu = true; lastFocus = document.activeElement;
      E.panel.hidden = false; E.scrim.hidden = false; el.classList.add('is-menu');
      requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('is-menu-open')));
      E.menu.setAttribute('aria-expanded', 'true'); updateMenuLabel(); root.classList.add('nfnav-lock');
      const cur = E.mitems.find(a => a.dataset.nav === S.visual) || E.mitems[0];
      setTimeout(() => cur.focus({ preventScroll: true }), 40);
      kick(); o.onMenuToggle(true);
    }
    function closeMenu(restoreFocus = true) {
      if (!S.menu) return; S.menu = false; el.classList.remove('is-menu-open');
      E.menu.setAttribute('aria-expanded', 'false'); updateMenuLabel(); root.classList.remove('nfnav-lock');
      setTimeout(() => { if (!S.menu) { E.panel.hidden = true; E.scrim.hidden = true; el.classList.remove('is-menu'); } }, reduced() ? 0 : 260);
      if (restoreFocus && (el.contains(document.activeElement) || document.activeElement === document.body)) E.menu.focus({ preventScroll: true });
      kick(); o.onMenuToggle(false);
    }
    function trap(e) {
      if (!S.menu || e.key !== 'Tab') return;
      const f = [E.menu, ...E.panel.querySelectorAll('a,button')].filter(x => !x.disabled);
      const i = f.indexOf(document.activeElement);
      if (e.shiftKey && (i <= 0)) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
      else if (i < 0) { e.preventDefault(); f[0].focus(); }
    }

    /* ---------- 事件 ---------- */
    const on = (t, ev, fn, opt) => { t.addEventListener(ev, fn, opt); offs.push(() => t.removeEventListener(ev, fn, opt)); }, offs = [];
    on(el, 'click', e => {
      const a = e.target.closest('a[data-nav]');
      if (a) { e.preventDefault(); go(a.dataset.nav, e.detail ? 'pointer' : 'key'); return; }
      const lg = e.target.closest('button[data-lang]'); if (lg) { setLang(lg.dataset.lang, 'user'); return; }
      const th = e.target.closest('button[data-theme]'); if (th) { setTheme(th.dataset.theme, 'user'); return; }
      if (e.target.closest('.nfnav__theme')) { setTheme(resolvedTheme() === 'dark' ? 'light' : 'dark', 'user'); return; }
      if (e.target.closest('.nfnav__menu')) { S.menu ? closeMenu() : openMenu(); return; }
      if (e.target === E.scrim) closeMenu();
    });
    on(E.primary, 'pointermove', e => {
      if (e.pointerType === 'touch') return;
      S.hoverX = e.clientX - (S.scheme === 'a' ? E.ruler.getBoundingClientRect().left : 0);
      const pr = E.primary.getBoundingClientRect(), x = e.clientX - pr.left, i = geo.findIndex(g => x >= g.l && x <= g.r);
      if (i !== S.hoverItem) { S.hoverItem = i; if (i >= 0) hoverEnter(i); }
      kick();
    });
    on(E.primary, 'pointerleave', () => { S.hoverX = null; S.hoverItem = -1; if (S.scheme === 'b' && S.focusItem < 0) hl.w.t = hl.w.x; kick(); });
    function hoverEnter(i) {
      const g = geo[i];
      if (S.scheme === 'a') { const off = E.primary.getBoundingClientRect().left - E.ruler.getBoundingClientRect().left; S.scan = { l: g.l + off, r: g.r + off, t0: performance.now(), dur: reduced() ? 1 : 420 }; }
      else { const fromNone = S.hoverAmp < .05; hl.x.t = g.l; hl.w.t = g.r - g.l; if (fromNone || reduced()) { hl.x.snap(g.l); hl.w.snap(g.r - g.l); } }
      E.items[i].classList.remove('is-scan'); void E.items[i].offsetWidth; E.items[i].classList.add('is-scan');
    }
    on(E.list, 'focusin', e => { const a = e.target.closest('.nfnav__item'); if (!a) return; S.focusItem = +a.dataset.i; if (a.matches(':focus-visible')) { if (S.scheme === 'b') hoverEnter(S.focusItem); kick(); } else S.focusItem = -1; });
    on(E.list, 'focusout', () => { S.focusItem = -1; kick(); });
    on(E.list, 'keydown', e => { /* 方向键在四个导航间移动焦点 */
      const a = e.target.closest('.nfnav__item'); if (!a) return; const i = +a.dataset.i;
      const j = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? 3 : null;
      if (j === null) return; e.preventDefault(); E.items[(j + 4) % 4].focus();
    });
    on(document, 'keydown', e => { if (S.menu && e.key === 'Escape') { e.preventDefault(); closeMenu(); } trap(e); });
    on(E.panel, 'keydown', e => {
      const a = e.target.closest('.nfnav__mitem'); if (!a) return; const i = +a.dataset.i;
      const j = e.key === 'ArrowDown' ? i + 1 : e.key === 'ArrowUp' ? i - 1 : null; if (j === null) return; e.preventDefault(); E.mitems[(j + 4) % 4].focus();
    });
    ['wheel', 'touchstart'].forEach(ev => on(global, ev, unlock, { passive: true }));
    on(global, 'keydown', e => { if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', ' ', 'Home', 'End'].includes(e.key) && !el.contains(e.target)) unlock(); });
    const ro = new ResizeObserver(() => measure()); ro.observe(el); ro.observe(E.list); E.items.forEach(a => ro.observe(a));
    on(mq, 'change', () => { if (S.themePref === 'system') { updateThemeUI(); kick(); o.onThemeChange(resolvedTheme(), 'system'); } });
    const onMobile = () => { S.mobile = mm.matches; el.classList.toggle('is-mobile', S.mobile); if (!S.mobile) closeMenu(false); };
    on(mm, 'change', onMobile); onMobile();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => !S.destroyed && measure());

    applyLang(false); setVisual(S.active); measure(); writePalette(); kick();
    S.firstScene = true;

    const api = {
      el, ITEMS, setScene, setActive, cancelNavigation: unlock, setTheme: p => setTheme(p, 'api'), setLang: l => setLang(l, 'api'), openMenu, closeMenu, note, measure,
      get state() { return { scheme: S.scheme, active: S.active, visual: S.visual, progress: S.progress, lock: S.lock, sceneTone: S.sceneTone, sceneKind: S.sceneKind, tone: S.tone, theme: resolvedTheme(), themePref: S.themePref, lang: S.lang, menu: S.menu, mobile: S.mobile, indicator: [edge.L.x, edge.R.x] }; },
      /* 仅供截图/测试：暂停内部时钟并手动步进，得到确定的中间帧 */
      debug: { pause() { S.paused = true; cancelAnimationFrame(S.raf); S.raf = 0; S.last = performance.now(); }, step(ms) { const t = S.last + ms; frame(t); }, resume() { S.paused = false; kick(); } },
      destroy() { S.destroyed = true; cancelAnimationFrame(S.raf); ro.disconnect(); offs.forEach(f => f()); root.classList.remove('nfnav-lock'); el.remove(); }
    };
    return api;
  }
  /* 场景适配辅助：多边形（如 Global 翻面纸面四边形，屏幕像素坐标 [[x,y],...]）覆盖顶栏矩形的面积比例 0..1。
     Sutherland–Hodgman 裁剪到矩形 + 鞋带公式求面积；宿主可用 tone = 白底 ? 1 - cover : cover 之类得到 setScene 的 tone。 */
  function rectCoverage(points, x, y, w, h) {
    if (!points || points.length < 3 || w <= 0 || h <= 0) return 0;
    let poly = points.map(p => [p[0], p[1]]);
    const edges = [[p => p[0] >= x, (a, b) => { const t = (x - a[0]) / (b[0] - a[0]); return [x, a[1] + t * (b[1] - a[1])]; }],
      [p => p[0] <= x + w, (a, b) => { const t = (x + w - a[0]) / (b[0] - a[0]); return [x + w, a[1] + t * (b[1] - a[1])]; }],
      [p => p[1] >= y, (a, b) => { const t = (y - a[1]) / (b[1] - a[1]); return [a[0] + t * (b[0] - a[0]), y]; }],
      [p => p[1] <= y + h, (a, b) => { const t = (y + h - a[1]) / (b[1] - a[1]); return [a[0] + t * (b[0] - a[0]), y + h]; }]];
    for (const [inside, cut] of edges) {
      const out = [];
      for (let i = 0; i < poly.length; i++) {
        const a = poly[(i + poly.length - 1) % poly.length], b = poly[i], ia = inside(a), ib = inside(b);
        if (ib) { if (!ia) out.push(cut(a, b)); out.push(b); } else if (ia) out.push(cut(a, b));
      }
      poly = out; if (poly.length < 3) return 0;
    }
    let A = 0; for (let i = 0; i < poly.length; i++) { const a = poly[i], b = poly[(i + 1) % poly.length]; A += a[0] * b[1] - b[0] * a[1]; }
    return Math.min(1, Math.abs(A) / 2 / (w * h));
  }
  global.NFNav = { mount, ITEMS, PAL, rectCoverage };
})(window);
