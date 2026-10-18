// LENS 顶部导航 —— 真实首页叠加（onsite）与实验页（lab）的交互回归测试
// 用法：node nav2/test.mjs   （需先运行 python3 nav2/serve.py）
import { chromium } from 'playwright';
const ON = 'http://127.0.0.1:4201/prototype/experiments/nav2/onsite/index.html', LABU = 'http://127.0.0.1:4201/prototype/experiments/nav2/lab/index.html';
const browser = await chromium.launch({ executablePath: process.env.CHROME || 'C:/Users/28919/AppData/Local/ms-playwright/chromium-1243/chrome-win64/chrome.exe' });
let pass = 0, fail = 0; const errs = [];
const ok = (name, cond, info) => { cond ? pass++ : fail++; console.log((cond ? 'PASS ' : 'FAIL ') + name + (info !== undefined ? '  ' + JSON.stringify(info) : '')); };
async function open(url, o = {}) {
  const ctx = await browser.newContext({ viewport: { width: o.w || 1440, height: o.h || 900 }, colorScheme: o.cs || 'dark', reducedMotion: o.rm ? 'reduce' : 'no-preference', hasTouch: !!o.touch, isMobile: !!o.mobile, deviceScaleFactor: o.dpr || 1 });
  const page = await ctx.newPage();
  page.on('pageerror', e => errs.push(url + ' ' + e.message)); page.on('console', m => { if (m.type() === 'error') errs.push(url + ' ' + m.text()); });
  await page.goto(url, { waitUntil: 'load' }); await page.waitForTimeout(o.wait || 5000);
  if (url.startsWith(ON)) await page.evaluate(() => { const w = document.getElementById('site').contentWindow, s0 = w.NF_DEBUG.seek; window.SEEKS = []; w.NF_DEBUG.seek = s => { window.SEEKS.push(+s.toFixed(3)); return s0(s); }; });
  return { ctx, page };
}
const st = p => p.evaluate(() => ({ ...NAV.state, sync: window.SYNC, seeks: window.SEEKS, hash: location.hash }));
const near = (a, b, e = .02) => Math.abs(a - b) < e;

