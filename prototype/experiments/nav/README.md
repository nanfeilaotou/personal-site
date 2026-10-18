# NANFEILAOTOU 全站顶部导航 · 可运行原型（v0.1 实验）

> 独立实验目录，**未修改 main 的任何文件**（首页、Shader、时间轴、Global 动画、Personal 内容均未动）。

## 1. 运行

```bash
# 方式一（本沙盒 / 独立目录）：站点根目录 = main 仓库，/nav/ 映射到本目录
python3 nav/serve.py --site ../main --port 4180
#   实验页（两方案可切换）  http://127.0.0.1:4180/nav/lab/index.html
#   叠加真实首页            http://127.0.0.1:4180/nav/onsite/index.html?scheme=a

# 方式二（放进仓库，如 prototype/experiments/nav/）：仓库根目录直接
python3 -m http.server 4180
```

实验页 URL 参数：`scheme=a|b` · `theme=light|dark|system` · `lang=zh|en` · `at=<vh 单位滚动位置>` · `nodock`（隐藏控制台）· `still`（静止绘制）· `noscroll` · `embed`。
右下角控制台可切换方案 / 主题 / 语言 / 跳转章节 / 手机 390×844 预览，并显示实时读数（tone、kind、active、progress）。

叠加页参数：`scheme`、`lang`、`theme`、`at`（main 的滚动位置）、`it`（跳过 intro）、`clean`（隐藏角标）。
叠加页通过同源 iframe 加载 `/index.html?debug`，只读 `NF_DEBUG.state` + `NF_TIMELINE` 同步，点击调 `NF_DEBUG.navigate()`；旧 `#hTL/#hTR` 仅在预览中用注入样式隐藏。

## 2. 文件

| 文件 | 作用 |
|---|---|
| `src/nf-nav.js` | 导航组件 `NFNav.mount(opts)`，两方案共用逻辑（弹簧标识、场景 tone、主题/语言、移动菜单、键盘） |
| `src/nf-nav.css` | 共享骨架 + 方案 A `.nfnav--a` + 方案 B `.nfnav--b` + 移动端 / reduced-motion / forced-colors |
| `src/nf-i18n.js` | `NFI18n`：字典、`t()`、`extend()`、`apply()`，英文缺失回退中文并标「ZH」 |
| `lab/` | 模拟宿主（开场点阵、AI 环、Global 黑→翻面暖白→下潜、Personal 线场、可主题化内容页） |
| `onsite/` | 叠加真实 main 首页的预览 |
| `serve.py` | 本地服务器 |
| `shoot.mjs / seq.mjs / traj.mjs / fps.mjs` | 截图、逐帧序列、标识轨迹/过冲、帧率测试（Playwright） |
| `shots/` | 运行截图 |

## 3. 两个方案

| | A · 刻度 Gauge（推荐） | B · 舱窗 Module |
|---|---|---|
| 结构 | 全宽 60px 轻表面（blur 14），底边一条精密刻度尺 | 三块 44px 发丝框模块悬浮，外侧裁切标记，无整条底板 |
| 选中标识 | 卡尺：两端竖刻度 + 2px #5AA9FF 条 + 进度小方点，左右边临界阻尼弹簧横移 | 取景框角标 + 顶边进度条，弹簧横移；读数单元 `02/03 038%` |
| 悬停 | 刻度尺局部高斯抬升 + 蓝光点 + 局部扫描 | 高亮框弹簧跟随 + 竖向扫描线 |
| 键盘聚焦 | 蓝色角括号 | 虚线聚焦框 |
| 语言 / 主题 | 中｜EN 滑动下划线；36px 方框太阳/月亮 | 拨动式语言；圆形刻度旋钮 |
| 移动端 | 全宽下拉板，72px 行，右侧卡尺标记 | 浮动面板，2×2 舱格 |
| 适合 | 长期全站导航：信息密度低、对各场景干扰最小、内容页同样成立 | 更「仪器感」，适合首页叙事；内容页略重 |

**推荐 A**：整条表面让黑场/暖白场切换最稳定（翻面时只有一条表面在变），刻度尺能承载悬停/进度而不增加元素；B 作为备选或首页特别版。

## 4. Codex 集成交接

### 4.1 DOM 与样式
组件自建 DOM，宿主只需：
```html
<link rel="stylesheet" href="/prototype/nav/nf-nav.css">
<script src="/prototype/nav/nf-i18n.js"></script>
<script src="/prototype/nav/nf-nav.js"></script>
<script>
const nav = NFNav.mount({ scheme:'a', onNavigate:(key,{already})=>navigate(MAP[key]) });
</script>
```
生成：`<header class="nfnav nfnav--a" id="nf-nav">` 内含 `.nfnav__surface`、`.nfnav__bar`（`.nfnav__brand` / `nav.nfnav__primary` 四个 `a[data-nav=open|ai|global|personal]` / `.nfnav__tools` 语言+主题+菜单按钮）、`canvas.nfnav__ruler`、`.nfnav__note`（aria-live）、`.nfnav__scrim`、`.nfnav__panel[role=dialog]`。
- **Logo 预留位**：`.nfnav__logo[data-slot=logo]`（当前为细线取景框占位，不是字母图标），正式 Logo 直接替换其内容（建议 18–20px 单色 SVG，`currentColor`）。
- 顶栏 `position:fixed; z-index:60`，高度写入 `:root { --nf-nav-h }`，其它固定元素用它下移。

