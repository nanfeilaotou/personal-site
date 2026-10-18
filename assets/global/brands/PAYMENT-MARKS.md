# Apple Pay / Google Pay 官方标识来源与使用记录

核验：2026-10-17。两份 SVG 均从用户指定的官方品牌页下载包中直接提取，保留原始字节。未改形状、配色、轮廓、留白或添加视觉效果；无脚本、事件、外部引用、嵌入图片或字体依赖。包内文件名、包 SHA256、SVG SHA256 与大小见 [Global manifest](../manifest.json)。

Google SVG 的官方原始行尾含额外 CR 字符，未为消除 Git 空白提示而改写；`.gitattributes` 仅对该原始文件豁免空白检查，仍由 SHA256 与 SVG 安全检查核对内容。

|名称|官方来源与下载|本地文件|
|---|---|---|
|Apple Pay|[Apple Developer 品牌规范](https://developer.apple.com/apple-pay/marketing/) → [Apple-Pay-Mark.zip](https://developer.apple.com/apple-pay/marketing/Apple-Pay-Mark.zip)，成员 `Apple Pay Mark/SVG/Apple_Pay_Mark_RGB_041619.svg`|[apple-pay.svg](apple-pay.svg)，viewBox `0 0 165.52107 105.9651`|
|Google Pay|[Google Pay API 品牌规范](https://developers.google.com/pay/api/web/guides/brand-guidelines) → [Google-Pay-Acceptance.zip](https://developers.google.com/static/pay/api/download-assets/Google-Pay-Acceptance.zip)，成员 `Google-Pay-Acceptance/Google-Pay-Acceptance/Google Pay Mark/google-pay-mark_800.svg`|[google-pay.svg](google-pay.svg)，viewBox `0 0 1094 742`|

## 权利与呈现规则

这是官方商标素材，权利分别属于 Apple Inc. 与 Google LLC，依各自品牌规范使用；未找到赋予通用自由修改、再授权的开放许可。Google 开发文档的 CC BY / 代码 Apache 许可不能被解释为商标图形的同等许可。此处整理素材供设计审查，不表示本站已接入支付，也不声称品牌授权、合作或卡片绑定资格。

- **Apple Pay**：使用 Apple 提供的带边框白底标识，保持比例、圆角及原始图形。四周净空至少为标识高度的 1/4，浅色背景优先，也可用于深底。不得重绘、翻转、旋转、动画化，或添加阴影、发光、反射等效果；不能改成孤立 Apple 图标或自制付款按钮。后续正式使用应符合与 Apple Pay 相关的内容语境。
- **Google Pay**：使用提供的 acceptance mark，不改变外轮廓、颜色或字体。四周至少保留大写 G 高度的 1/2 净空，与其他支付身份保持相当的可见尺寸。使用完整名称；标识与支付按钮用途不同，实际支付按钮必须触发 Google Pay API。
- **本地审查**：两份标识均在纯白和深色背景上静态显示，不使用滤镜、裁切、混合模式、缩放动画或点击付款行为。Google SVG 自带较大留白，按整份 SVG 等比例调整 CSS 尺寸以使实际图形可读，不改 viewBox。两个标识原有的白色底形属于官方图形，不应像卡面外部白角一样移除。

## 素材库分类边界

第三领域“账户与钱包”内部区分 **账户资金服务**（iFAST Global Bank、Wise、PayPal）和 **钱包快捷支付**（Apple Pay、Google Pay）。Wise 不称作传统银行；PayPal 在此按账户 / 支付服务整理，不否认其其他功能。分组不是互通清单，不表示任意账户、钱包和下方卡片已支持充值、转账、绑卡或结算连接。实际支持范围需逐地区、发卡机构与产品另行核实。
