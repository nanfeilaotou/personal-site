# 手机竖屏版发布记录

2026-10-19：用户已完成初步预览，明确授权提交及部署，接下来使用真实手机测试。

- 正式根地址：https://personal-site-7xv.pages.dev/
- 截图/边界框对照：https://personal-site-7xv.pages.dev/tests/mobile-portrait/review.html
- 基线：`7ad321568909e997f1f16eea646e995c73a9119e`。
- 已验收实现：`3cbc294`；完整本地/在线预览证据：`6dff52f`、`fee17a0`。
- 合入方式：从 `feat/mobile-portrait` 快进 main，保留功能分支和完整提交历史。
- 发布方式：现有 Cloudflare Pages 的 main 自动发布，不修改部署配置、域名或 DNS。
- 发布范围：已验收的手机布局、安全区、触摸适配和返回场景修复；桌面、时间轴和粒子算法保护结果见原测试。
- `run-metadata.json` 的 `mainUnchanged` 及旧预览报告描述的是发布前状态，不是本次上线结果。

发布流水线、线上源文件与浏览器回归结果在完成上线后补充到本目录 `release/`。真实 iPhone Safari、Android Chrome 尚待用户实机反馈，不将 Chromium 触摸模拟描述为实体手机测试。
