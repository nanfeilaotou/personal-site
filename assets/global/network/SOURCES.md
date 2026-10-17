# Network 正式素材与历史记录

核验与用户定稿：2026-10-17。正式展示顺序为 **Clash Verge Rev、FlClash、Shadowrocket、v2rayN**。所有原文件保持上游字节，不改色、不重绘、不放大。固定 revision、下载 URL、SHA256 和尺寸见 [manifest.json](manifest.json) 的 `selected`；旧候选单独放在 `historicalCandidates`，不参与素材总览的正式展示。

## 正式展示

|名称|本地文件 / 尺寸|固定来源与身份|许可 / 限制|
|---|---|---|---|
|Clash Verge Rev|[clash-verge-rev.png](clash-verge-rev.png)，512×512 透明 PNG|[Rev 官方仓库原图](https://github.com/clash-verge-rev/clash-verge-rev/blob/cef66cd745ef29aa98e219ffb083b62e13c959e8/src-tauri/icons/icon.png)，revision `cef66cd745ef29aa98e219ffb083b62e13c959e8`。沿用已有文件，用户已正式选定。|GPL-3.0 仓库；原文 [licenses/clash-rev](licenses/clash-rev)。未发现另行商标授权。|
|FlClash|[flclash.svg](flclash.svg)，240×240 矢量|[上游 glyph.svg](https://github.com/chen08209/FlClash/blob/8d4f9744948751f1273fe871e1d05276fac09b0e/assets_source/images/icon/glyph.svg)，revision `8d4f9744948751f1273fe871e1d05276fac09b0e`。保留原始蓝色。|GPL-3.0 仓库；[licenses/flclash](licenses/flclash)。|
|Shadowrocket|[shadowrocket.jpg](shadowrocket.jpg)，512×512 JPEG|[App Store ID 932747118](https://apps.apple.com/us/app/shadowrocket/id932747118)。开发者 / Seller **Shadow Launch Technology Limited**，bundle ID `com.liguangming.Shadowrocket`。Apple lookup 的 artworkUrl512 原图。|自带应用白底，非透明，未伪造透明版。产品图权利保留，未找到开放再使用许可。|
|v2rayN|[v2rayn.png](v2rayn.png)，256×256 透明 PNG|[2dust/v2rayN 官方桌面项目原图](https://github.com/2dust/v2rayN/blob/1f083adbe42cfe46ab55249768f6f1976ae233cf/v2rayN/v2rayN.Desktop/v2rayN.png)，revision `1f083adbe42cfe46ab55249768f6f1976ae233cf`。不是 V2Fly、Xray-core 或 v2rayNG 图标。|GPL-3.0 仓库；固定 revision 的 [LICENSE](https://github.com/2dust/v2rayN/blob/1f083adbe42cfe46ab55249768f6f1976ae233cf/LICENSE) 原文保存在 [licenses/v2rayn](licenses/v2rayn)。未发现图标单独授权或额外商标许可。|

## v2rayN 原图检查

- 网页使用上游 PNG 原字节：索引色 PNG，透明通道范围 0–255，可见边界 `(1,2)–(255,254)`，原始分辨率 256×256。审查页显示约 82 CSS px，在 2× DPI 下仍不需要放大原图。
- 同时保存指定 [Assets/v2rayN.ico](https://github.com/2dust/v2rayN/blob/1f083adbe42cfe46ab55249768f6f1976ae233cf/v2rayN/v2rayN.Desktop/Assets/v2rayN.ico) 为 [v2rayn.ico](v2rayn.ico)。含 16、24、32、48、64、256 px 六档，最大档也为 256×256；没有从小图生成伪高清版本。
- PNG SHA256：`dc5577105e8806e4ac70137052ddb796734b773888d7bc39a454cb0f1c0d7f31`。
- ICO SHA256：`1c41e4e4df0c16f0536005eb7f9f9f3806a999e70b70a3b79c0378cb7ff5132f`。
- 两份图与许可均从同一固定 revision 取得；manifest 还记录许可原文 SHA256。

## 历史候选（不用于最终展示）

|名称|保留文件 / 来源|保留原因与许可|
|---|---|---|
|Clash Verge 原项目|[clash-verge.svg](clash-verge.svg)，[v1.3.8 固定源码](https://github.com/zzzgydi/clash-verge/blob/b5391560fcbca6eb04c76502b9828dd29ca6546c/src/assets/image/logo.svg)|已由用户选择 **Clash Verge Rev**。历史归档项目仅供追溯；GPL-3.0，[licenses/clash-original](licenses/clash-original)。|
|v2ray / V2Fly 文档标识|[v2ray.png](v2ray.png)，896×896 RGBA，[固定文档仓库资源](https://github.com/v2fly/v2fly-github-io/blob/094c084eef448fc573f2228acc847911ca78ae11/docs/.vuepress/public/v2ray.png)|最终选择 **v2rayN**。本图不代表桌面客户端；文档仓库 CC-BY-SA-4.0，保留来源署名及 [licenses/v2fly-doc](licenses/v2fly-doc)。|

## 审查与使用边界

[Global 素材总览](../../../prototype/experiments/global-assets.html) 对四个正式图标提供深色 / 暖白背景并排显示，原图不使用滤镜。SVG 检查拒绝脚本、事件属性、外部 href / url、foreignObject 和嵌入 image / use；只允许文件内的渐变 / 裁切引用。没有运行下载的代码、安装应用或加入运行时第三方脚本。

`IP / Proxy / VPS / Routing / Remote` 继续作为通用概念。官方公开文件和仓库代码许可不等于额外商标、赞助或合作授权；原图、来源和许可随素材保留。本轮没有修改正式 Global、AI、卡面模块或首页时间轴。
