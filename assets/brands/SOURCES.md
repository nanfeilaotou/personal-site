# 品牌素材来源

获取日期：2026-10-16。Lobe Icons 固定版本 `8a1b2821bb768c484fe8da20c5e1838b6bf551a9`。实际下载、检查的 15 个 SVG 如下；不是只按库名称推断存在。

许可：MIT，完整版权和许可保存在 [LICENSE-lobe-icons](LICENSE-lobe-icons)。MIT 不授予第三方商标权；仅用作对应产品的识别，不暗示赞助。各品牌名称和标志权利仍归其所有人。使用上游单色版本，仅将 currentColor 固定成中性白，保持路径、比例。无重绘、裁剪、彩色标志混色。无额外品牌使用权承诺。

|本地文件|原始来源|处理|
|---|---|---|
|openai.svg|[固定原始 SVG](https://raw.githubusercontent.com/lobehub/lobe-icons/8a1b2821bb768c484fe8da20c5e1838b6bf551a9/packages/static-svg/icons/openai.svg)|路径未改，currentColor → #ededeb|
|claude.svg|[固定原始 SVG](https://raw.githubusercontent.com/lobehub/lobe-icons/8a1b2821bb768c484fe8da20c5e1838b6bf551a9/packages/static-svg/icons/claude.svg)|路径未改，currentColor → #ededeb|
|grok.svg|[固定原始 SVG](https://raw.githubusercontent.com/lobehub/lobe-icons/8a1b2821bb768c484fe8da20c5e1838b6bf551a9/packages/static-svg/icons/grok.svg)|路径未改，currentColor → #ededeb|
|gemini.svg|[固定原始 SVG](https://raw.githubusercontent.com/lobehub/lobe-icons/8a1b2821bb768c484fe8da20c5e1838b6bf551a9/packages/static-svg/icons/gemini.svg)|路径未改，currentColor → #ededeb|
|deepseek.svg|[固定原始 SVG](https://raw.githubusercontent.com/lobehub/lobe-icons/8a1b2821bb768c484fe8da20c5e1838b6bf551a9/packages/static-svg/icons/deepseek.svg)|路径未改，currentColor → #ededeb|
|zai.svg|[固定原始 SVG](https://raw.githubusercontent.com/lobehub/lobe-icons/8a1b2821bb768c484fe8da20c5e1838b6bf551a9/packages/static-svg/icons/zai.svg)|路径未改，currentColor → #ededeb|
|qwen.svg|[固定原始 SVG](https://raw.githubusercontent.com/lobehub/lobe-icons/8a1b2821bb768c484fe8da20c5e1838b6bf551a9/packages/static-svg/icons/qwen.svg)|路径未改，currentColor → #ededeb|
|kimi.svg|[固定原始 SVG](https://raw.githubusercontent.com/lobehub/lobe-icons/8a1b2821bb768c484fe8da20c5e1838b6bf551a9/packages/static-svg/icons/kimi.svg)|路径未改，currentColor → #ededeb|
|lmstudio.svg|[固定原始 SVG](https://raw.githubusercontent.com/lobehub/lobe-icons/8a1b2821bb768c484fe8da20c5e1838b6bf551a9/packages/static-svg/icons/lmstudio.svg)|路径未改，currentColor → #ededeb|
|comfyui.svg|[固定原始 SVG](https://raw.githubusercontent.com/lobehub/lobe-icons/8a1b2821bb768c484fe8da20c5e1838b6bf551a9/packages/static-svg/icons/comfyui.svg)|路径未改，currentColor → #ededeb|
|codex.svg|[固定原始 SVG](https://raw.githubusercontent.com/lobehub/lobe-icons/8a1b2821bb768c484fe8da20c5e1838b6bf551a9/packages/static-svg/icons/codex.svg)|路径未改，currentColor → #ededeb|
|claudecode.svg|[固定原始 SVG](https://raw.githubusercontent.com/lobehub/lobe-icons/8a1b2821bb768c484fe8da20c5e1838b6bf551a9/packages/static-svg/icons/claudecode.svg)|路径未改，currentColor → #ededeb|
|hermesagent.svg|[固定原始 SVG](https://raw.githubusercontent.com/lobehub/lobe-icons/8a1b2821bb768c484fe8da20c5e1838b6bf551a9/packages/static-svg/icons/hermesagent.svg)|路径未改，currentColor → #ededeb|
|antigravity.svg|[固定原始 SVG](https://raw.githubusercontent.com/lobehub/lobe-icons/8a1b2821bb768c484fe8da20c5e1838b6bf551a9/packages/static-svg/icons/antigravity.svg)|路径未改，currentColor → #ededeb|
|notion.svg|[固定原始 SVG](https://raw.githubusercontent.com/lobehub/lobe-icons/8a1b2821bb768c484fe8da20c5e1838b6bf551a9/packages/static-svg/icons/notion.svg)|路径未改，currentColor → #ededeb|

## 2026-10-17 精修补充

现有 15 个 SVG 未重下载、未改路径、未改 viewBox；逐文件 SHA256 回归通过。显示问题通过节点的统一标识槽与逐品牌 CSS 比例修正：细线条、横向轮廓及复杂图形适当放大，保留透明留白，不裁切、不拉伸、不加统一圆框。

新增三个静态 SVG（两个用于节点，一个仅供审查核对）：

|本地文件|官方固定来源|许可 / 处理|
|---|---|---|
|`dsh-fish.svg`|[FishLogo.tsx](https://github.com/deepseek-ai/deepseek-harness/blob/1517a4dbca0a2789ff1d41ba439600f8547d23fa/packages/client/ui-primitives/src/FishLogo.tsx)|MIT，Copyright © 2026 DeepSeek；逐字提取 FISH_LOGO_PATH，保持 23.16:17.04 的原始 viewBox，官方 currentColor 解析为 #ededeb|
|`dsh-wordmark.svg`|[BrandWordmark.tsx](https://github.com/deepseek-ai/deepseek-harness/blob/1517a4dbca0a2789ff1d41ba439600f8547d23fa/packages/client/ui-primitives/src/BrandWordmark.tsx)|MIT；完整字标用于品牌审查页，保留路径、局部 clipPath 与 182:24 比例；解析官方正反色 token，没有重画字标|
|`zcode.svg`|[ZCodeAboutLogo.tsx](https://github.com/zai-org/ZCode/blob/aac4755666d09fdcd70272fcf063c077a639015f/packages/ui/src/components/ui/ZCodeAboutLogo.tsx)|Apache-2.0，Copyright © 2026 Z.AI Co., Ltd；提取独立产品组件的首个 SVG，三条路径与 256:218 viewBox 不变，官方 currentColor 解析为 #ededeb|

完整许可分别保存在 [LICENSE-deepseek-harness](LICENSE-deepseek-harness)、[LICENSE-zcode](LICENSE-zcode)。以上静态提取与 token 解析均属于已标明的修改；源代码资源的版权与许可仍保留。静态 SVG 不携带或执行 TSX / React 代码。

DSH 节点使用官方 FishLogo，并配合完整产品名称，不将 DeepSeek 模型图标代称为一个新图标。已阅读 [官方品牌规范](https://github.com/deepseek-ai/deepseek-harness/blob/1517a4dbca0a2789ff1d41ba439600f8547d23fa/BRAND_GUIDELINES.md)：只作如实介绍和识别，不暗示官网、赞助、合作或授权，站名仍为 NANFEILAOTOU。

### 仍保留文字的三个产品

|产品|实际检查的官方资源|本轮处理原因|
|---|---|---|
|Tencent WorkBuddy|[官网](https://www.workbuddy.cn/) 链接到 [产品彩色 SVG](https://assets.workbuddy.cn/web/workbuddy/ec2f30bd9f775bc9a298ca138ab307c7be52a810/assets/logo.svg)，另查阅官方接入文档|对应独立产品，但为彩色渐变、包含滤镜与裁切；未确认可复用的官方单色版。保留 WorkBuddy + 产品全称，不强制去色|
|Grok Bot|[官方产品文档](https://cursor.com/docs/grok-bot)、[官方下载安装页](https://cursor.com/download/bot)|可辨识的公开资源为营销 OG 图片和通用站点 favicon，未核对到可复用的独立单色产品标志；不冒用 Cursor 或 Grok 模型图标|
|Muse|[官方设计资料](https://introducing.muse.ai/) 中的 [MuseLogo.svg](https://introducing.muse.ai/landing/MuseLogo.svg)|已确认是 Meta 的个人智能体，但公开标志为蓝色渐变。未确认单色使用条件，不强制改色；保留 Muse 名称，详情注明 Meta|

已再次核对 Lobe Icons 固定目录：没有上述五个缺失产品的专用静态 SVG。DSH / ZCode 本次从各自官方仓库补齐，其余三个为有记录的名称标识，不是伪造 Logo。

## 检查

原 Lobe 下载器 `scripts/collect-brands.py`（本轮未重跑） 拒绝脚本、foreignObject、image、use、事件属性、href/src、url() 和实体；本地 manifest 保存来源、日期、SHA256。运行时只通过本地 img 加载；没有远程图床或第三方脚本。所有 SVG 内容另由静态检查脚本复查。

新增字标的 `url(#id)` 只引用本文件声明的 clipPath；静态检查允许且逐一验证这种本地引用，继续拒绝所有外部引用与主动内容。品牌原始资源不使用 CSS filter 强制去色。

## 2026-10-17 原色候选实验

本轮后续：Grok Bot 已收到用户提供的透明图标，作为本地候选加入独立审查页；官方出处仍未单独确认，首页数据不变。Global 允许使用原色，新增 iFAST Global Bank、Wise、PayPal 官方透明 SVG，ClubSIM 沿用现有原色文件。详见 [当前素材记录](../cards/SOURCES.md)。

新增 `workbuddy-color.svg`、`muse-color.svg`，字节与官方原图一致，未改色；这两份为权利保留的官方公开资源，不属于上文 Lobe Icons 的 MIT 素材。来源、SHA256、使用边界见 [Global / 原色候选来源](../global/SOURCES.md) 及其 manifest。对照位于 `prototype/experiments/brand-color.html`。首页名称标识仍保留，未修改节点布局、运动或时间轴。
