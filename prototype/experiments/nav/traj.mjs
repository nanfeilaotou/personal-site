import { chromium } from 'playwright';
const browser = await chromium.launch({ executablePath: '/usr/local/bin/chromium', args: ['--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox'] });
for (const scheme of ['a','b']) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`http://127.0.0.1:4180/nav/lab/index.html?scheme=${scheme}&nodock&still&noscroll&at=0`); await page.waitForTimeout(600);
  const res = await page.evaluate(() => new Promise(done => {
    const out = []; const t0 = performance.now();
    document.querySelector('.nfnav__item[data-nav=personal]').click();
    (function f() { const s = LAB.nav.state; out.push([Math.round(performance.now() - t0), +s.indicator[0].toFixed(1), +s.indicator[1].toFixed(1), s.visual, s.lock, s.active]); if (performance.now() - t0 < 2200) requestAnimationFrame(f); else done(out); })();
  }));
  const tgtR = res[res.length - 1][2], tgtL = res[res.length - 1][1];
  const overL = Math.max(...res.map(r => r[1])) - tgtL, overR = Math.max(...res.map(r => r[2])) - tgtR;
  const pick = res.filter((r, i) => i % 3 === 0).slice(0, 16).map(r => r.slice(0,3).join(',')).join(' | ');
  const visuals = [...new Set(res.map(r => r[3]))];
  console.log(scheme, 'overshootL', overL.toFixed(2), 'overshootR', overR.toFixed(2), 'visual seq', visuals.join('>'), 'final active', res.at(-1)[5], 'lock', res.at(-1)[4]);
  console.log(pick);
  await page.close();
}
await browser.close();