### 4.2 场景背景自动适配接口
```js
nav.setScene({ tone, kind })  // tone: 0 = 顶栏下方为黑，1 = 暖白；可为小数（覆盖率）
                              // kind: 'art'（Opening，不受主题影响）| 'canvas'（AI/Global/Personal 画布）| 'page'（可主题化内容页）
```
- 组件内部做指数平滑（τ≈90ms）、表面连续过渡（过渡中加厚）、文字/线条按表面明度二值化并交叉淡化（回差 .47/.53），**宿主只管报 tone**。
- **场景适配与手动主题分开**：kind 为 `art/canvas` 时顶栏跟场景 tone；kind 为 `page` 或菜单打开时跟用户主题。`art` 时点主题按钮仅提示「开场视觉不随主题变化」。不改任何 WebGL 颜色。
- **Global 精确 tone**（建议加到 global-world.js `render()`，只读，不改绘制）：
```js
let navTone = white ? 1 : 0;
if (!white && ((g>=1.70&&g<2.2)||(g>=4.5&&g<4.84))) {
  const sh = sheet(C, E*40);                                      // 与 sceneFlip/diveSheet 同一纸面多边形
  if (sh) navTone = NFNav.rectCoverage(sh, 0, 0, W, NAV_H);       // NAV_H = --nf-nav-h
}
HOST.setNavTone && HOST.setNavTone(navTone);
```
  无法改 global-world 时，可用实测关键帧近似（1440×900 顶部 64px 亮度）：`g 1.817→1.826: 0→1`，`g 4.655→4.673: 1→0`。
  **不要用 `body.on-white`**（在 g 2.0/4.5 切换，与顶栏实际被覆盖的时机不一致）。

### 4.3 导航同步
```js
nav.setActive(key, progress)  // 每帧调用，key ∈ open|ai|global|personal，progress 0..1（标识上的进度点/读数）
```
叠加页已验证的映射（scene 坐标 `sc = NF_TIMELINE.toScene(s)`）：
`sc < models.start(2.42)` → open（kind art）；`globalHome.state.active` → global（progress = g/6.8）；`sc < bridge 中点` → ai；`sc < personal.start` → global；否则 personal。
- 点击：`onNavigate(key)` → 宿主 `navigate()`；组件对目标加锁（到达 / 3.6s / 用户滚轮·触摸·按键 即解锁），途经章节**不闪现**。
- 标识为左右边临界阻尼弹簧（实测零过冲），连续横移；`prefers-reduced-motion` 时直接到位。
- 键盘：Tab 进入，←/→ 在四项间移动焦点，Enter 跳转；main 原有 0–3 / Global 1–4 快捷键不冲突。

### 4.4 主题与语言状态
- `nav.setTheme('light'|'dark'|'system')`、`nav.setLang('zh'|'en')`；默认 `persist:true` 存 `localStorage nf.theme / nf.lang`。
- 写到 `<html>`：`data-nf-theme`（解析后 light/dark）、`data-nf-theme-pref`、`data-nf-scene`、`lang`。内容页样式用 `[data-nf-theme=light]` 主题化；Opening/WebGL 不读它。
- 回调：`onThemeChange(resolved, pref)`、`onLangChange(lang)`。
- i18n：`NFI18n.extend('en', {...})` 注册文案，`NFI18n.apply(root, lang)` 刷新 `[data-i18n]` / `[data-i18n-attr]`；缺英文时显示中文并加 `lang="zh-CN"` + `data-i18n-fallback`（ZH 角标），**不假装已翻译**。切换语言时宿主应记录当前章节锚点并在重排后恢复（lab.js `preserveAnchor` 示例）。

### 4.5 移动端（≤760px）
- 紧凑栏：品牌 + 当前章节胶囊（序号+名称）+ 菜单按钮；语言/主题在菜单内（分段控件 中/EN、浅/深/自动）。
- 菜单：`aria-expanded`、`role=dialog aria-modal`、焦点陷阱、打开后聚焦当前项；Esc / 遮罩 / 选择项关闭并还焦点；`html.nfnav-lock` 锁滚动。触摸目标 ≥44px（A 行高 72px）。已测 390 / 360 / 320 宽。
- main 移动端 `#gw-chap`（top 62）需下移到 `calc(var(--nf-nav-h) + 10px)`。

### 4.6 避免与旧 difference HUD 冲突
- 新导航挂在 `body` 顶层，**不要放进 `#ui`**（`mix-blend-mode:difference`，z10），否则 tone 适配会被二次反相。
- 移除（或先 `display:none`）旧 `#hTL`（品牌+crumb）与 `#hTR`（中/EN+三链接）；`#rail`、底部读数、`.chap` 等保留。
- `.chap { top: calc(var(--nf-nav-h) + 38px) }`（原 98px），Global `#gw-chap/#gw-nav` 同理下移。
- 旧 HUD 的语言按钮逻辑迁到 `onLangChange`，三链接迁到四标签。

## 5. 截图（shots/）
`compare-desktop.png` A/B 黑场·暖白·翻面·悬停/聚焦 · `seq-a.png / seq-b.png` 四标签切换 0–900ms · `lang.png` 中英切换中间帧 · `theme.png` 主题 · `mobile-a.png / mobile-b.png` · `onsite.png` 叠加真实首页。
