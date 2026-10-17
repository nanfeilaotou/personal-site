# Global Connectivity：通讯与社交官方素材

下载与资料核验：2026-10-17。新增五个平台，主要展示 WhatsApp、Telegram、LINE；Instagram、Facebook 为辅助社交账号语境。通信运营商仍保留 ClubSIM、SMART。**这不是“七个平台都必须手机号注册”的清单**，也不保证任一运营商的全部号码均能注册或接收验证。

## 原始文件与来源

|平台|本地原始素材|官方来源 / 包内成员|尺寸|
|---|---|---|---|
|WhatsApp|[whatsapp.svg](whatsapp.svg)|[Meta 官方品牌页](https://www.meta.com/brand/resources/whatsapp/whatsapp-brand/) 当前下载包，`Brand Resource Center Page Downloads/01_Glyph/01_Digital RGB/03_SVG/Digital_Glyph_Green_RGB_2026.svg`|SVG，viewBox 720×720|
|Telegram|[telegram.svg](telegram.svg)|[Telegram Press · Logos](https://telegram.org/press#telegram-logos) 的 [官方包](https://telegram.org/file/464001088/1/bI7AJLo7oX4.287931.zip/374fe3b0a59dc60005)，`Logo.svg`；不使用同包 `Logo_old.*`|SVG，viewBox 1000×1000|
|LINE|[line.png](line.png)|[官方 Logo 页](https://www.line.me/en/logo) → [LINE_Brand_icon.zip](https://www.line.me/static/logo/top/LINE_Brand_icon.zip)，`LINE_Brand_icon.png`|1001×1000 RGBA，有实际透明通道|
|Instagram|[instagram.png](instagram.png)|[Meta 官方品牌页](https://www.meta.com/brand/resources/instagram/instagram-brand/) 当前下载包，`01 Static Glyph/01 Gradient Glyph/Instagram_Glyph_Gradient.png`|5000×5000 RGBA，有实际透明通道|
|Facebook|[facebook.png](facebook.png)|[Meta 官方 Logo 页](https://www.meta.com/brand/resources/facebook/logo/) 当前下载包，`Facebook Brand Asset Pack/Logo/Primary Logo/Facebook_Logo_Primary.png`|2084×2084 RGBA，官方蓝圆与白色 f|

原始 ZIP URL、下载日期、ZIP / 成员 SHA256、字节数、透明度、尺寸和限制逐项记录在 [manifest.json](manifest.json)。Meta 的下载链接带公开 CDN 查询签名，可能过期，品牌页为重新获取入口；运行时仅引用本地文件。五份展示文件均为原始成员字节，未重绘、改色、裁切、压缩或添加效果。原始 SVG / PNG 自身也是源文件；Facebook 另保留可编辑 [官方 AI 源文件](source-files/facebook-primary.ai)，其来源成员和 SHA256 在 manifest 中，审查页不执行或嵌入它。

Instagram 同包彩色 SVG 约 10.9MB，含嵌入栅格，不视为轻量纯矢量；因此使用同包官方透明 PNG（约 2.65MB）并保留原始分辨率。当前仅静态素材审查，未来生产尺寸优化需另核对规则，不能冒称已有更轻的官方矢量。SVG 已检查无脚本、事件、外部引用、image / use；Telegram 渐变只引用文件内 ID。

## 应用关系核验

|平台|可写入内容的边界|官方资料|
|---|---|---|
|WhatsApp|手机号注册与验证关系明确，需本人可控且受支持的号码；不承诺任意 VoIP 或海外号码可用。|[注册手机号](https://faq.whatsapp.com/684051319521343/)|
|Telegram|账号关联手机号，验证码接收可能使用已登录客户端等渠道，不能将所有验证写死为短信。|[FAQ · Login and SMS](https://telegram.org/faq#login-and-sms)|
|LINE|香港、日本、韩国、台湾、泰国可按官方流程验证手机号；其他地区从 13.11.0 起停止手机号新注册，转为 Apple / Google。不能概括为所有地区都支持手机号注册。|[创建账号](https://help2-o.line.me/line/smartphone?contentId=20001192&lang=en)|
|Instagram|仅作账号 / 社交生态辅助展示；官方账号恢复说明涉及邮箱或手机号，不写为必须手机号注册。|[账号访问资料](https://www.facebook.com/help/instagram/358911864194456)|
|Facebook|仅作账号 / 社交生态辅助展示，不建立手机号必需前提。创建账号帮助页本次跳转登录，未据此声称核验了具体注册流程；`scopeVerifiedAt` 如实为空。|[官方帮助入口](https://www.facebook.com/help/188157731232424)|

资料核验不是产品可用性、注册成功率、任何具体号码套餐或账号条件的保证。以上说明供 Opus 理解内容关系，不制作部署或注册教程。

## 许可、规范与文字后备

没有将这些商标登记为 MIT、CC0 或通用开放许可；从官网取得文件也不等于任意商业使用授权。详细 `license`、`usageRestrictions`、`publicUseStatus`、`fallbackText` 见 manifest。

- **WhatsApp**：仅使用官方资源，保持原图 / 配色，不拼接成新标识，不暗示合作、背书；商品、影视等指定用途需另行许可。品牌不得压过本站主体。
- **Telegram**：Press 页面明确允许文章插图、图表等用途，但必须让读者知道不是官方代表。截图的 public-domain 表述不能套到 Logo；也不应拿官方图标冒充本站或第三方客户端身份。
- **LINE**：LY Corporation 保留权利；按官方 guideline 原样使用，禁止膨胀、旋转、装饰等 Logo 自身动画与效果。保留隔离区，桌面不低于 20px、移动不低于 40px；媒体或不明确的最终语境按官方联系入口确认。
- **Instagram**：仅用品牌中心素材、不暗示合作；广播、户外及大于 A4 印刷等指定用途需申请，影视等情况按官方流程审核。不把当前静态素材审查当作将来所有电影式网页呈现均已获批。
- **Facebook**：保留当前官方蓝圆与白色 f，完整使用，不抽出 f、不改色、不加阴影或 3D；净空至少宽度 1/4，数字最小宽 16px。特定赞助或影视用途另按官方规则确认。

本轮静态审查保留独立分组、充足留白与图下名称，不把名称拼进 Logo。纯白背景用于检查原色对比，无图形滤镜、变形或混合模式。生产接入前需按最终语境核对各品牌条件；若许可不明确，采用 manifest 的原名文字后备。审查页提供 `?textOnly=1`，五个平台仅显示文字且不请求其图片；任意图像失败时也自动使用原名。它不是规避条件或已有正式授权的声明。

## 2026-10-18 首页性能派生

正式整合页的 Instagram 使用 [derived/instagram-512.png](derived/instagram-512.png)：由此处官方 5000×5000 透明 PNG 经浏览器 Canvas 2D 高质量等比例采样为 512×512，未裁切、重绘、改色或加效果。原件及独立 Opus 基线不改；派生文件不冒称官网直接下载。原件 / 派生 SHA256、尺寸、用途见 [derived/manifest.json](derived/manifest.json)。
