// 用法: node nav2/shoot.mjs  —— 读取 JOBS(JSON) 环境变量 或 默认任务
import { chromium } from 'playwright';
const BASE = process.env.BASE || "http://127.0.0.1:4201/prototype/experiments/nav2/lab/index.html";
const jobs = JSON.parse(process.env.JOBS || '[]');
const browser = await chromium.launch({ executablePath: process.env.CHROME || 'C:/Users/28919/AppData/Local/ms-playwright/chromium-1243/chrome-win64/chrome.exe' });
const errors = [];
for (const j of jobs) {
  const ctx = await browser.newContext({ viewport: { width: j.w || 1440, height: j.h || 900 }, deviceScaleFactor: j.dpr || 1, colorScheme: j.cs || 'dark', hasTouch: !!j.touch, isMobile: !!j.mobile, reducedMotion: j.rm ? 'reduce' : 'no-preference' });
  const page = await ctx.newPage();
  page.on('console', m => { if (m.type() === 'error') errors.push(j.out + ': ' + m.text()); });
  page.on('response', r => { if (r.status() >= 400) errors.push(j.out + ': HTTP ' + r.status() + ' ' + r.url()); });
  page.on('pageerror', e => errors.push(j.out + ': ' + e.message));
  await page.goto((j.base || BASE) + (j.q || ''), { waitUntil: 'load' });
  await page.waitForTimeout(j.wait ?? 700);
  for (const a of j.acts || []) {
    if (a.js) await page.evaluate(a.js);
    if (a.hover) await page.hover(a.hover);
    if (a.move) await page.mouse.move(a.move[0], a.move[1], { steps: a.steps || 1 });
    if (a.click) await page.click(a.click);
    if (a.key) await page.keyboard.press(a.key);
    if (a.wait) await page.waitForTimeout(a.wait);
    if (a.shot) await page.screenshot({ path: '/data/nav2/shots/' + a.shot + '.png', clip: a.clip });
  }
  if (j.out) await page.screenshot({ path: '/data/nav2/shots/' + j.out + '.png', clip: j.clip });
  if (j.eval) console.log(j.out || '', JSON.stringify(await page.evaluate(j.eval)));
  await ctx.close();
}
await browser.close();
console.log(errors.length ? 'ERRORS:\n' + [...new Set(errors)].slice(0,30).join('\n') : 'no console errors');
