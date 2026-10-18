# NANFEILAOTOU · V0.1.0 发布记录

2026-10-18。已验收源版本：`ff907cb5b541f7e7081f71a39a1c9e7c213a84f0`。正式站点：<https://personal-site-7xv.pages.dev/>。

## 来源与入口

- 原 main：`01cfd566438a21bd589131bbd091b5e7ebd142fd`，仅包含 Hello 占位 `index.html`。
- 在独立 release worktree 基于 origin/main，以 `--no-ff` 合并功能分支，保留全部开发历史、独立 Opus 作品、素材与验收资料。功能分支不删除。
- 唯一首页 HTML 由 `prototype/prototype-02.html` 提升为根 `index.html`；动画仍在 `prototype/motion.js`、`showcase.js`、`timeline.js`、`global-home.js` 和原 Opus 模块内。只有首页引用路径、标题、canonical、空 favicon 与页尾原型标识作发布适配。
- 原 prototype 地址是小型兼容入口，保留 query/hash 后转到 `/`。无 iframe、运行时 HTML 拼接或第二份动画 HTML。独立 `prototype/experiments/global-world.html` 仍可运行。
- 不使用 `<base>`：它会改变 `history.pushState('#…')` 的路径；根入口明确引用 `prototype/` 中的 CSS/JS，避免导航 / 刷新掉进 `/prototype/`。
- 标题为“NANFEILAOTOU · AI 与全球数字服务”，description 保留“AI、全球数字服务、个人项目与日常探索。”；正式页尾仅显示 NANFEILAOTOU。
- `404.html` 为真实缺失文件提供后备，避免 Pages 将不存在的脚本 / 图片路径作为首页成功响应。

## 部署平台

沿用现有 **Cloudflare Pages / personal-site** GitHub 集成，生产来源为本仓库 **main**，静态入口在仓库根目录。发布前通过 GitHub 的 `Cloudflare Pages` 成功检查及线上根地址实际返回 Hello 占位页确认现有接入；另有独立 `Workers Builds: personal-site` 检查记录，不迁移服务商或改 DNS。

本版本是原生 HTML / CSS / JS 静态站，无 npm 安装、前端构建或 Node 常驻服务要求。未引入 Wrangler 配置覆盖现有云端设置；只新增 Pages 原生 `_redirects` 和静态 404。云端检查结果与浏览器验收见本次发布提交和下方在线结果，不能以 Git push 代替部署成功。

本地预览使用 `node scripts/serve.mjs`，默认端口 4173；发布 worktree 验收使用 `PORT=4180`。原用户工作区的 4173 服务和文件不受影响。脚本现在按真实根 `index.html` 提供 `/`，并模拟与 Pages 相同的原图 URL 跳转。

官方配置依据：[静态目录与构建方式](https://developers.cloudflare.com/pages/configuration/build-configuration/)、[原生 redirects（优先于同名资产）](https://developers.cloudflare.com/pages/configuration/redirects/)、[404 与默认 SPA 回退](https://developers.cloudflare.com/pages/configuration/serving-pages/)。

## StarryBlu 资源边界

- 正式场景、三卡采样、高清层和静态后备只引用 `assets/cards/public/starryblu-card-sanitized.png`，SHA256 为 `4a9a9a5ad535b827e9b5121b67aa309a4218e7cc95cdd8f1cea959483eb3ce06`。号码 / 姓名区域已在文件像素中离线处理。
- `_redirects` 使旧 `/assets/cards/starryblu-card.png` 请求在 Cloudflare Pages 端 **302 到上述安全副本**，即使源文件存在也优先跳转。不是浏览器遮罩。发布测试验证旧 URL 的响应链及最终返回字节哈希。
- 本轮沿用仓库根静态发布，**研究原件仍留在仓库与上传目录中；是 URL 规则阻止本站直接返回它，并不声称已经从发布包物理删除**。未来改用纯生产白名单构建目录时，应不拷贝该研究原件；若更换静态托管平台，必须先落实等价规则或排除文件。
- 公共 GitHub 当前研究目录、功能分支和历史仍可访问原件；此发布不是撤回历史，也不能消除已下载副本。来源仍是用户提供、公开演示字段出处未独立确认，不宣称已核实为演示卡号。本轮不重写 Git 历史。

## 已保护内容

Opening Shader / 字形 / 排斥恢复、AI 21 条目与 B 显色、三段 AI 时长 / 坐标、15.68 屏全站映射、Global 黑白翻面与四领域、64,000 点三卡状态机、三张卡图及 Personal 三入口，均相对已验收提交不变。没有主题色、顶栏、移动端竖屏或第三章视觉重设计。

原工作区 `D:\AI\personal-site` 保持功能分支和 ` M index.html`；原文件 SHA256 为 `BFC193B140D94B8669327F71A677D68F84DB19F573E262119C53894CDE4D1711`，与已归档 Prototype 01 完全相同。本轮只在独立 worktree 修改正式入口，不暂存原工作区文件。

## 回归与证据

- [发布根路径检查脚本](../tests/release-v010/check.cjs)，默认测试 `http://127.0.0.1:4180/`；设置 `NF_RELEASE_BASE=https://personal-site-7xv.pages.dev` 后执行相同在线检查。
- [本地结果](../tests/release-v010/local-results.json)、[在线结果](../tests/release-v010/online-results.json)。线上结果在真正部署后追加，不预先声称成功。
- [静态保护检查](../tests/release-v010/static.cjs)：将根 HTML 的发布差异还原后，与 ff907cb 的已验收 HTML 逐字符相同；`prototype / data / assets` 中只有旧 HTML 兼容入口改变，动画脚本、数据、材质无改动。
- 原 `tests/static-check.cjs`、`tests/home-global/static.cjs` 的根入口断言更新为正式入口规则；原版完整备份哈希保护仍保留，其余检查不减。
- 三桌面分辨率：1920×1080、1440×900、1366×768。覆盖根启动、21 AI 条目、四领域、三卡切换 / 快速重选、Hash / Back / Forward / 刷新、键盘、索引 / Esc、资源和 Console。
- 390×844 只做触摸可达与横向溢出冒烟；系统减少动态和实际禁用 WebGL 仍有静态后备。手机竖屏精修继续延期。
- 本轮不修改算法，也不重复声称新性能数字；实际硬件性能及更深的 Context / 长时停留验证见 [已验收集成报告](HOME-AI-GLOBAL-INTEGRATION.md)。

## 标签与回滚

在线验证后创建注释标签 `v0.1.0`，推送 main 与该标签；不删除功能分支，不强推。

紧急网站回滚可以在现有 Cloudflare Pages 项目中选择已成功的历史生产部署；这不重写 Git。发布前的部署为 `71ed765d-9fe0-4360-9a47-34ada33250fa`（Hello 版本）。

未来恢复本次 V0.1 代码，使用**新的干净 worktree**，不要在含用户未提交文件的原目录执行：

```powershell
git fetch origin --tags
git worktree add -b rollback/v0.1.0 ../personal-site-rollback origin/main
cd ../personal-site-rollback
git restore --source=v0.1.0 --staged --worktree .
git commit -m "revert: restore accepted v0.1.0 site"
git push origin HEAD:main
```

这会建立正常回滚提交，保留后续历史。真实教程仍整理中，Personal 保留预留内容；手机精修、其他浏览器和低端 GPU 仍属于后续工作。
