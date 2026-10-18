> 集成备注（2026-10-18）：此交付说明原先基于旧 main 7b7e53b；本仓库正式集成基于 V0.1.1 / 460d5d9，保留其右轨与接缝、快捷返回修复。正式首页没有 iframe 或像素探针，使用 topnav-home 适配层。用户已纠正原交付的语义：顶栏是页面导航，整张滚动首页始终选中首页，其余三个页面先预留；不能用它控制首页章节，主题也不能改变首页任何颜色。以下原章节映射与主题面板建议仅作为历史说明，不适用于正式首页。后续改动、实测入口见 [LENS 集成报告](../../../docs/LENS-INTEGRATION.md)。原始软件渲染测试的通过数量不等于本机集成测试。

# NANFEILAOTOU 全站顶部主导航 · LENS 透镜（原型 v2）

真正的横向全站主导航：左侧 Logo 插槽 + NANFEILAOTOU，中间 首页 / AI / 全球 / 个人 四个主入口，右侧 中 / EN 和明暗主题。
没有搜索，也没有登录。本原型**没有改动 main 仓库的任何文件**，可以直接拷进仓库，也可以单独运行。

## 运行

```bash
python3 nav2/serve.py            # 站点根目录 = ../main，/nav2/ 映射到本目录，端口 4181
```

| 页面 | 地址 | 用途 |
|---|---|---|
| 独立实验页 | `http://127.0.0.1:4181/nav2/lab/index.html` | 模拟场景（开场、AI、全球黑白翻面、个人、内容页）。右下控制台可切主题、语言、过渡方式，可跳到各位置，可打开手机预览 |
| 真实首页叠加 | `http://127.0.0.1:4181/nav2/onsite/index.html?it` | 用同源 iframe 加载未修改的 main 首页，新导航挂在父页面上。只在预览里隐藏旧的左上和右上 HUD |

URL 参数：`lang=zh|en`、`theme=light|dark|system`、`nopersist`（不读写 localStorage）、`#open|#ai|#global|#personal`（Hash 入口）。
lab 还支持 `at=<屏数>`、`still`（静止截图）、`nodock`、`tr=none`；onsite 还支持 `at=<s>`、`clean`（隐藏角标）。

测试：`node nav2/test.mjs`，共 24 项交互回归，覆盖真实首页、Hash、刷新、减少动态、手机和 lab；
`node nav2/tonecheck.mjs`，在真实首页上比对像素探针与截图实测亮度。
截图工具：`JOBS='[...]' node nav2/shoot.mjs`。

## 文件

```
src/nf-topnav.js        导航组件（无依赖）：NFTopNav.mount(opts) → api
src/nf-topnav.css       结构、字体与交互态（颜色全部来自 JS 写入的 --tn-* 变量）
src/nf-scene-probe.js   像素探针：读取顶栏正下方真实画面的亮度 → tone
src/nf-i18n.js          最小 i18n 接口（DICT / t / has / extend / apply），以后可整体替换
lab/                    独立实验页（宿主示例：瞬时定位、hash、阅读锚点、语言回退）
onsite/                 叠加真实 main 首页的预览（同步映射、seek、像素探针）
test.mjs tonecheck.mjs shoot.mjs grid.py montage.py serve.py
shots/                  运行截图
```

## 设计语汇

- **TRACK 轨道**：四个入口坐落在一条细长的六边形轨道里。细线宽 1px，单元之间有分隔刻度，两端连接线渐隐收尾，末端有节点。窄屏时连接线会自动缩短。
- **LENS 透镜**：当前入口被一枚切角透镜框住，左上和右下是大切角，顶边有锚点方块缺口，切角外侧有双切口细线，底部有落针。透镜内部会擦掉轨道线，铺一层很淡的蓝。
  切换时，透镜先**折叠**成一束 2px 光线，前缘先行、后缘追随地**掠过**轨道。掠过时每 7px 留下一枚刻度残影，0.5s 内熄灭。到达后透镜**展开**，四角括号向内收拢，一条蓝色竖线扫过文字。
