# 支付标识与 Global 分类验收

2026-10-17，基线 `fe65bc5`。Apple Pay、Google Pay 的 SVG 从官方资源包直接提取，原字节与商标形状 / 配色未改；包 URL、成员路径、SHA256 和品牌规则见 `assets/global/manifest.json` 与 `assets/global/brands/PAYMENT-MARKS.md`。

- [专项结果](results.json)：DPR 2 下的 1920×1080、1440×900、1366×768，纯白 / 深色图标审查、14 份素材加载、两个内部服务分组、三张卡片的顺序与场景说明、刷新、链接及 Console 均通过。
- 图标无滤镜、变形、裁切或动画；Apple Pay 净空满足标识高度 1/4。Google Pay 保留 SVG 自带留白，整图等比例显示。实际截图：[1920](wallets-1920.png)、[1440](../../docs/global-visual/payment-wallets.png)、[1366](wallets-1366.png)。已人工检查两份标识在纯白背景上的识别度。
- [既有资源套件](asset-results.json) 复测，新增两份官方 SVG 哈希 / 安全内容检查，Global 数量按本轮实际内容从 12 更新为 14；保留 AI 21 条目资源、正常刷新与显色检查。
- `tests/static-check.cjs` 通过；专项另核对首页全部场景、AI 数据 / 资源、三张卡面和卡片算法与基线未改。根 `index.html` 保留原 SHA256，未纳入修改。
- 本轮只改素材与交接分类；首页旧版四层 Global 标签和滚动场景不变。三卡视觉用途不是产品形态、业务互通或钱包绑定支持的排他性断言。

启动 `node scripts/serve.mjs` 后，沿用现有 Playwright / Chromium 测试依赖：

```powershell
node tests/static-check.cjs
$env:ASSET_TEST_OUT='D:\AI\personal-site\tests\payment-marks'
node tests/ai-global-final/assets-check.cjs
node tests/payment-marks/check.cjs
```

最后运行专项以生成 2× 的最新素材总览，避免覆盖此前 AI 截图和测试记录。只验证本机 Chromium，不声称本轮已做其他浏览器或真实移动设备验收。
