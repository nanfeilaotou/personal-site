# Global Network 素材定稿验收

2026-10-17，基线 `9723bd41611888110545dedf2ff75c135ef87ec5`。正式四项为 Clash Verge Rev、FlClash、Shadowrocket、v2rayN。旧 Clash Verge 与 V2Fly 文档图只留作历史候选。

## 实测记录

- [Network 专项结果](results.json)：Chromium，1920×1080、1440×900、1366×768，均为 DPR 2。每个客户端的原图同时显示在深色 / 暖白背景；共 8 张图，无滤镜、拉伸、裁切或原图放大，无横向溢出。刷新、资源和本地链接通过，Console / page error / 失败请求均为 0。
- 人工检查浏览器截图：四个图标均可辨识；Shadowrocket 如实保留应用白底。截图：[1920](network-1920.png)、[1440](../../docs/global-visual/network-final-contrast.png)、[1366](network-1366.png)、[更新后的全素材库](../../docs/global-visual/material-library.png)。截图只涉及审查页，不改变首页视觉。
- [既有资源套件复测](asset-results.json)：12 项 Global 素材、AI 21 组单色 / 原色资源、SHA256、SVG 安全内容、许可文件、离线 StarryBlu 副本、正常导航刷新及显色过渡通过。v2rayN PNG / ICO / 许可另有字节哈希校验。
- [既有 AI 套件复测](ai-regression.json)：21 条目 × 三桌面分辨率、详情显色、键鼠 / 触摸 / Esc、失败后备、减少动态效果、导航及七个固定场景视觉回归。截图输出到临时目录，未覆盖上轮 AI 截图。
- [既有卡面套件复测](card-regression.json)：三卡面 36 个交接门槛、36 对正反向状态、闲置停帧、交互、DPR 2、白卡交接、Context 恢复与后备等检查通过；另运行 `finish-check.cjs` 检查倾斜 / 矮窗口 / 历史审查页。截图输出到临时目录，原有卡面验收证据保留。
- `tests/static-check.cjs` 通过。主 Shader、采样 / WebGL 绘制、Global 与原型基线一致；专项另核对本轮未修改任何 AI 资源 / 数据、首页动画、时间轴、卡面源图或算法。根 `index.html` 的既有修改保持原 SHA256，未纳入本轮提交。
- 交接文档的相对路径与本分支 GitHub 文件 / 图片目标均检查存在；推送后另核对远端文件与图片可取回。

仅声称本机 Chromium 实测；未新增跨浏览器或低端 GPU 的通过结论。资源套件的计时为原测试真实记录，不作显示 FPS 保证。

## 复测

先运行 `node scripts/serve.mjs`。环境需有 Playwright、pngjs、Chromium，沿用项目现有测试依赖。

```powershell
node tests/static-check.cjs
node tests/network-final/check.cjs
$env:ASSET_TEST_OUT='D:\AI\personal-site\tests\network-final'
node tests/ai-global-final/assets-check.cjs
$env:AI_TEST_OUT=Join-Path $env:TEMP 'nanfeilaotou-network-final-ai'
node tests/ai-global-final/ai-check.cjs
$env:CARD_TEST_OUT=Join-Path $env:TEMP 'nanfeilaotou-network-final-card'
node tests/card-formation/check.cjs
node tests/card-formation/finish-check.cjs
# 提交并推送后，检查交接文档中的 GitHub 文件 / 图片与本地提交字节一致
python tests/network-final/verify-remote.py
```

AI / 资源测试新增可选输出目录参数，避免覆盖已验收截图和结果；没有修改动画实现或放宽原有断言。专项 `check.cjs` 负责更新 Global 素材截图；资源套件如重新生成了 1× 总览，再运行一次专项即可恢复提交中的 2× 总览。
