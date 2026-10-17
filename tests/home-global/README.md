# AI + Global 首页整合验收

2026-10-18。主验收页面为 `prototype/prototype-02.html`，Opus 完整基线为 Commit A `6c16a2a`。竖屏精修按用户后续指示延期，只做基本访问兼容。

## 审查

- [可浏览对照页](review.html)：正式首页 / 独立 Global 入口、录像、AI 对照、三桌面尺寸四阶段、接缝、DPR 2 和后备。
- [实际操作录像](home-ai-global.webm)：1440×900，约 44 秒、无音频，Opening→AI→Global→Personal，含三卡切换与反向返回。性能测试另行运行，不受录像编码影响。
- [原始 Opus 验收材料](../../docs/global-world/opus-baseline/README.md)：收到的文件哈希、七张截图与沙盒脚本归档。
- [正式集成报告 / 时间轴](../../docs/HOME-AI-GLOBAL-INTEGRATION.md)。

## 实际执行的检查

|脚本 / 结果|通过内容|
|---|---|
|[static.cjs](static.cjs) / [结果](static-results.json)|Opening Shader / 取样 / draw、AI 数据 / 运动 / CSS、Local / Personal 函数、原 Card Formation 文件、Opus 核心场景与卡片 Shader 保留；密集时间轴正反映射、AI 原区间不变、总长 15.68、四停点、指南待整理接口、根 index 哈希保护。另运行原 `tests/static-check.cjs` 通过。|
|[visual-ai.cjs](visual-ai.cjs) / [结果](ai-visual-results.json)|1920×1080、1440×900、1366×768 × 五画面共 15 次前后对照。总长度更新的进度数字 / rail 单独排除，其余差异通道 0（色阶阈值 2）。|
|[opus-regression.cjs](opus-regression.cjs) / [结果](opus-visual-results.json)|原始独立基线、当前独立版及整合版的四个停留点，Canvas / WebGL 共 16 次比较，最大差异 0。首页无独立 Global 驱动，window scroll 0、resize 1、keydown 1、pointermove 1。|
|[check.cjs](check.cjs) / [结果](function-results.json)|AI 21 节点 × 三桌面尺寸，B 显色 / 详情 / Esc；Global 原色 / HUD / 子导航、四份指南索引、三卡门槛、快速重选 / 晚期重选 / 中断 / 返回、键盘、Hash / Back / Forward、刷新 / Resize / 真实滚轮中断；Context 恢复、闲置停绘、12 次重入；390×844 触摸访问冒烟。|
|[fallback.cjs](fallback.cjs) / [结果](fallback-results.json)|真实开场播放、固定时刻排斥与恢复原画面、DPR 2 与倾斜 / 招行分辨率上限、系统减少动态、强制 WebGL 不可用、慢纹理低 q 等待与最后目标、直接指南 hash。|
|[focus.cjs](focus.cjs) / [结果](focus-results.json)|真实侧卡键盘 Enter 激活后焦点保留在新主卡可见卡名；Tab / Shift+Tab / Space 正常。|
|[seams.cjs](seams.cjs) / [结果](seam-results.json)|35 个入口 / 翻面 / 下潜 / 出口关键帧，随机位置、反向定位；旧 Bridge 无白色闪回；Global 结束时 Personal 正确接管。|
|[performance.cjs](performance.cjs) / [结果](performance-results.json)|本机 RTX 4080 Laptop / ANGLE D3D11，三桌面尺寸及 1440×900 DPR 2，实际阶段 CPU / rAF / 长任务、实时切卡约 2.55–2.61s、20 秒稳定停留新增卡绘制 0。|
|[video.cjs](video.cjs) / [结果](video-results.json)|实际主页面滚动、鼠标、三卡选择、Personal 出口及反向返回，无异常 Console error / 请求失败。|
|[delivery.cjs](delivery.cjs) / [结果](delivery-results.json)|交接文档相对链接、审查页全部图片 / 模式切换 / 视频元数据与 MIME、非 debug 首页、开发参数隔离；四种背景阶段的指南入口聚焦 / 悬停对比和真实索引可达。|

`build-review.py` 只将真实截图拼成联系表，不改源素材。初期冒烟 / 诊断截图未纳入交付，保留最终关键帧、原始 JSON、可重复脚本与实际录像。

## 复测

先 `node scripts/serve.mjs`，沿用现有 Playwright / pngjs / Chromium。脚本使用本机 Chromium 路径，没有强制软件渲染参数。

```powershell
node tests/static-check.cjs
node tests/home-global/static.cjs
node tests/home-global/visual-ai.cjs
node tests/home-global/check.cjs
node tests/home-global/fallback.cjs
node tests/home-global/focus.cjs
node tests/home-global/opus-regression.cjs
node tests/home-global/seams.cjs
python tests/home-global/build-review.py
# 性能独立运行，不与其他 GPU 测试或录屏并行
node tests/home-global/performance.cjs
node tests/home-global/video.cjs
node tests/home-global/delivery.cjs
```

仅声称本机 Chromium 的实际结果；rAF Hz 为应用回调采样率，不是显示器呈现 FPS；像素 / 缓冲字节不是驱动显存。Safari / Firefox、真实手机、低端 GPU 仍需后续验证。四份教程内容尚未制作，索引明确标记整理中；Personal 不新增正式内容。
