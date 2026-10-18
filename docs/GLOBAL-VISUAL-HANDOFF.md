# NANFEILAOTOU · Global 视觉素材交接

> **2026-10-18 集成更新**：Opus 已完成 Global World 和三卡粒子切换，并正式接入 `prototype/prototype-02.html`。当前实现、15.68 屏时间轴、导航与本机 GPU 验收见 [AI + Global 集成报告](HOME-AI-GLOBAL-INTEGRATION.md)；[独立 Global](../prototype/experiments/global-world.html) 和 [Opus 原始基线](global-world/opus-baseline/README.md) 保留。以下素材记录与早期交互建议按历史阶段保存，不再表示卡片仍未实现或未接入。

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
- [Apple Pay / Google Pay 与最终分类验收](https://github.com/nanfeilaotou/personal-site/blob/feat/home-ai-showcase-v2/tests/payment-marks/README.md)
- [Connectivity 五平台素材与三卡交接验收](https://github.com/nanfeilaotou/personal-site/blob/feat/home-ai-showcase-v2/tests/connectivity/README.md)

GitHub 的 HTML 源码页不会运行动画；无需访问用户本地电脑即可先看本文件中的截图、缩略图和源代码。克隆此分支后在仓库根目录运行 `node scripts/serve.mjs`，打开 `http://127.0.0.1:4173/prototype/experiments/global-assets.html`。不需要前端构建或运行时外部图床。

## 四类内容与全部 Logo

|内容分类|理解方式|现有内容|
|---|---|---|
|01 号码 / Connectivity|海外号码与通信、账号、验证、社交服务的应用关系|运营商：ClubSIM、SMART；主要通讯平台：WhatsApp、Telegram、LINE；辅助社交账号：Instagram、Facebook。不把七项写成必须手机号注册，也不保证任意套餐兼容。|
|02 路径 / Network|连接与路由的技术空间|Clash Verge Rev、FlClash、Shadowrocket、v2rayN（四项均已正式确认）；保留 IP / Proxy / VPS / Routing / Remote 通用概念|
|03 账户与钱包 / Accounts & Wallets|账户资金服务与钱包快捷支付两组|账户资金服务：iFAST Global Bank、Wise、PayPal；钱包快捷支付：Apple Pay、Google Pay。Wise 是金融科技服务；并列不表示资金互通或已支持绑卡。|
|04 支付卡片 / Payment Cards|三种代表性视觉场景，全部保留|StarryBlu：海外实体卡；招商银行万事达人民币 IC 借记卡（普卡）：国内万事达借记卡；Bybit Card：数字资产虚拟支付。场景选择不是产品形态的排他性断言，实际范围见下表官方资料。|

所有路径均为本功能分支。素材文件本地化，不依赖运行时第三方域名。

|分类 / 名称|GitHub 文件|来源 / 使用条件|
|---|---|---|
|Connectivity · ClubSIM / Club Sim|[assets/global/brands/clubsim.png](https://github.com/nanfeilaotou/personal-site/blob/feat/home-ai-showcase-v2/assets/global/brands/clubsim.png)|[官网](https://www.clubsim.com.hk/en/)，210×88 RGBA；官方彩色图形及白字，适合深底，建议不超过 105 CSS px|
|Connectivity · SMART|[assets/global/brands/smart.png](https://github.com/nanfeilaotou/personal-site/blob/feat/home-ai-showcase-v2/assets/global/brands/smart.png)|[官网](https://store.smart.com.ph/)，299×78 RGBA；保留原色及白字|
|手机号相关通讯 · WhatsApp（主要）|[assets/global/social/whatsapp.svg](https://github.com/nanfeilaotou/personal-site/blob/feat/home-ai-showcase-v2/assets/global/social/whatsapp.svg)|Meta 当前官方品牌包，绿色 Digital Glyph RGB 2026；SVG 原字节，遵守 WhatsApp 品牌规则|
|手机号相关通讯 · Telegram（主要）|[assets/global/social/telegram.svg](https://github.com/nanfeilaotou/personal-site/blob/feat/home-ai-showcase-v2/assets/global/social/telegram.svg)|Telegram Press 官方 Logo.svg；允许说明性插图，但不能暗示官方代表，不使用 Logo_old|
|手机号相关通讯 · LINE（主要）|[assets/global/social/line.png](https://github.com/nanfeilaotou/personal-site/blob/feat/home-ai-showcase-v2/assets/global/social/line.png)|LINE 官方 Brand icon，1001×1000 RGBA；原色、无变形或效果，LY Corporation 保留权利|
|辅助社交账号 · Instagram|[assets/global/social/instagram.png](https://github.com/nanfeilaotou/personal-site/blob/feat/home-ai-showcase-v2/assets/global/social/instagram.png)|Meta 当前官方包的原始渐变 Glyph，5000×5000 RGBA；保留原文件，不将同包嵌入栅格的大 SVG 冒称轻量矢量|
|辅助社交账号 · Facebook|[assets/global/social/facebook.png](https://github.com/nanfeilaotou/personal-site/blob/feat/home-ai-showcase-v2/assets/global/social/facebook.png)|Meta 当前官方 Primary Logo，2084×2084 RGBA，完整蓝圆与白色 f；另保留同包 AI 源文件|
|Network · Clash Verge Rev|[assets/global/network/clash-verge-rev.png](https://github.com/nanfeilaotou/personal-site/blob/feat/home-ai-showcase-v2/assets/global/network/clash-verge-rev.png)|[Rev 上游固定原图](https://github.com/clash-verge-rev/clash-verge-rev/blob/cef66cd745ef29aa98e219ffb083b62e13c959e8/src-tauri/icons/icon.png)，512×512 透明 PNG；GPL-3.0。**用户正式选定**，现有文件未改写|
|Network · FlClash|[assets/global/network/flclash.svg](https://github.com/nanfeilaotou/personal-site/blob/feat/home-ai-showcase-v2/assets/global/network/flclash.svg)|[上游指定 glyph.svg](https://github.com/chen08209/FlClash/blob/8d4f9744948751f1273fe871e1d05276fac09b0e/assets_source/images/icon/glyph.svg)，240×240 蓝色矢量；GPL-3.0|
|Network · Shadowrocket|[assets/global/network/shadowrocket.jpg](https://github.com/nanfeilaotou/personal-site/blob/feat/home-ai-showcase-v2/assets/global/network/shadowrocket.jpg)|[App Store ID 932747118](https://apps.apple.com/us/app/shadowrocket/id932747118) 实际图；开发者 **Shadow Launch Technology Limited**，bundle `com.liguangming.Shadowrocket`。512×512 JPEG，原应用白底，非透明；权利保留|
|Network · v2rayN|[assets/global/network/v2rayn.png](https://github.com/nanfeilaotou/personal-site/blob/feat/home-ai-showcase-v2/assets/global/network/v2rayn.png)|[2dust/v2rayN 固定原图](https://github.com/2dust/v2rayN/blob/1f083adbe42cfe46ab55249768f6f1976ae233cf/v2rayN/v2rayN.Desktop/v2rayN.png)，revision `1f083adbe42cfe46ab55249768f6f1976ae233cf`，256×256 透明 PNG；GPL-3.0 仓库。另存同 revision 的 [原始 ICO](https://github.com/nanfeilaotou/personal-site/blob/feat/home-ai-showcase-v2/assets/global/network/v2rayn.ico)，最大 256px。**用户正式选定**，不是 V2Fly / Xray-core / v2rayNG 标识|
|账户资金服务 · iFAST Global Bank|[assets/global/brands/ifast.svg](https://github.com/nanfeilaotou/personal-site/blob/feat/home-ai-showcase-v2/assets/global/brands/ifast.svg)|[银行官网](https://www.ifastgb.com/) Header 原始透明 SVG，独立银行字标；权利保留|
|账户资金服务 · Wise|[assets/global/brands/wise.svg](https://github.com/nanfeilaotou/personal-site/blob/feat/home-ai-showcase-v2/assets/global/brands/wise.svg)|[官方媒体包](https://newsroom.wise.com/en-CAS/assets/228971/)，深绿透明字标；viewBox 留白较大，审查页只调整 CSS，不改原图|
|账户资金服务 · PayPal|[assets/global/brands/paypal.svg](https://github.com/nanfeilaotou/personal-site/blob/feat/home-ai-showcase-v2/assets/global/brands/paypal.svg)|[官方 Logo Center](https://www.paypal.com/us/webapps/mpp/logo-center) 原色透明标志；权利保留|
|钱包快捷支付 · Apple Pay|[assets/global/brands/apple-pay.svg](https://github.com/nanfeilaotou/personal-site/blob/feat/home-ai-showcase-v2/assets/global/brands/apple-pay.svg)|[Apple Developer 品牌页](https://developer.apple.com/apple-pay/marketing/) 官方下载包原始 SVG，带边框白底标识；Apple 商标权利保留，按官方规范使用，未改色或添加效果|
|钱包快捷支付 · Google Pay|[assets/global/brands/google-pay.svg](https://github.com/nanfeilaotou/personal-site/blob/feat/home-ai-showcase-v2/assets/global/brands/google-pay.svg)|[Google Pay API 品牌页](https://developers.google.com/pay/api/web/guides/brand-guidelines) 官方下载包原始 acceptance mark SVG；Google 商标权利保留，原色、轮廓与内置留白不改|

Network 最终展示只有上述四个客户端。Clash Verge 原项目与 V2Fly 文档图仅在 manifest 的 `historicalCandidates` 及来源记录中保留，不是待确认的正式展示项。

详细原始资源 URL、固定 Git revision、文件 SHA256、开发者核验与许可文件：[Network 来源](https://github.com/nanfeilaotou/personal-site/blob/feat/home-ai-showcase-v2/assets/global/network/SOURCES.md)、[Network manifest](https://github.com/nanfeilaotou/personal-site/blob/feat/home-ai-showcase-v2/assets/global/network/manifest.json)、[既有 Global 来源](https://github.com/nanfeilaotou/personal-site/blob/feat/home-ai-showcase-v2/assets/global/SOURCES.md)。GPL / CC 许可原文在 `assets/global/network/licenses/`。代码或文档许可不等于额外商标授权，官方公开可见也不等于开放商业复用许可；未假称品牌合作。

![Global 原色素材总览](https://raw.githubusercontent.com/nanfeilaotou/personal-site/refs/heads/feat/home-ai-showcase-v2/docs/global-visual/material-library.png)

![四个正式 Network 图标的深色 / 暖白审查](https://raw.githubusercontent.com/nanfeilaotou/personal-site/refs/heads/feat/home-ai-showcase-v2/docs/global-visual/network-final-contrast.png)

以上审查图仅检验原色图标在两种背景的识别度；Shadowrocket 保留 App Store 原始白底，未伪造透明图。

## 01 号码：新增通讯与社交应用语境

四章分类仍为 **01 号码 / Connectivity、02 路径 / Network、03 账户与钱包、04 支付卡片**。号码领域新增五个平台，只在素材审查页分为三组，当前不进入首页正式滚动场景：

- 通信运营商：ClubSIM、SMART。
- 手机号相关通讯平台（主要）：WhatsApp、Telegram、LINE。
- 其他社交账号服务（辅助）：Instagram、Facebook。

内容边界必须保留：WhatsApp 注册与本人可控且受支持的手机号验证相关；Telegram 账号关联手机号，验证码渠道可变化，不能固定写成短信；LINE 在香港、日本、韩国、台湾、泰国可依官方流程验证手机号，其他地区自 13.11.0 起用 Apple / Google 创建账号，不能笼统写成所有地区支持手机号注册。Instagram / Facebook 为辅助账号生态，不声称注册必须使用手机号码。各平台的具体注册条件与渠道应回到官方资料，不推断 ClubSIM / SMART 的任意号码均可完成验证。

五份原始文件、官方包 URL / 成员路径、日期、尺寸、SHA256、使用限制和文字后备见 [social/manifest.json](https://github.com/nanfeilaotou/personal-site/blob/feat/home-ai-showcase-v2/assets/global/social/manifest.json)、[官方来源与应用关系核验](https://github.com/nanfeilaotou/personal-site/blob/feat/home-ai-showcase-v2/assets/global/social/SOURCES.md)。Facebook 的创建账号帮助页本次跳转登录，因此没有声称核验具体注册流程。五个 Logo 本身都不改色、不变形、不增加动画；品牌需额外许可的用途按最终公开语境核对，不将当前素材审查当作已授权的影视式呈现。

![号码领域三组素材审查](https://raw.githubusercontent.com/nanfeilaotou/personal-site/refs/heads/feat/home-ai-showcase-v2/docs/global-visual/connectivity-platforms.png)

许可未明确或图片加载失败时使用 manifest 的原名文字后备。本地审查页 `?textOnly=1` 可直接检查五个平台的文字模式，且不请求其图片；这只是素材审查能力，不是首页新增交互。Opus 可自由决定空间构图和过渡风格，但需要保持主 / 辅内容优先级与品牌规范。

## 03 账户与钱包：分类与官方标识

账户资金服务（iFAST Global Bank、Wise、PayPal）与钱包快捷支付（Apple Pay、Google Pay）内部区分；PayPal 在此按账户 / 支付服务归类，不否认其其他功能。**不画出或暗示未经核实的充值、互转、绑卡或结算关系**，也不表示本站已接入 Apple Pay / Google Pay。

两份支付 SVG 均从官方 ZIP 原样提取，下载 URL、包内路径、包与文件 SHA256 记录在 [素材 manifest](https://github.com/nanfeilaotou/personal-site/blob/feat/home-ai-showcase-v2/assets/global/manifest.json)。[使用规范与来源](https://github.com/nanfeilaotou/personal-site/blob/feat/home-ai-showcase-v2/assets/global/brands/PAYMENT-MARKS.md) 记录净空、比例、适用语境及效果限制。Apple Pay 标识不可旋转或动画化；两个标识都不加滤镜、阴影或改色。官方内置的白底形属于标识本身，应保留，不能与银行卡外部白角的处理混淆。

![Apple Pay / Google Pay 白底与深色审查](https://raw.githubusercontent.com/nanfeilaotou/personal-site/refs/heads/feat/home-ai-showcase-v2/docs/global-visual/payment-wallets.png)

素材结构与场景用途由 [library-manifest.json](https://github.com/nanfeilaotou/personal-site/blob/feat/home-ai-showcase-v2/assets/global/library-manifest.json) 维护，不改首页时间轴或卡片实验数据。

## 04 支付卡片：三张卡全部保留

|StarryBlu|招商银行蓝色 Mastercard|Bybit Card|
|---|---|---|
|![StarryBlu 已处理缩略图](https://raw.githubusercontent.com/nanfeilaotou/personal-site/refs/heads/feat/home-ai-showcase-v2/docs/global-visual/cards/starryblu.png)|![招行蓝卡缩略图](https://raw.githubusercontent.com/nanfeilaotou/personal-site/refs/heads/feat/home-ai-showcase-v2/docs/global-visual/cards/cmb-mastercard.png)|![Bybit 缩略图](https://raw.githubusercontent.com/nanfeilaotou/personal-site/refs/heads/feat/home-ai-showcase-v2/docs/global-visual/cards/bybit.png)|
|1010×608，用户提供；展示用离线副本已替换印刷号码与姓名区域|581×373 RGBA，官方目录卡面；四角白底已离线转透明，无卡号 / 姓名|1010×630 RGBA，用户提供；完整正面，无卡号、有效期或姓名|

- StarryBlu 展示用文件：[assets/cards/public/starryblu-card-sanitized.png](https://github.com/nanfeilaotou/personal-site/blob/feat/home-ai-showcase-v2/assets/cards/public/starryblu-card-sanitized.png)。它离线导出自已验收的 `NFCardSurface` 处理结果，**作为图片文件本身已经处理，不依赖前端遮罩**。原件 `assets/cards/starryblu-card.png` 仅保留研究和追溯；原发布出处与公开演示身份未独立确认。原件及历史未删除、未重写，未来生产发布必须排除未处理原件，不能整仓当作公开生产资源目录。

  后续采用该副本时无需携带原件的 `redactions` 配置。当前独立实验仍保留原输入及运行时采样规则，是为了保持已验收算法和回归结果，不代表未来生产应直接发布研究原件。
- Bybit：[assets/cards/bybit-card.png](https://github.com/nanfeilaotou/personal-site/blob/feat/home-ai-showcase-v2/assets/cards/bybit-card.png)。来源如实记录为用户提供，不伪造官网地址或授权。
- 招行：[assets/cards/cmb-mastercard-blue.png](https://github.com/nanfeilaotou/personal-site/blob/feat/home-ai-showcase-v2/assets/cards/cmb-mastercard-blue.png)。准确名称是 **万事达人民币 IC 借记卡（普卡）**，来自[招行公开目录](https://mobile.cmbchina.com/DCAMobile/applycard/familyportal.html)对应条目，不是全币种信用卡。展示文件已离线清除四角白底及边缘杂边，尺寸和四角区域外像素保持不变；官方原下载件仅归档在 `assets/cards/originals/cmb-mastercard-blue.png`，不用于展示。缩略图与素材总览已同步更新。

以下区分“本项目选择的视觉用途”和“产品实际范围”，核验日期均为 **2026-10-17**：

|素材|代表性视觉用途|官方范围说明|
|---|---|---|
|StarryBlu|海外实体卡场景|[官网](https://www.starryblu.com/) 同时提及实体卡、虚拟卡，并保留卡项目筹备中及监管许可条件的说明；不把宣传描述当作当前各地区已开放申请的保证。提供卡图的原始出处和许可状态仍按用户素材记录。|
|招商银行万事达人民币 IC 借记卡（普卡）|国内万事达借记卡场景|[招行目录](https://mobile.cmbchina.com/DCAMobile/applycard/familyportal.html) 的准确产品名称与本图对应；不称作全币种信用卡，不推断未核实的虚拟版本或钱包绑定范围。|
|Bybit Card|数字资产虚拟支付场景|[官方申请帮助页](https://www.bybit.com/en/help-center/article/How-to-Apply-for-Bybit-Card) 同时说明虚拟卡和实体卡，地区与资格有限制；选用虚拟支付场景不表示产品只有虚拟卡，也不等同发卡关系或钱包兼容性。|

卡面来源、原始签名图片网关 URL、处理记录及 SHA256：[assets/cards/SOURCES.md](https://github.com/nanfeilaotou/personal-site/blob/feat/home-ai-showcase-v2/assets/cards/SOURCES.md)、[原始 manifest](https://github.com/nanfeilaotou/personal-site/blob/feat/home-ai-showcase-v2/assets/cards/manifest.json)、[已处理副本 manifest](https://github.com/nanfeilaotou/personal-site/blob/feat/home-ai-showcase-v2/assets/cards/public/manifest.json)。缩略图保留比例，生成器为 `scripts/prepare-global-thumbnails.py`，只从已处理的 StarryBlu 生成缩略图。

![招行卡面在深色与暖白背景下的透明圆角](https://raw.githubusercontent.com/nanfeilaotou/personal-site/refs/heads/feat/home-ai-showcase-v2/tests/cmb-corners/corner-review.png)

## 已有四层空间能力

![当前 Global 四层空间](https://raw.githubusercontent.com/nanfeilaotou/personal-site/refs/heads/feat/home-ai-showcase-v2/docs/global-visual/global-four-layers.png)

这是当前首页实际截图，仍保留旧版白底黑线的四层号码 / 路径 / 账户 / 资金结构，本轮没有重画。资料库第三、第四领域已更新为“账户与钱包”“支付卡片”，不意味着截图内旧标签或正式场景已同步改造。源入口：[prototype/motion.js](https://github.com/nanfeilaotou/personal-site/blob/feat/home-ai-showcase-v2/prototype/motion.js)，定位 `sceneGlobal(s,time)`；章节边界由 [prototype/timeline.js](https://github.com/nanfeilaotou/personal-site/blob/feat/home-ai-showcase-v2/prototype/timeline.js) 管理。

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

## 2026-10-17 早期三卡交互建议（历史交接，后续已实现）

这是下一阶段的明确内容需求与推荐交互，**本轮只交接，不修改 card-particle.html / card-particle.js / card-surface.js、Shader、三张卡面或现有实验**。它不锁定 Opus 的空间构图、镜头顺序、转场风格或具体时长，也不改变四章分类。

三张真实卡同时存在：**StarryBlu 默认中央主卡，招行 Mastercard 和 Bybit Card 为两侧较小卡**。侧卡须显示清晰可辨的真实卡面和名称，不能只有线框；侧卡及名称都能点击和键盘操作。StarryBlu 侧卡应使用已处理的安全副本，招行使用已清除四角白底的文件。

推荐一次切换的顺序：

1. 当前中央卡按原有 q 递减路径，由高清态回到粒子态并解构。
2. 粒子进入低辨识度数据流；中央高清层此时不应绘制。
3. 在低辨识阶段准备 / 切换新卡的采样颜色、目标尺寸、采样矩阵及高清纹理，避免原地硬换一张可辨识卡面。
4. q 递增，复用既有 **320×200 / 64,000 点** 与相同种子、目标插值、聚焦和原生层接管门槛重新聚合。
5. 新卡成为中央主卡；另外两张以真实侧卡重新布局，名称和选中语义同步。
6. 可重复选择；侧卡的小型静态预览与中央高清绘制层需要清楚区分，侧边预览不是中央纹理提前出现。

### 现有代码能复用什么、不能直接怎么用

读码确认：`initGL()` 已建立固定 UV / seed 点缓冲，`assets[]` 与 `textures[]` 预加载三卡，`formationAt(progress)` 决定 q / surfaceMix，`drawPass()` 同步取选中材质与采样矩阵，所有绘制复用一个 WebGL Context。目标坐标由归一化 UV 与 `uCard` 尺寸生成，颜色从纹理采样；因此换卡通常不需要再创建 64,000 个对象或第二套粒子系统。

**当前 `select(index)` 是立即改变 selected / 尺寸 / 绑定纹理的测试选择，不是粒子换卡状态机。不能在 q≈1 时直接调用它并声称完成上述过程。** `NF_CARD_DEBUG` 只供验收，不作为未来生产接口。后续可以在既有渲染器外增加控制适配层，暴露可复用的材质快照与 q 控制；路径、种子、采样密度与原 Shader 保持原样。本轮未新增这层接口。

### 技术候选与验收约束

|问题|推荐研究方式 / 必须满足的结果|
|---|---|
|颜色不突然跳变|q 很低时点依然有约 0.24 的基础透明度，**低辨识不等于颜色完全不可见**，仅在 q=0 硬换纹理不能保证无跳色。候选是在同一 Context 增加一张低分辨率临时颜色纹理，从两张已处理采样面的预乘 alpha 颜色平滑插值；仅在低 q 使用，进入聚合前绑定新卡原生高清纹理。若以 320×200 RGBA 计算，临时像素约 0.244MiB，这是估算，上传成本需实测。不要修改原粒子轨迹或提前混入两张可辨识高清卡。|
|位置与比例连续|复用同一 UV / seed 缓冲；在低辨识阶段平滑交接 `uCard` 尺寸 / 比例和采样矩阵，避免当前 sizeCard() 的立即尺寸切换让流场跳位。中央与侧卡布局可由 Opus 重新构思。|
|高清纹理门槛|沿用 q .80 全点到位、.80–.88 聚焦、.88–.98 高清接管。颜色混合或材质尚未准备完时中央 `surfaceMix` 必须为 0。每帧采用完整一致的材质快照，不能点层用 A、高清层却用 B。临时规范 UV 纹理和原材质矩阵 / 隐私采样规则不能重复应用。|
|连点 / 异步竞态|建议仅一个控制器和单一请求代次 token；合并为“最后一次有效选择优先”，丢弃过期加载回调，不累积无限队列。解构期间可重定向目标；已开始重新聚合时，从当前 q 连续退回低辨识阶段再换目标，不能突然重置 q。重复点击当前卡应为空操作。|
|滚动离开|滚动叙事始终优先，局部切换只在允许的稳定区内接管材质。离开时撤销排队 / 异步回调与局部调度；已离屏可直接停绘。仍可见时需要把当前有效材质与 q 连续交还叙事，颜色临时混合未收束时不得提前恢复高清层。不要通过程序滚动、强制 pin 或第二条独立时间轴拦住用户。交还过程与快速离开是后续重点实测项，不宣称已由当前模块实现。|
|反向与返回|保持已验收的滚动→q 映射与相同进出路径。明确保存“已确认材质”与“待切换目标”，取消目标不应在返回页面或反向进入时突然出现。返回策略与离开规则统一，不能依赖完整播放一次才有正确状态。|
|招行清晰度|仍使用 581×373 原尺寸与 maxWidth 290.5 CSS px（DPR 2）。成为主卡不等于必须放大到其他卡宽度；依靠位置 / 层次强调主次，不能插值放大后宣称高清。|
|键盘 / 减少动态 / 后备|真实侧卡用 DOM button / 图片，名称可聚焦；Enter / Space 选择、明确 aria-pressed / busy、稳定焦点和简短完成通知。减少动态效果或无 WebGL 时允许直接切换清晰静态卡；三卡内容仍可访问。|
|成本与释放|一个 Context、一套 64,000 点缓冲，三张高清纹理缓存复用；最多一张过渡纹理，不因点击重复上传大图或新建 Context。退出销毁临时资源、清理请求与监听，空闲停帧。|

未来验收至少覆盖三张卡两两重复切换、快速连点、切换中滚离 / 返回 / 反向、Resize、DPR 2、键盘、减少动态、无 WebGL 与 Context 丢失。检查颜色连续、中央高清层绘制时序、白卡亮度、招行文字及纹理预算。**上表是经代码审查提出的可行候选与待验证约束，不是已经开发、测试通过的三卡切换。** 本轮提供可靠素材和已有模块，创意与实现安排交给 Opus。

## 彩色品牌能力与性能约束

AI 三章共 21 条目现在统一采用 B：默认原单色、仅当前活动目标显色，详情及内容索引使用小型原图。13 个展示条目有实际彩色源；另 8 个保持黑白，包括本身为灰阶的 Grok Bot 用户候选。OpenAI、Notion 等没有被添加虚构渐变。实现位于 [showcase.js](https://github.com/nanfeilaotou/personal-site/blob/feat/home-ai-showcase-v2/prototype/showcase.js) / [showcase.css](https://github.com/nanfeilaotou/personal-site/blob/feat/home-ai-showcase-v2/prototype/showcase.css)，它提供 DOM 图标与浮层处理参考，而不是要求 Global 使用同样的 AI 节点排布。

Global 允许直接使用官方原色透明标志。原来的 difference HUD 与品牌层分离；不要把彩色图标放进 difference 层而导致反色。颜色与白底黑线骨架可以并存，具体视觉重心由下一轮创意决定。通用 IP / Proxy / VPS / Routing / Remote 不需要硬塞品牌图标。

不引入新框架。未来合并实验时优先复用一个舞台和统一时钟，避免第二个独立 WebGL Context 及重复纹理上传。现有卡实验纹理估算约 5.87MB、静态点 / 面缓冲约 1.02MB；这是数组 / 像素估算，不是驱动实际显存。CPU / GPU 和帧率只能引用真实测量；当前测试机为 Chromium / RTX 4080 Laptop，不能当作低端设备保证。低端 GPU、Safari / Firefox、真实手机仍需下一轮测试。

## 完成状态与待确认

已完成：AI B 统一规则、真实品牌资源、十六个 Global 品牌标识（含五个官方通讯 / 社交平台、四个已确认 Network 客户端和两个官方钱包支付标识），另留两份历史候选、三卡面、离线处理副本、静态总览、GitHub 可读截图，以及独立卡模块回归。

仅交接未实现：三卡同屏与粒子换卡候选。仍是独立实验：卡面与 Global 的衔接、`layer` / `portal` 两个既有实验视图，均不是已接入首页的分镜；Global 正式场景本轮未变。

Network 名称选择已全部完成，没有待确认客户端。仍需按未来公开使用场景核对的事项：Grok Bot 本地图标与提供卡面的公开出处、商标 / 商业复用条件仍不是已确认授权。它们的来源状态不会因进入素材库而变成“官方认证”。

Global 素材准备阶段至此结束。下一轮由 Claude Opus 自由规划 Global 的电影式体验，不需要沿用本文件的分类次序、镜头数或布局；本交接只提供真实素材、已验收能力与工程边界。
