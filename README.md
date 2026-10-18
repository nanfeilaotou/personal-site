# NANFEILAOTOU

V0.1.1 正式入口：[personal-site-7xv.pages.dev](https://personal-site-7xv.pages.dev/)。Cloudflare Pages 沿用现有 main 分支和仓库根静态目录，无需常驻 Node 服务。

唯一首页 HTML 为根 `index.html`；已验收动画继续由 `prototype/` 中的共享脚本和样式维护。旧 `prototype/prototype-02.html` 兼容转到根路径并保留 query / hash，不维护第二份动画页面。

[发布说明、原图访问边界与回滚方法](docs/RELEASE-V0.1.0.md)。

[V0.1.1 UI 精修报告](docs/UI-V0.1.1.md) · [右侧导航与接缝前后对照](tests/ui-v011/review.html)。顶部原导航保留；Opening、AI、Global、卡面和 15.68 屏时间轴保持原样。

AI 品牌统一采用 B（默认单色、当前目标显色），Opus Global World 已接入同一首页：Opening → AI → 经由 / VIA → Personal 预留。最新 [双章节集成报告](docs/HOME-AI-GLOBAL-INTEGRATION.md) 包含 15.68 屏时间轴、导航、实际 GPU 数据与测试；[素材 / 创意历史交接](docs/GLOBAL-VISUAL-HANDOFF.md) 继续保留。

```powershell
node scripts/serve.mjs
```

打开 [正式根入口](http://127.0.0.1:4173/)。Global 卡面纹理需要同源 HTTP，不以双击 `file://` 为验收入口；无需构建或安装前端框架。

- [AI + Global 整合验收 / 前后对照 / 操作录像](tests/home-global/review.html)
- [Global 独立原型](http://127.0.0.1:4173/prototype/experiments/global-world.html)
- [Opus 已验收原始基线](docs/global-world/opus-baseline/README.md)

- [2026-10-17 精修报告：Logo / 文案 / 滚动](docs/PROTOTYPE-02-REFINEMENT.md)
- [品牌素材审查页](prototype/brand-review.html)
- [AI 21 条目原色与默认形态](prototype/experiments/ai-brands.html)
- [Global 全部素材总览](prototype/experiments/global-assets.html)
- [AI B 定稿与本轮测试](docs/AI-BRAND-FINAL.md)
- [交付与维护说明](docs/PROTOTYPE-02.md)
- [实际测试与性能数据](docs/PROTOTYPE-02-TESTS.md)
- [新旧截图对照](tests/visual-report.html)
- [品牌素材来源与许可](assets/brands/SOURCES.md)
- [原始 Prototype 01 备份](prototype/prototype-01.html)

Global 素材与独立卡面实验（原实验继续保留，通过上述 HTTP 服务预览）：

- [卡面粒子实验 · 原生高清纹理](http://127.0.0.1:4173/prototype/experiments/card-particle.html?p=.66)
- [真实彩色粒子成像 · 本轮报告](docs/CARD-FORMATION-02.md)
- [本轮前后对照与实测](tests/card-formation/index.html)
- [Global 原色品牌](prototype/experiments/global-brands.html)
- [AI 原色品牌对照](prototype/experiments/brand-color.html)
- [Global 首批素材](prototype/experiments/global-materials.html)
- [上一轮实验截图和实测结果（归档）](tests/card-lab/index.html)
- [实现、来源与清晰度限制](docs/GLOBAL-CARD-LAB.md)

八个模型品牌、十个平台和本地 AI 工具的数据分别在 `data/models.js`、`data/agents.js`。核验日期为 2026-10-16；更新型号不需要修改动画。
