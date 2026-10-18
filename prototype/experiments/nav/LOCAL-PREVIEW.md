# 项目内 Windows 预览

本目录是用户提供的 `nf-nav-prototype.zip` 原型，当前放在个人站点项目内独立审查，尚未替换正式导航。原 `README.md` 与 Linux / 软件渲染脚本保持原样；Windows 实测另见 `review/REPORT.md`。

在项目根目录运行：

```powershell
pwsh -File scripts/preview-nav.ps1
```

脚本寻找已检出的 `origin/main` 工作区并只读加载。当前项目根 `index.html` 仍是用户未提交的 Prototype 01，**不要直接以当前目录作为 `--site`**。当前 main 在独立工作区，提交为 `7b7e53b2be1610f18f112f37cd00b58fae4012a1`。

如主线工作区位于其他地方：

```powershell
pwsh -File scripts/preview-nav.ps1 -SitePath '你的干净 main 工作区路径' -Port 4190
```

新克隆只有功能分支、尚无 main 工作区时，可以先 `git fetch origin`，再执行 `git worktree add ../personal-site-main origin/main`，随后以 `-SitePath ../personal-site-main` 启动。该操作不会覆盖当前目录的未提交首页。

- A 叠加真实首页：<http://127.0.0.1:4190/nav/onsite/index.html?scheme=a>
- B 叠加真实首页：<http://127.0.0.1:4190/nav/onsite/index.html?scheme=b>
- 实验控制台：<http://127.0.0.1:4190/nav/lab/index.html>
- 本机截图与报告：<http://127.0.0.1:4190/nav/review/index.html>

`/nav/` 映射到本目录，其余资源来自 main。旧 HUD 只在 iframe 中隐藏，主线代码和线上部署均不变。退出服务器按 Ctrl+C；默认端口被占用时可指定其他端口。

Windows 回归脚本在 `tests/nav-review/`，沿用项目已有 Playwright / Chromium 环境；不要直接运行原包写死 `/usr/local/bin/chromium` 和 SwiftShader 的脚本来声称真机性能。