- **LATTICE 点阵**：悬停时，单元内出现一片跟随指针的 4px 像素点阵聚光。32 个光点从轨道下沿汇聚，重构成该单元的虚线切角框。指针在单元之间移动时，光点会连续流动、断开再重组；离开后光点散回轨道，然后熄灭。
  悬停在当前项上时，透镜微微扩张，并出现内角刻度；按下时透镜压缩。键盘焦点显示为虚线切角框。
- **SHUTTER 光闸**：点击后，一道深色光闸从顶栏下沿落下。前缘是蓝线，带刻度、目标位置的加粗段、`02 · 号码` 标签和 Y 读数。完全覆盖时显示 `02 / 03 全球 GLOBAL DIGITAL SERVICES · VIA`，宿主在这一刻**瞬时定位**到目标章节；然后光闸继续下落，揭开新画面。
  全程约 0.8s，不会滚过其他章节。开启减少动态效果时，透镜直接到位，光闸改为约 0.3s 的淡入淡出。
- 品牌悬停时，Logo 四角外扩，菱形旋转，字标做一次解码动画。主题按钮是切角框里的日食图标，遮挡圆的位移表示太阳或月亮，右下角蓝点表示「自动」。
  语言切换时，mini 透镜先折叠、再移动、再展开，四个标签逐个解码（中文用块字符，英文用字母）。
- 颜色：唯一主题色是 `#5AA9FF`。暖白底上，线条用同色相的 `rgb(58,146,240)`，蓝色文字用 `rgb(36,112,196)`，保证对比度。其余只用深黑、暖白和灰阶。
  静止时没有任何持续闪烁或循环动画，rAF 空闲时会完全停止。

## 系统行为

- **按顶栏下方实际亮度自动黑白适配**：`NFSceneProbe` 把顶栏矩形内的各个画布或背景按 z 序合成到一张 96×6 的小图上，取亮像素占比 smoothstep(.35,.65) 作为 tone。它不依赖 `body.on-white` 或任何 class。
  在真实首页上实测，探针结果与截图测量值一致（`tonecheck.mjs`），包括翻面扫过顶栏时的中间值，例如 0.143。
  导航内部的处理：tone 做 τ90ms 平滑，文字明暗在 .47/.53 处带回差切换（τ55ms），所以不会闪。处于中间灰阶时，遮罩取「文字对侧」的底色并加厚，保证可读。光闸期间直接跟随光闸自身的曲线。
- **主题和场景适配互相独立**：`kind:'art'|'canvas'` 时，顶栏跟随画面；`kind:'page'`（普通内容页）或手机菜单打开时，跟随用户主题。
  主题只写 `<html data-nf-theme / data-nf-theme-pref>`，不碰任何 WebGL 颜色。Opening 不受主题影响：在开场切换主题时，会提示主题作用的范围。
- **同步与锁**：宿主每帧调用 `setActive(key)`。点击后锁定到目标，直到光闸结束且宿主报告已到达，或 900ms 超时，避免途中高亮来回跳。
- **连续快速点击**：覆盖阶段只更换目标；完全覆盖阶段直接改为新定位并延长停留；揭开阶段会重新覆盖。实测在 120ms 内点三次，只定位一次。
- **其他行为**：在当前项上再次点击，只做确认脉冲，不跳转。按住修饰键点击，可以在新标签打开 `#hash`。
  方向键、Home、End 在入口之间移动焦点。手机菜单有焦点陷阱，支持 Esc，关闭后焦点回到菜单按钮，背景设为 `inert`。
- **Resize 和缩放**：用 ResizeObserver、resize、devicePixelRatio 的 matchMedia 和 fonts.ready 触发重新测量。宽度 ≤1180 和 ≤980 时逐级收紧（≤980 隐藏字标），≤760 切换为手机品牌栏。
- **中英**：导航自身完整双语，切换语言不会回到首页（lab 演示了阅读锚点的保持）。缺英文的正文会可靠地回退到中文，并写上 `lang="zh-CN"` 和 `data-i18n-fallback`，**正式视觉里不显示角标**，只出现一次轻提示：「Some page content is not translated yet」。

## Codex 集成交接