/* ---------- onsite 桌面 ---------- */
{
  const { ctx, page } = await open(ON + '?it&clean&nopersist');
  let s = await st(page); ok('onsite 初始：开场 / art / 黑场', s.active === 'open' && s.sceneKind === 'art' && s.tone < .05, { a: s.active, k: s.sceneKind, t: s.tone });
  await page.click('.nftn__item[data-nav=global]'); await page.waitForTimeout(1600); s = await st(page);
  ok('点击「全球」→ 号码稳定画面 s=8.92，一次瞬时定位', near(s.sync.s, 8.92) && s.visual === 'global' && s.seeks.length === 1 && s.hash === '#global', { s: s.sync.s, seeks: s.seeks, hash: s.hash });
  ok('跳转结束后解锁、光闸 idle', s.lock === null && s.shutter.ph === 'idle');
  /* 连续快速点击：AI → 全球 → 个人（120ms 内） */
  await page.evaluate(() => { window.SEEKS.length = 0; window.PH = []; const f = () => { const p = NAV.state.shutter.ph; if (window.PH[window.PH.length - 1] !== p) window.PH.push(p); if (window.PH.length < 40) requestAnimationFrame(f); }; f(); });
  await page.evaluate(() => { const c = k => document.querySelector(`.nftn__item[data-nav=${k}]`).click(); c('ai'); setTimeout(() => c('open'), 60); setTimeout(() => c('personal'), 120); });
  await page.waitForTimeout(2000); s = await st(page);
  const ph = await page.evaluate(() => window.PH);
  ok('连续快速点击：只按最后目标定位一次（个人 14.7）', near(s.sync.s, 14.7) && s.seeks.length === 1 && s.visual === 'personal' && s.active === 'personal', { s: s.sync.s, seeks: s.seeks, ph });
  /* 揭开途中再点：重新覆盖并改到新目标 */
  await page.evaluate(() => { window.SEEKS.length = 0; });
  await page.click('.nftn__item[data-nav=open]');
  await page.waitForFunction(() => NAV.state.shutter.ph === 'reveal', null, { timeout: 3000 }).catch(() => { });
  await page.waitForTimeout(80);
  await page.click('.nftn__item[data-nav=ai]'); await page.waitForTimeout(1800); s = await st(page);
  ok('揭开途中改点 AI：先到首页再到模型生态，最终 s=3.42', near(s.sync.s, 3.4198) && s.visual === 'ai' && s.seeks.length === 2, { s: s.sync.s, seeks: s.seeks });
  /* 反向 */
  await page.click('.nftn__item[data-nav=open]'); await page.waitForTimeout(1600); s = await st(page);
  ok('反向跳回首页：s=0、kind=art', near(s.sync.s, 0) && s.sceneKind === 'art' && s.visual === 'open', { s: s.sync.s });
  /* 已在当前项再次点击：只脉冲 */
  await page.evaluate(() => { window.SEEKS.length = 0; });
  await page.click('.nftn__item[data-nav=open]'); await page.waitForTimeout(500); s = await st(page);
  ok('已在首页再点「首页」：不跳转、不出光闸', s.seeks.length === 0 && s.shutter.ph === 'idle');
  /* 浏览器后退 */
  await page.goBack(); await page.waitForTimeout(1600); s = await st(page);
  ok('后退（popstate）→ 回到上一入口 AI', s.visual === 'ai' && near(s.sync.s, 3.4198), { s: s.sync.s, hash: s.hash });
  /* 鼠标中途离开 */
  await page.hover('.nftn__item[data-nav=personal]'); await page.mouse.down(); await page.mouse.up();
  await page.mouse.move(700, 600, { steps: 3 }); await page.waitForTimeout(1600); s = await st(page);
  ok('点击后鼠标立即离开：照常完成到「个人」', s.visual === 'personal' && near(s.sync.s, 14.7) && s.hover === -1, { s: s.sync.s });
  /* 用户滚动同步（不经导航） */
  await page.evaluate(() => document.getElementById('site').contentWindow.NF_DEBUG.seek(10.5)); await page.waitForTimeout(1200); s = await st(page);
  ok('滚动同步：Global 暖白段 → 全球 + 顶栏转浅色（ink=1）', s.active === 'global' && s.visual === 'global' && s.ink > .95 && s.tone > .95, { tone: s.tone, ink: s.ink });
  /* 键盘 */
  await page.evaluate(() => document.querySelector('.nftn__item[data-nav=open]').focus());
  await page.keyboard.press('ArrowRight'); await page.keyboard.press('ArrowRight'); await page.keyboard.press('ArrowRight');
  const foc = await page.evaluate(() => document.activeElement.dataset.nav);
  await page.keyboard.press('Enter'); await page.waitForTimeout(1600); s = await st(page);
  ok('键盘：方向键移焦到「个人」，Enter 跳转', foc === 'personal' && s.visual === 'personal' && near(s.sync.s, 14.7), { foc, s: s.sync.s });
  /* 语言 */
  await page.click('.nftn__lopt[data-lang=en]'); await page.waitForTimeout(900);
  const en = await page.evaluate(() => ({ labels: [...document.querySelectorAll('.nftn__item .nftn__label')].map(e => e.textContent), lang: document.documentElement.lang, toast: document.querySelector('.nftn__toast').classList.contains('is-on'), s: window.SYNC.s }));
  ok('EN：标签替换、html lang=en、回退轻提示、位置不变', en.labels.join() === 'Home,AI,Global,Personal' && en.lang === 'en' && en.toast && near(en.s, 14.7), en);
  await page.click('.nftn__lopt[data-lang=zh]'); await page.waitForTimeout(900);
  /* 主题：与场景适配独立 */
  const before = (await st(page)).tone;
  await page.click('.nftn__theme'); await page.waitForTimeout(500); s = await st(page);
  ok('主题切换：data-nf-theme=light，顶栏场景 tone 不受影响', s.theme === 'light' && Math.abs(s.tone - before) < .02 && (await page.evaluate(() => document.documentElement.dataset.nfTheme)) === 'light', { before, after: s.tone });
  /* Resize */
  await page.setViewportSize({ width: 1100, height: 760 }); await page.waitForTimeout(800); s = await st(page);
  const cell = s.geo.cells[3];
  ok('Resize 1100×760：透镜对齐当前单元', Math.abs(s.lens.L - (cell[0] - 2)) < 1.5 && Math.abs(s.lens.R - (cell[1] + 2)) < 1.5, { lens: s.lens, cell });
  await ctx.close();
}
/* ---------- Hash 入口 ---------- */
{
  const { ctx, page } = await open(ON + '?it&clean&nopersist#personal');
  const s = await st(page);
  ok('Hash 入口 #personal：直接停在个人，透镜无入场动画', near(s.sync.s, 14.7) && s.visual === 'personal' && s.lens.h > .99 && Math.abs(s.lens.L - (s.geo.cells[3][0] - 2)) < 1, { s: s.sync.s, lens: s.lens });
  await page.reload({ waitUntil: 'load' }); await page.waitForTimeout(5000);
  const s2 = await page.evaluate(() => ({ s: window.SYNC.s, v: NAV.state.visual }));
  ok('刷新后保持在个人', near(s2.s, 14.7) && s2.v === 'personal', s2);
  await ctx.close();
}
/* ---------- 减少动态效果 ---------- */
{
  const { ctx, page } = await open(ON + '?it&clean&nopersist', { rm: true });
  await page.evaluate(() => { window.PH = []; window.T0 = performance.now(); const f = () => { const p = NAV.state.shutter.ph; if (window.PH[window.PH.length - 1]?.[0] !== p) window.PH.push([p, Math.round(performance.now() - window.T0)]); requestAnimationFrame(f); }; f(); });
  await page.click('.nftn__item[data-nav=global]'); await page.waitForTimeout(1200);
  const s = await st(page), ph = await page.evaluate(() => window.PH);
  ok('减少动态：淡入淡出完成跳转、透镜直接到位', near(s.sync.s, 8.92) && s.lens.h === 1 && s.shutter.ph === 'idle', { ph });
  await ctx.close();
}
/* ---------- 手机 ---------- */
{
  const { ctx, page } = await open(ON + '?it&clean&nopersist', { w: 390, h: 844, touch: true, mobile: true, dpr: 2 });
  let s = await st(page);
  ok('手机 390：紧凑品牌栏', s.mobile === true && (await page.evaluate(() => getComputedStyle(document.querySelector('.nftn__primary')).display)) === 'none');
  await page.tap('.nftn__menu'); await page.waitForTimeout(600);
  const m = await page.evaluate(() => ({ open: NAV.state.menu, focus: document.activeElement.className, exp: document.querySelector('.nftn__menu').getAttribute('aria-expanded'), inert: document.getElementById('site').inert }));
  ok('菜单打开：焦点进入面板、aria-expanded、背景 inert', m.open && /nftn__mitem/.test(m.focus) && m.exp === 'true' && m.inert, m);
  await page.keyboard.press('Escape'); await page.waitForTimeout(400);
  ok('Esc 关闭菜单并归还焦点', !(await page.evaluate(() => NAV.state.menu)) && (await page.evaluate(() => document.activeElement.classList.contains('nftn__menu'))));
  await page.tap('.nftn__menu'); await page.waitForTimeout(500);
  await page.tap('.nftn__mitem[data-nav=global]'); await page.waitForTimeout(1700); s = await st(page);
  ok('菜单内选择「全球」：关闭菜单并跳转', !s.menu && s.visual === 'global' && near(s.sync.s, 8.92), { s: s.sync.s });
  await ctx.close();
}
/* ---------- lab ---------- */
{
  const { ctx, page } = await open(LABU + '?nodock&nopersist', { wait: 1500 });
  await page.click('.nftn__item[data-nav=personal]'); await page.waitForTimeout(1500);
  let s = await page.evaluate(() => ({ ...LAB.nav.state, u: LAB.last.u, stop: LAB.stopY('personal') / innerHeight }));
  ok('lab：点击「个人」瞬时到停点', s.visual === 'personal' && near(s.u, s.stop, .01), { u: s.u });
  await page.evaluate(() => scrollTo(0, LAB.sec.page.a * innerHeight + 900)); await page.waitForTimeout(500);
  await page.click('.nftn__lopt[data-lang=en]'); await page.waitForTimeout(900);
  const r = await page.evaluate(() => ({ log: LAB.log[0], fb: document.querySelectorAll('[data-i18n-fallback]').length, badge: getComputedStyle(document.querySelector('[data-i18n-fallback]'), '::after').content, kind: LAB.nav.state.sceneKind }));
  ok('lab：内容页切 EN 保持阅读锚点、回退元素无视觉角标', /锚点保持/.test(r.log) && r.fb === 2 && (r.badge === 'none' || r.badge === 'normal') && r.kind === 'page', r);
  await page.click('.nftn__theme'); await page.waitForTimeout(700);
  s = await page.evaluate(() => LAB.nav.state);
  ok('lab：内容页上顶栏跟随主题（浅色 → ink=1）', s.theme === 'light' && s.ink > .95, { ink: s.ink });
  await ctx.close();
}
console.log(`\n${pass} passed, ${fail} failed`);
console.log(errs.length ? 'ERRORS:\n' + [...new Set(errs)].slice(0, 20).join('\n') : 'no console errors');
await browser.close();
