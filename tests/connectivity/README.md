# Global Connectivity 素材与三卡交接验收

2026-10-17，基线 `6dc5250b60dc499b50fa49cf136bc8f5b71fd837`。

- 五份 Logo 全部来自官方当前下载入口；原始成员字节 / SHA256、包内路径、日期、尺寸、透明度、条件许可及文字后备记录在 [social manifest](../../assets/global/social/manifest.json)。WhatsApp / Telegram 为原始 SVG，LINE / Instagram / Facebook 为原始透明 PNG；Facebook 另保留官方 AI 源文件，不执行或嵌入它。
- [本轮结果](results.json)：三桌面分辨率（1920×1080、1440×900、1366×768）均按 DPR 2 实测，19 项素材、四个领域、号码领域三个子组及主辅顺序正确；Logo 无滤镜、变形、动画、裁切或横向溢出，原色白底可辨。刷新与本地链接通过。
- 实际截图：[1920](connectivity-1920.png)、[1440](../../docs/global-visual/connectivity-platforms.png)、[1366](connectivity-1366.png)、[全素材库](../../docs/global-visual/material-library.png)。人工检查主要三个通讯图标与辅助两个社交图标的可读性和大小差异。
- `?textOnly=1` 实测只显示五个原名，不请求五份图像；单独模拟 WhatsApp 图像 503 时，原名后备和页面完成状态仍正常。正常素材页 Console / 页面错误 / 失败资源均为 0，故意的失败用例单独隔离。
- `tests/static-check.cjs` 通过；新增保护检查确认 AI、首屏、Global、Personal、时间轴、卡面代码、三张卡图、既有品牌资源及根 `index.html` 均与基线一致。本轮没有重新开发或声称测试了尚未实现的三卡切换。
- 交接明确记录默认 StarryBlu 中央主卡、两张真实侧卡、解构→低辨识→材质交接→64,000 点重组、连续点击 / 滚动 / 反向 / 键盘 / 清晰度 / 单 Context 约束；指出当前 select(index) 为立即换材质，q=0 仍有颜色，不能冒充已经完成的切换效果。

## 复测

启动 `node scripts/serve.mjs`，沿用项目现有 Playwright、pngjs 与 Chromium：

```powershell
node tests/static-check.cjs
node tests/connectivity/check.cjs
```

本轮只声称本机 Chromium 的静态素材与后备验收；没有新增跨浏览器、低端 GPU 或真实手机性能结论。后续正式使用要按最终语境核对品牌条件，不能把审查页当作品牌合作、Logo 的任意动画授权或任意号码的注册保证。