1. **引入**：在 `index.html` 中加入 `nf-topnav.css`，以及 `nf-i18n.js`、`nf-topnav.js`（如果不在渲染里上报 tone，再加 `nf-scene-probe.js`）。在 motion.js 初始化后调用：
   ```js
   const nav = NFTopNav.mount({
     active: initialKey,                    // 由 fromHash()/恢复位置算出，避免入场动画
     navigate: key => navigate(MAIN[key], { instant: true }),   // MAIN = {open:'open', ai:'models', global:'global', personal:'personal'}
     isAt: key => Math.abs(sd - STOP[MAIN[key]]) < .015,
     onLangChange: L => window.NFI18n.apply(document, L),       // 返回 {fallbacks}
     onMenuToggle: open => { document.getElementById('ui').inert = open; }
   });
   ```
   导航是 `<header class="nftn">`（fixed，z-index 60）加一块光闸 canvas（z-index 59），是**独立的合成层，不放进 `#ui` 的 difference HUD**。
2. **给 motion.js 增加瞬时导航**：`navigate(key, {instant:true})`，效果等同于现有的 `NF_DEBUG.seek`：`anim=null; sd=s; scrollTo(0,s*UNIT); globalHome.invalidate(); render(...)`，再加 `history.pushState('#'+key)`。现有的 `goTo` 补间滚动保留给滚轮和键盘用。
   键盘 0–3 / Alt+0–3 建议改走 `nav.go(key)`，这样同样使用光闸。popstate 和 hashchange 时调用 `nav.go(hashKey)`。
3. **tone**（二选一）：
   a) 推荐在 `render()` 末尾直接上报：普通章节 `tone=0`；Global 用翻面纸面多边形（sheet）与顶栏矩形求覆盖率，`white` 时为 1。然后调用 `nav.setScene({tone, kind})`；
   b) 兜底：`NFSceneProbe.create({layers:()=>[#stage,#gl,#cv,#gw-cv,#gw-gl,#gw-fallback], rect:顶栏矩形})`，每帧 `sample()`，开销是一次 96×6 的 getImageData。
   注意：WebGL 画布（`preserveDrawingBuffer:false`）在 rAF 外读出的是透明，探针会把它当作透明层。顶栏区域的白场来自 `#stage` 背景和 2D 的 `#gw-cv`，所以可以正确读到；如果以后改成由 WebGL 画白场，请改用方式 a。
   `kind`：Opening（`sc < scene.models.start`）用 `'art'`，其余章节用 `'canvas'`，以后的普通内容页用 `'page'`。
4. **章节映射**（onsite 已验证）：`sc<models.start` → open；`global.active` → global；`sc` 小于 bridge 中点 → ai；`sc<personal.start` → global；否则 → personal。
5. **旧 HUD**：`#hTL`（品牌和面包屑）和 `#hTR` 由新导航取代，可以删除或隐藏。`.chap` 和 `#gw-chap` 的顶部位置需要不小于 `var(--nf-nav-h) + 30px`（导航会写入 `--nf-nav-h`，桌面 68px，手机 58px）。右侧纵向章节导航使用第一轮 B「舱窗」的视觉语言，与本组件互不依赖。
6. **主题和语言状态**：存储在 `localStorage nf.theme`（light/dark/system）和 `nf.lang`（zh/en）中，`<html lang>` 会同步更新。主题作用于以后的界面层和内容页：CSS 读取 `[data-nf-theme=light]`。新文案通过 `NFI18n.extend('en', {...})` 登记，缺失的键会自动回退。
7. **性能**：只有在交互、过渡或 tone 变化时才运行 rAF，静止时为 0。使用两块小画布（轨道约 610×68 和全屏光闸，光闸空闲时设为 `visibility:hidden`）。中部画布 DPR 上限为 3。

## 已知限制

- 截图和测试都是在无头 Chromium（SwiftShader 软件渲染）中完成的，**没有在真机 GPU 上测帧率**，也没有在 Safari 或 Firefox 上验证。
- WebGL 层不能被探针读取（原因见上文），集成时建议在渲染里上报 tone。
- 首页正文目前只有中文，onsite 切到 EN 时只有导航变成英文，并给出一次轻提示。
- Logo 只是几何占位插槽（`data-slot="logo"`），没有制作正式 Logo 或 favicon。
