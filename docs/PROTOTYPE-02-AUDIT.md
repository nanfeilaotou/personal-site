# Prototype 02 审计（2026-10-16）

## 基线与 Git

- 输入是本地 783 行单文件 `index.html`，SHA256 `BFC193B140D94B8669327F71A677D68F84DB19F573E262119C53894CDE4D1711`。
- 原目录没有 `.git`。接入远端 `nanfeilaotou/personal-site` 后以 `01cfd56` 为分支基线；远端 index 是 23 行占位主页，与本地原型不同。
- `prototype/prototype-01.html` 是本地原件的完整副本。根 index 的差异是接入 Git 前已有的本地内容，不纳入本次提交。
- 远端没有构建配置、依赖或部署工作流；本轮只创建原型与静态资源，不替换生产入口。

## 实现核对

- 固定 `#stage`，`#track` 提供 11.1 屏滚动；唯一进度 `sd` 由 scrollY 插值得出，`?at`、`?it`、`?debug` 为原调试入口。
- 原生 WebGL 一个 context，两个 Shader、一个交错 buffer、单次 POINTS draw。几何字形固定种子采样，最多 42,000 字形点，加 1,400 环境点。鼠标排斥、速度故障感、7 层纵深及坍缩都在原 VS。
- `#grain` 的随机纹理配合 `.8s steps(5)` 平移是躁动来源，与粒子无依赖。
- `sceneRise` 在 .84–1.95 完成点到线；`sceneModels` 在 1.95–4.6 是 Token / Embedding / Attention / Sampling；`sceneEco` 4.44–5.18 仅四个具名节点。
- `sceneLocal` 4.98–6.36 包括 24×24 数值方格、量化扫描、144×144 缓存去噪、四个工作流节点。图像去噪与权重量化必须明确分开，内存数字只能称示意。
- `sceneAgents` 6.25–7.56 是 3×4 线到 MCP 总线、脉冲及 Harness 边界。
- `sceneBridge` 7.44–8.06 黑白幕切换，`sceneGlobal` 8.04–9.46 四层网络。`poly` 也被 Global 使用，不能随旧 Agent 场景删除。
- `sceneField` 9.44–11.1、`PEW`、DOM 个人入口相关联。Global / Field 保留内部时间参数，通过统一映射兼容新 AI 长度。
- UI 混色层不适合彩色 Logo，交互另建 normal 混色层。原 hash 无定位实现；原 reduced-motion 仅跳过插值、仍持续漂动；原 WebGL 失败首屏无字形。

## 决策与风险

完整保留 Shader、字形、粒子采样、原 Local 核心、Global、Field。替换背景、模型教学和 Agent 协议教学；重写 DOM 数据、坐标、浮层和导航。继续使用原生 WebGL + Canvas + DOM，无新 WebGL context，无 GSAP / Three.js / React。新时间轴保持唯一 `sd`，旧章节使用纯映射而非另起时钟。稳定阶段固定坐标；同一投影结果同时用于 Canvas 与 DOM。

重点回归：确定性首屏 GL 像素、鼠标进入/离开、随机定位和反向滚动、旧章节映射交界、节点命中与浮层、窗口重排与降级。
