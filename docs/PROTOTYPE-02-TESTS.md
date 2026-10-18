# Prototype 02 实测报告

> 2026-10-17 已完成精修：当前为 10.58 屏，新增 DSH / ZCode 标志。以下是首轮记录；当前范围、文案和测试以 [精修交付](PROTOTYPE-02-REFINEMENT.md) 为准。

日期：2026-10-16。完整记录见 [results.json](../tests/results.json)，截图见 [visual-report.html](../tests/visual-report.html)。

## 环境与覆盖边界

Windows；headless Chromium 153.0.8010.12；ANGLE / NVIDIA RTX 4080 Laptop GPU / D3D11。桌面 DPR=1。额外测试 390 × 844 触摸视口，以及 device DPR=2.5 时的 DPR=2 上限。未测试真实手机、Firefox、Safari 或低性能 GPU。连续小滚动由浏览器 wheel 输入模拟，不代表实测物理触控板。

静态页面 → 本地数据脚本与 SVG → 滚动投影 → DOM 节点 → 品牌详情与官方链接，是本次端到端验证路径。无后端、无第三方在线运行依赖、无密钥。预览服务成功返回 HTML / JS / CSS / SVG；正常浏览期间 Console 与网络没有未预期错误。另有故意中断一张 SVG 的独立后备测试。

## 性能采样

每个分辨率分别在开场、模型、Local、Agent、Global 稳定画面预热后采样约 1.2 秒，帧间隔和 rAF 回调 CPU 耗时分别记录。不是用原 debug FPS 插值值充当统计。GPU 对开场 POINTS draw 使用 EXT_disjoint_timer_query，每个分辨率取 120 次，无 disjoint。

|分辨率|观察到的 rAF FPS 范围|各场景回调 CPU p95 范围|采样期间长任务|粒子总数|粒子 buffer|GPU draw 平均 / p95|
|---|---:|---:|---:|---:|---:|---:|
|1920 × 1080|238.3–240.0|0.5–0.8 ms|0|41,853|1,506,708 B|0.0184 / 0.0236 ms|
|1440 × 900|239.2–240.0|0.4–0.7 ms|0|29,693|1,068,948 B|0.0153 / 0.0205 ms|
|1366 × 768|239.2–240.0|0.4–0.7 ms|0|21,930|789,480 B|0.0104 / 0.0143 ms|

GPU 计时仅覆盖原粒子 draw，不含 clear、Canvas、DOM 或浏览器合成；buffer 数字为已分配的交错顶点 buffer，不能据此宣称总 GPU 显存占用。rAF 频率受本机 headless 刷新节奏影响，不保证其他设备的帧率。没有观察到稳定采样期间超过 50ms 的 Long Task，这不等于所有导航与系统负载下都无卡顿。

## 粒子视觉回归

在两版上注入完全一致的时间、滚动、intro 与鼠标输入，实际读取 WebGL framebuffer，计算 SHA256。三个桌面分辨率首屏、中间鼠标排斥和移开恢复均一致；1440 × 900 的 s=.32 / .72 纵深与坍缩画面也一致。原图像不是通过改写 Shader 模拟得到。VS、FS、buildPoints、drawGL 和 sceneGlobal 另经源码对比（仅规范化换行）确认一致。

|分辨率|s|原版 / 新版 GL SHA256|结果|
|---|---:|---|---|
|1920 × 1080|0|`5674423de8624128c1ec551beea85bf53f2e44bd7d4befa5d23b102c345f5b3e`|相同|
|1440 × 900|0|`202029f0c168b8eb32732fc221ecb653e7fe176cf91576a654c5f8df6aa55009`|相同|
|1440 × 900|0.32|`8518b3d74af7d4ac28c16a3d40edf736e651a1fe1337b1ef38d7bfe317967ec5`|相同|
|1440 × 900|0.72|`c7adea7331c8e785b51c02ff97e441e8ad00b1d9b35202f4d73527d723d594ea`|相同|
|1366 × 768|0|`d3b54c13341ca86e0219f5eb0c189dea49c61a503b43d70d91f4b213f681f754`|相同|

