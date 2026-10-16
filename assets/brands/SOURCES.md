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

## 名称标识

DeepSeek Harness（DSH）、ZCode、Tencent WorkBuddy、Grok Bot、Muse（Meta）：已搜索官方站点和 Lobe SVG 目录；未取得具有清晰复用条件的专用产品 SVG。本轮使用真实名称排版，不伪造图标、不以提供商 Logo 冒充产品 Logo。相关官方身份来源见 `data/agents.js`。这些是 Logo 待补齐项，非身份未确认项。

## 检查

下载器 `scripts/collect-brands.py` 拒绝脚本、foreignObject、image、use、事件属性、href/src、url() 和实体；本地 manifest 保存来源、日期、SHA256。运行时只通过本地 img 加载；没有远程图床或第三方脚本。所有 SVG 内容另由静态检查脚本复查。
