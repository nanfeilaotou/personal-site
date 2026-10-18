# Global「经由 / VIA」原型 · 评审包

- 解压到仓库根目录（personal-site/）即可：`prototype/experiments/` 下是 4 个原型文件和说明文档，只新增、不覆盖已有文件。
- 预览：`node scripts/serve.mjs` → http://127.0.0.1:4173/prototype/experiments/global-world.html
- 完整说明与 Codex 集成交接：`prototype/experiments/GLOBAL-WORLD-PROTOTYPE.md`
- `shots/`：关键截图（1440×900，移动端 390×844）。
- `dev-scripts/`：沙盒里用的 Playwright 截图 / 换卡回归脚本，仅供参考（写死了 `/usr/local/bin/chromium` 与 `/data/shots` 路径，运行前需要修改）。
  - `node shot.mjs 1440 900 1.40,3.30,4.25,6.12 key` 逐个 g 截图
  - `node switch.mjs 1440 900 seq|robust|slow|nogl|reduced|fps` 换卡时序与可靠性测试
- 评审包本身（global-world-review/）不需要提交到仓库。
