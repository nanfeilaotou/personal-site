# AI B 定稿与 Global 素材交付

日期：2026-10-17。用户已正式选定 B，本轮将它统一到模型 / Local / Agent 全部 21 个条目。原产品名称、代表型号、简介、提供商及核验日期保持不变。当前功能分支为 `feat/home-ai-showcase-v2`，根 `index.html` 的原有修改始终排除在提交之外。

## 显色覆盖

|章节|实际彩色原图|保持原生黑白|
|---|---|---|
|模型 8 条|Claude、Gemini、DeepSeek、Qwen、Kimi|GPT / ChatGPT、Grok、GLM / Z.ai|
|Local 3 条|Qwen、LM Studio、ComfyUI|无|
|Agent 10 条|Codex、Claude Code、WorkBuddy、Google Antigravity、Muse|DeepSeek Harness、ZCode、Hermes Agent、Grok Bot、Notion AI|

实际彩色共 **13 个展示条目 / 12 个独立品牌资源**；Qwen 在两个区域出现，读取同一彩色文件。Grok Bot 有原图层，但图本身接近黑白，并继续标记“用户提供、官方出处未独立确认”。其余没有可靠彩色版的品牌不添加虚构渐变。

新增九个 Lobe Icons `*-color.svg`，逐项在固定 revision `8a1b2821bb768c484fe8da20c5e1838b6bf551a9` 的完整目录核对；LM Studio 另从官网取得 200×200 原图。WorkBuddy、Muse 与 Grok Bot 使用既有本地资源，没有重下载。Color 文件和缺失项记录：[color-manifest.json](../assets/brands/color-manifest.json)。原有单色 SVG 全部保留，原始字节不变，MIT / 官方权利状态见 [SOURCES.md](../assets/brands/SOURCES.md)。

## 实现

- `logo` 继续表示默认单色；`logoColor`、来源引用和少量原色尺寸校正存于原 `models.js` / `agents.js` 记录，没有第二套产品数据。
- 三章共用 `NFBrandMarks`。同一文件用单图灰阶过渡；独立 mono / color 文件用同一标识槽、叠加色彩层与透明度交接。支持时使用隔离的 plus-lighter 合成避免亮度塌陷，非支持环境保留单色承托。指针只落在原按钮上。
- 正式默认始终 B。仅 `?debug&brandColor=mono|interactive|accent`（兼容旧 agentColor）保留开发回归入口，页面没有模式选择器。
- 显色由实际 `aria-expanded` 活动状态控制，不直接由任意 hover CSS 控制。因此固定一个节点后，路过其他节点不会同时显色。Esc 关闭后恢复单色，同时保留可访问的键盘焦点。
- 深色详情面板加 30px 原图，内容索引加 22px 原图；没有改成商品卡，也没有修改原场景轨迹、Shader、节点坐标或滚动长度。

审查入口：[AI 全条目](../prototype/experiments/ai-brands.html)、[Global 素材总览](../prototype/experiments/global-assets.html)、[交给 Opus 的 GitHub 文档](GLOBAL-VISUAL-HANDOFF.md)。启动 `node scripts/serve.mjs` 后通过本地 HTTP 浏览。此前三标识 A/B/C 页及报告保留为历史回归材料，不再是待选方案。

## 测试

- 原有 `tests/static-check.cjs` 通过。
- `tests/ai-global-final/ai-check.cjs`：21 条目 × 三桌面分辨率共 63 次详情与显色检查；默认单色、单一活动目标、详情 / 索引原图、Esc 恢复、Tab、触摸、DPR 2、减少动态效果、色彩图失败回退、导航 / 刷新 / 前后退均通过。正常 Console 和资源失败为 0。
- 首屏、Local、Global、Personal 的固定画面与 b47ac3e 一致。模型默认画面有 1116 个通道的差异，仅在 Claude 图标的隔离合成栅格边缘；默认 SVG、图标矩形和坐标保持原样，标识区域外为 0。Agent 比较有意变化的 DOM 之外的 Canvas / WebGL；完整数据见 [ai-results.json](../tests/ai-global-final/ai-results.json)。没有把栅格差异描述成“全页逐像素完全相同”。
- Card Formation 原算法、HTML、CSS、素材数据与原始图片不变。既有测试增加可选 `CARD_TEST_OUT`，把本轮复测输出保存到新目录而不覆盖旧验收结果；保留严格的卡模块与产品内容保护，允许首页 Logo 元数据演进。36 个门槛、36 对同 q 正反哈希、DPR 2 / 白卡交接 / Context 恢复及交互回归通过：[结果](../tests/ai-global-final/card-regression/results.json)。
- Global 候选的 SHA256、SVG 主动内容、许可文件、页面加载和 GitHub 图像入口在交付检查中复查。没有把未测的浏览器或低端 GPU 描述为通过。

本轮在 1440×900 的稳定 Agent 场景采样 200 个预热后的应用回调：CPU 平均 0.495ms、p95 0.700ms，平均 rAF 间隔 4.167ms，采样长任务为 0；测试机为 Chromium / RTX 4080 Laptop。另读取到独立 mono / color 交接的中途透明度 0.522323，确认不是瞬时切换。这些不是最终显示 FPS 或其他设备的性能保证。原始数据见 [asset-results.json](../tests/ai-global-final/asset-results.json)。

桌面截图：

|窗口|模型生态|本地 AI|Agent|
|---|---|---|---|
|1920×1080|[默认](../tests/ai-global-final/models-default-1920.png)|[默认](../tests/ai-global-final/local-default-1920.png)|[默认](../tests/ai-global-final/agents-default-1920.png)|
|1440×900|[默认](../tests/ai-global-final/models-default-1440.png)|[默认](../tests/ai-global-final/local-default-1440.png)|[默认](../tests/ai-global-final/agents-default-1440.png)|
|1366×768|[默认](../tests/ai-global-final/models-default-1366.png)|[默认](../tests/ai-global-final/local-default-1366.png)|[默认](../tests/ai-global-final/agents-default-1366.png)|

原色详情示例：[Claude](../tests/ai-global-final/detail-claude.png)、[LM Studio](../tests/ai-global-final/detail-lmstudio.png)、[Codex](../tests/ai-global-final/detail-codex.png)、[全部内容索引](../tests/ai-global-final/catalog.png)。旧三标识测试入口转发到新 21 条目测试，源代码与结果保存在 `tests/agent-color/archive/` 及原目录，未覆盖历史截图。

复测命令：

```powershell
node scripts/serve.mjs
# 另一个终端；需要现有 Playwright / pngjs 与 Chromium
node tests/static-check.cjs
node tests/ai-global-final/ai-check.cjs
node tests/ai-global-final/assets-check.cjs
$env:CARD_TEST_OUT='D:\AI\personal-site\tests\ai-global-final\card-regression'
node tests/card-formation/check.cjs
node tests/card-formation/finish-check.cjs
```

未改 main、生产部署配置或根 `index.html`。未将卡面接入首页，未设计或实施完整 Global 分镜。新的离线 StarryBlu 副本和缩略图可供后续使用，原件与 Git 历史没有重写，未来生产应排除未处理原件。
