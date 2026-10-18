/* NFTopNav — NANFEILAOTOU 全站顶部主导航「LENS 透镜」（原型 v2）
 *
 * 视觉语汇
 *   TRACK   中部一条细长的六边形轨道，四个入口坐落其中（细线、单元刻度、两端连接线与节点）
 *   LENS    当前入口被一枚「切角透镜」框住：左上 / 右下大切角、顶边锚点方块、底部落针；
 *           切换时透镜先折叠成一束光线 → 前缘先行、后缘追随地掠过轨道（留下逐渐熄灭的刻度残影）→ 在目标处展开锁定
 *   LATTICE 悬停时单元内出现跟随指针的像素点阵；32 个光点从轨道上汇聚、重构为该单元的虚线外框，
 *           指针在单元之间移动时光点连续流动、断开、重组；离开时散回轨道并熄灭
 *   SHUTTER 点击跳转：一道光闸从顶栏下沿落下覆盖画面 → 在覆盖瞬间瞬时定位到目标章节 → 光闸继续下落揭开新画面
 *           （不滚动经过其他章节；约 0.7s；减少动态效果时改为 0.2s 淡入淡出）
 *
 * 系统
 *   场景适配（setScene tone/kind，来自宿主或 NFSceneProbe 像素采样）与用户主题（setTheme）完全分开：
 *   kind 'art'|'canvas' → 顶栏跟随画面明暗；kind 'page' 或菜单打开 → 跟随主题。
 *   不读写任何 WebGL 颜色；只写自身 CSS 变量与 <html data-nf-theme / data-nf-theme-pref / data-nf-scene / lang>。
 *
 * NFTopNav.mount(opts) → api
 *   opts.navigate(key)   必填：宿主「瞬时」定位到章节（open|ai|global|personal），由光闸在完全覆盖时调用
 *   opts.isAt(key)       可选：宿主当前是否已停在该章节入口（是则只做确认脉冲，不跳转）
 *   opts.lang / theme / persist(localStorage nf.lang / nf.theme) / transition 'shutter'|'none' / mobileQuery
 *   opts.onLangChange(lang) → 可返回 {fallbacks}，>0 时给一次轻提示；onThemeChange(resolved, pref)；onMenuToggle(open)
 *   api.setScene({tone, kind}) · setActive(key) · go(key) · setLang · setTheme · openMenu · closeMenu · toast(text) · state · destroy
 */
