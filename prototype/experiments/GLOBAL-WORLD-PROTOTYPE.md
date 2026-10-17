# Global「经由 / VIA」第二阶段原型 · 说明与集成交接

> 独立原型，不替换首页。本轮只新增文件，没有修改 `index.html`、Opening、AI 三个场景、现有 Shader、正式 Global / Personal、`motion.js` / `timeline.js` 和部署配置。
> 分支：`feat/home-ai-showcase-v2`（基于 `6415f72`）。`git status` 只有下面 4 个新文件和本说明。

## 1. 文件

| 文件 | 作用 |
|---|---|
| `prototype/experiments/global-world.html` | 独立预览页：舞台（2D 画布 + 卡片 WebGL 画布 + 降级图）、品牌 DOM 层、卡片 DOM 层、HUD（difference 混合）、无障碍全文、HTTP 提示 |
| `prototype/experiments/global-world.css` | 原型样式（HUD、品牌标签挖空底色、卡片按钮、面板、移动端、`prefers-reduced-motion`） |
| `prototype/experiments/global-world.js` | 场景模块 `window.NF_GLOBAL` 与独立驱动（scrollY → g）。所有 2D 场景、相机、布局、HUD、换卡 DOM |
| `prototype/experiments/global-card-adapter.js` | `window.NFCardStage`：三卡粒子舞台。沿用 `card-particle.js` 的 FLOW 阈值、320×200 网格、transform / pointVS / quadVS / quadFS；新增双材质混合与换卡控制器 |
| `prototype/experiments/GLOBAL-WORLD-PROTOTYPE.md` | 本说明 |

素材全部引用仓库已有的 `assets/global/**` 与 `assets/cards/**`（StarryBlu 使用 `cards/public/starryblu-card-sanitized.png`；招行卡最大宽度 290.5px）。

## 2. 预览

```bash
cd personal-site            # 仓库根目录
node scripts/serve.mjs      # http://127.0.0.1:4173
# 打开 http://127.0.0.1:4173/prototype/experiments/global-world.html
```

- 必须走 HTTP（`file://` 下会显示提示，因为 WebGL 纹理需要同源图片）。
- URL 参数：`?g=4.25` 直接定位；`?debug` 显示状态行；`?reduced` 模拟减少动态；`?nogl` 模拟无 WebGL；`?slow=3000` 模拟纹理慢加载（毫秒）。
- 操作：滚轮 / 触控滚动；右上导航或键盘 `1`–`4` 跳到四个停留点；在卡片停留区点侧卡或下方卡名按钮换主卡。
- 调试（仅 `?debug` 或控制台）：`NF_GLOBAL_DEBUG.seek(g)`、`.select(id)`、`.advance(sec, fps)`、`.freeze(true)`、`.loseContext()`、`.state`。

## 3. 分镜（g = Global 局部进度，1 = 一屏，全长 6.8）

| g | 段落 | 画面 |
|---|---|---|
| 0 – 0.75 | 入境（黑） | 桥接句「要用上这些，你需要」+ 四个 token（一个号码 / 一条路径 / 一个账户 / 一张支付卡），token 收拢成一个点（你 · YOU）；左上角「02 经由」章节标识淡入 |
| 0.55 – 1.84 | 01 号码（停留 **1.40**） | 点拉成波形号码线，ClubSIM(+852) / SMART(+63) 两个运营商环；WhatsApp、Telegram、LINE（主要通讯，实线）与 Instagram、Facebook（辅助社交，虚线）依次接到线上；eSIM、SMS·OTP 小注；1.54–1.68 波形压平成一条亮线 |
| 1.70 – 2.32 | 翻面（高潮①） | 亮线上下展开，黑场翻成浅色地面；网格从低角度抬起到俯视（f = io(R(g,1.72,2.08))） |
| 2.1 – 4.6 | 02 网络（停留 **3.30**） | 等时线地形；四个客户端环形入口（灰阶出现，被路由波前扫过后显色，并列不分先后）；ORIGIN → PROXY → VPS / REMOTE 的 A* 路由线；IP / Proxy / VPS / Routing / Remote 五个概念以标注出现 |
| 3.5 – 4.75 | 03 账户与钱包（停留 **4.25**） | 相机转成斜俯视城市区块；ACCOUNTS（iFAST / Wise / PayPal）与 WALLETS（Apple Pay / Google Pay）两个虚线分组；**品牌之间不连线**，说明文字明确"不代表互通、充值或绑卡关系" |
| 4.5 – 5.16 | 下潜（高潮②） | 路线汇聚、穿过平面，细线分成 11 条彩色数据流 |
| 4.96 – 6.72 | 04 支付卡片（停留 **6.12**） | 叙事 q：5.0→5.7 由 0→1（彩色粒子成卡，高潮③），5.7–6.3 稳定；**换卡只在 5.78–6.30 接受**；6.3–6.62 q 回落 |
| 6.48 – 6.8 | 离场 | 卡解构回 11 条流 → 褪白 → 展开为 46 条水平线场（与 Personal `sceneField` 铺满状态同式） |

