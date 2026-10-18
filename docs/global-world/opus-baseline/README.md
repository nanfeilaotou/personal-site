# Opus Global World 已验收基线

2026-10-18，保存用户解压到本地仓库的完整独立作品，原始源码与说明位于 `prototype/experiments/global-world.*`、`global-card-adapter.js`、`GLOBAL-WORLD-PROTOTYPE.md`。源文件哈希见 [source-hashes.json](source-hashes.json)。本基线提交早于正式首页集成，便于回退与截图对比。

- [原始交接](../../../prototype/experiments/GLOBAL-WORLD-PROTOTYPE.md)
- [独立页面](../../../prototype/experiments/global-world.html)：启动 `node scripts/serve.mjs` 后访问 `/prototype/experiments/global-world.html`。
- [评审包说明](DELIVERY-README.md)、[截图](shots/)：用户提供的验收证据，原样保留。其约 7fps 来自 Opus 的软件渲染环境，不能视为本机性能。
- `dev-scripts/`：原始沙盒截图与切卡脚本，含 `/usr/local/bin/chromium`、`/data/shots`，归档供参考；本机验收应使用后续集成测试。

未暂存、覆盖或提交根目录 `index.html`。解压产生的 `global-world-review/` 保留在本地但忽略，必要原始交付已归档，避免重复提交。