(function (global) {
  'use strict';
  const I = global.NFI18n;
  const ITEMS = [
    { key: 'open', idx: '00', k: 'nav.home' },
    { key: 'ai', idx: '01', k: 'nav.ai' },
    { key: 'global', idx: '02', k: 'nav.global' },
    { key: 'personal', idx: '03', k: 'nav.personal' }
  ];
  const KEYS = ITEMS.map(i => i.key);
  /* 色板：唯一系统色 #5AA9FF；暖白底上同色相加深一档以保证线条与文字对比（UI ≥ 3:1） */
  const PAL = {
    dark: { ink: [242, 241, 236], bg: [5, 5, 6], acc: [90, 169, 255], accT: [90, 169, 255], panel: [8, 8, 9] },
    light: { ink: [18, 18, 17], bg: [236, 235, 231], acc: [58, 146, 240], accT: [36, 112, 196], panel: [238, 237, 233] }
  };
  const GLYPH_CJK = '▖▗▘▙▚▛▜▝▞▟', GLYPH_LAT = 'ABCDEFGHJKLMNPRSTUVWXYZ0123456789';
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const lerp = (a, b, t) => a + (b - a) * t;
  const mix3 = (A, B, t) => [0, 1, 2].map(i => Math.round(lerp(A[i], B[i], t)));
  const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${+a.toFixed(3)})`;
  const ease = {
    io: x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2,
    in: x => x * x * x,
    out: x => 1 - Math.pow(1 - x, 3)
  };
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { } }
  };
  const reduced = () => global.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  const SVG_LOGO = `<svg viewBox="0 0 30 30" aria-hidden="true" focusable="false"><g fill="none" stroke="currentColor" stroke-width="1">
    <path class="nftn__lc" d="M1.5 7V1.5H7M23 1.5h5.5V7M28.5 23v5.5H23M7 28.5H1.5V23"/>
    <path class="nftn__ld" d="M15 8.5 21.5 15 15 21.5 8.5 15Z"/></g><rect class="nftn__lp" x="14" y="14" width="2" height="2" fill="currentColor"/></svg>`;
  const SVG_THEME = `<svg class="nftn__ticon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <defs><mask id="nftn-eclipse"><rect width="24" height="24" fill="#fff"/><circle class="nftn__occ" cx="17.5" cy="7" r="5.2" fill="#000"/></mask></defs>
    <circle class="nftn__orb" cx="12" cy="12" r="5" fill="currentColor" mask="url(#nftn-eclipse)"/>
    <g class="nftn__rays" stroke="currentColor" stroke-width="1.2" stroke-linecap="square">
      <path d="M12 2.6v2M12 19.4v2M2.6 12h2M19.4 12h2M5.4 5.4l1.4 1.4M17.2 17.2l1.4 1.4M5.4 18.6l1.4-1.4M17.2 6.8l1.4-1.4"/></g></svg>`;
  const SVG_CHAMFER = `<svg class="nftn__cf" viewBox="0 0 34 34" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="M7.5 .5H33.5V26.5L26.5 33.5H.5V7.5Z" fill="none" stroke="currentColor" vector-effect="non-scaling-stroke"/></svg>`;

  function markup(o, t) {
    const items = ITEMS.map((it, i) => `<li class="nftn__li"><a class="nftn__item" href="#${it.key}" data-nav="${it.key}" data-i="${i}">
      <span class="nftn__idx" aria-hidden="true">${it.idx}</span><span class="nftn__label" data-k="${it.k}">${t(it.k)}</span></a></li>`).join('');
    const mitems = ITEMS.map((it, i) => `<li><a class="nftn__mitem" href="#${it.key}" data-nav="${it.key}" data-i="${i}">
      <span class="nftn__midx" aria-hidden="true">${it.idx}</span>
      <span class="nftn__mtext"><span class="nftn__mlabel" data-k="${it.k}">${t(it.k)}</span><span class="nftn__msub" data-k="${it.k}.sub">${t(it.k + '.sub')}</span></span>
      <span class="nftn__marrow" aria-hidden="true"></span></a></li>`).join('');
    const seg = (name, opts) => `<div class="nftn__seg" role="group" data-seg="${name}" aria-label="${t(name + '.group')}" data-i18n-aria="${name}.group">${opts.map(([v, k, extra]) =>
      `<button type="button" class="nftn__sopt" data-${name}="${v}" ${extra || ''}><span data-k="${k}">${t(k)}</span></button>`).join('')}<span class="nftn__slens" aria-hidden="true"></span></div>`;
    return `
  <div class="nftn__scrim" aria-hidden="true"></div>
  <div class="nftn__bar">
    <a class="nftn__brand" href="#open" data-nav="open" aria-label="${t('brand.home')}" data-i18n-aria="brand.home">
      <span class="nftn__logo" data-slot="logo" title="${t('logo.slot')}">${SVG_LOGO}</span>
      <span class="nftn__word" aria-hidden="true">NANFEILAOTOU</span>
    </a>
    <nav class="nftn__primary" aria-label="${t('nav.label')}" data-i18n-aria="nav.label">
      <canvas class="nftn__cv" aria-hidden="true"></canvas>
      <ul class="nftn__list" role="list">${items}</ul>
    </nav>
    <div class="nftn__tools">
      <div class="nftn__lang" role="group" aria-label="${t('lang.group')}" data-i18n-aria="lang.group">
        <span class="nftn__llens" aria-hidden="true">${SVG_CHAMFER}</span>
        <button type="button" class="nftn__lopt" data-lang="zh" lang="zh-CN" aria-label="切换到中文">中</button>
        <button type="button" class="nftn__lopt" data-lang="en" lang="en" aria-label="Switch to English">EN</button>
      </div>
      <span class="nftn__sep" aria-hidden="true"></span>
      <button type="button" class="nftn__theme" aria-label="${t('theme.toLight')}">${SVG_CHAMFER}${SVG_THEME}<span class="nftn__auto" aria-hidden="true"></span></button>
      <span class="nftn__chip" aria-hidden="true"><span class="nftn__chip-idx">00</span><span class="nftn__chip-t">${t('nav.home')}</span></span>
      <button type="button" class="nftn__menu" aria-expanded="false" aria-controls="${o.id}-panel" aria-label="${t('menu.open')}"><i></i><i></i></button>
    </div>
  </div>
  <p class="nftn__toast" role="status" aria-live="polite"></p>
  <div class="nftn__panel" id="${o.id}-panel" role="dialog" aria-modal="true" aria-label="${t('menu.title')}" data-i18n-aria="menu.title" hidden>
    <div class="nftn__pscan" aria-hidden="true"></div>
    <ol class="nftn__mlist" role="list"><span class="nftn__mlens" aria-hidden="true"></span>${mitems}</ol>
    <div class="nftn__prefs">
      <div class="nftn__prow"><span class="nftn__plabel" data-k="lang.group">${t('lang.group')}</span>${seg('lang', [['zh', 'lang.zh', 'lang="zh-CN"'], ['en', 'lang.en', 'lang="en"']])}</div>
      <div class="nftn__prow"><span class="nftn__plabel" data-k="theme.group">${t('theme.group')}</span>${seg('theme', [['light', 'theme.light'], ['dark', 'theme.dark'], ['system', 'theme.auto']])}</div>
    </div>
    <p class="nftn__pfoot" aria-hidden="true"><span>NANFEILAOTOU</span><span>00 — 03</span></p>
  </div>`;
  }

  /* 切角多边形：左上、右下为大切角 cb，右上、左下为小切角 cs */
  function chamfer(x0, y0, x1, y1, cb, cs) {
    const h = y1 - y0, w = x1 - x0; cb = Math.min(cb, h / 2, w / 2); cs = Math.min(cs, h / 2, w / 2);
    return [[x0 + cb, y0], [x1 - cs, y0], [x1, y0 + cs], [x1, y1 - cb], [x1 - cb, y1], [x0 + cs, y1], [x0, y1 - cs], [x0, y0 + cb]];
  }
  function perim(poly) {
    const seg = []; let L = 0;
    for (let i = 0; i < poly.length; i++) { const a = poly[i], b = poly[(i + 1) % poly.length], l = Math.hypot(b[0] - a[0], b[1] - a[1]); seg.push([a, b, L, l]); L += l; }
    return p => { let d = ((p % 1) + 1) % 1 * L; for (const s of seg) { if (d <= s[2] + s[3]) { const k = (d - s[2]) / (s[3] || 1); return [lerp(s[0][0], s[1][0], k), lerp(s[0][1], s[1][1], k)]; } } return poly[0]; };
  }
  function pathPoly(c, poly) { c.beginPath(); poly.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.closePath(); }

  function mount(opts) {
    const o = Object.assign({ parent: document.body, id: 'nf-topnav', lang: null, theme: null, persist: true, transition: 'shutter',
      mobileQuery: '(max-width: 760px)', navigate: () => { }, isAt: null, onLangChange: () => { }, onThemeChange: () => { }, onMenuToggle: () => { } }, opts || {});
    const root = document.documentElement;
    const S = {
      lang: o.lang || (o.persist && store.get('nf.lang')) || 'zh',
      themePref: o.theme || (o.persist && store.get('nf.theme')) || 'system',
      sceneTone: 0, sceneKind: 'art', tone: 0, side: 0, m: 0, first: true,
      active: KEYS.includes(o.active) ? o.active : 'open', visual: KEYS.includes(o.active) ? o.active : 'open', lock: null, lockT: 0,
      lens: { L: 0, vL: 0, R: 0, vR: 0, h: 1, vh: 0, init: false }, fold: false, arrivedT: -1, lastLead: null,
      trail: [], fl: null, scan: null, pulse: null,
      hover: { i: -1, last: -1, amp: 0, x: 0, y: 0, sx: 0, sy: 0, vx: 0, vy: 0 }, press: -1, focus: -1, kbd: false,
      parts: [], menu: false, mobile: false, raf: 0, last: 0, destroyed: false, decoding: 0, palKey: '',
      shutter: { ph: 'idle', a: 0, b: 0, a0: 0, b0: 0, t0: 0, dur: 0, key: null }
    };
    if (!I.LANGS.includes(S.lang)) S.lang = 'zh';
    const tr = k => I.t(k, S.lang);
    const clock = () => S.paused ? S.dbgT : performance.now();
    const mq = matchMedia('(prefers-color-scheme: light)'), mm = matchMedia(o.mobileQuery);
    const resolvedTheme = () => S.themePref === 'system' ? (mq.matches ? 'light' : 'dark') : S.themePref;
    const surfaceTheme = () => o.artThemeIndependent && S.sceneKind !== 'page' ? (S.sceneTone > .5 ? 'light' : 'dark') : resolvedTheme();

    const el = document.createElement('header');
    el.className = 'nftn'; el.id = o.id;
    el.innerHTML = markup(o, tr);
    o.parent.prepend(el);
    const sh = document.createElement('canvas'); sh.className = 'nftn-shutter'; sh.setAttribute('aria-hidden', 'true');
    el.after(sh);
    const $ = s => el.querySelector(s), $$ = s => [...el.querySelectorAll(s)];
    const E = {
      bar: $('.nftn__bar'), primary: $('.nftn__primary'), cv: $('.nftn__cv'), list: $('.nftn__list'), items: $$('.nftn__item'), labels: $$('.nftn__item .nftn__label'),
      brand: $('.nftn__brand'), word: $('.nftn__word'), lopts: $$('.nftn__lopt'), llens: $('.nftn__llens'), theme: $('.nftn__theme'),
      chipIdx: $('.nftn__chip-idx'), chipT: $('.nftn__chip-t'), menu: $('.nftn__menu'), panel: $('.nftn__panel'), mitems: $$('.nftn__mitem'),
      mlens: $('.nftn__mlens'), toast: $('.nftn__toast'), segs: $$('.nftn__seg')
    };
    const cx = E.cv.getContext('2d'), sx = sh.getContext('2d');
    let G = null, DPR = 1, VW = innerWidth, VH = innerHeight;
    const PX = 84; /* 画布左右外扩（连接线与节点） */
    const TH = 19, LH = 24; /* 轨道 / 透镜半高 */

    /* ---------- 测量 ---------- */
    function measure() {
      VW = innerWidth; VH = innerHeight; DPR = Math.min(3, global.devicePixelRatio || 1);
      const hr = el.getBoundingClientRect(), pr = E.primary.getBoundingClientRect();
      root.style.setProperty('--nf-nav-h', Math.round(E.bar.getBoundingClientRect().height) + 'px');
      S.mobile = mm.matches; el.classList.toggle('is-mobile', S.mobile);
      sh.width = Math.round(VW * DPR); sh.height = Math.round(VH * DPR);
      if (S.mobile || pr.width < 2) { G = null; placeMenuLens(); return; }
      const W = pr.width + PX * 2, H = pr.height;
      if (E.cv.width !== Math.round(W * DPR) || E.cv.height !== Math.round(H * DPR)) { E.cv.width = Math.round(W * DPR); E.cv.height = Math.round(H * DPR); }
      E.cv.style.width = W + 'px'; E.cv.style.height = H + 'px'; E.cv.style.left = -PX + 'px';
      const cells = E.items.map(a => { const r = a.getBoundingClientRect(); return { x0: r.left - pr.left + PX, x1: r.right - pr.left + PX, lx0: 0, lx1: 0 }; });
      E.labels.forEach((l, i) => { const r = l.getBoundingClientRect(); cells[i].lx0 = r.left - pr.left + PX; cells[i].lx1 = r.right - pr.left + PX; });
      /* 两端连接线长度随可用空间收缩（窄屏时不碰到品牌与工具组） */
      const br = E.brand.getBoundingClientRect(), tl = $('.nftn__tools').getBoundingClientRect();
      const room = Math.min(pr.left + cells[0].x0 - PX - 19 - br.right, tl.left - (pr.left + cells[cells.length - 1].x1 - PX + 19));
      G = { W, H, cy: H / 2, cells, x0: cells[0].x0, x1: cells[cells.length - 1].x1, left: pr.left - PX, top: pr.top, barBottom: hr.bottom, conn: clamp(room - 18, 0, 58) };
      /* 首次与 Resize / 缩放：透镜直接对齐（不做弹簧动画）；点击掠过途中则保持动画 */
      if (!S.lens.init || !S.fold) { const c = cells[KEYS.indexOf(S.visual)]; Object.assign(S.lens, { L: c.x0 - 2, R: c.x1 + 2, vL: 0, vR: 0, init: true }); }
      placeMenuLens(); placeLangLens(false); kick();
    }

    /* ---------- 色板（JS 每帧按 tone 与 ink 写变量）---------- */
    function writePalette() {
      const m = S.m, t = S.tone, P = { ink: mix3(PAL.dark.ink, PAL.light.ink, m), acc: mix3(PAL.dark.acc, PAL.light.acc, m), accT: mix3(PAL.dark.accT, PAL.light.accT, m) };
      const bg = mix3(PAL.dark.bg, PAL.light.bg, m), mid = Math.sin(Math.PI * clamp(t)), page = S.sceneKind === 'page' ? 1 : 0;  /* 遮罩取「文字对侧」的底色：中间灰阶时推向高对比而不是变脏灰 */
      const th = surfaceTheme() === 'light' ? PAL.light : PAL.dark, panelInk = th === PAL.light ? PAL.light : PAL.dark;
      const key = [P.ink, P.acc, bg, (mid * 100) | 0, th === PAL.light, page].join('|');
      S.P = P; S.bg = bg;
      if (key === S.palKey) return; S.palKey = key;
      const st = el.style;
      st.setProperty('--tn-ink', rgba(P.ink, 1)); st.setProperty('--tn-ink2', rgba(P.ink, .64)); st.setProperty('--tn-ink3', rgba(P.ink, .38));
      st.setProperty('--tn-line', rgba(P.ink, .2)); st.setProperty('--tn-acc', rgba(P.acc, 1)); st.setProperty('--tn-acct', rgba(P.accT, 1));
      st.setProperty('--tn-accs', rgba(P.acc, m > .5 ? .14 : .12));
      /* 顶部只有一层很轻的渐隐（不遮场景）；翻面过渡的中间灰阶时自动加厚，保证文字始终可读 */
      st.setProperty('--tn-scrim', rgba(bg, page ? .84 : .5 + .38 * mid)); st.setProperty('--tn-scrim2', rgba(bg, page ? .84 : .16 + .5 * mid));
      st.setProperty('--tn-panel', rgba(th.panel, 1)); st.setProperty('--tn-pink', rgba(panelInk.ink, 1)); st.setProperty('--tn-pink2', rgba(panelInk.ink, .6));
      st.setProperty('--tn-pline', rgba(panelInk.ink, .14)); st.setProperty('--tn-pacc', rgba(panelInk.accT, 1)); st.setProperty('--tn-pacc2', rgba(panelInk.acc, 1));
      el.setAttribute('data-tone', m > .5 ? 'light' : 'dark');
    }
    function toneTarget() {
      if (S.menu || S.sceneKind === 'page') return surfaceTheme() === 'light' ? 1 : 0;
      /* 光闸覆盖时顶栏落在光闸（深色）上 */
      return S.sceneTone * (1 - shutterTop());
    }

    /* ---------- 主题与语言 ---------- */
    function applyTheme(announce) {
      const th = resolvedTheme();
      root.setAttribute('data-nf-theme', th); root.setAttribute('data-nf-theme-pref', S.themePref);
      el.classList.toggle('is-light-pref', th === 'light'); el.classList.toggle('is-auto', S.themePref === 'system');
      E.theme.setAttribute('aria-label', tr(th === 'light' ? 'theme.toDark' : 'theme.toLight'));
      E.theme.setAttribute('aria-pressed', String(th === 'light'));
      syncSeg('theme', S.themePref); S.palKey = ''; kick();
      if (announce) o.onThemeChange(th, S.themePref);
    }
    function decode(span, text, delay, set) {
      if (span.textContent === text && !span._dec) return;
      if (reduced() || !span.isConnected) { span.textContent = text; return; }
      const cjk = /[\u3400-\u9fff]/.test(text), G2 = cjk ? GLYPH_CJK : GLYPH_LAT, chars = [...text], t0 = clock() + (delay || 0);
      span._dec = (span._dec || 0) + 1; const id = span._dec; S.decoding++;
      (function step(now) {
        if (S.destroyed || span._dec !== id) { S.decoding--; return; }
        const e = now - t0; let out = '';
        chars.forEach((ch, i) => { out += ch === ' ' ? ' ' : e > 150 + i * 34 ? ch : e < 0 && set ? set[i] || '' : G2[(Math.random() * G2.length) | 0]; });
        span.textContent = out;
        if (e > 150 + chars.length * 34) { span.textContent = text; span._dec = 0; S.decoding--; S.dirty = true; return; }
        S.dirty = true; kick(); requestAnimationFrame(step);
      })(clock());
    }
    function applyLang(animate) {
      const L = S.lang;
      root.setAttribute('lang', I.HTML_LANG[L]); el.setAttribute('data-lang', L);
      $$('[data-k]').forEach((sp, i) => { const txt = tr(sp.dataset.k); animate && sp.offsetParent ? decode(sp, txt, (+sp.closest('[data-i]')?.dataset.i || 0) * 40) : (sp.textContent = txt); });
      $$('[data-i18n-aria]').forEach(n => n.setAttribute('aria-label', tr(n.dataset.i18nAria)));
      E.lopts.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === L)));
      $('.nftn__logo').title = tr('logo.slot');
      syncSeg('lang', L); updateMenuLabel(); updateChip(animate); applyTheme(false); placeLangLens(animate);
      S.dirty = true; kick();
    }
    function syncSeg(name, v) {
      const seg = el.querySelector(`.nftn__seg[data-seg=${name}]`); if (!seg) return;
      const btns = [...seg.querySelectorAll('.nftn__sopt')]; let on = null;
      btns.forEach(b => { const p = b.dataset[name] === v; b.setAttribute('aria-pressed', String(p)); if (p) on = b; });
      const lens = seg.querySelector('.nftn__slens');
      if (on && lens) { lens.style.transform = `translateX(${on.offsetLeft}px)`; lens.style.width = on.offsetWidth + 'px'; }
    }
    function placeLangLens(animate) {
      const on = E.lopts.find(b => b.dataset.lang === S.lang); if (!on) return;
      const x = on.offsetLeft, prev = S.llx;
      S.llx = x; E.llens.style.width = on.offsetWidth + 'px';
      if (animate && prev != null && prev !== x && !reduced() && E.llens.animate) {
        E.llens.animate([{ transform: `translateX(${prev}px) scaleY(1)` }, { transform: `translateX(${prev}px) scaleY(.06)`, offset: .28 },
          { transform: `translateX(${x}px) scaleY(.06)`, offset: .7 }, { transform: `translateX(${x}px) scaleY(1)` }], { duration: 460, easing: 'cubic-bezier(.5,0,.2,1)' });
      }
      E.llens.style.transform = `translateX(${x}px)`;
    }
    function updateMenuLabel() { E.menu.setAttribute('aria-label', tr(S.menu ? 'menu.close' : 'menu.open')); }
    function updateChip(animate) {
      const it = ITEMS[KEYS.indexOf(S.visual)]; E.chipIdx.textContent = it.idx;
      animate && S.mobile ? decode(E.chipT, tr(it.k), 0) : (E.chipT.textContent = tr(it.k));
    }
    let toastT = 0;
    function toast(text, ms) {
      E.toast.textContent = text; E.toast.classList.add('is-on'); clearTimeout(toastT);
      toastT = setTimeout(() => E.toast.classList.remove('is-on'), ms || 3600);
    }

    /* ---------- 激活态 ---------- */
    function setVisual(key, viaClick) {
      if (!KEYS.includes(key)) return;
      if (key !== S.visual) {
        S.visual = key; if (viaClick) S.fold = true; S.arrivedT = -1;
        markActive(key);
        updateChip(true); placeMenuLens(); kick();
      }
    }
    function markActive(key) {
      E.items.concat(E.mitems).forEach(a => { const on = a.dataset.nav === key; a.classList.toggle('is-active', on); on ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current'); });
    }
    function placeMenuLens() {
      const a = E.mitems[KEYS.indexOf(S.visual)]; if (!a || !E.mlens) return;
      const li = a.parentElement; E.mlens.style.transform = `translateY(${li.offsetTop}px)`; E.mlens.style.height = li.offsetHeight + 'px';
    }

    /* ---------- 跳转：点击 → 透镜折叠/掠过/展开 + 光闸 + 宿主瞬时定位 ---------- */
    function go(key, src) {
      if (!KEYS.includes(key)) return;
      if (o.canNavigate && !o.canNavigate(key)) { o.onUnavailable?.(key); return; }
      const already = S.visual === key && !S.lock && S.shutter.ph === 'idle' && (o.isAt ? o.isAt(key) : true);
      if (already) { S.pulse = { t0: clock() }; kick(); return; }
      S.lock = key; S.lockT = clock();
      setVisual(key, true);
      if (o.transition === 'none') { o.navigate(key); S.lockT = clock(); return; }
      startShutter(key);
    }
    function shutterTop() { const s = S.shutter; if (s.ph === 'idle') return 0; const e = x => x * x * (3 - 2 * x); return s.ph === 'reveal' ? 1 - e(clamp(s.a * 5)) : e(clamp(s.b * 5)); }
    function startShutter(key) {
      const s = S.shutter, now = clock();
      s.key = key;
      if (s.ph === 'cover') return;                   /* 覆盖途中改目标：只换目标，覆盖完成时按最新目标定位 */
      if (s.ph === 'hold') { if (s.committed !== key) { o.navigate(key); s.committed = key; } s.t0 = now; kick(); return; }  /* 已完全覆盖：直接改定位并延长停留 */
      s.a0 = s.ph === 'idle' ? 0 : s.a; s.b0 = s.ph === 'idle' ? 0 : s.b;
      if (s.ph === 'idle') { s.a = 0; s.b = 0; s.a0 = 0; s.b0 = 0; }
      s.ph = 'cover'; s.t0 = now;
      s.dur = reduced() ? 110 : 120 + 200 * Math.max(1 - s.b0, s.a0);
      kick();
    }
    function stepShutter(now) {
      const s = S.shutter; if (s.ph === 'idle') return false;
      const k = clamp((now - s.t0) / s.dur);
      if (s.ph === 'cover') {
        const e = reduced() ? k : ease.in(k * .6 + .4 * k * k) ;
        s.b = lerp(s.b0, 1, reduced() ? 1 : e); s.a = lerp(s.a0, 0, reduced() ? 1 : ease.out(k));
        s.fade = reduced() ? k : 1;
        if (k >= 1) { s.a = 0; s.b = 1; s.committed = null; s.ph = 'hold'; s.t0 = now; s.dur = reduced() ? 40 : 90; }
      } else if (s.ph === 'hold') {
        // Present a fully closed frame before the host may initialise a cold WebGL scene.
        if (s.committed !== s.key) { o.navigate(s.key); s.committed = s.key; s.t0 = now; }
        else if (k >= 1) { s.ph = 'reveal'; s.t0 = now; s.dur = reduced() ? 160 : 380; }
      } else if (s.ph === 'reveal') {
        s.a = reduced() ? 0 : ease.io(k); s.fade = reduced() ? 1 - k : 1;
        if (k >= 1) { s.ph = 'idle'; s.a = s.b = 0; S.lockT = now; }
      }
      return true;
    }
    function drawShutter(now) {
      const c = sx, s = S.shutter; c.setTransform(DPR, 0, 0, DPR, 0, 0); c.clearRect(0, 0, VW, VH);
      if (s.ph === 'idle') { sh.style.visibility = 'hidden'; return; }
      sh.style.visibility = 'visible';
      const nb = G ? G.barBottom : (parseFloat(root.style.getPropertyValue('--nf-nav-h')) || 60), span = VH - nb;
      const yA = s.a <= 0 ? 0 : nb + s.a * span, yB = nb + s.b * span, fade = s.fade == null ? 1 : s.fade;
      const D = PAL.dark, ink = D.ink, acc = D.acc;
      if (reduced()) { c.fillStyle = rgba(D.bg, .98 * fade); c.fillRect(0, 0, VW, VH); return; }
      /* 顶栏下方以上的区域（顶栏背后）渐入/渐出，避免在顶栏处突然变色 */
      const topA = shutterTop();
      if (topA > 0) { c.fillStyle = rgba(D.bg, .97 * topA); c.fillRect(0, 0, VW, Math.min(nb, yB)); }
      const y0 = Math.max(nb, yA), y1 = yB;
      if (y1 > y0) {
        c.fillStyle = rgba(D.bg, .97); c.fillRect(0, y0, VW, y1 - y0);
        /* 扫描纹理与参考网格（极淡） */
        c.fillStyle = rgba(ink, .028); for (let y = Math.ceil(y0 / 6) * 6; y < y1; y += 6) c.fillRect(0, y, VW, 1);
        c.fillStyle = rgba(ink, .05); for (let x = (VW / 2) % 96; x < VW; x += 96) c.fillRect(Math.round(x), y0, 1, y1 - y0);
      }
      const tgt = G ? G.cells[KEYS.indexOf(s.key)] : null, tx = tgt ? G.left + (tgt.x0 + tgt.x1) / 2 : VW / 2;
      const edge = (y, dir) => {
        c.fillStyle = rgba(acc, .95); c.fillRect(0, Math.round(y) - 1, VW, 1);
        c.fillStyle = rgba(acc, .16); c.fillRect(0, Math.round(y) - 1 - 3 * dir, VW, 3 * dir || 1);
        c.fillStyle = rgba(ink, .32); for (let x = (tx % 24 + 24) % 24; x < VW; x += 24) c.fillRect(Math.round(x), Math.round(y) - (dir > 0 ? 6 : -1), 1, 5);
        c.fillStyle = rgba(acc, 1); c.fillRect(Math.round(tx - 36), Math.round(y) - 2, 72, 3);
        c.fillRect(Math.round(tx) - 1, Math.round(y) - (dir > 0 ? 10 : -2), 2, 8);
        c.font = '500 10px "JetBrains Mono","SF Mono","Liberation Mono",monospace'; c.textBaseline = 'alphabetic';
        const it = ITEMS[KEYS.indexOf(s.key)], lab = `${it.idx} · ${I.t(it.k + '.go', S.lang).toUpperCase()}`;
        c.fillStyle = rgba(acc, .9); c.fillText(lab, Math.round(tx + 44), Math.round(y) + (dir > 0 ? -8 : 16));
        c.fillStyle = rgba(ink, .4); c.fillText('Y ' + String(Math.round(y)).padStart(4, '0'), VW - 74, Math.round(y) + (dir > 0 ? -8 : 16));
      };
      if (s.ph === 'cover' && yB < VH - .5) edge(yB, 1);
      if (s.ph === 'reveal' && yA > nb) edge(yA, -1);
      /* 完全覆盖时的目标字样 */
      const full = s.ph === 'hold' ? 1 : s.ph === 'cover' ? clamp((s.b - .78) / .22) : 1 - clamp(s.a / .3);
      if (full > 0 && y1 - y0 > 40) {
        const it = ITEMS[KEYS.indexOf(s.committed && s.ph !== 'cover' ? s.committed : s.key)], cy = nb + span * .5;
        c.save(); c.beginPath(); c.rect(0, y0, VW, y1 - y0); c.clip();
        c.globalAlpha = full; c.textAlign = 'center';
        c.fillStyle = rgba(acc, 1); c.font = '600 11px "JetBrains Mono","SF Mono","Liberation Mono",monospace'; c.fillText(`${it.idx}  /  03`, VW / 2, cy - 34);
        c.fillStyle = rgba(ink, 1); c.font = `600 ${S.lang === 'en' ? 30 : 34}px ${S.lang === 'en' ? '"JetBrains Mono","SF Mono","Liberation Mono",monospace' : '"PingFang SC","Noto Sans SC","Noto Sans CJK SC",sans-serif'}`;
        c.fillText(I.t(it.k, S.lang).toUpperCase(), VW / 2, cy + 8);
        c.fillStyle = rgba(ink, .42); c.font = '500 10px "JetBrains Mono","SF Mono","Liberation Mono",monospace'; c.fillText(I.t(it.k + '.sub', 'en').toUpperCase(), VW / 2, cy + 32);
        c.fillStyle = rgba(acc, 1); c.fillRect(VW / 2 - 18, cy + 46, 36, 1);
        c.restore(); c.textAlign = 'left'; c.globalAlpha = 1;
      }
    }

    /* ---------- 粒子（悬停重构）---------- */
    const NP = 32;
    for (let i = 0; i < NP; i++) S.parts.push({ x: 0, y: 0, vx: 0, vy: 0, k: .75 + ((i * 7919) % 100) / 200, p: i / NP, init: false });

    /* ---------- 帧 ---------- */
    function spring(o2, xk, vk, target, K, dt, z) { const B = 2 * Math.sqrt(K) * (z || 1); o2[vk] += (K * (target - o2[xk]) - B * o2[vk]) * dt; o2[xk] += o2[vk] * dt; }
    function frame(now) {
      S.raf = 0; if (S.destroyed) return;
      const dtR = S.last ? Math.min(.25, Math.max(0, now - S.last) / 1000) : .016, dt = Math.min(.05, dtR); S.last = now;  /* 平滑用真实 dt（低帧率也能按时收敛），弹簧用截断 dt */
      let busy = false;
      /* tone 与 ink */
      const tt = toneTarget();
      if (S.first) { S.tone = tt; S.side = tt > .5 ? 1 : 0; S.m = S.side; S.first = false; }
      else if (S.shutter.ph !== 'idle') S.tone = tt;           /* 光闸自身已是平滑曲线：直接跟随，避免文字滞后在灰阶上 */
      else S.tone += (tt - S.tone) * (1 - Math.exp(-dtR / .09));
      if (S.tone > .53) S.side = 1; else if (S.tone < .47) S.side = 0;
      S.m += (S.side - S.m) * (1 - Math.exp(-dtR / .055));
      if (Math.abs(tt - S.tone) > .002 || Math.abs(S.side - S.m) > .002) busy = true; else { S.tone = tt; S.m = S.side; }
      writePalette();
      /* 锁定解除：光闸结束且宿主已到达目标，或超时 */
      if (S.lock && S.shutter.ph === 'idle' && (S.active === S.lock || now - S.lockT > 900)) { S.lock = null; if (S.active !== S.visual) setVisual(S.active); }
      if (S.dirty) { S.dirty = false; measureCells(); }
      if (G) busy = stepLens(now, dt) || busy;
      busy = stepShutter(now) || busy;
      if (G) draw(now);
      drawShutter(now);
      if (busy || S.decoding > 0 || S.lock) kick();
    }
    function measureCells() {
      if (!G) return; const pr = E.primary.getBoundingClientRect();
      E.items.forEach((a, i) => { const r = a.getBoundingClientRect(), l = E.labels[i].getBoundingClientRect(); Object.assign(G.cells[i], { x0: r.left - pr.left + PX, x1: r.right - pr.left + PX, lx0: l.left - pr.left + PX, lx1: l.right - pr.left + PX }); });
      G.x0 = G.cells[0].x0; G.x1 = G.cells[G.cells.length - 1].x1; G.left = pr.left - PX;
    }
    function stepLens(now, dt) {
      const Ls = S.lens, c = G.cells[KEYS.indexOf(S.visual)], tL = c.x0 - 2, tR = c.x1 + 2, H = S.hover;
      const RM = reduced();
      let busy = false;
      if (RM) { Ls.L = tL; Ls.R = tR; Ls.h = 1; Ls.vL = Ls.vR = Ls.vh = 0; S.fold = false; S.trail.length = 0; }
      else {
        const n = Math.max(1, Math.ceil(dt / (1 / 240))), h = dt / n;
        const right = (tL + tR) / 2 > (Ls.L + Ls.R) / 2;
        const far = Math.max(Math.abs(tL - Ls.L), Math.abs(tR - Ls.R)) > (S.fold ? 9 : 1.5);
        const hoverActive = H.i === KEYS.indexOf(S.visual) ? H.amp : 0;
        let hT = 1 + .1 * hoverActive - (S.press === KEYS.indexOf(S.visual) ? .08 : 0);
        if (S.fold && far) hT = .04; else if (S.fold && !far) { S.fold = false; S.arrivedT = now; }
        for (let i = 0; i < n; i++) {
          const gate = S.fold && Ls.h > .3;           /* 先折叠、后掠过 */
          const KL = right ? 380 : 900, KR = right ? 900 : 380;
          spring(Ls, 'L', 'vL', gate ? Ls.L : tL, KL, h); spring(Ls, 'R', 'vR', gate ? Ls.R : tR, KR, h);
          const sp = (Math.abs(Ls.vL) + Math.abs(Ls.vR)) / 2;
          const hTarget = S.fold ? hT : Math.min(hT, 1 - .5 * clamp(sp / 1600));
          spring(Ls, 'h', 'vh', hTarget, S.fold ? 1400 : 700, h);
        }
        if (Ls.R - Ls.L < 6) { const m = (Ls.L + Ls.R) / 2; Ls.L = m - 3; Ls.R = m + 3; }
        /* 掠过残影：前缘每移动 7px 留下一枚刻度 */
        const lead = right ? Ls.R : Ls.L;
        if (S.lastLead == null) S.lastLead = lead;
        if (Ls.h < .5 && Math.abs(lead - S.lastLead) >= 7) { S.trail.push({ x: lead, t0: now }); S.lastLead = lead; }
        else if (Ls.h >= .5) S.lastLead = lead;
        S.trail = S.trail.filter(t => now - t.t0 < 520);
        if (S.arrivedT > 0 && Ls.h > .9) { S.fl = { t0: now, i: KEYS.indexOf(S.visual) }; S.scan = { t0: now, i: KEYS.indexOf(S.visual) }; S.arrivedT = -1; }
        busy = far || Math.abs(Ls.vL) + Math.abs(Ls.vR) > .5 || Math.abs(Ls.h - hT) > .002 || Math.abs(Ls.vh) > .01 || S.trail.length > 0 || S.fold;
        if (!busy) { Ls.L = tL; Ls.R = tR; Ls.h = hT; }
      }
      /* 悬停强度与指针（平滑） */
      const aT = H.i >= 0 ? 1 : 0;
      H.amp += (aT - H.amp) * (1 - Math.exp(-dt / (aT ? .09 : .16)));
      if (Math.abs(aT - H.amp) < .003) H.amp = aT;
      spring(H, 'sx', 'vx', H.x, 520, dt); spring(H, 'sy', 'vy', H.y, 520, dt);
      if (H.amp > 0 && H.amp < 1 || Math.abs(H.x - H.sx) > .3) busy = true;
      /* 粒子：悬停时汇聚到该单元的外框，否则散回轨道 */
      const hi = H.i >= 0 ? H.i : H.last;
      if (hi >= 0) {
        const cc = G.cells[hi], cy = G.cy, poly = chamfer(cc.x0 + 4, cy - 15, cc.x1 - 4, cy + 15, 6, 2), P = perim(poly);
        S.parts.forEach((p, j) => {
          let tx, ty;
          if (H.i >= 0) { const q = P(p.p + now * 0); tx = q[0]; ty = q[1]; }
          else { tx = lerp(cc.x0, cc.x1, j / (NP - 1)); ty = cy + TH; }
          if (!p.init) { p.x = lerp(G.x0, G.x1, j / (NP - 1)); p.y = G.cy + TH; p.init = true; }
          if (RM) { p.x = tx; p.y = ty; p.vx = p.vy = 0; return; }
          const K = 210 * p.k; spring(p, 'x', 'vx', tx, K, dt, .82); spring(p, 'y', 'vy', ty, K, dt, .82);
          if (Math.abs(p.vx) + Math.abs(p.vy) > 1 || Math.abs(tx - p.x) > .4) busy = true;
        });
      }
      if (S.fl && now - S.fl.t0 < 420) busy = true; else S.fl = null;
      if (S.scan && now - S.scan.t0 < 420) busy = true; else S.scan = null;
      if (S.pulse && now - S.pulse.t0 < 520) busy = true; else S.pulse = null;
      return busy;
    }
    function draw(now) {
      const c = cx, P = S.P, ink = P.ink, acc = P.acc, cy = G.cy, light = S.m > .5;
      c.setTransform(DPR, 0, 0, DPR, 0, 0); c.clearRect(0, 0, G.W, G.H);
      const X0 = G.x0 - 8, X1 = G.x1 + 8;
      /* —— 轨道 —— */
      const track = [[X0, cy - TH], [X1, cy - TH], [X1 + 11, cy], [X1, cy + TH], [X0, cy + TH], [X0 - 11, cy]];
      c.lineWidth = 1; c.strokeStyle = rgba(ink, light ? .24 : .2);
      c.save(); c.translate(.5, .5); pathPoly(c, track); c.stroke();
      /* 单元分隔刻度 */
      c.strokeStyle = rgba(ink, light ? .34 : .3); c.beginPath();
      for (let i = 0; i < G.cells.length - 1; i++) { const x = Math.round((G.cells[i].x1 + G.cells[i + 1].x0) / 2); c.moveTo(x, cy - TH); c.lineTo(x, cy - TH + 4); c.moveTo(x, cy + TH - 4); c.lineTo(x, cy + TH); }
      c.stroke();
      /* 两端连接线与节点 */
      const CL = G.conn;
      if (CL > 6) for (const [x, d] of [[X0 - 11, -1], [X1 + 11, 1]]) {
        const g = c.createLinearGradient(x, 0, x + d * CL, 0); g.addColorStop(0, rgba(ink, light ? .3 : .26)); g.addColorStop(1, rgba(ink, 0));
        c.strokeStyle = g; c.beginPath(); c.moveTo(x, cy); c.lineTo(x + d * CL, cy); c.stroke();
        if (CL > 30) { c.fillStyle = rgba(ink, light ? .5 : .42); c.fillRect(Math.round(x + d * (CL + 8)) - 1.5, Math.round(cy) - 1.5, 2, 2); }
      }
      c.restore();
      /* —— 悬停：像素点阵（跟随指针的聚光）—— */
      const H = S.hover, hi = H.i >= 0 ? H.i : H.last, ai = KEYS.indexOf(S.visual);
      if (hi >= 0 && H.amp > .01) {
        const cc = G.cells[hi], col = hi === ai ? acc : ink;
        c.fillStyle = rgba(col, 1);
        for (let y = cy - 13; y <= cy + 13; y += 4) for (let x = cc.x0 + 6; x <= cc.x1 - 6; x += 4) {
          const d = Math.hypot(x - H.sx, (y - H.sy) * 1.4), a = H.amp * (light ? .5 : .55) * Math.exp(-(d * d) / (2 * 30 * 30));
          if (a < .03) continue; c.globalAlpha = a; c.fillRect(Math.round(x), Math.round(y), 1, 1);
        }
        c.globalAlpha = 1;
      }
      /* —— 悬停：光点重构的虚线外框 —— */
      if (hi >= 0 && H.amp > .01 && !(hi === ai && H.i >= 0)) {
        const a = H.amp; c.lineWidth = 1;
        for (let j = 0; j < NP; j++) {
          const p = S.parts[j], q = S.parts[(j + 1) % NP], d = Math.hypot(q.x - p.x, q.y - p.y);
          if (j % 2 === 0 && d < 13) { c.strokeStyle = rgba(ink, a * (light ? .55 : .5) * (1 - d / 13 * .4)); c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(q.x, q.y); c.stroke(); }
          c.fillStyle = rgba(ink, a * (light ? .8 : .75)); c.fillRect(p.x - .75, p.y - .75, 1.5, 1.5);
        }
      }
      /* —— 键盘焦点：虚线切角框 + 外侧蓝色角标 —— */
      if (S.focus >= 0 && S.kbd) {
        const cc = G.cells[S.focus], poly = chamfer(cc.x0 + 1, cy - TH - 6, cc.x1 - 1, cy + TH + 6, 9, 2);
        c.save(); c.setLineDash([3, 3]); c.strokeStyle = rgba(ink, .9); c.lineWidth = 1; c.translate(.5, .5); pathPoly(c, poly); c.stroke(); c.restore();
      }
      /* —— 透镜 —— */
      const Ls = S.lens, pulse = S.pulse ? clamp((now - S.pulse.t0) / 520) : 1, pe = S.pulse ? Math.sin(Math.PI * pulse) : 0;
      const ex = 3 * pe, h = clamp(Ls.h, 0, 1.2), yb = cy + LH + ex * .6, yt = yb - Math.max(1.5, 2 * LH * h) - ex * 1.2;
      const L = Ls.L - ex, R = Ls.R + ex, mid = (L + R) / 2;
      const poly = chamfer(L, yt, R, yb, 10 * Math.min(1, h + .05), 3 * Math.min(1, h + .2));
      /* 透镜内部擦除轨道线并铺一层极淡的蓝 */
      c.save(); c.globalCompositeOperation = 'destination-out'; pathPoly(c, poly); c.fill(); c.restore();
      c.fillStyle = rgba(acc, (light ? .1 : .085) * clamp(h)); pathPoly(c, poly); c.fill();
      /* 掠过残影 */
      S.trail.forEach(t => { const k = 1 - (now - t.t0) / 520; c.fillStyle = rgba(acc, .8 * k * k); c.fillRect(Math.round(t.x), Math.round(cy + TH - 6), 1, 6 + 4 * k); });
      /* 外框：顶边中部留出锚点缺口 */
      const gap = h > .55 ? 9 : 0;
      c.save(); c.translate(.5, .5);
      if (!light) { c.strokeStyle = rgba(acc, .14); c.lineWidth = 4; pathPoly(c, poly); c.stroke(); }
      c.strokeStyle = rgba(acc, 1); c.lineWidth = h < .3 ? 2 : 1.25;
      c.beginPath();
      const pts = poly.slice(1).concat([poly[0]]);
      c.moveTo(Math.min(mid + gap, pts[0][0]), yt);
      pts.forEach(p => c.lineTo(p[0], p[1]));
      c.lineTo(Math.max(mid - gap, poly[0][0]), yt);
      c.stroke();
      if (h > .55) {
        const k = clamp((h - .55) / .4);
        c.fillStyle = rgba(acc, k); c.fillRect(Math.round(mid) - 2.5, Math.round(yt) - 2.5, 4, 4);
        /* 切角处的平行细线（双切口） */
        c.strokeStyle = rgba(acc, .7 * k); c.lineWidth = 1; c.beginPath();
        c.moveTo(L - 3, yt + 7); c.lineTo(L + 4, yt - 0); c.moveTo(R + 3, yb - 7); c.lineTo(R - 4, yb); c.stroke();
        /* 落针：从透镜底边连到顶栏底沿 */
        c.strokeStyle = rgba(acc, .75 * k); c.beginPath(); c.moveTo(Math.round(mid), yb + 1); c.lineTo(Math.round(mid), Math.min(G.H - 3, yb + 7)); c.stroke();
        c.fillStyle = rgba(acc, k); c.fillRect(Math.round(mid) - 1, Math.min(G.H - 3, yb + 7), 2, 2);
      }
      c.restore();
      /* 锁定瞬间：四角括号由外向内收拢 */
      if (S.fl) {
        const k = clamp((now - S.fl.t0) / 420), e = ease.out(k), d = 10 * (1 - e), a = 1 - k, s = 7;
        c.strokeStyle = rgba(acc, a); c.lineWidth = 1; c.save(); c.translate(.5, .5); c.beginPath();
        const x0 = L - 5 - d, x1 = R + 5 + d, y0 = yt - 5 - d, y1 = yb + 5 + d;
        c.moveTo(x0, y0 + s); c.lineTo(x0, y0); c.lineTo(x0 + s, y0); c.moveTo(x1 - s, y0); c.lineTo(x1, y0); c.lineTo(x1, y0 + s);
        c.moveTo(x1, y1 - s); c.lineTo(x1, y1); c.lineTo(x1 - s, y1); c.moveTo(x0 + s, y1); c.lineTo(x0, y1); c.lineTo(x0, y1 - s); c.stroke(); c.restore();
      }
      /* 文字扫描：一条蓝色竖线掠过新激活的文字 */
      if (S.scan) {
        const k = clamp((now - S.scan.t0) / 420), cc = G.cells[S.scan.i], x = lerp(cc.lx0 - 6, cc.lx1 + 6, ease.io(k));
        c.fillStyle = rgba(acc, Math.sin(Math.PI * k) * .9); c.fillRect(Math.round(x), cy - 11, 1, 22);
      }
      /* 悬停在当前项上：透镜内角刻度 */
      if (H.i === ai && H.amp > .01) {
        c.strokeStyle = rgba(acc, .8 * H.amp); c.lineWidth = 1; c.beginPath();
        c.moveTo(R - 7, yt + 4.5); c.lineTo(R - 4.5, yt + 4.5); c.lineTo(R - 4.5, yt + 7); c.moveTo(L + 7, yb - 4.5); c.lineTo(L + 4.5, yb - 4.5); c.lineTo(L + 4.5, yb - 7); c.stroke();
      }
    }
    function kick() { if (!S.raf && !S.destroyed) S.raf = requestAnimationFrame(frame); }

    /* ---------- 事件 ---------- */
    const offs = [];
    const on = (t, ev, fn, op) => { t.addEventListener(ev, fn, op); offs.push(() => t.removeEventListener(ev, fn, op)); };
    on(el, 'click', e => {
      const a = e.target.closest('a[data-nav]');
      if (a) {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;   /* 允许新标签打开 #hash 入口 */
        e.preventDefault(); const key = a.dataset.nav;
        if (S.menu) { closeMenu(true); }
        go(key, 'click'); return;
      }
      const lb = e.target.closest('button[data-lang]');
      if (lb) { api.setLang(lb.dataset.lang); return; }
      const tb = e.target.closest('button[data-theme]');
      if (tb) { api.setTheme(tb.dataset.theme); return; }
      if (e.target.closest('.nftn__theme')) { api.setTheme(resolvedTheme() === 'light' ? 'dark' : 'light'); return; }
      if (e.target.closest('.nftn__menu')) { S.menu ? closeMenu(true) : openMenu(); }
    });
    const cellAt = (x, y) => { if (!G) return -1; const lx = x - G.left, ly = y - G.top; if (ly < G.cy - LH - 6 || ly > G.cy + LH + 6) return -1; return G.cells.findIndex(c => lx >= c.x0 && lx <= c.x1); };
    on(E.primary, 'pointermove', e => {
      if (e.pointerType === 'touch' || !G) return;
      const i = cellAt(e.clientX, e.clientY), H = S.hover;
      H.x = e.clientX - G.left; H.y = e.clientY - G.top;
      if (i !== H.i) { if (H.i < 0 && i >= 0 && H.amp < .05) { H.sx = H.x; H.sy = H.y; } H.i = i; if (i >= 0) H.last = i; }
      kick();
    });
    on(E.primary, 'pointerleave', () => { S.hover.i = -1; S.press = -1; kick(); });
    on(E.primary, 'pointerdown', e => { S.kbd = false; S.press = cellAt(e.clientX, e.clientY); kick(); });
    on(global, 'pointerup', () => { if (S.press >= 0) { S.press = -1; kick(); } });
    on(global, 'pointerdown', () => { S.kbd = false; }, true);
    on(global, 'keydown', e => { if (e.key === 'Tab') S.kbd = true; }, true);
    on(E.list, 'focusin', e => { const a = e.target.closest('.nftn__item'); S.focus = a ? +a.dataset.i : -1; kick(); });
    on(E.list, 'focusout', () => { S.focus = -1; kick(); });
    on(E.list, 'keydown', e => {
      const i = E.items.indexOf(document.activeElement); if (i < 0) return;
      let j = -1;
      if (e.key === 'ArrowRight') j = (i + 1) % 4; else if (e.key === 'ArrowLeft') j = (i + 3) % 4; else if (e.key === 'Home') j = 0; else if (e.key === 'End') j = 3;
      if (j >= 0) { e.preventDefault(); S.kbd = true; E.items[j].focus(); }
    });
    on(E.brand, 'pointerenter', () => decode(E.word, 'NANFEILAOTOU', 0));
    on(E.brand, 'focus', () => decode(E.word, 'NANFEILAOTOU', 0));
    /* 菜单 */
    let lastFocus = null;
    function openMenu() {
      if (S.menu || !S.mobile) return;
      E.panel.inert = false; S.menu = true; lastFocus = document.activeElement; E.panel.hidden = false; void E.panel.offsetWidth;
      el.classList.add('is-menu'); E.menu.setAttribute('aria-expanded', 'true'); root.classList.add('nftn-lock'); updateMenuLabel();
      placeMenuLens(); syncSeg('lang', S.lang); syncSeg('theme', S.themePref);
      (E.mitems[KEYS.indexOf(S.visual)] || E.mitems[0]).focus({ preventScroll: true });
      o.onMenuToggle(true); S.palKey = ''; kick();
    }
    function closeMenu(restore) {
      if (!S.menu) return;
      E.panel.inert = true; S.menu = false; el.classList.remove('is-menu'); E.menu.setAttribute('aria-expanded', 'false'); root.classList.remove('nftn-lock'); updateMenuLabel();
      setTimeout(() => { if (!S.menu) E.panel.hidden = true; }, reduced() ? 0 : 260);
      if (restore) (S.mobile ? E.menu : lastFocus || E.menu).focus({ preventScroll: true });
      o.onMenuToggle(false); S.palKey = ''; kick();
    }
    on(el, 'keydown', e => {
      if (!S.menu) return;
      if (e.key === 'Escape') { e.preventDefault(); closeMenu(true); return; }
      if (e.key === 'Tab') {
        const f = [E.menu, ...E.panel.querySelectorAll('a,button')].filter(n => n.offsetParent !== null);
        const i = f.indexOf(document.activeElement);
        if (e.shiftKey && (i <= 0)) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
      }
    });
    const onMM = () => { measure(); if (!S.mobile && S.menu) closeMenu(false); };
    mm.addEventListener('change', onMM); offs.push(() => mm.removeEventListener('change', onMM));
    const onMQ = () => { if (S.themePref === 'system') { applyTheme(true); } };
    mq.addEventListener('change', onMQ); offs.push(() => mq.removeEventListener('change', onMQ));
    const ro = new ResizeObserver(() => measure()); ro.observe(el); ro.observe(E.list);
    on(global, 'resize', () => measure());
    /* 缩放（devicePixelRatio 变化）也要重建画布分辨率 */
    let dprMQ = null; const watchDpr = () => { if (dprMQ) dprMQ.removeEventListener('change', onDpr); dprMQ = matchMedia(`(resolution: ${global.devicePixelRatio || 1}dppx)`); dprMQ.addEventListener('change', onDpr); };
    const onDpr = () => { measure(); watchDpr(); }; watchDpr(); offs.push(() => dprMQ && dprMQ.removeEventListener('change', onDpr));
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { S.dirty = true; measure(); });

    /* ---------- API ---------- */
    const api = {
      el, shutter: sh,
      setScene(sc) {
        if (!sc) return;
        if (sc.kind && sc.kind !== S.sceneKind) { S.sceneKind = sc.kind; el.setAttribute('data-scene', sc.kind); root.setAttribute('data-nf-scene', sc.kind); kick(); }
        if (typeof sc.tone === 'number' && Math.abs(sc.tone - S.sceneTone) > .0005) { S.sceneTone = clamp(sc.tone); kick(); }
      },
      setActive(key) {
        if (!KEYS.includes(key)) return;
        S.active = key;
        if (!S.lock) setVisual(key, false);
      },
      go,
      // Host interruptions (wheel, history or another navigation surface).
      cancel() { S.shutter.ph = 'idle'; S.shutter.a = S.shutter.b = 0; S.lock = null; sh.style.visibility = 'hidden'; setVisual(S.active, false); kick(); },
      setLang(L) {
        if (!I.LANGS.includes(L) || L === S.lang) return;
        S.lang = L; if (o.persist) store.set('nf.lang', L);
        applyLang(true);
        const r = o.onLangChange(L) || {};
        if (L === 'en' && r.fallbacks > 0) toast(tr('lang.partial'), 4200);
      },
      setTheme(pref) {
        if (!['light', 'dark', 'system'].includes(pref)) return;
        S.themePref = pref; if (o.persist) store.set('nf.theme', pref);
        applyTheme(true);
        if (S.sceneKind === 'art' && !S.menu) toast(tr('theme.artNote'), 3800);
      },
      openMenu, closeMenu, toast, measure,
      get state() {
        return { active: S.active, visual: S.visual, lock: S.lock, sceneTone: S.sceneTone, sceneKind: S.sceneKind, tone: S.tone, ink: S.m,
          theme: resolvedTheme(), themePref: S.themePref, lang: S.lang, menu: S.menu, mobile: S.mobile,
          lens: { L: S.lens.L, R: S.lens.R, h: S.lens.h }, hover: S.hover.i, geo: G && { left: G.left, top: G.top, cells: G.cells.map(c => [Math.round(c.x0), Math.round(c.x1)]) }, shutter: { ph: S.shutter.ph, a: S.shutter.a, b: S.shutter.b, key: S.shutter.key } };
      },
      /* 仅供截图 / 测试：冻结内部时钟，按毫秒步进得到确定的中间帧 */
      debug: { pause() { S.dbgT = performance.now(); S.paused = true; cancelAnimationFrame(S.raf); S.raf = 0; S.last = S.dbgT; kick = () => { }; },
        step(ms) { const n = Math.max(1, Math.round(ms / 16.667)); for (let i = 0; i < n; i++) { S.dbgT += ms / n; frameAt(S.dbgT); } } },
      destroy() { S.destroyed = true; cancelAnimationFrame(S.raf); ro.disconnect(); offs.forEach(f => f()); root.classList.remove('nftn-lock'); el.remove(); sh.remove(); }
    };
    /* debug 步进时 performance.now 由 S.dbgT 代替 */
    function frameAt(t) { S.raf = 0; frame(t); S.raf = 0; }
    applyLang(false); applyTheme(false); markActive(S.visual);
    measure(); kick();
    return api;
  }
  global.NFTopNav = { mount, ITEMS, PAL, chamfer };
})(window);
