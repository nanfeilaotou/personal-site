# 卡面粒子实验 · 真实成像与原生纹理接管

日期：2026-10-17。基线 `317032c`，继续在 `feat/home-ai-showcase-v2` 开发。本轮仅打磨独立实验和素材，未接入正式 Global。

## 预览与验收位置

在仓库根目录运行 `node scripts/serve.mjs`，无需构建或安装框架。

- [StarryBlu 粒子成像停点](http://127.0.0.1:4173/prototype/experiments/card-particle.html?card=starryblu&p=.48)
- [Bybit 粒子成像停点](http://127.0.0.1:4173/prototype/experiments/card-particle.html?card=bybit&p=.48)
- [招行蓝色 Mastercard](http://127.0.0.1:4173/prototype/experiments/card-particle.html?card=cmb&p=.66)
- [Global 彩色品牌](http://127.0.0.1:4173/prototype/experiments/global-brands.html)
- [卡面素材与来源](http://127.0.0.1:4173/prototype/experiments/global-materials.html)
- [本轮截图、前后对照与测试报告](http://127.0.0.1:4173/tests/card-formation/index.html)

最有价值的操作：从 32% 慢滚到 46%，停住查看完整粒子图；再滚到 55% 看高清接管。66% 是稳定展示，支持鼠标轻微倾斜、点击或键盘聚焦查看资料。继续滚至 80% 后按逆序粒子化，再回到数据流。也可以直接拖动进度条、倒放，或在中间暂停。

## 旧版的问题与本次修复

旧 Shader 在页面进度 `.35–.57` 用 `scan(uv, reveal)` 从左到右显示原图，但最晚到达的粒子要接近 `.48` 才落位。图片和粒子还有不同的退出路径，导致“原图先露出，粒子在旁边赶来”的观感。

本轮删除 `scan`、横向覆盖和独立离场路径。64,000 个点组成 320×200 采样网格，每点始终携带源图对应 UV、颜色和目标坐标。从数据流到目标位置使用插值，同一个聚合量 `q` 同时决定位置、姿态、粒子形状、聚焦和高清层透明度。离场让 `q` 递减，复用完全相同的函数。

|聚合量 q|画面|高清层|
|---|---|---|
|0–.80|源图彩色点沿各自轨迹到达目标；圆点逐渐变成覆盖图像的细小采样块|不绘制|
|.80–.88|所有点已到位，完整粒子图像停留，并有轻微聚焦提亮|不绘制|
|.88–.98|整幅原生纹理平滑覆盖已完成的粒子图，姿态与位置相同|短暂全幅混合，没有横向遮罩|
|.98–1|原生高清卡面，允许倾斜与资料交互|完整绘制|

页面进度映射：进入 `.06–.56` 对应 q 0→1；`.56–.78` 稳定停留；退出 `.78–1` 对应 q 1→0。粒子最晚到达时间由种子决定，但其上限严格小于 q `.80`；原图开始接管是 q `.88`。进入与退出速度不同，几何与采样逻辑相同。实验轨道仍为 500vh，没有修改首页 TOTAL、STOP 或任何章节区间。

白卡的两个细节也做了修正：采样块增加一个设备像素的覆盖余量，消除点栅格取整引起的细缝；透明 WebGL 背板使用正确的预乘合成和独立 Alpha 混合，避免两层交接时透明度被重复相乘而变暗。混合期间粒子图保持完整承托，原生层覆盖它；原生层完成后才停止粒子绘制。

## 本轮卡面与图标

|文件|来源 / 规格|本轮使用|
|---|---|---|
|`assets/cards/starryblu-card.png`|用户提供，1010×608 RGBA|主测试，深色星空。原文件保留；预览对样张号码和姓名采用相邻无文字区域采样，所有渲染层规则一致。|
|`assets/cards/bybit-card.png`|用户提供，1010×630 RGBA|主测试，完整浅灰正面；替代此前宣传图里的约 500px 摄影取样。|
|`assets/cards/cmb-mastercard-blue.png`|招行官方目录，581×373 RGBA；四角白底已离线转透明|第三张辅助卡：**万事达人民币 IC 借记卡（普卡）**，不是全币种信用卡。无卡号、姓名或有效期。|
|`assets/brands/grok-bot-provided.png`|用户提供，512×512 RGBA|用于独立品牌对照页；标为本地候选，不冒称官方出处已确认。|
|`assets/global/brands/ifast.svg`|iFAST Global Bank 官网 Header|保留银行独立字标原色与比例。|
|`assets/global/brands/wise.svg`|Wise 官方媒体包|保留深绿矢量字标；用 CSS 处理其 viewBox 留白。|
|`assets/global/brands/paypal.svg`|PayPal 官方 Logo Center|保留官方彩色标志。|

ClubSIM 沿用已下载的官方彩色透明 PNG，未无理由重新下载；210px 原宽按不超过 105 CSS px 展示。SMART 同样沿用既有原色资源。品牌可与黑白网络骨架共存，深绿 / 深蓝标志在浅底审查、白字品牌在深底审查，未用滤镜强制变白。AI 首页维持原有呈现。

招行资源从官方公开产品目录中定位到具体产品条目，读取其实际加载的完整 PNG。后续按用户要求清除了原下载件不透明的四角白底；展示文件保持原尺寸，卡面主体未改。原下载件仅归档至 `assets/cards/originals/cmb-mastercard-blue.png`，来源记录同时保存原件与修正文件的 SHA256。旧全币种产品页只有黑色 Mastercard，蓝色 AE 页属于美国运通；未混用这些产品，也未从被遮挡的推广海报补画。逐项来源、原始 URL、SHA256 和使用边界见 [素材记录](../assets/cards/SOURCES.md) 与 [manifest](../assets/cards/manifest.json)。

## 显示质量与资源成本

原生层直接上传原图，不经中间缩图。保留正确的透视 UV 和可用时最高 4x 的各向异性过滤。DPR 上限 2：两张提供图片最大宽度 505 CSS px，对应 1010 设备像素；招行辅助图最大宽度 290.5 CSS px，对应 581 设备像素，因此第三张尺寸较小。没有放大伪装成更高分辨率。

仍是一个原生 WebGL Context、两个 Program、Canvas 2D 骨架和 DOM 控件。没有 Three.js、React 或 GSAP。纹理像素分配估算 5,868,372 字节，静态点 / 面缓冲 1,024,096 字节；这些是按像素和数组计算的分配规模，不是驱动实际显存测量。

## 实测

环境：Windows、Chromium 153.0.8010.12、NVIDIA GeForce RTX 4080 Laptop / ANGLE D3D11。原始数据见 [results.json](../tests/card-formation/results.json)。

- 原有 `node tests/static-check.cjs` 通过；首页 HTML、Shader / motion、timeline、节点布局、模型 / Agent 数据和旧素材与基线相同。用户原有 `index.html` 修改保留。
- 三张卡分别取 12 个 q 值，共 36 次绘制门槛检查，高清层只在粒子全部落位、聚焦完成后绘制。
- 36 组进入 / 离开同 q 的 WebGL framebuffer SHA256 相同；保存连续截图。
- `?debug&pass=surface` 的粒子成像停点得到全透明 framebuffer，确认不是靠原图冒充粒子图；q `.94` 的检查可以看到原生层像素。
- 实际回放基线 Shader，并使用本轮同一张 Bybit 原图截图对照，旧版在 p `.42` 已绘制高清层。
- DPR 2 检查三张素材设备像素预算，另测倾斜、白卡混合、Context 丢失 / 恢复。白卡检测区域在七个交接点的平均 RGB 亮度为 **214.25–215.08 / 255**，轻微聚焦提亮之外没有亮度塌陷。
- 测试滚轮正反、拖动、正反播放与暂停、鼠标倾斜、点击资料、键盘聚焦和 Escape。八次 Resize 不增加纹理和缓冲；650ms 稳定停留没有新增 rAF 或 Draw。
- 三张卡和六个品牌正常加载；无 WebGL、减少动态效果、390px 触摸及 file:// 静态提示可用；浏览器错误和失败资源列表为空。

每个桌面尺寸连续驱动聚合与接管 150 帧：

|窗口|回调 CPU 平均 / p95|观测 rAF 次/秒|采样长任务|
|---|---|---|---|
|1920×1080|0.131 / 0.200ms|230.8|0|
|1440×900|0.139 / 0.300ms|227.9|0|
|1366×768|0.135 / 0.200ms|227.8|0|

这是本机应用回调的实测，rAF 节奏不等于最终显示帧率，不是跨设备性能保证。这一版未重新测 GPU Timer Query，不沿用上一版 36,480 点的 GPU 数字。真实手机、Safari、Firefox 和低端 GPU 未测。没有把未运行的完整首页浏览器回归描述为通过。

复测：`node tests/static-check.cjs`、`node tests/card-formation/check.cjs`，再运行 `node tests/card-formation/finish-check.cjs` 检查 DPR 2 倾斜、短窗口排版、品牌键盘操作及报告链接。浏览器脚本需要现成的 Playwright、pngjs；可通过 `NODE_PATH` 指向依赖、`CHROME_PATH` 指向 Chromium。旧 `tests/card-lab/check.cjs` / `final-check.cjs` 入口转发到当前主测试，上一轮截图和结果保留归档。

## 调试与修改范围

- `?debug`：显示 q、点数、落位与高清层比例；暴露实验测试入口。
- `?debug&pass=particles`：只绘制采样点，可单独审查完整粒子图。
- `?debug&pass=surface`：只绘制原生层，仍遵守接管门槛。
- `?card=starryblu|bybit|cmb&p=.46|.66`：直接定位素材和进度；`view=layer|portal` 保留两种独立衔接草案。

新增素材、实验渲染、数据、审查页和测试，不覆盖首页或 `sceneGlobal()`，不修改 Personal，不部署生产。全部工作继续提交到原功能分支，等待本轮视觉验收。
