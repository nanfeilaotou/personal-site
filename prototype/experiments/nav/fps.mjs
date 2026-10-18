import { chromium } from 'playwright';
const browser = await chromium.launch({ executablePath: '/usr/local/bin/chromium', args: ['--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
for (const q of ['still&at=0','at=0','still&at=5.6','still&at=8.4']) {
  await page.goto(`http://127.0.0.1:4180/nav/lab/index.html?scheme=a&nodock&${q}`); await page.waitForTimeout(500);
  const n = await page.evaluate(() => new Promise(d => { let n = 0; const t0 = performance.now(); (function f() { n++; performance.now() - t0 < 1000 ? requestAnimationFrame(f) : d(n); })(); }));
  const m = await page.evaluate(() => new Promise(d => { let n = 0; const t0 = performance.now(); (function f() { n++; scrollBy(0, 3); performance.now() - t0 < 1000 ? requestAnimationFrame(f) : d(n); })(); }));
  console.log(q, 'idle fps', n, 'scrolling fps', m);
}
await browser.close();
