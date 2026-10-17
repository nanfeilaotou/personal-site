# Network 候选素材

核验：2026-10-17。所有文件保留原始字节，SHA256、固定 revision、资源 URL、身份说明见 [manifest.json](manifest.json)。这里准备四个指定项目的五份候选，不决定下一轮最终名称。

|候选|本地文件|上游与身份|许可 / 限制|
|---|---|---|---|
|Clash Verge|`clash-verge.svg`|[原项目 v1.3.8 固定源码](https://github.com/zzzgydi/clash-verge/blob/b5391560fcbca6eb04c76502b9828dd29ca6546c/src/assets/image/logo.svg)。原仓库已归档，默认分支不再保留完整历史代码，故从发布标签取图。|GPL-3.0 仓库；许可保存在 `licenses/clash-original`，未发现另行商标授权。|
|Clash Verge Rev|`clash-verge-rev.png`|[延续项目固定源码](https://github.com/clash-verge-rev/clash-verge-rev/blob/cef66cd745ef29aa98e219ffb083b62e13c959e8/src-tauri/icons/icon.png)，512×512，透明。独立列为延续项目，不能静默替代原名称。|GPL-3.0，`licenses/clash-rev`。上游另有横向字标 SVG，含局部 use，本轮选用原始 PNG，未改写 SVG。|
|FlClash|`flclash.svg`|[用户指定的上游 glyph.svg](https://github.com/chen08209/FlClash/blob/8d4f9744948751f1273fe871e1d05276fac09b0e/assets_source/images/icon/glyph.svg)，240×240 矢量，由两条圆端线与圆点组成；保留原始蓝色。|GPL-3.0，`licenses/flclash`；不重新描绘、不冒用相似项目图标。|
|Shadowrocket|`shadowrocket.jpg`|[App Store ID 932747118](https://apps.apple.com/us/app/shadowrocket/id932747118)，名称 **Shadowrocket**，开发者 / Seller **Shadow Launch Technology Limited**，bundle ID `com.liguangming.Shadowrocket`。图来自 Apple lookup 返回的 artworkUrl512，与该产品对应。|512×512 JPEG，自带应用白底，不是透明图；未伪造透明版本。App Store 产品图，权利保留，未找到开放再使用许可。|
|v2ray / V2Fly 文档候选|`v2ray.png`|[V2Fly 官方文档仓库固定资源](https://github.com/v2fly/v2fly-github-io/blob/094c084eef448fc573f2228acc847911ca78ae11/docs/.vuepress/public/v2ray.png)，896×896 RGBA。V2Fly 为 V2Ray 社区延续项目；此图不代表 v2rayN 或 v2rayNG 客户端。|文档仓库 CC-BY-SA-4.0，保留 `licenses/v2fly-doc` 与来源署名；未发现另行商标许可。|

SVG 检查拒绝脚本、事件属性、外部 href / url、foreignObject 和嵌入 image / use；只允许存在于文件内的渐变 / 裁切引用。没有运行下载的代码、安装应用或添加运行时第三方脚本。

待确认：

- 展示名使用历史 **Clash Verge**，还是 **Clash Verge Rev**；目前两者分列。
- “v2ray”是否指核心项目 / V2Fly，还是某个具体客户端。没有自行用客户端 Logo 替代。

`IP / Proxy / VPS / Routing / Remote` 保留为通用概念，不硬套品牌。官方公开文件与仓库代码许可不等于额外的商标、赞助或合作授权；原图、署名和许可均随素材保留。
