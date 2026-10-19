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

## 正式上线核验 — 2026-10-19

发布提交：`409ca13a4851d092b5b46b663ea434d8e94cb0f9`，main 快进并推送成功。Cloudflare 正式部署 `bca23cee-8578-4540-9b76-b9362cd50a95`，GitHub Check `117963732288` 完成为 success；[不可变快照](https://bca23cee.personal-site-7xv.pages.dev/)。后续发布记录提交只补充证据，不修改应用代码。

- [Cloudflare 发布记录](release/cloudflare.json)：其中无 Branch Preview URL 的记录是 main 正式部署，另一条为保留的手机功能分支预览。
- [正式源文件检查](release/deployment-results.json)：根路径 HTTP 200，全部已修改运行资源的规范化 SHA256 与已验收实现一致；审查 HTML、JSON、缩略图、录像也与当前本地证据一致。
- [正式根页面浏览器回归](release/online-results.json)：1920×1080、1440×900、1366×768；21 个 AI 条目及详情、四个 Global 停留点、三卡切换/快速改选、Personal、Hash/Back/Forward/刷新、键盘、减少动态效果、真实 no-WebGL 后备、StarryBlu 安全副本；completed=true，Console errors=[]、failed=[]。
- [正式根页面手机触摸回归](release/touch/touch-results.json)：320×568、360×740、375×667、390×844、430×932，105 次 AI 详情触摸，Global 导航/指南、三卡/快速切换/滚动中断、菜单和背景锁定、Esc/聚焦、回到起点；补充合成安全区、动态视口、旋转、真实 WebGL 丢失恢复、减少动态/无 WebGL 检查。completed=true，Console errors=[]、failed=[]。
- [390px 正式卡片截图](release/online-mobile.png)；五种宽度截图位于 `release/touch/touch-cards-*.png`，三种桌面截图位于 `release/online-*-*.png`。
- 测试时间以本记录 2026-10-19 为准。旧 `release-v010/check.cjs` 的 JSON date 和“portrait polish deferred”是旧夹具固定说明；本轮专项触摸证据和既有五尺寸视觉审查补全手机优化的验证范围，未改写历史脚本。

发布回退基线为 `7ad321568909e997f1f16eea646e995c73a9119e`，保留全部历史和手机功能分支。回退应创建可审查的恢复提交或使用 Cloudflare 历史部署回滚，不强推重写 main。发布检查脚本 `release.cjs` 与旧预览验证 `deployment.cjs` 分开，后者保留“生产仍为旧版”的历史检查用途，不适用于上线后。

真实 iPhone Safari、Android Chrome 尚待用户实机反馈，不将 Chromium 触摸模拟描述为实体手机测试。
