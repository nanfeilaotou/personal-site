# Global 卡面实验与原色品牌候选

> 本文保存上一轮实验记录。当前版本已改为真实彩色粒子成像，并采用用户提供的两张完整卡面和招行官方蓝色借记卡，见 [本轮报告](CARD-FORMATION-02.md)。

日期：2026-10-17。分支：`feat/home-ai-showcase-v2`。这是独立素材研究和视觉实验，等待人工视觉验收后再决定是否接入首页。

## 预览

在仓库根目录执行 `node scripts/serve.mjs`，无需构建或新增依赖。

- [高清卡面实验](http://127.0.0.1:4173/prototype/experiments/card-particle.html?p=.66)：默认 Monzo；滚动、拖动、播放与倒放共用同一进度。
- [品牌原色 A/B](http://127.0.0.1:4173/prototype/experiments/brand-color.html)
- [三张卡面与通信品牌素材](http://127.0.0.1:4173/prototype/experiments/global-materials.html)
- [截图、连续帧与测试结果](http://127.0.0.1:4173/tests/card-lab/index.html)

动态实验需要 HTTP。直接双击 HTML 会显示原始静态卡面及启动提示，避免 file:// 的像素读取和 WebGL 纹理安全限制。

## 清晰度修复

原先的中间缩图会损失细节；主渲染现在直接上传原图，通过 Shader 进行透视取样，没有中间 960px 缩图。投影保留正确的 clip-space W，使 UV 插值在倾斜时仍然正确；支持时使用最高 4x 各向异性过滤。Canvas 按设备 DPR 设置背板，上限 2。

Monzo 原始透明卡面为 **1230×786**，最大显示 **615×393 CSS px**，DPR 2 下刚好对应原始像素数。已实际验证 1440×900 窗口使用 2880×1800 背板，默认素材是 Monzo。高清截图见 [DPR 2 实测](../tests/card-lab/clarity-native-2x.png)。

Bybit 虽然来自 1600×900 宣传图，卡面实际只占约 450–500px。已改为直接取样原图并限制到 440 CSS px，但原始摄影素材的细节上限仍然存在；高清正面待补。Starryblu 官网图只有 232×145，同样明确标注低分辨率待补。没有用 AI 放大、重绘品牌或锐化伪装成高清。高 DPR 屏幕上，这两张来源仍达不到 Monzo 的清晰度。

## 品牌对照

|品牌|本次结果|对照方式|
|---|---|---|
|Tencent WorkBuddy|取得官方透明彩色 SVG，保持原始渐变、比例和滤镜|A：白色名称，悬停 / Tab 聚焦切换官方原色；B：默认官方原色|
|Muse / Meta|取得官方透明彩色 SVG，保持原始颜色与比例|同上|
|Grok Bot / Cursor · xAI|未确认可复用的独立产品 Logo，继续使用名称|两侧均为名称，不借用模型 Grok 或 Cursor 通用图标|

A 的默认状态是名称标识，不是声称官方提供了单色 Logo。建议优先验收 B，以减少悬停时识别形状变化；首页尚未应用任何候选，原有 18 个 SVG 未改动。

## 首批 Global 素材

|素材|实际文件规格|处理与限制|
|---|---|---|
|Bybit Card / Georgia|1600×900 PNG 官方发布图|保存完整原图，渲染中用单应矩阵提取卡面，无卡号或姓名；高清正面待补|
|Monzo Perks / Mastercard|1230×786 AVIF，透明|银行 / Mastercard 卡面测试样本，原色原比例，无卡号或姓名|
|Starryblu / Starry|232×145 PNG，有透明通道|官网样张，渲染时遮蔽演示数字与姓名；官网注明项目仍在筹备；高清待补|
|Club Sim / HKT|210×88 PNG，透明|保留官方白字，深色底展示|
|SMART / Philippines|299×78 PNG，透明|保留官方白字与图形颜色，深色底展示|

原始资源 URL、来源页面、许可边界和 SHA256 见 [SOURCES.md](../assets/global/SOURCES.md) 与 [manifest.json](../assets/global/manifest.json)。下载的是公开产品资料，没有采集用户个人卡片截图。公开可下载不等于开放许可，当前按权利保留的视觉研究资源记录；未声称获得品牌授权。

调研了 [CouCouYa](https://card.coucouya.com/)、[CardFi 首页](https://card-fi.com/) 和 [CardFi Canvas](https://card-fi.com/explore/canvas)，截图保存在测试目录。可借鉴的是前者的白底编辑排版和卡面叠放，以及后者画布的平移、缩放与简短详情入口。本实验沿用自己的数字结构，不复制其卡片墙。CardFi 的部分参考图与官方素材不同且来源不充分，未收入本地卡面库。Mastercard 媒体资源下载返回 403，未冒称已取得，使用 Monzo 官方卡面满足银行 / Mastercard 样本要求。

## 实现与两种接入草案

实验使用原生 WebGL、Canvas 2D、DOM 与 CSS，没有新增框架。一个 WebGL Context、两个 Program；36,480 个点负责聚合和解构，清晰阶段切换为原图纹理面。粒子位置是统一进度的确定函数，正反向可复现。鼠标只改变倾斜，不修改滚动进度；暂停后停止 rAF。Logo、按钮、说明与资料入口由 DOM 承载。减少动态效果、WebGL 不可用及 Context 丢失均有静态卡面后备。

实验进度：约 .08–.48 聚合，.35–.57 显露原图，.58–.78 稳定展示，.78–.99 解构。它有自己的实验滚动轨道，与首页时间轴没有关联。

1. [账户浮出](http://127.0.0.1:4173/prototype/experiments/card-particle.html?view=layer&p=.66)：保留白底四层线框，卡面从账户层浮出并朝资金层抬升；较小彩色卡面作为局部重心。这是对现有白底风格影响较小的方案。[实际画面](../tests/card-lab/layer-color-hold.png)。
2. [暗场取景](http://127.0.0.1:4173/prototype/experiments/card-particle.html?view=portal&p=.66)：白色四层结构位于左侧，右侧局部黑色窗口承接粒子与彩色卡面，避免整章切成黑底。[实际画面](../tests/card-lab/portal-color-hold.png)。正式接入时仍需设计窗口与账户 / 资金转场的进度关系，本轮没有应用到首页。

两种视图都是独立实验中的示意结构，不是对 `sceneGlobal()` 的修改。

## 实际测试

测试环境：Windows、Chromium 153.0.8010.12、ANGLE D3D11 / NVIDIA GeForce RTX 4080 Laptop GPU。原始结果见 [results.json](../tests/card-lab/results.json)。

- 原有静态检查 `node tests/static-check.cjs` 通过。
- 新实验：三张素材分别检查 12 个固定进度，并逐一反向恢复，WebGL framebuffer SHA256 相同；保存完整合成截图供人工检查。
- 测试滚轮、进度条、播放 / 倒放 / 暂停、鼠标倾斜、点击资料、键盘聚焦与 Escape。倾斜不改变进度。
- 650ms 静止展示没有新增 rAF 或 Draw Call；稳定阶段单次绘制一个纹理面。
- 八次 Resize 不增加纹理或点缓冲；检查原色 Logo、三张卡面、两个通信标识加载。
- DPR 2、Context 丢失与恢复、无 WebGL、减少动态效果、390px 触摸布局、file:// 静态提示均有实际检查。
- 浏览器错误和失败资源列表为空。主测试首次执行的 file:// 像素读取失败已修复为静态后备，并由 `final-check.cjs` 单独复测通过；未把首次失败描述成通过。

连续驱动聚合阶段每个分辨率采样 150 帧：

|分辨率|回调 CPU 平均 / p95|观测 rAF 节奏|采样期间长任务|
|---|---|---|---|
|1920×1080|0.156 / 0.300ms|238.4 次/秒|0|
|1440×900|0.176 / 0.300ms|238.4 次/秒|0|
|1366×768|0.249 / 0.400ms|238.4 次/秒|0|

这是测试机的应用回调成本和 rAF 间隔，不是跨设备 FPS 保证，也不等于显示器最终合成帧率。GPU Timer Query 在 1366×768 分别采样 100 次：粒子 Draw 平均 0.0195ms / p95 0.0297ms；纹理面 Draw 平均 0.0294ms / p95 0.2470ms。仅测 Draw，不包括清屏和浏览器合成，保留原始离群值。纹理像素分配估算 9,761,680 字节、点缓冲 583,776 字节，不是驱动实际显存测量。

复测命令（需自行配置可用的 Playwright / pngjs 与 Chromium）：

```powershell
node scripts/serve.mjs
# 另一个终端；可通过 NODE_PATH 指向已有依赖，CHROME_PATH 指向浏览器
node tests/static-check.cjs
node tests/card-lab/check.cjs
node tests/card-lab/final-check.cjs
```

真实手机、Safari、Firefox 和低端 GPU 未测试。首页没有重复完整浏览器回归；通过与 `a441659` 的逐文件比较确认已验收 HTML、Shader / motion、timeline、节点布局、模型 / Agent 数据及 18 个原 SVG 保持不变。

## 文件与 Git 边界

- `prototype/experiments/`：三种预览页面、原生渲染与素材读取。
- `data/global-materials.js`：卡面信息、来源、透视坐标、隐私遮蔽和尺寸参数。
- `assets/global/`、`assets/brands/*-color.svg`：七份来源可追溯的原始资源。
- `scripts/collect-global-assets.py`：明确 URL 的素材收集与安全检查。
- `tests/card-lab/`：浏览器检查、结果、截图与连续帧审查。

素材独立提交 `4e1d32b`，实验及测试另行提交在同一功能分支。未改动首页 `sceneGlobal()`、Personal、原粒子、节点运动、时间轴；用户原有未提交 `index.html` 保留且不纳入提交。没有部署或替换生产主页。下一步等待本轮视觉验收。
