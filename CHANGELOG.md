# Changelog

All notable changes to this project are documented here.

## [0.1.1] — 2026-11-03

### 文档

- README 增加「展开 / 折叠」对比截图（`docs/`）。
- 新增维护者发版说明 `RELEASING.md`。
- 新增 GitHub Actions 发布工作流：推 `v*` 标签后自动把该版本**暂存**到 npm，再由维护者用 2FA 批准发布（trusted publishing，不保存长期令牌）。

### English

- README now shows before/after screenshots (`docs/`).
- Added maintainer release notes (`RELEASING.md`).
- Added a GitHub Actions release workflow: pushing a `v*` tag stages the version on npm, and a maintainer approves it with 2FA (trusted publishing, no long-lived token).

## [0.1.0] — 2026-11-03

### 新增

- 在「工作区」标题右侧新增折叠按钮：一键收起／展开全局插件按钮条。
- 按钮在全局面板按钮达到 5 个时出现；折叠状态下保持可见，随时可以展开。
- 折叠状态持久化到 `localStorage`（`dsh-sidebar-collapse:collapsed`）。
- 侧栏收成 56px 图标栏时折叠自动暂停；标题行搜索框展开时按钮自动让位。
- 锚点解析失败时启用测量回退，保证按钮仍落在同一位置。

### 说明

- 通过 `sidebar.footer.action` 座位注册并用 CSS 锚点定位落在标题行；不替换任何宿主组件、不改写宿主 CSS、不修改其他插件的注册。

### English

- Added a fold button in the workspace header that collapses/expands the global panel-button strip.
- The button appears once the strip holds five panel buttons and stays visible while folded.
- Fold state persisted in `localStorage` (`dsh-sidebar-collapse:collapsed`).
- The fold is suspended in the 56px rail; the button steps aside while the header search is expanded.
- A measured fallback keeps the button in place when the CSS anchor does not resolve.
- Registered through `sidebar.footer.action` and positioned with CSS anchor positioning; no host component is replaced and no host CSS is mutated.
