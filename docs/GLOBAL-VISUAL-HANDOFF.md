# NANFEILAOTOU · Global 视觉素材交接

更新：2026-10-17。面向未参与前期开发的 Creative Director。当前成果位于功能分支 [`feat/home-ai-showcase-v2`](https://github.com/nanfeilaotou/personal-site/tree/feat/home-ai-showcase-v2)，没有合并 main 或替换生产主页。

**目前有三项成熟能力：四层数字空间、真实品牌原色、彩色粒子卡面生成。** AI 首页 B 已定稿；Global 正式场景仍是原有四层 Canvas 原型，卡面是独立实验，尚未接入首页。

这些材料不是完整分镜。Opus 可以自由组合能力、改变视觉呈现顺序、调整 Global 章节长度，或提出优于四层结构的方案。四个分类用于理解内容与素材，不要求未来动画机械地逐层讲解；不要把现有实现当作必须保留的 Global 分镜。

## 先看这些入口

- [Global 素材总览源码 / 可直接运行的审查页](https://github.com/nanfeilaotou/personal-site/blob/feat/home-ai-showcase-v2/prototype/experiments/global-assets.html)
- [AI 21 条目原色审查页](https://github.com/nanfeilaotou/personal-site/blob/feat/home-ai-showcase-v2/prototype/experiments/ai-brands.html)
- [原有首页 Prototype 02](https://github.com/nanfeilaotou/personal-site/blob/feat/home-ai-showcase-v2/prototype/prototype-02.html)
- [独立卡面粒子实验](https://github.com/nanfeilaotou/personal-site/blob/feat/home-ai-showcase-v2/prototype/experiments/card-particle.html)
- [AI 定稿与本轮测试说明](https://github.com/nanfeilaotou/personal-site/blob/feat/home-ai-showcase-v2/docs/AI-BRAND-FINAL.md)
- [Network 最终定稿验收与回归记录](https://github.com/nanfeilaotou/personal-site/blob/feat/home-ai-showcase-v2/tests/network-final/README.md)

GitHub 的 HTML 源码页不会运行动画；无需访问用户本地电脑即可先看本文件中的截图、缩略图和源代码。克隆此分支后在仓库根目录运行 `node scripts/serve.mjs`，打开 `http://127.0.0.1:4173/prototype/experiments/global-assets.html`。不需要前端构建或运行时外部图床。

## 四类内容与全部 Logo

|内容分类|理解方式|现有内容|
|---|---|---|
|01 号码 / Connectivity|连接身份与基础通信服务|ClubSIM、SMART；SIM/eSIM、短信验证可用通用数字符号表达，不增加更多运营商|
|02 路径 / Network|连接与路由的技术空间|Clash Verge Rev、FlClash、Shadowrocket、v2rayN（四项均已正式确认）；保留 IP / Proxy / VPS / Routing / Remote 通用概念|
|03 账户 / Banking|银行账户、金融科技和支付服务|iFAST Global Bank、Wise、PayPal；**Wise 是金融科技服务，不是传统银行**，PayPal 为支付平台|
|04 资金 / Payments|账户与支付相关的识别素材|招行蓝色 Mastercard、Bybit、StarryBlu 三张卡面；不假设它们有相同产品类型、发卡关系或开户条件|

所有路径均为本功能分支。素材文件本地化，不依赖运行时第三方域名。

|分类 / 名称|GitHub 文件|来源 / 使用条件|
|---|---|---|
|Connectivity · ClubSIM / Club Sim|[assets/global/brands/clubsim.png](https://github.com/nanfeilaotou/personal-site/blob/feat/home-ai-showcase-v2/assets/global/brands/clubsim.png)|[官网](https://www.clubsim.com.hk/en/)，210×88 RGBA；官方彩色图形及白字，适合深底，建议不超过 105 CSS px|
|Connectivity · SMART|[assets/global/brands/smart.png](https://github.com/nanfeilaotou/personal-site/blob/feat/home-ai-showcase-v2/assets/global/brands/smart.png)|[官网](https://store.smart.com.ph/)，299×78 RGBA；保留原色及白字|
|Network · Clash Verge Rev|[assets/global/network/clash-verge-rev.png](https://github.com/nanfeilaotou/personal-site/blob/feat/home-ai-showcase-v2/assets/global/network/clash-verge-rev.png)|[Rev 上游固定原图](https://github.com/clash-verge-rev/clash-verge-rev/blob/cef66cd745ef29aa98e219ffb083b62e13c959e8/src-tauri/icons/icon.png)，512×512 透明 PNG；GPL-3.0。**用户正式选定**，现有文件未改写|
|Network · FlClash|[assets/global/network/flclash.svg](https://github.com/nanfeilaotou/personal-site/blob/feat/home-ai-showcase-v2/assets/global/network/flclash.svg)|[上游指定 glyph.svg](https://github.com/chen08209/FlClash/blob/8d4f9744948751f1273fe871e1d05276fac09b0e/assets_source/images/icon/glyph.svg)，240×240 蓝色矢量；GPL-3.0|
|Network · Shadowrocket|[assets/global/network/shadowrocket.jpg](https://github.com/nanfeilaotou/personal-site/blob/feat/home-ai-showcase-v2/assets/global/network/shadowrocket.jpg)|[App Store ID 932747118](https://apps.apple.com/us/app/shadowrocket/id932747118) 实际图；开发者 **Shadow Launch Technology Limited**，bundle `com.liguangming.Shadowrocket`。512×512 JPEG，原应用白底，非透明；权利保留|
|Network · v2rayN|[assets/global/network/v2rayn.png](https://github.com/nanfeilaotou/personal-site/blob/feat/home-ai-showcase-v2/assets/global/network/v2rayn.png)|[2dust/v2rayN 固定原图](https://github.com/2dust/v2rayN/blob/1f083adbe42cfe46ab55249768f6f1976ae233cf/v2rayN/v2rayN.Desktop/v2rayN.png)，revision `1f083adbe42cfe46ab55249768f6f1976ae233cf`，256×256 透明 PNG；GPL-3.0 仓库。另存同 revision 的 [原始 ICO](https://github.com/nanfeilaotou/personal-site/blob/feat/home-ai-showcase-v2/assets/global/network/v2rayn.ico)，最大 256px。**用户正式选定**，不是 V2Fly / Xray-core / v2rayNG 标识|
|Banking · iFAST Global Bank|[assets/global/brands/ifast.svg](https://github.com/nanfeilaotou/personal-site/blob/feat/home-ai-showcase-v2/assets/global/brands/ifast.svg)|[银行官网](https://www.ifastgb.com/) Header 原始透明 SVG，独立银行字标；权利保留|
|Banking · Wise|[assets/global/brands/wise.svg](https://github.com/nanfeilaotou/personal-site/blob/feat/home-ai-showcase-v2/assets/global/brands/wise.svg)|[官方媒体包](https://newsroom.wise.com/en-CAS/assets/228971/)，深绿透明字标；viewBox 留白较大，审查页只调整 CSS，不改原图|
|Banking · PayPal|[assets/global/brands/paypal.svg](https://github.com/nanfeilaotou/personal-site/blob/feat/home-ai-showcase-v2/assets/global/brands/paypal.svg)|[官方 Logo Center](https://www.paypal.com/us/webapps/mpp/logo-center) 原色透明标志；权利保留|

Network 最终展示只有上述四个客户端。Clash Verge 原项目与 V2Fly 文档图仅在 manifest 的 `historicalCandidates` 及来源记录中保留，不是待确认的正式展示项。

详细原始资源 URL、固定 Git revision、文件 SHA256、开发者核验与许可文件：[Network 来源](https://github.com/nanfeilaotou/personal-site/blob/feat/home-ai-showcase-v2/assets/global/network/SOURCES.md)、[Network manifest](https://github.com/nanfeilaotou/personal-site/blob/feat/home-ai-showcase-v2/assets/global/network/manifest.json)、[既有 Global 来源](https://github.com/nanfeilaotou/personal-site/blob/feat/home-ai-showcase-v2/assets/global/SOURCES.md)。GPL / CC 许可原文在 `assets/global/network/licenses/`。代码或文档许可不等于额外商标授权，官方公开可见也不等于开放商业复用许可；未假称品牌合作。

![Global 原色素材总览](https://raw.githubusercontent.com/nanfeilaotou/personal-site/refs/heads/feat/home-ai-showcase-v2/docs/global-visual/material-library.png)

![四个正式 Network 图标的深色 / 暖白审查](https://raw.githubusercontent.com/nanfeilaotou/personal-site/refs/heads/feat/home-ai-showcase-v2/docs/global-visual/network-final-contrast.png)

以上审查图仅检验原色图标在两种背景的识别度；Shadowrocket 保留 App Store 原始白底，未伪造透明图。

## 三张卡面

|StarryBlu|Bybit Card|招商银行蓝色 Mastercard|
|---|---|---|
|![StarryBlu 已处理缩略图](https://raw.githubusercontent.com/nanfeilaotou/personal-site/refs/heads/feat/home-ai-showcase-v2/docs/global-visual/cards/starryblu.png)|![Bybit 缩略图](https://raw.githubusercontent.com/nanfeilaotou/personal-site/refs/heads/feat/home-ai-showcase-v2/docs/global-visual/cards/bybit.png)|![招行蓝卡缩略图](https://raw.githubusercontent.com/nanfeilaotou/personal-site/refs/heads/feat/home-ai-showcase-v2/docs/global-visual/cards/cmb-mastercard.png)|
|1010×608，用户提供；展示用离线副本已替换印刷号码与姓名区域|1010×630 RGBA，用户提供；完整正面，无卡号、有效期或姓名|581×373 RGBA，官方目录卡面；四角白底已离线转透明，无卡号 / 姓名|

- StarryBlu 展示用文件：[assets/cards/public/starryblu-card-sanitized.png](https://github.com/nanfeilaotou/personal-site/blob/feat/home-ai-showcase-v2/assets/cards/public/starryblu-card-sanitized.png)。它离线导出自已验收的 `NFCardSurface` 处理结果，**作为图片文件本身已经处理，不依赖前端遮罩**。原件 `assets/cards/starryblu-card.png` 仅保留研究和追溯；原发布出处与公开演示身份未独立确认。原件及历史未删除、未重写，未来生产发布必须排除未处理原件，不能整仓当作公开生产资源目录。

  后续采用该副本时无需携带原件的 `redactions` 配置。当前独立实验仍保留原输入及运行时采样规则，是为了保持已验收算法和回归结果，不代表未来生产应直接发布研究原件。
- Bybit：[assets/cards/bybit-card.png](https://github.com/nanfeilaotou/personal-site/blob/feat/home-ai-showcase-v2/assets/cards/bybit-card.png)。来源如实记录为用户提供，不伪造官网地址或授权。
- 招行：[assets/cards/cmb-mastercard-blue.png](https://github.com/nanfeilaotou/personal-site/blob/feat/home-ai-showcase-v2/assets/cards/cmb-mastercard-blue.png)。准确名称是 **万事达人民币 IC 借记卡（普卡）**，来自[招行公开目录](https://mobile.cmbchina.com/DCAMobile/applycard/familyportal.html)对应条目，不是全币种信用卡。展示文件已离线清除四角白底及边缘杂边，尺寸和四角区域外像素保持不变；官方原下载件仅归档在 `assets/cards/originals/cmb-mastercard-blue.png`，不用于展示。缩略图与素材总览已同步更新。

卡面来源、原始签名图片网关 URL、处理记录及 SHA256：[assets/cards/SOURCES.md](https://github.com/nanfeilaotou/personal-site/blob/feat/home-ai-showcase-v2/assets/cards/SOURCES.md)、[原始 manifest](https://github.com/nanfeilaotou/personal-site/blob/feat/home-ai-showcase-v2/assets/cards/manifest.json)、[已处理副本 manifest](https://github.com/nanfeilaotou/personal-site/blob/feat/home-ai-showcase-v2/assets/cards/public/manifest.json)。缩略图保留比例，生成器为 `scripts/prepare-global-thumbnails.py`，只从已处理的 StarryBlu 生成缩略图。

![招行卡面在深色与暖白背景下的透明圆角](https://raw.githubusercontent.com/nanfeilaotou/personal-site/refs/heads/feat/home-ai-showcase-v2/tests/cmb-corners/corner-review.png)

## 已有四层空间能力

![当前 Global 四层空间](https://raw.githubusercontent.com/nanfeilaotou/personal-site/refs/heads/feat/home-ai-showcase-v2/docs/global-visual/global-four-layers.png)

这是当前首页实际截图，白底黑线的四层号码 / 路径 / 账户 / 资金结构，本轮没有重画。源入口：[prototype/motion.js](https://github.com/nanfeilaotou/personal-site/blob/feat/home-ai-showcase-v2/prototype/motion.js)，定位 `sceneGlobal(s,time)`；章节边界由 [prototype/timeline.js](https://github.com/nanfeilaotou/personal-site/blob/feat/home-ai-showcase-v2/prototype/timeline.js) 管理。

当前首页以滚动屏数为唯一进度源：`scrollY / H → NF_TIMELINE.toScene() → 场景`。压缩后的总路程为 10.58 屏，保留原场景坐标映射；Global 接受 `old = sceneS - .91`。调试 `NF_DEBUG.seek(scrollS)` 的参数是压缩后滚动坐标，不是旧场景坐标。`NF_TIMELINE.fromScene()` 可以反向映射。不要同时增加第三套 scroll / pin / 插值权威源。

现有四层不要求成为下一轮最终结构。可以复用其投影、细线、节点与连续反向滚动能力，是否保留、重新排序或替换由 Creative Director 决定。

## 创意参考：背景方向（非分镜）

推荐探索 **深黑数字空间 → 暖白色拓扑空间 → 深黑色彩色粒子成像**：

- 深黑适合数据流、信号、网络路径与光点。
- 暖白适合高对比的精密网络结构与账户关系。
- 回到深黑有利于发挥已完成的彩色卡面粒子效果。
- 黑白变化应通过精心设计的电影式转场建立连续性，避免生硬闪切。

这只是创意参考，未修改正式 Global 的背景、时间轴或粒子效果。**最终场景顺序、背景时长、空间变化方式均交由 Opus 决定**，不要求遵循上面的呈现顺序或现有四层结构，也不预设镜头数。

## 已有彩色粒子卡面能力

|A 散点 / 数据流|B 完整粒子成像|C 高清原图接管|
|---|---|---|
|![彩色数据流](https://raw.githubusercontent.com/nanfeilaotou/personal-site/refs/heads/feat/home-ai-showcase-v2/docs/global-visual/card-flow.png)|![粒子成像](https://raw.githubusercontent.com/nanfeilaotou/personal-site/refs/heads/feat/home-ai-showcase-v2/docs/global-visual/card-particles.png)|![高清接管](https://raw.githubusercontent.com/nanfeilaotou/personal-site/refs/heads/feat/home-ai-showcase-v2/docs/global-visual/card-native.png)|

![StarryBlu 粒子态](https://raw.githubusercontent.com/nanfeilaotou/personal-site/refs/heads/feat/home-ai-showcase-v2/docs/global-visual/starryblu-particles.png)

关键入口：

- [card-particle.html](https://github.com/nanfeilaotou/personal-site/blob/feat/home-ai-showcase-v2/prototype/experiments/card-particle.html)：独立页面与交互控件。
- [card-particle.js](https://github.com/nanfeilaotou/personal-site/blob/feat/home-ai-showcase-v2/prototype/experiments/card-particle.js)：64,000 采样点、统一 formation、原生纹理、交接与解构。
- [card-surface.js](https://github.com/nanfeilaotou/personal-site/blob/feat/home-ai-showcase-v2/prototype/experiments/card-surface.js)：原图读取、预览与采样矩阵，`NFCardSurface.load(item)` 返回 image / canvas / sampleMatrix。
- [global-materials.js](https://github.com/nanfeilaotou/personal-site/blob/feat/home-ai-showcase-v2/data/global-materials.js)：原有三张卡面和账户 / 通信资料；本轮保留原样。
- [已验收算法与边界说明](https://github.com/nanfeilaotou/personal-site/blob/feat/home-ai-showcase-v2/docs/CARD-FORMATION-02.md)、[本轮卡面回归结果](https://github.com/nanfeilaotou/personal-site/blob/feat/home-ai-showcase-v2/tests/ai-global-final/card-regression/results.json)。

`q=0→1` 是进入过程，退出复用同一函数令 q 递减。q `.80` 之前全部采样点落位；`.80–.88` 为完整粒子图与聚焦，高清层不绘制；`.88–.98` 才全幅混合原生纹理，之后稳定展示。没有左到右 reveal，也没有独立且不一致的退出路线。`?debug` 下的 `NF_CARD_DEBUG.seekFormation(q,exit)`、`seek(p)` 可随机定位检查；进度条、播放和滚动共用同一进度。

技术边界：单页一个 WebGL Context、两个 Program，Canvas 2D 结构和 DOM UI。高 DPI 上限 2，原图直接取样、正确透视 UV、可用时最高 4x 各向异性过滤。两张提供卡面最大 505 CSS px，招行最大 290.5 CSS px；不要把辅助小图放大后宣称更高原始分辨率。稳定停留会停止帧调度；减少动态效果、无 WebGL 和 Context 丢失有静态后备。

这些算法和进出场效果已获人工审美验收，本轮源码保持不变。集成 Global 时可以规划承接方式，但应把它视为可复用能力，保留质量与反向可复现性；不要用普通图片 fade 或通用粒子模板替代。

## 彩色品牌能力与性能约束

AI 三章共 21 条目现在统一采用 B：默认原单色、仅当前活动目标显色，详情及内容索引使用小型原图。13 个展示条目有实际彩色源；另 8 个保持黑白，包括本身为灰阶的 Grok Bot 用户候选。OpenAI、Notion 等没有被添加虚构渐变。实现位于 [showcase.js](https://github.com/nanfeilaotou/personal-site/blob/feat/home-ai-showcase-v2/prototype/showcase.js) / [showcase.css](https://github.com/nanfeilaotou/personal-site/blob/feat/home-ai-showcase-v2/prototype/showcase.css)，它提供 DOM 图标与浮层处理参考，而不是要求 Global 使用同样的 AI 节点排布。

Global 允许直接使用官方原色透明标志。原来的 difference HUD 与品牌层分离；不要把彩色图标放进 difference 层而导致反色。颜色与白底黑线骨架可以并存，具体视觉重心由下一轮创意决定。通用 IP / Proxy / VPS / Routing / Remote 不需要硬塞品牌图标。

不引入新框架。未来合并实验时优先复用一个舞台和统一时钟，避免第二个独立 WebGL Context 及重复纹理上传。现有卡实验纹理估算约 5.87MB、静态点 / 面缓冲约 1.02MB；这是数组 / 像素估算，不是驱动实际显存。CPU / GPU 和帧率只能引用真实测量；当前测试机为 Chromium / RTX 4080 Laptop，不能当作低端设备保证。低端 GPU、Safari / Firefox、真实手机仍需下一轮测试。

## 完成状态与待确认

已完成：AI B 统一规则、真实品牌资源、九个 Global 正式品牌标识（含四个已确认 Network 客户端），另留两份历史候选、三卡面、离线处理副本、静态总览、GitHub 可读截图，以及独立卡模块回归。

仍是独立实验：卡面与 Global 的衔接、`layer` / `portal` 两个既有实验视图，均不是已接入首页的分镜；Global 正式场景本轮未变。

Network 名称选择已全部完成，没有待确认客户端。仍需按未来公开使用场景核对的事项：Grok Bot 本地图标与提供卡面的公开出处、商标 / 商业复用条件仍不是已确认授权。它们的来源状态不会因进入素材库而变成“官方认证”。

Global 素材准备阶段至此结束。下一轮由 Claude Opus 自由规划 Global 的电影式体验，不需要沿用本文件的分类次序、镜头数或布局；本交接只提供真实素材、已验收能力与工程边界。