## 4. 动效实现说明

**单一进度源。** 所有画面都是 `NF_GLOBAL.render(g, time)` 的纯函数：`g` 决定场景与转场，`time` 只驱动环境微动（波形、粒子呼吸）和换卡的局部状态。向上 / 向下滚动都成立，没有只执行一次的 DOM 动画。独立驱动里 `g = scrollY / innerHeight`，再做一次指数平滑（`reduced` 时不平滑）。

**分层。**
1. `#gw-cv` Canvas 2D：所有线、点、网格、地形、路由、区块、引导线、离场线场（DPR ≤ 2）。
2. `#gw-gl` WebGL：只画卡片（粒子点层 + 高清卡面层）。
3. `#gw-brands` DOM：品牌 Logo 原色显示（正常合成，不进 difference），位置每帧由场景写入 `place()`，`applyBrands()` 只在值变化时改 style。说明文字带同色底，引线 / 路由从字下穿过时不压字。
4. `#gw-cards` / `#gw-cardnav` / `#gw-cardcap` DOM：侧卡按钮、卡名按钮、主卡说明。
5. `#gw-ui` HUD：`mix-blend-mode: difference`，黑白底都可读。

**相机。** `cam(g)` 是一台透视相机（俯仰 φ、方位 ψ、缩放 sw、焦距 F=1400），世界坐标以 `E = max(W,H)·0.62` 为单位。号码段是平面画面；翻面时相机从水平看向地面；网络段俯视并按屏幕比例缩放（`NS`）；账户段在停留点使用 `NF_TUNE`（桌面 ψ18°、移动 ψ45°）以保证五个品牌、两个分组和说明面板互不遮挡；下潜时相机穿过平面。

**各段要点。**
- 号码：波形 `waveAt(x)` = 包络 × 正弦，运营商处有环和码号；平台立杆从线上升起，主通讯实线、辅助社交虚线。移动端 WhatsApp / LINE 放在运营商 Logo 外侧，矮屏会略下移号码线。
- 网络：噪声地形的等时线（`metric`）+ 网格 A*（`astar`）生成路由；波前半径随 g 扩散，客户端被扫过后由灰转彩色。REMOTE / VPS 为线框立方体，标签抬到顶面之上并挖空底色。
- 账户与钱包：锚点放在整数区块上；分组标签由 `labelPlan()` 在停留点相机下一次性求解（尝试分组框各顶点 × 对齐 × 偏移，避开品牌框、屏幕边缘、说明面板），避免逐帧跳动。品牌整体上移一个说明高度，读作「立杆 → 端点 → 名称 → Logo」。
- 卡片：主卡居中，两张侧卡在两侧（移动端在下方），由 `cardLayout()` 统一给出矩形；换卡时 2D 画布叠加 11 条低 q 引导线（颜色按 m 从旧卡过渡到新卡），弥补低 q 粒子本身较暗的可读性。
- 离场：`stage.lanesAt(0)` 取 11 条流的几何，逐条向 46 线场的基线插值；线场公式、振幅、透明度与 `motion.js` 的 `sceneField` 铺满状态一致。

**降级。** `?reduced` / 系统减少动态：不画粒子、叙事 q 变成开关、换卡立即提交、无环境动画。无 WebGL：显示 `#gw-fallback` 静态卡图，换卡立即生效。WebGL context lost：自动恢复并继续未完成的切换。

## 5. 三卡切换技术记录

**状态（`NFCardStage` 控制器）。** `from`（已确认卡）、`to`（正在换入）、`desired`（最后一次有效选择）、`m`（材质混合 0→1）、`q`（局部成形度）、`v`（q 的速度）、`token`（每次有效请求 +1）。

**参数。** `SWITCH = { qMin .025, qMix .20, qHold .14, mixTime .55s, wDown 7.2, wUp 6.4 }`；`dt` 每帧夹到 ≤ 0.05s。

