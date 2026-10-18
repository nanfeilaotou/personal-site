import { chromium } from 'playwright';
const browser = await chromium.launch({ executablePath: '/usr/local/bin/chromium', args: ['--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox'] });
const scheme = process.argv[2] || 'a', at = process.argv[3] || '0', target = process.argv[4] || 'personal', tag = process.argv[5] || scheme;
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
await page.goto(`http://127.0.0.1:4180/nav/lab/index.html?scheme=${scheme}&nodock&still&noscroll&at=${at}`); await page.waitForTimeout(700);
await page.evaluate(() => LAB.nav.debug.pause());
await page.click(`.nfnav__item[data-nav=${target}]`, { position: { x: 4, y: 4 } });
await page.mouse.move(700, 600);
const frames = [0, 60, 120, 180, 260, 360, 520, 900]; let t = 0; const H = scheme === 'a' ? 64 : 72;
for (const f of frames) {
  while (t < f) { await page.evaluate(() => LAB.nav.debug.step(1000 / 60)); t += 1000 / 60; }
  await page.screenshot({ path: `/data/nav/shots/seq-${tag}-${f}.png`, clip: { x: 380, y: 0, width: 680, height: H } });
}
await browser.close();
