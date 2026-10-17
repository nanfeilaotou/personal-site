# Global / AI 原色素材来源

> 此文件保留上一轮资源记录。当前实验使用的新卡面、招行蓝卡及 Global 原色品牌见 [本轮素材记录](../cards/SOURCES.md)。以下原始资源仍保留用于追溯与回归。

Global 素材库的 [Network 正式清单与许可](network/SOURCES.md) 已定稿为 Clash Verge Rev、FlClash、Shadowrocket、v2rayN。Clash Verge 原项目和 V2Fly 文档图仅保留为历史候选，不用于正式展示。统一入口为 [Global 总览](../../prototype/experiments/global-assets.html) 和 [Opus 交接文档](../../docs/GLOBAL-VISUAL-HANDOFF.md)；通信及账户原始文件没有重下载或修改。

新增 Apple Pay、Google Pay 原始官方 SVG 及使用规范见 [支付标识记录](brands/PAYMENT-MARKS.md)，原始下载包、成员文件及哈希见 [manifest](manifest.json)。Global 第三领域现为“账户与钱包”，第四领域为“支付卡片”；分组、三卡视觉用途与官方产品范围核验见 [素材分类 manifest](library-manifest.json)。不由并列展示推断品牌互通关系。

以下为此前素材获取与核验记录（2026-10-17），当轮下载了下列 7 份公开资源：三张卡面来源、两个通信 Logo、两个 AI 原色 Logo。原始下载字节与 SHA256 保存在 [manifest.json](manifest.json)。现有 Prototype 02 的 18 个单色 SVG 没有改动。

所有权利归对应品牌或摄影 / 设计权利人。官网公开可访问不等于开放许可；未找到可覆盖本项目自由修改、广告使用或再授权的通用许可。因此这些文件按“公开产品 / 媒体资源、权利保留”登记，当前只用于本次独立视觉研究。没有将其标为 MIT，也没有声称获得品牌合作或授权；正式站点接入前需按所选场景继续核对品牌规范。

## 原始文件

