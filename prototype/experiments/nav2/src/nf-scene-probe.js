/* NFSceneProbe — 读取「顶栏下方真实画面」的亮度（像素采样，不依赖任何背景 class）。
 * 把若干画布 / 元素按 z 序合成到一张 96×6 的小画布上，统计亮像素占比：
 *   tone = Σ smoothstep(.35,.65,L) / N   （0 = 黑场，1 = 完全被暖白覆盖；翻面扫过时连续变化）
 * 稀疏亮粒子（Opening / AI 点阵）占比极低，不会误判为白场。
 *
 * create({
 *   layers: () => [el, ...]      // 自下而上：<canvas>/<img>/<video> 用 drawImage；其它元素填充其 computed background-color
 *   rect:   () => ({x,y,w,h})   // 采样区域（视口坐标；默认顶栏矩形由调用方给）
 *   offset: () => ({x,y})       // 图层所在文档相对当前视口的偏移（同源 iframe 时用），默认 0
 *   base:   '#000'              // 最底色
 * }) → { sample() → {tone, mean, ok} }
 * WebGL 画布：Chrome 在合成后仍可 drawImage；若读到全透明（部分浏览器），该层视为不可读、按底色处理。
 * 集成建议：首页可直接在各自的 render() 里上报 tone（更省），本探针作为通用兜底与校验工具。 */
(function (global) {
  'use strict';
  function effOpacity(el) {
    let a = 1;
    for (let e = el; e && e.nodeType === 1; e = e.parentElement) {
      const cs = e.ownerDocument.defaultView.getComputedStyle(e);
      if (cs.display === 'none' || cs.visibility === 'hidden') return 0;
      a *= parseFloat(cs.opacity); if (a <= .001) return 0;
    }
    return a;
  }
  function create(o) {
    const COLS = o.cols || 96, ROWS = o.rows || 6, off = document.createElement('canvas');
    off.width = COLS; off.height = ROWS;
    const c = off.getContext('2d', { willReadFrequently: true });
    function sample() {
      const r = o.rect(), of = o.offset ? o.offset() : { x: 0, y: 0 };
      c.globalAlpha = 1; c.fillStyle = o.base || '#000'; c.fillRect(0, 0, COLS, ROWS);
      let ok = false;
      for (const el of o.layers()) {
        if (!el) continue;
        const a = effOpacity(el); if (a <= 0) continue;
        const b = el.getBoundingClientRect(); if (b.width < 1 || b.height < 1) continue;
        const bx = b.left + of.x, by = b.top + of.y;
        c.globalAlpha = a;
        if (el.tagName === 'CANVAS' || el.tagName === 'IMG' || el.tagName === 'VIDEO') {
          const sw = el.width || el.naturalWidth || el.videoWidth, sh = el.height || el.naturalHeight || el.videoHeight; if (!sw || !sh) continue;
          const kx = sw / b.width, ky = sh / b.height;
          /* 只取与采样矩形相交的部分，并按比例放到目标位置 */
          const ix0 = Math.max(r.x, bx), iy0 = Math.max(r.y, by), ix1 = Math.min(r.x + r.w, bx + b.width), iy1 = Math.min(r.y + r.h, by + b.height);
          if (ix1 <= ix0 || iy1 <= iy0) continue;
          try {
            c.drawImage(el, (ix0 - bx) * kx, (iy0 - by) * ky, (ix1 - ix0) * kx, (iy1 - iy0) * ky,
              (ix0 - r.x) / r.w * COLS, (iy0 - r.y) / r.h * ROWS, (ix1 - ix0) / r.w * COLS, (iy1 - iy0) / r.h * ROWS);
            ok = true;
          } catch (e) { /* 跨源或不可读：跳过 */ }
        } else {
          const bg = el.ownerDocument.defaultView.getComputedStyle(el).backgroundColor;
          if (!bg || bg === 'transparent' || /rgba\(.*,\s*0\)$/.test(bg)) continue;
          c.fillStyle = bg;
          const ix0 = Math.max(r.x, bx), iy0 = Math.max(r.y, by), ix1 = Math.min(r.x + r.w, bx + b.width), iy1 = Math.min(r.y + r.h, by + b.height);
          if (ix1 > ix0 && iy1 > iy0) c.fillRect((ix0 - r.x) / r.w * COLS, (iy0 - r.y) / r.h * ROWS, (ix1 - ix0) / r.w * COLS, (iy1 - iy0) / r.h * ROWS);
        }
      }
      const d = c.getImageData(0, 0, COLS, ROWS).data, N = COLS * ROWS;
      let bright = 0, sum = 0;
      for (let i = 0; i < d.length; i += 4) {
        const L = (.2126 * d[i] + .7152 * d[i + 1] + .0722 * d[i + 2]) / 255; sum += L;
        const t = Math.max(0, Math.min(1, (L - .35) / .3)); bright += t * t * (3 - 2 * t);
      }
      return { tone: bright / N, mean: sum / N, ok };
    }
    return { sample };
  }
  global.NFSceneProbe = { create };
})(window);