**流程。**
1. `request(id)`：不在稳定区（5.78–6.30）→ 返回 false；与 `desired` 相同 → 无动作；否则只记录 `desired` 并 `token++`，不排队、不直接改画面。
2. 解构：q 以临界阻尼弹簧（wDown）降向 qMin，有效 q = min(叙事 q, 局部 q)，所以**滚动永远优先**。
3. 低 q 换色：有效 q ≤ qMix 且新纹理已就绪时，m 在 0.55s 内 0→1；着色器在预乘 alpha 空间混合两张材质，同时插值 `uCard / uAspect`（卡片尺寸）。纹理未就绪就保持低 q 等待。
4. 提交：m = 1 → `from = to`、`onCommit`（侧卡槽位交换、按钮 `aria-pressed`、主卡说明、live 播报）。
5. 重聚：q 以 wUp 回到 1；高清卡面层只画已确认材质，q 过 0.88–0.98 时接管。

**最后选择优先。**
- 还没开始换色（m = 0）时改选：直接改目标。
- 已开始换色（m > 0）时改选：在低 q 区把 m 反向退回 0，再朝最新目标混合；中间目标不会被提交。
- 切换中滚出稳定区：m ≥ 0.5 完成到新卡，m < 0.5 退回旧卡；整个卡片段离屏时立即收束。

**实测时间线（60fps 模拟，1440×900，三次切换结果一致）。**

| 时间 | 状态 |
|---|---|
| 0 – 0.43s | 解构：q 0.99 → 0.20 |
| 0.43 – 1.0s | 低 q 换色：m 0 → 1，q 最低 0.057 |
| 1.0s | 提交 |
| 1.0 – 1.7s | 重聚：q 0.10 → 0.95 |
| ≈ 1.6 – 2.0s | 高清卡面接管 |
| 2.6s | 完全稳定（q = 1，busy = false） |

**可靠性测试（全部通过，无控制台错误）。** 快速连点 6 次 → 只执行最后一次；点当前卡 → 无动作；m=0 / m≈0.6 时改选 → 最终为最新选择；切换中滚到 6.5 / 5.5 → 退回旧卡，返回后稳定；滚到 6.0（区内）→ 正常完成；区外点击 → 返回 false；切换中 context lost → 恢复后完成；切换中 resize → 完成；`?slow=3000` → 保持低 q 等待纹理，最终为最后选择；`?nogl` / `?reduced` → 立即切换、状态一致；真实鼠标点侧卡、点卡名按钮、键盘 1–4、导航按钮、滚轮离开均正常；`destroy()` 后继续滚动无报错。

## 6. 已知问题

1. 沙盒只有 SwiftShader 软件渲染：卡片段约 7fps（p95 317ms），JS 主线程每帧 0.1–3.9ms，需要真机 GPU 验证。因为 dt 夹到 0.05s，低帧率设备上换卡会按帧变慢（软件渲染下一次切换约 6–8s 实时）。
2. `assets/global/social/instagram.png` 为 5000²（2.6MB），解码内存偏大，集成时建议出 512² 派生图。
3. 低 q 粒子沿用原 `card-particle` 着色器，本身偏暗，目前靠 2D 引导线补可读性。
4. 移动端号码 / 网络段 Logo 仍偏密；1920×1080 下 VPS 立方体偏右下，需要目检。
5. 四个「…指南 ↗」入口是占位（点击只播报"教程页尚未接入"）。
6. `NF_GLOBAL._probe`、`NF_GLOBAL._tune`、`NF_GLOBAL_DEBUG`、`?slow` / `?nogl` 是开发钩子，生产应移除或关闭。
7. 入境 token 第 4 项为「一张支付卡」，正式 `#bridge` 文案是「一条资金链路」，需要统一（见 7.6）。

## 7. Codex 集成交接

### 7.1 接口

```js
await NF_GLOBAL.init({ el, W, H, dpr, kick })  // el 见下；kick = 请求下一帧
const { needsFrame } = NF_GLOBAL.render(g, timeSec) // g ∈ [0, 6.8]
NF_GLOBAL.resize(W, H, dpr)
NF_GLOBAL.request(cardId)        // 'starryblu' | 'cmb' | 'bybit'；稳定区外返回 false
NF_GLOBAL.destroy()
NF_GLOBAL.state                  // { card:{from,to,desired,m,q,busy,token,webgl,ready}, confirmed, brands, stats, ... }
NF_GLOBAL.LEN / STOPS / ZONE / DOMAINS / CARDS
```

`el` 需要：`stage, cv, gl, fallback, brands, cards, cardNavWrap, cap, capK, capN, capD, chap, crumb, panels[4], nav[4], prog, hint, fill, live, debug`（结构见 `global-world.html`）。其中 HUD 部分（`chap / crumb / panels / nav / prog / hint / fill`）可以改接正式站已有的 HUD，`hud(g)` 只做显隐与文案。

