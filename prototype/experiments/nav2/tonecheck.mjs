// 校验像素探针：在真实首页的多个位置比较 探针 tone 与 截图顶栏区域（68px）实测亮像素占比
import { chromium } from 'playwright';
const browser = await chromium.launch({ executablePath: process.env.CHROME || 'C:/Users/28919/AppData/Local/ms-playwright/chromium-1243/chrome-win64/chrome.exe' });
const W = +(process.env.W || 1440), H = +(process.env.H || 900);
const ctx = await browser.newContext({ viewport: { width: W, height: H }, colorScheme: 'dark' });
const page = await ctx.newPage(); const errs = [];
page.on('pageerror', e => errs.push(e.message)); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await page.goto('http://127.0.0.1:4201/prototype/experiments/nav2/onsite/index.html?it&clean&nopersist', { waitUntil: 'load' });
await page.waitForTimeout(5000);
const S = JSON.parse(process.env.S || '[0,3.42,8.92,9.2,9.4,9.6,10,11,12,13,14.7]');
const sharp = (await import('sharp')).default;
for (const s of S) {
  await page.evaluate(s => { document.getElementById('site').contentWindow.NF_DEBUG.seek(s); }, s);
  await page.waitForTimeout(+(process.env.WAIT || 900));
  const r = await page.evaluate(() => ({ ...window.SYNC, nt: NAV.state.tone }));
  /* 截图时隐藏导航本身，测量的是「顶栏下方的画面」 */
  await page.evaluate(() => { NAV.el.style.visibility = 'hidden'; });
  const buf = await page.screenshot({ clip: { x: 0, y: 0, width: W, height: 68 } });
  await page.evaluate(() => { NAV.el.style.visibility = ''; });
  const { data, info } = await sharp(buf).raw().toBuffer({ resolveWithObject: true });
  let b = 0, n = 0, sum = 0;
  for (let i = 0; i < data.length; i += info.channels) { const L = (.2126 * data[i] + .7152 * data[i + 1] + .0722 * data[i + 2]) / 255; sum += L; const t = Math.max(0, Math.min(1, (L - .35) / .3)); b += t * t * (3 - 2 * t); n++; }
  console.log(`s=${s.toFixed(3)} g=${r.g == null ? '-' : (+r.g).toFixed(3)} key=${r.key} kind=${r.kind} probe=${r.tone.toFixed(3)} mean=${r.mean.toFixed(3)} | shot=${(b / n).toFixed(3)} mean=${(sum / n).toFixed(3)} | nav=${r.nt.toFixed(2)}`);
}
console.log(errs.length ? 'ERR ' + errs.slice(0, 5).join('\n') : 'no errors');
await browser.close();
