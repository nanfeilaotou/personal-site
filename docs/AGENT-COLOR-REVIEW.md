# Prototype 02 · AI 品牌色彩整合验收

> 本文保留上一轮三标识 A/B/C 的本地验收记录。用户已正式选择 B，当前已扩展到全部 21 个 AI 条目，见 [AI 定稿](AI-BRAND-FINAL.md)。下文“待验收 / 未提交”为此前阶段状态。

2026-10-17。基线及当前 HEAD：`b47ac3e6e072843be17a7394a2593b0bd38d22fe`。本轮全部保留本地未提交状态，没有暂存、commit、push 或部署。`main` 仍为 `01cfd566438a21bd589131bbd091b5e7ebd142fd`；根 `index.html` 的原有本地改动保留，未触碰。

## 预览

服务：仓库根目录运行 `node scripts/serve.mjs`，本机端口为 4173，无需构建。

- [统一 A / B / C 对照页](http://127.0.0.1:4173/prototype/experiments/brand-color.html)：三个模式的相同稳定画面与共用组件的交互样例。
- [A · 统一单色](http://127.0.0.1:4173/prototype/prototype-02.html?agentColor=mono#agents)
- [B · 默认单色，交互显色](http://127.0.0.1:4173/prototype/prototype-02.html?agentColor=interactive#agents)
- [C · 三枚常驻原图](http://127.0.0.1:4173/prototype/prototype-02.html?agentColor=accent#agents)
- [截图与实测记录](http://127.0.0.1:4173/tests/agent-color/index.html)

不带参数时，本地暂以 B 为默认；无效参数也回到 B。首页没有永久模式切换控件。主页面仍可通过 file:// 运行；对照页的“实际首页”入口和截图使用相对路径。页面正常滚动、锚点和 HUD 仍由原时间轴控制。

## 三种呈现

|方案|七个既有单色标识|WorkBuddy / Muse / Grok Bot|判断|
|---|---|---|---|
|A / `mono`|保持原样|灰阶显示，不在交互时变色|最统一，但弱化原色识别|
|B / `interactive`|保持原样|默认灰阶，悬停、键盘聚焦或选中时恢复原图|推荐；黑白空间不被持续抢占，颜色跟随注意力|
|C / `accent`|保持原样|静止时显示原图|强调更持久，构图重心更靠近两枚有明显色彩的标志|

Grok Bot 原图本身接近黑白，没有为“显色”伪造色彩。它在三种模式中仍使用提供的真实图形候选。A / B 的单色态明确属于浏览器灰阶显示处理，不声称是官方发布的单色资源。

## 素材检查与技术决策

三份文件原始字节全部保持不变。检查了 512px 栅格下的 Alpha 和可见边界，原始数据见 [asset-audit.json](../tests/agent-color/asset-audit.json)。

- WorkBuddy：40×40 SVG，圆形底属于官方资源本身，角部透明；灰阶亮度增益取 1.05，避免原色底和白色图形一起过曝成白点。
- Muse：100×100 SVG，实际 Alpha 边界约 y 16.0%–84.0%，可见高度约 68%；节点 CSS 比例为 1.2，在 36px 槽内获得约 29px 的可见图形高度。没有改 viewBox 或裁切路径。
- Grok Bot：512×512 RGBA，透明角、自带深灰渐变底和浅色图形均保留；未抠底、未重画，也未虚构官方素材出处。不能将整张图片解释为背景全部透明的独立轮廓。

`data/agents.js` 在原产品记录中增加 `logoColor`、`logoMonoTreatment`、`logoOrigin` 等标识信息，没有维护第二套产品数据。产品名称、提供商、简介、分类、型号和核验日期没有趁机更新。

当前三个标志的单色态与原色态来自同一文件，因此采用单个 img 的 **260ms filter 过渡**，不叠放两份相同图片。这样不存在不同 viewBox 对位、双重 Alpha 边缘或互相抢占点击的问题；共用工厂也支持以后提供不同的 mono / color 文件。滤镜只作用于 Agent 新增标志，模型与 Local 的图片不受影响。

鼠标离开节点进入详情后，原有 `aria-expanded` 状态继续保持颜色。点击固定、Esc、Tab 和详情链接仍复用既有交互逻辑。没有新增节点缩放、轨迹、帧循环、WebGL Context 或外部框架。品牌层仍与 difference HUD 分离。

对照页从同一 `NF_AGENTS` 数据和同一标识工厂生成交互样例；完整场景采用真实首页截图，不同时运行三套 WebGL。A/B/C 的截图使用相同 viewport、`at=6.321110608`、`it=4` 与 `time=10`，所以可比较同一完成状态。

## 实际测试结果

已运行 `node tests/static-check.cjs`、`node tests/agent-color/check.cjs` 和针对对照页的补充检查。浏览器为 Windows 上 Chromium 153.0.8010.12；实际 GPU 沿用本机 NVIDIA GeForce RTX 4080 Laptop / ANGLE D3D11。详细数据见 [results.json](../tests/agent-color/results.json)。

- **9 张完整稳定画面**：A/B/C × 1920×1080、1440×900、1366×768。十个名称及图标正常加载，点击框不重叠、不出屏，三种模式投影坐标完全相同；原有七个图标没有滤镜改色。
- **过渡**：WorkBuddy 默认截图的平均 RGB 色差为 0，悬停后约 96.97；中途实际读取到 `grayscale(0.418086)`，最终为 0，确认存在平滑中间态。前后图片的 DOM 矩形完全一致。
- **交互**：从节点移动到详情后等待 350ms 仍保持打开及显色；点击固定后移开鼠标仍保持；Esc 关闭，十节点实际 Tab 顺序正确；Muse 键盘显色和 Grok Bot 的用户来源说明均检查。
- **维护与导航**：反复随机定位章节、五次 Resize 后仍只有 21 个品牌节点；每个 Agent 的原交互监听器仍各一个。正反滚轮、快速连续导航、hash 定位、刷新、浏览器回退和前进正常。
- **视觉回归**：与 HEAD 逐项对照 16 个场景位置，冻结时间并停用 CSS 过渡。开场、模型、Local、桥接、Global、Personal 均无像素差异；Agent 区间只隐藏本轮有意改变的 DOM，验证 Canvas / WebGL 骨架与运动画面相同。节点投影和绘制函数也与基线逐字相同。
- **降级**：主动让三份新 Logo 返回 503，名称和点击详情仍可用；这三次预期网络错误单独隔离，正常预览错误与失败资源列表为空。另检查 DPR 2、减少动态效果和 390px 触摸选中。
- **资源保护**：所有已有 SVG / PNG、Global 数据、卡面实验算法与既有卡面测试结果保持原样；八个模型和 Local 数据保持原样。时间轴仍是 10.58 屏。

1440×900 稳定 Agent 场景，各采样 200 个已预热的应用 rAF 回调：

|版本|CPU 平均 / p95|rAF 平均间隔|采样长任务|
|---|---|---|---|
|HEAD 基线|0.323 / 0.500ms|4.174ms|0|
|本地版本|0.391 / 0.700ms|4.174ms|0|

这是单次本机应用回调测量，没有宣称最终显示 FPS、GPU 成本或跨设备性能相同；未观察到长任务或明显节奏变化。真实手机、Safari、Firefox 和低端 GPU 未测试。

## StarryBlu 的运行时遮蔽复核

代码确认：当前实验 Canvas / Shader 在采样时替换区域，原始 `assets/cards/starryblu-card.png` 仍含印刷号码和姓名。已有官方低清样张也包含展示字段，但与用户提供图并非同一卡面，不能据此独立证明提供图的所有内容都是已核验的公开演示数据。来源状态没有被擅自改成“已确认公开演示”。

已在 [卡面来源记录](../assets/cards/SOURCES.md) 补记：未来公开生产必须先生成并检查处理后的图像副本，只发布和引用处理后的版本，排除未处理原图，不能依赖前端遮罩隐藏下载资源内容。本轮只补充记录，没有改卡面文件、算法或实验结果。

## 精确修改文件

已有文件：

1. `data/agents.js`：仅三个 Agent 的标识字段与来源状态。
2. `prototype/showcase.js`：Agent 标识工厂、开发参数、三份资源接入与来源说明。
3. `prototype/showcase.css`：Agent 专属滤镜、过渡、比例校准与来源小字。
4. `prototype/experiments/brand-color.html`：统一 A/B/C 对照及实际首页入口。
5. `assets/brands/SOURCES.md`：灰阶显示与已有素材的来源边界记录。
6. `assets/cards/SOURCES.md`：StarryBlu 运行时处理与未来生产资源要求的复核记录。

新增文件：`docs/AGENT-COLOR-REVIEW.md`；`tests/agent-color/check.cjs`、补充检查、`asset-audit.json`、`results.json`、`index.html` 和验收截图。

`index.html` 为本轮开始前已有的修改，不属于以上修改清单。没有新增生产模式开关，不改 `prototype-02.html`、`motion.js`、`timeline.js`、Global / Personal、`global-brands.html` 或 Card Formation。等待人工确认最终色彩模式后，才考虑提交到当前功能分支。
