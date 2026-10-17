# NANFEILAOTOU · 首页原型

Prototype 02 是独立预览，生产入口 `index.html` 不纳入本轮修改。

```powershell
node scripts/serve.mjs
```

打开 [Prototype 02](http://127.0.0.1:4173/prototype/prototype-02.html)。也可直接双击 `prototype/prototype-02.html`，不需要构建或安装依赖。

- [2026-10-17 精修报告：Logo / 文案 / 滚动](docs/PROTOTYPE-02-REFINEMENT.md)
- [品牌素材审查页](prototype/brand-review.html)
- [交付与维护说明](docs/PROTOTYPE-02.md)
- [实际测试与性能数据](docs/PROTOTYPE-02-TESTS.md)
- [新旧截图对照](tests/visual-report.html)
- [品牌素材来源与许可](assets/brands/SOURCES.md)
- [原始 Prototype 01 备份](prototype/prototype-01.html)

Global 素材与卡面独立实验（通过上述 HTTP 服务预览，不影响首页）：

- [卡面粒子实验 · 原生高清纹理](http://127.0.0.1:4173/prototype/experiments/card-particle.html?p=.66)
- [真实彩色粒子成像 · 本轮报告](docs/CARD-FORMATION-02.md)
- [本轮前后对照与实测](tests/card-formation/index.html)
- [Global 原色品牌](prototype/experiments/global-brands.html)
- [AI 原色品牌对照](prototype/experiments/brand-color.html)
- [Global 首批素材](prototype/experiments/global-materials.html)
- [上一轮实验截图和实测结果（归档）](tests/card-lab/index.html)
- [实现、来源与清晰度限制](docs/GLOBAL-CARD-LAB.md)

八个模型品牌、十个平台和本地 AI 工具的数据分别在 `data/models.js`、`data/agents.js`。核验日期为 2026-10-16；更新型号不需要修改动画。
