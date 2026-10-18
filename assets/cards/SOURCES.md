# 卡面与 Global 彩色品牌 · 本轮记录

日期：2026-10-17。下载原件与展示用文件的字节 / SHA256 见 [manifest.json](manifest.json)。本轮素材仅接入独立实验页；AI 章节与正式 Global 没有改动。

## 提供的本地文件

|文件|来源|规格与处理|
|---|---|---|
|`starryblu-card.png`|本轮用户附件 #2|1010×608 RGBA；保留原文件。实验采样时以相邻无文字区域替代样张号码、姓名区域，粒子、高清面与后备图使用同一规则；不改原文件。原始发布出处和再使用许可未独立确认。|
|`bybit-card.png`|本轮用户附件 #1|1010×630 RGBA；完整正面透明图，原比例原色；没有卡号、有效期或姓名。替代此前的宣传图透视取样。原始发布出处和再使用许可未独立确认。|
|`../brands/grok-bot-provided.png`|本轮用户附件 #3，按用户指定用于 Grok Bot 候选|512×512 RGBA；未改色、未重画；这是本地提供的候选，不能据此声称已核实为官方商标文件。只更新实验审查页，未修改首页 Agent 数据。|

## 招行蓝色辅助卡：已找到官方完整卡面

从招商银行官方 [借记卡公开目录](https://mobile.cmbchina.com/DCAMobile/applycard/familyportal.html) 中，定位名称 **万事达人民币 IC 借记卡（普卡）** 的条目，读取该条目实际加载的图片。展示文件为 `cmb-mastercard-blue.png`，**581×373 RGBA**，完整正面、无卡号 / 有效期 / 姓名。下载件虽带 RGBA 通道，但其 alpha 全为 255，四角白底并不透明；此前“透明圆角”的记述不准确。现按用户要求离线清除四角白底并去除边缘白色杂边，四角 24×24 范围以外的像素逐字节不变，不缩图、不重绘卡面。原始公开图片网关 URL 记录在 manifest，不在运行时依赖它。

原始下载件归档至 [originals/cmb-mastercard-blue.png](originals/cmb-mastercard-blue.png)，原 SHA256 为 `cdf71a42a69820edb93f0363ddf32bcdc5e10426e9b08453b73bd08c7aabbc43`；仅供追溯，不用于展示。处理脚本为 [prepare-cmb-transparency.cjs](../../scripts/prepare-cmb-transparency.cjs)。manifest 分别记录原件与修正文件的哈希。首页素材库、卡面实验及交接缩略图均使用修正后的文件，不依赖 CSS 遮罩。

这张蓝卡是人民币借记卡，**不是全币种国际信用卡**。同时查过招商银行 `ccard/uniqbk/xpjs.html` 与 `ccard/wap/`：旧全币种 Mastercard 卡面是黑色带倒影；蓝色 AE 页面属于美国运通。没有把这些不同产品改名为“蓝色 Mastercard”。官方 [借记卡产品推广页](https://market.cmbchina.com/MPage/online/240708104147586/ofwf.html) 还展示了蓝卡与银卡，但蓝卡被遮挡，未拿海报遮挡部分补画成完整图。

目录原图仅 581px 宽，按 DPR 2 将最大展示宽度限制为 290.5 CSS px。它是辅助卡，尺寸较小，未做虚假高清放大。此前 Monzo 原图和来源记录继续保留在仓库，但不占本轮三个实验选择位。

## Global 品牌原色

|文件|官方来源页面与资源|说明|
|---|---|---|
|`../global/brands/clubsim.png`|[官网](https://www.clubsim.com.hk/en/) → [官方透明 PNG](https://www.clubsim.com.hk/en/Common/btn_menu_logo@2x.png)|沿用上一轮 210×88 原文件，不重复下载；彩色图形 + 白色字标适合深底，展示宽度上限 105 CSS px。|
|`../global/brands/ifast.svg`|[iFAST Global Bank 官网](https://www.ifastgb.com/) → [实际 Header SVG](https://www.ifastgb.com/assets/images/logo/logo_IFB_header.svg)|保留原始青色与深蓝，不以集团通用标志冒充银行产品；矢量透明。|
|`../global/brands/wise.svg`|[Wise 官方媒体包](https://newsroom.wise.com/en-CAS/assets/228971/) → [官方 SVG](https://d21buns5ku92am.cloudfront.net/41519/documents/51452-1677618673-Frame%2039263-941e68.svg)|透明深绿字标，原始 250×250 viewBox 有较大留白；仅调整 CSS 显示区域，不改路径或颜色。浅底保持对比。|
|`../global/brands/paypal.svg`|[官方 Logo Center](https://www.paypal.com/us/webapps/mpp/logo-center) → [页面实际使用的彩色标志](https://www.paypalobjects.com/marketing/web/logos/paypal-mark-color_new.svg)|透明彩色 P 标志，保留当前官方资源原色和比例，浅底展示。|
|`../global/brands/smart.png`|[官网](https://store.smart.com.ph/)；来源详见 [上一轮记录](../global/SOURCES.md)|沿用已有透明彩色标志，未重新下载。|

所有官方品牌资源仍归相应权利人所有；公开可下载不等于开放许可，未将其标成 MIT，也未声明品牌授权或合作。Grok Bot 与两张用户提供卡面的来源按“用户提供”如实登记，不杜撰官方 URL。SV​​G 检查拒绝脚本、事件属性、外部链接和主动内容；只允许本文件中存在的局部 clipPath 引用。原始 SVG 未重绘、未改色。

预览：[Global 彩色品牌](../../prototype/experiments/global-brands.html)、[卡面素材](../../prototype/experiments/global-materials.html)。正式场景继续保留黑白网络骨架，是否接入以上原色素材等待本轮视觉验收。

## AI 品牌整合轮的 StarryBlu 复核

后续交付补充：现已新增 [public/starryblu-card-sanitized.png](public/starryblu-card-sanitized.png)，离线导出自已验收的 Canvas 处理结果；印刷号码和姓名区域已在像素中替换，使用该文件时不依赖运行时遮罩。SHA256 与处理说明见 [public/manifest.json](public/manifest.json)。素材总览和 GitHub 缩略图直接采用该副本。原始卡面、原实验算法、相关数据及历史均未改写，旧实验仍保留原来的运行时采样以维持已验收画面。未来生产发布应只使用副本并排除未处理原件。

确认当前遮蔽只发生在运行时：`card-surface.js` 生成预览 Canvas 时替换区域，`card-particle.js` 的 Shader 采用同样的采样替换。`starryblu-card.png` 原始文件仍包含印刷号码和姓名；RGBA / 透明通道不构成脱敏。

此前官方 232×145 样张确实也展示了样例号码和姓名，但与本轮提供的 1010×608 图不是同一张卡面，号码也不同。不能据此证明提供图中所有字段均为已核验的公开演示数据；该图继续按“用户提供、原始发布出处未独立确认”记录，不将它认定为真实持卡人的信息，也不假称已完成公开演示来源核验。

将来生成公开生产资源时，应先生成并检查已处理的图像副本，生产页面只引用该副本，发布目录排除未处理原图；不能仅依赖前端 Canvas / Shader 遮罩隐藏原始图像内容。本轮不改卡面资产、实验代码、算法或测试结果。

## Global 第四领域的视觉用途（2026-10-17）

第四领域为“支付卡片”，保留 StarryBlu、招行万事达人民币 IC 借记卡（普卡）、Bybit Card 全部三图，分别用作海外实体卡、国内万事达借记卡、数字资产虚拟支付场景的代表性视觉素材。场景不是产品形态或业务互通的排他性判断。官方范围与核验来源见 [分类 manifest](../global/library-manifest.json) 和 [Global 交接文档](../../docs/GLOBAL-VISUAL-HANDOFF.md)：StarryBlu 官网同时提到实体 / 虚拟卡，并有筹备及监管许可条件；Bybit 官方帮助同时说明虚拟 / 实体卡与地区资格限制。三张源图、尺寸、处理规则与实验算法本轮均不变。