背景静止验证使用 Canvas 图层的合成截图：模型稳定区相隔 800ms 的像素完全一致。直接 Canvas readback 会改变 Chromium 的加速策略，因此未把 readback 后的细微栅格变化误判成动画漂移。新旧全屏截图同时保留，用于人工确认原噪点移除后的观感。

## 已实际检查的场景

- **GL pixel regression 1920×1080 s=0**：identical SHA256; repulsion/recovery checked at s=0。
- **GL pixel regression 1440×900 s=0**：identical SHA256; repulsion/recovery checked at s=0。
- **GL pixel regression 1440×900 s=0.32**：identical SHA256; repulsion/recovery checked at s=0。
- **GL pixel regression 1440×900 s=0.72**：identical SHA256; repulsion/recovery checked at s=0。
- **GL pixel regression 1366×768 s=0**：identical SHA256; repulsion/recovery checked at s=0。
- **local logo loading**：all 15 SVG assets loaded; 5 intentional name marks。
- **hover / focus / pin / small-scroll / Escape**：inspector remains usable across pointer gap and 35px scroll。
- **navigation / URL hash / browser back / refresh**：stable stops; refresh preserves manual scroll even when URL retains a chapter hash。
- **random seek / reverse / mid-animation pause**：16 positions reproduce the same transforms and chapter state。
- **wheel / continuous small deltas / rapid reversals**：single interpolated timeline settles at scroll position。
- **complete keyboard-accessible content index**：21 entries with official sources and product links。
- **10 resize cycles**：one WebGL context / one point buffer / fixed DOM count; no repeated allocations。
- **WebGL loss / restore**：fallback wordmark and restored buffer。
- **WebGL unavailable**：readable opening wordmark and fully usable content。
- **prefers-reduced-motion**：no animated navigation or idle time motion; all content readable。
- **390px mobile / touch access**：all nodes stay in viewport; tap opens pinned inspector without covering the trigger。
- **HiDPI cap**：device DPR 2.5 uses canvas DPR 2。
- **fresh hash / manual-scroll refresh**：hash initially seeks Agent hold; refresh retains subsequent manual Local position。
- **mouse inspector after touch fix**：hover and pointer transfer remain usable。
- **file:// direct preview**：local data scripts and SVGs load without fetch。
- **logo load failure**：visible product name and working inspector remain after an intentionally aborted SVG request。
- **console / network**：no unexpected errors or HTTP failures; broken SVG tested separately。
- **GPU timer query**：120 point-draw samples per desktop resolution; draw-only GPU timing excludes clear/compositing。
- **quiet background / stable hold**：Canvas-only compositor screenshots identical across 800ms at model hold; direct Canvas readback avoided because it changes acceleration。

## 修复与测试记录

桌面浏览测试完成后，触摸测试发现 pointerenter / focus 在点击前打开详情并遮挡触发按钮。已区分 mouse 与 touch 的打开方式，并让窄屏浮层在目标上方或下方出现。最终定向测试再次实际点击 Grok Bot / Codex、关闭和重开、检查鼠标转入链接，均通过。刷新测试还覆盖了 URL 保留 #agents、实际已经手动到 Local 的情况。

中间完整脚本曾因测试夹具及真实触摸问题退出；最终记录由桌面覆盖、修复后的 final-check 与 GPU 补测合并保存，不表示同一条命令从未失败。未把未测浏览器和未测硬件标记通过。

## 重跑

先运行 `node scripts/serve.mjs`。静态检查无需依赖：

```powershell
node tests/static-check.cjs
```

浏览器检查使用开发工具 Playwright，不进入网页运行依赖。当前机器可直接使用内置包；若换机器需配置可用 Playwright 和 Chrome 路径：

```powershell
$env:NODE_PATH = 'C:\Users\28919\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules'
$env:CHROME_PATH = 'C:\Users\28919\AppData\Local\ms-playwright\chromium-1243\chrome-win64\chrome.exe'
node tests/browser-check.cjs
node tests/final-check.cjs
node tests/gpu-check.cjs
```

后两条读取前一阶段的 results.json 并补充记录。网页本身不需要安装 Playwright。