|文件|名称与原始规格|原始资源 URL|来源页面|
|---|---|---|---|
|`assets/brands/workbuddy-color.svg`|Tencent WorkBuddy · SVG · 保留官方配色与 viewBox|[原始资源](https://assets.workbuddy.cn/web/workbuddy/ec2f30bd9f775bc9a298ca138ab307c7be52a810/assets/logo.svg)|[官方页面](https://www.workbuddy.cn/)|
|`assets/brands/muse-color.svg`|Muse / Meta · SVG · 保留官方配色与 viewBox|[原始资源](https://introducing.muse.ai/landing/MuseLogo.svg)|[官方页面](https://introducing.muse.ai/)|
|`assets/global/cards/starryblu-starry.png`|Starryblu / Starry 官网样张 · 232×145 · P · 有透明通道|[原始资源](https://h2static.wotransfer.com/test/blue/home/home_card1.png)|[官方页面](https://www.starryblu.com/)|
|`assets/global/cards/bybit-georgia.png`|Bybit Card / Georgia 官方发布图 · 1600×900 · RGB · 无透明通道|[原始资源](https://www.bybit.com/common-static/fht-static/cms/cs-assets/blt4ef4a5078d90ca4d/ade0ec3552025470444595d320c19982.png)|[官方页面](https://www.bybit.com/press/post/bybit-expands-payment-solutions-with-launch-of-bybit-card-in-georgia-blt19fb415e399f34d8)|
|`assets/global/cards/monzo-perks.avif`|Monzo Perks / Mastercard 官网卡面 · 1230×786 · RGBA · 有透明通道|[原始资源](https://images.ctfassets.net/ro61k101ee59/1gemwJqJIKJLaGCyjWB4Fk/f84de96a473328b454dfa34bc6f173e4/blue-coral-card-overlay.avif)|[官方页面](https://monzo.com/current-account)|
|`assets/global/brands/clubsim.png`|Club Sim / HKT · 210×88 · RGBA · 有透明通道|[原始资源](https://www.clubsim.com.hk/en/Common/btn_menu_logo@2x.png)|[官方页面](https://www.clubsim.com.hk/en/)|
|`assets/global/brands/smart.png`|Smart Communications / Philippines · 299×78 · RGBA · 有透明通道|[原始资源](https://store.smart.com.ph/on/demandware.static/-/Sites-smart-Library/default/dw67fc73eb/images/homepage/header/smart-logo.png)|[官方页面](https://store.smart.com.ph/)|

## 三张卡面如何使用

### Bybit Card / Georgia

官方发布页为 2026-01-28 的 Georgia 发卡新闻。保存的是完整 1600×900 官方宣传图，不是用户卡片照片。图中的卡面没有卡号、姓名或有效期。

实验读取图中的完整卡面四角，通过单应矩阵在 Shader 中直接取样原图；原文件未裁切、未重绘、未改色。画面边界内缩 .9% 以避开摄影背景，并使用圆角遮罩。按银行卡名义宽高比 1.586 展开，这是实验的透视还原参数，不是声称已取得官方透明正面。

**清晰度限制**：完整宣传图为 1600px 宽，但卡面本身只占约 450–500px。不能把宣传图的总分辨率当作卡面的有效分辨率。当前限制展示宽度 440 CSS px，并标记高清正面待补；未使用 AI 放大或锐化伪装成高清。

### Monzo Perks / Mastercard

来源为 Monzo 官方 current-account 页实际加载的 `blue-coral-card-overlay.avif`。原始 1230×786，透明背景，卡面无卡号、有效期、持卡人姓名。保持原始宽高比和颜色。清晰阶段直接上传原始图片到 WebGL，不经过 960px 缩图或二次重采样。

默认最大展示为 615×393 CSS px，在 DPR 2 对应 1230×786 设备像素。此图是当前实验的默认高清验证素材，不代表 Bybit 或 Starryblu 的卡面。

### Starryblu / Starry 样张

来源为 Starryblu 官网套餐区的原始 232×145 PNG。官网同页仍包含卡项目筹备提示，因此只按“官网样张 / 视觉参考”记录，不推断服务已正式发行。

原图含官网演示数字与姓名。素材清单 Canvas 和实验 Shader 都在显示前遮蔽这些区域；不使用真实用户的卡号或个人截图。原始文件仍完整保留，便于核验来源。原图清晰度不足以支撑大幅卡面，当前只作为低清来源样本，后续需取得高清授权正面。

## AI 原色候选

- **Tencent WorkBuddy**：直接来自官网实际引用的 SVG，保留渐变、滤镜、裁切和原始颜色。内部 `url(#id)` 均仅引用本文件已定义节点；无脚本、外部图片或事件属性。
- **Muse / Meta**：来自官方设计说明网站的 `MuseLogo.svg`，保留蓝色渐变和透明背景。没有擅自转白或去色。
- **Grok Bot**：再次检查官方产品文档及下载页，未取得可确认的独立透明产品标志。页面继续使用名称，未用 Grok 模型或 Cursor 通用 favicon 代替。

对照 A 使用单色名称标识，悬停 / Tab 聚焦显示官方原色；对照 B 直接使用官方原色。A 不是伪称的“官方单色 Logo”。当前首页 `data/agents.js` 保持不变，等待视觉验收后再决定采用方式。

## 通信标识

Club Sim 与 SMART（Smart Communications / Philippines）从各自官方站点实际引用的透明 PNG 获取。两张均带白色文字，因此清单放在深色底上，未用滤镜改成黑色。今后用于 Global 的浅色舞台时，应取得官方深色版本或使用保留颜色的局部底色；不把本次实验视为品牌改色许可。

## 未采用的参考图

已查看 CouCouYa 与 CardFi 的首页、CardFi 拖拽画布及其公开素材索引。它们适合作为布局、卡面叠放、拖拽缩放、点击资料入口的参考，但不能直接推定全部图库均为官方卡面：公开索引中存在标为 reference 或含 AI 标识的资源。取样的 Starryblu / Bybit 平面参考图与官方样张有差别且缺乏逐图来源链，本轮没有放入素材库或主实验。

另查看 cryptocard.guide 的 Bybit 平面图，原始仅 600×381、缺少逐图版权来源，未将网站的 1080 / 3840 响应式请求参数当作真实原始分辨率。Mastercard 官方媒体库提供 card art 下载入口，但当前下载返回 403，未将未取得的资源列为已交付。

参考页面：[CouCouYa](https://card.coucouya.com/)、[CardFi](https://card-fi.com/)、[CardFi Canvas](https://card-fi.com/explore/canvas)、[Mastercard Media Resources](https://www.mastercard.com/news/press/media-resources/)。

## 安全与运行

原始 SVG 只通过本地 img 加载，保留官方颜色；检查脚本、事件、实体、外部引用以及本地引用完整性。所有新页面运行时只读取本地素材，没有第三方脚本或图床依赖。卡面取样需要 HTTP 同源环境；没有账户、表单提交、个人数据采集或自动播放声音。
