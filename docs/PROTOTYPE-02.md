# NANFEILAOTOU · Prototype 02

> 2026-10-17 已完成精修：当前为 10.58 屏，新增 DSH / ZCode 标志。以下是首轮记录；当前范围、文案和测试以 [精修交付](PROTOTYPE-02-REFINEMENT.md) 为准。

交付日期：2026-10-16。桌面优先的增量原型；不替换生产主页。

## 打开预览

在仓库根目录运行（无 npm 安装、无构建步骤）：

```powershell
node scripts/serve.mjs
```

打开 <http://127.0.0.1:4173/prototype/prototype-02.html>。直接双击 `prototype/prototype-02.html` 也可以：数据使用普通本地 JS 脚本，无 fetch / ESM / CDN 依赖。

- 模型稳定画面：`prototype-02.html#models`
- 本地 AI：`prototype-02.html#local`
- AI 客户端与 Agent：`prototype-02.html#agents`
- Global / Personal：`#global` / `#personal`
- 截图对照：[视觉报告](../tests/visual-report.html)
- 原版备份：[Prototype 01](../prototype/prototype-01.html)

支持原调试参数 `?debug`、`?at=3.65`、`?it=4`。新增 `?time=10` 冻结环境时间，便于截图；`?at` 优先于 hash 和恢复位置。`?debug` 时可在 Console 使用 `NF_DEBUG.seek(7.42)`、`NF_DEBUG.state` 和 `NF_DEBUG.positions`。生产访问不暴露调试对象。

## 本轮变化与保留

原 VS、FS、几何字形采样和 `drawGL()` 保持不变，粒子密度、分层纵深、闪光、鼠标排斥恢复、速度扰动与滚动坍缩均继续使用原实现。移除独立随机 grain 纹理及 CSS 步进动画；背景仅加 48 个极低对比的确定性微点，视差随滚动发生，停止时不漂移、不闪烁。原粒子中的 1,400 个环境点也完整保留。

模型章节用字符碎片 → 轨道生成 → 八个识别节点 → 稳定停留 → 聚合退出，替代 Token / Attention / Sampling 教学。Agent 章节用双层轨迹展开十个平台，移除 MCP 总线和 Harness 教学。文字在位置接近成形后出现，避免暂停在展开途中时堆叠。稳定阶段所有命中区域固定，不跟随鼠标晃动。

Local 保留原 24×24 数值方格、精度扫描、缓存去噪与四个工作流节点，调整画幅和品牌排版。明确区分权重表示精度与独立的图像生成示意；移除未提供具体模型依据的内存数字表。Global 函数完全保留，Personal 的三组入口与场线保留，使用纯时间映射接到新时间轴。子页面继续属于未来原型，点击会明确提示尚未搭建。

## 文件位置与维护

|位置|用途|
|---|---|
|`prototype/prototype-01.html`|完整输入备份|
|`prototype/prototype-02.html`|新预览入口与原 HUD 样式|
|`prototype/motion.js`|原粒子、Local、Global、Personal、滚动与导航|
|`prototype/timeline.js`|滚动区间、稳定停留与导航位置的单一配置|
|`prototype/showcase.js`|生成式轨迹、统一节点投影、DOM Logo、详情与内容索引|
|`prototype/showcase.css`|独立品牌图层、浮层、触摸和小屏兼容|
|`data/models.js`|八个模型品牌、API 代表型号、核验日期与官方来源|
|`data/agents.js`|十个平台及三个本地工具，全称、类别、别名、入口|
|`assets/brands/`|15 个本地 SVG、MIT 许可、来源和 SHA256 manifest|
|`scripts/serve.mjs`|仅绑定 127.0.0.1 的无依赖静态预览服务|
|`scripts/collect-brands.py`|固定版本 SVG 获取与主动内容检查|
|`tests/`|可重跑检查、实际结果及对照截图|

以后更新型号只需编辑 `data/models.js` 的 `featuredModels`、`modelScope`、`verifiedAt`、`officialSource`。不需触碰 Shader、节点坐标或时间轴。添加 Logo 时修改对应数据项的 `logo`，并补充来源与许可。

## 内容核验

