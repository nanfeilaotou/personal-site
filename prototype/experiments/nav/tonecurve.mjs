import { chromium } from 'playwright';
import sharp from 'sharp';
const browser = await chromium.launch({ executablePath: '/usr/local/bin/chromium', args: ['--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox','--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('http://127.0.0.1:4180/main/index.html?debug&it=10', { waitUntil: 'load' });
await page.waitForTimeout(2500);
const gs = []; for (let g = 1.796; g <= 1.8301; g += .003) gs.push(+g.toFixed(3)); for (let g = 4.646; g <= 4.6801; g += .003) gs.push(+g.toFixed(3));
const out = [];
for (const g of gs) {
  const s = await page.evaluate(g => { const C = NF_TIMELINE; return C.fromScene(C.globalWorld.sceneStart + g); }, g);
  await page.evaluate(s => NF_DEBUG.seek(s), s);
  await page.waitForTimeout(260);
  await page.evaluate(s => NF_DEBUG.seek(s), s);
  await page.waitForTimeout(60);
  const buf = await page.screenshot({ clip: { x: 0, y: 0, width: 1440, height: 64 } });
  const { data, info } = await sharp(buf).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  let sum = 0, n = 0, rows = [0, 0, 0, 0];
  for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x += 4) { const i = (y * info.width + x) * 3; const l = (data[i] * .2126 + data[i + 1] * .7152 + data[i + 2] * .0722) / 255; sum += l; n++; rows[Math.min(3, (y / 16) | 0)] += l / (info.width / 4) / 16; }
  const st = await page.evaluate(() => ({ g: NF_DEBUG.state.global.g, white: document.body.classList.contains('on-white'), bg: document.body.style.background }));
  out.push([g, +(sum / n).toFixed(3), rows.map(r => +r.toFixed(2)).join('/'), st.white, st.bg]);
}
console.log(out.map(r => r.join(' ')).join('\n'));
await browser.close();