`render()` 的副作用：设置 `#gw-stage`、`html`、`body` 的背景色，切换 `body.on-white`。与 `motion.js` 同时运行时需要只保留一方写背景（建议 Global 区间内由 `NF_GLOBAL` 写）。

### 7.2 滚动映射

- 正式 `timeline.js`：`global { start 8.95, end 10.37, stop 9.97 }`（1.42 屏）。建议把 Global 段改为 6.8 屏：`g = s − global.start`，`personal` 与 `total` 整体后移 `6.8 − 1.42 = 5.38`；`legacyLater` 对 Personal 段同样要减去这段偏移。
- 停留点：`stop = global.start + STOPS.number (1.40)`，另三个为 3.30 / 4.25 / 6.12。
- `render(g, time)` 的 `time` 应与 `motion.js` 的秒时钟同源（离场线场与 `sceneField` 用同一个 `time*.25` 相位，才能无缝）。
- Global 区间内由正式驱动调用 `render`，删除原型里的独立驱动（`global-world.js` 末尾 "独立原型驱动" 一节）。

### 7.3 WebGL 状态

- 卡片必须使用**独立画布 / 独立上下文**（原型为 `#gw-gl`）。`draw()` 每帧 `gl.clear()` 整个画布，不能与正式 `#gl` 点云共用。
- `draw()` 会保存 / 恢复 BLEND 开关、blendFuncSeparate、当前 program、ARRAY_BUFFER、activeTexture；不恢复 viewport、纹理绑定、顶点属性开关、clearColor。
- 混合：卡片为预乘 alpha `SRC_ALPHA, ONE_MINUS_SRC_ALPHA, ONE, ONE_MINUS_SRC_ALPHA`；正式点云为 `ONE, ONE`。两者分画布后互不影响。
- DPR ≤ 2，各向异性 ≤ 4x；context lost / restored 已处理；首张纹理就绪即可交互，其余后台加载。

### 7.4 导航

- `STOPS` + 补间 `goTo(stop)`（时长 = 距离 × 260ms，限制在 450–2400ms；`reduced` 时直接跳），滚轮 / 触摸会打断补间。
- 键盘 `1`–`4` 在原型里对应四个领域；正式站已有数字键映射（`motion.js` keydown），集成时建议只在 Global 区间内把 `1`–`4` 交给子导航，或改为 Global 子导航按钮，避免冲突。
- 无障碍：`跳过动画` 链接、`#gw-content` 全文、`aria-live` 换卡播报、`aria-busy` / `aria-pressed`。

### 7.5 与 Personal 的衔接（出口）

- g 6.80 的画面 = `sceneField` 铺满状态（`spread = 1`）：46 线、基线 `H*.07 + i*(H*.86/45)`、振幅 `H*.011*(.6+.4 sin(i*.7))`、透明度 `.14+.22*hs(i*2.3)`。建议 Personal 从 legacy ≈ 9.74 开始（跳过 9.45–9.74 的"从中线展开"），否则会出现"展开 → 收回 → 再展开"。
- 背景：原型为 `#050505`，`sceneField` 为 `#0d0d0c`，需要统一其一。
- 原型右下角的 `FIELD · 46 LINES` / `→ 03 场 · 个人` 与 `sceneField` 的同类标注位置不同，集成时保留正式那一份。

### 7.6 与 AI Bridge 的衔接（入口，需要你决定）

- 正式 `sceneBridge` 在 legacy 7.9–8.06 把浅色带展开到全屏（黑 → 白）；原型入口 g=0 是黑底桥接句 + 四个 token，黑 → 白的翻面放在 g 1.70–2.08。
- 如果直接拼接会出现"白 → 黑 → 白"。建议二选一：
  - A（推荐）：Bridge 保留文案，但停用最后的浅色展开，由原型 `sceneEntry` 以相同位置和字号接管句子；
  - B：保留 Bridge 白场，在 Global g 0–0.1 先把白场收成一条线 → 一个点，再进入黑底号码段。
- 第 4 个 token 文案需要统一：「一张支付卡」（原型）或「一条资金链路」（正式）。改正式文案属于 `index.html` 改动，本轮未做。

### 7.7 集成前清单

- [ ] 删除 / 关闭 `_probe`、`_tune`、`NF_GLOBAL_DEBUG`、`?slow`、`?nogl`
- [ ] Instagram 派生 512² 图
- [ ] 真机 GPU（桌面 + iOS Safari + Android Chrome）帧率与换卡时长
- [ ] 背景色单一写入方
- [ ] 入口 / 出口衔接方案确认（7.5、7.6）
- [ ] 四个指南链接接入真实页面