以下为 **2026-10-16 查阅官方 API 目录后选择的代表型号**，不是各聊天产品的默认模型或订阅保证，也不宣称只有一个“最新”系列。

|品牌|API 代表型号|官方来源|
|---|---|---|
|GPT / ChatGPT — OpenAI|GPT-6 Astra / GPT-6.1 Sol|[OpenAI 模型目录](https://developers.openai.com/api/docs/models)|
|Claude — Anthropic|Claude Opus 5.5 / Claude Fable 5.1|[Claude 模型目录](https://platform.claude.com/docs/en/models/overview)|
|Grok — xAI|Grok 4.7|[xAI 模型目录](https://docs.x.ai/developers/models)|
|Gemini — Google|Gemini 4 Argon / Gemini 3.8 Flash|[Gemini API 模型目录](https://ai.google.dev/gemini-api/docs/models)|
|DeepSeek|DeepSeek-V4.1-Flash / DeepSeek-V4-Pro-0813|[DeepSeek API 型号](https://api-docs.deepseek.com/quick_start/pricing/)|
|GLM — Z.ai / 智谱|GLM-5.3|[Z.ai GLM-5.3](https://docs.z.ai/guides/llm/glm-5.3)|
|Qwen — 阿里|Qwen3.8-Max / Qwen3.8-Flash|[阿里云推荐型号](https://www.alibabacloud.com/help/en/model-studio/models)|
|Kimi — Moonshot AI / 月之暗面|Kimi K3 / Kimi K2.7 Code|[Kimi API 平台](https://platform.kimi.ai/docs/overview)|

十个平台的身份已通过官方站点或官方文档核对，原用户名称保存在 `alias`，页面使用全称：

|全称|类别与身份来源|
|---|---|
|OpenAI Codex|编程 Agent；[官方入口](https://developers.openai.com/codex/)|
|Claude Code|编程 Agent；[官方文档](https://code.claude.com/docs/en/overview)|
|DeepSeek Harness（DSH）|编程 Agent；[DeepSeek API 文档链接的 Harness 指南](https://deepseek-harness.github.io/deepseek-harness/en/guide/quickstart)|
|ZCode|Z.ai 编程客户端；[官方站点](https://zcode.z.ai/cn)|
|Tencent WorkBuddy|腾讯 AI 工作台；[腾讯云产品资料](https://cloud.tencent.com/product/workbuddy)|
|Hermes Agent|Nous Research 自主智能体；[官方仓库](https://github.com/NousResearch/hermes-agent)|
|Google Antigravity|编程平台；[官方站点](https://antigravity.google/)|
|Grok Bot|Cursor / Grok 生态中的自主智能体；[官方文档](https://cursor.com/docs/grok-bot)|
|Muse（Meta）|个人智能体；[Meta 发布资料](https://about.fb.com/news/2026/09/introducing-muse-personal-ai-agent/)|
|Notion AI|知识协作工作台；[官方产品资料](https://www.notion.com/product/ai)|

不存在未核验却填写的模型版本。仍待补齐的是 DSH、ZCode、WorkBuddy、Grok Bot、Muse 的专用 Logo 及其明确复用条件；本轮使用名称型标识，不以模型或提供商图标冒充独立产品标志。

## 素材与许可

实际下载的 15 个 SVG 来自 Lobe Icons 固定提交 `8a1b2821bb768c484fe8da20c5e1838b6bf551a9`，采用上游单色资源、保留原比例与路径，将 `currentColor` 固定为中性白以适配 img。八个模型全部具有真实 SVG；GLM 使用对应的 Z.ai 品牌标志，并同时显示 GLM 名称。

逐文件原始 URL、日期、处理方式见 [SOURCES.md](../assets/brands/SOURCES.md)，SHA256 见 [manifest.json](../assets/brands/manifest.json)，保留完整 [MIT 许可](../assets/brands/LICENSE-lobe-icons)。代码许可不等同于第三方商标授权；这里只作产品识别，不暗示赞助。未使用未知来源图片、第三方脚本、外部 SVG 引用或运行时图床。

## 技术决策

继续使用一个原生 WebGL Context + 原 Canvas 2D + 独立 DOM 层，没有引入 GSAP、ScrollTrigger、Three.js、React 或打包器。当前需求是少量空间节点与可逆滚动，现有纯函数时间轴已经足够；换栈会增加粒子回归风险与维护成本。

`scrollY / UNIT → sd → render()` 仍是唯一进度来源。模型稳定区为 3.20–4.22 屏，Agent 为 6.95–8.05 屏；导航停在 3.65、5.97、7.42、9.97、11.03。Local 映射回原 4.98–6.36，后续章节统一减去 .91；Global / Personal 内部边界无需重写。

`projection()` 的同一结果同时提供轨迹端点、DOM transform 与交互坐标。WebGL z=1、结构 Canvas z=2、品牌 DOM z=6、原 difference HUD z=10、详情 z=14。品牌层无混色；空白处穿透指针，只有可交互节点接收事件。详情不是带交互链接的 ARIA tooltip，使用有标题的 region，支持悬停转入、焦点、点击固定、Esc 与关闭按钮。全部内容另外存在原生 dialog 索引中。

减少动态效果时冻结环境时间、跳过滚动插值和导航补间；WebGL 不可用或丢失时显示站名后备，其他内容仍可使用。窗口重排复用原 buffer，清理字形与去噪缓存；页面回退和刷新会恢复实际停留位置，新锚点打开则进入稳定画面。

## 实际测试与边界

详见 [测试报告](PROTOTYPE-02-TESTS.md)、[原始结果](../tests/results.json)、[截图对照](../tests/visual-report.html)。环境为 Windows、Chromium 153、RTX 4080 Laptop / ANGLE D3D11，桌面 DPR=1，另检查 DPR=2.5 的上限策略。

通过了原 Shader / 采样代码比对、三种桌面分辨率首屏及鼠标排斥恢复的实际 GL 像素对比，以及两处滚动纵深像素对比。Logo 加载、悬停到资料链接、焦点、固定详情、小幅滚动、导航/返回/刷新、16 个随机位置正反向复现、连续和快速滚轮、十次 resize、WebGL 丢失恢复、无 WebGL、减少动态效果、触摸、file://、图片加载失败均有实际检查。

测试中修复了触摸提前触发浮层遮挡目标、刷新时 hash 覆盖手动位置，以及展开过程文字过早出现的问题。测试脚本本身也修正了“隐藏节点旧 transform 参与画面比较”、调试 `?at` 优先级及丢失后重新获取扩展导致的误判。完整桌面记录与最终定向补测共同组成 `results.json`；不把中间失败记录冒称完整测试命令一次通过。

性能数字仅代表本机 headless 采样，不替代实际显示器上的人工滚动观感。未测 Safari、Firefox、真实手机或集成显卡；没有声称已完成精细移动端设计。浏览器无法直接提供整个站点的真实 GPU 显存占用，报告仅记录实际粒子 buffer 大小和绘制计时。

## 人工验收路线

1. 并排看报告中的 01 / 02 首屏，再打开两版，让鼠标扫过 NANFEI / LAOTOU 后移开。确认粒子恢复与字体细节；背景应明显更干净。
2. 从顶部慢滚到模型，停在展开中途，再前后小幅滚动。成形后逐一悬停八个标识，进入官方资料链接，点击固定浮层，按 Esc 关闭。
3. 进入 Local，比较量化方格、去噪与工作流；检查右侧 Qwen、LM Studio、ComfyUI 真实标识与内容关联。
4. 导航到 Agent，检查十个全称与停留布局。悬停/Tab 聚焦后继续前滚，观察轨迹收束到黑白转场，再进入原四层 Global。
5. 快滚、反滚、暂停、改变窗口尺寸；刷新有 hash 的页面；打开“浏览全部内容”。最后进入 Personal，确认仍只有三组原入口。

## Git 与生产边界

分支：`feat/home-ai-showcase-v2`，基于远端 `01cfd56`。按备份审计、数据素材、实现、修复测试、交付文档分阶段提交并推送该功能分支。没有创建生产部署、没有推送 main、没有替换正式站点。

本地根 `index.html` 在接入 Git 前就与远端占位主页不同，因此工作区仍显示它有差异；本轮未改写、未暂存或提交它。其 SHA256 与完整备份一致：`BFC193B140D94B8669327F71A677D68F84DB19F573E262119C53894CDE4D1711`。
