# dsh-sidebar-collapse

给 DeepSeek Harness 侧边栏的「全局面板按钮条」加一个折叠开关。
A fold switch for the global plugin-button strip in the DeepSeek Harness sidebar.

[中文](#中文) · [English](#english)

---

## 中文

### 它解决什么问题

DSH 的左侧栏从上到下是：品牌行 → 新会话 → **全局面板按钮条**（插件、任务看板、技能中心……）→ 工作区／会话列表 → 底部。按钮条里每一行由各个插件注册，占 36px 且不会被压缩——插件装得越多，工作区和会话列表就被挤得越扁，而且按钮条本身不能折叠也不能滚动。

这个插件只做一件事：在**「工作区」标题右侧、搜索图标的左边**放一个折叠按钮。点一下，整条插件按钮收起，工作区列表拿到整列高度；再点一下恢复。

### 用起来是什么样

- 按钮只在全局面板按钮达到 **5 个**时出现——少于 5 个时它没必要存在。
- 折叠后按钮保留在标题行，随时可以展开；状态存进浏览器 `localStorage`（键名 `dsh-sidebar-collapse:collapsed`），刷新或重启后保持。
- 侧栏收成 56px 图标栏时折叠自动暂停（那里按钮条是唯一的导航）；标题行搜索框展开时按钮自动让位。
- 没有高度上限、没有第二条滚动条；不替换任何宿主组件，也不改动其他插件的注册。

### 安装

任选其一：

1. **插件页（推荐）**：设置 → 插件 → 添加，填入 `dsh-sidebar-collapse`；也可以让 DSH 代理执行 `plugin_manager` 的 `install_bundle`，`target` 填 `dsh-sidebar-collapse`。
2. **命令行**（需要 `dsh` CLI 已在 PATH 中）：`dsh plugin --profile <你的 profile 名> add dsh-sidebar-collapse`。

卸载：插件页里禁用／卸载，或用 `plugin_manager` 的 `remove_bundle`（`target` 填 `dsh-sidebar-collapse`）。

### 兼容性

在 **DSH 0.2.1-rc.3**（Electron 44 / Chromium ~144）上开发并验证。实现依赖宿主的两处内部命名：

| 依赖 | 用途 |
| --- | --- |
| `nav` 上的 `…_panelList` 类名子串 | 判断折叠范围与「5 个按钮」阈值 |
| 工作区标题行搜索槽的 `…_searchSlot` 类名子串 | 定位锚点（测量回退也用它） |

如果未来 DSH 改了这些名字，最坏表现是「按钮出现在错误位置或不出现」，不会破坏侧栏，也不会影响其他插件。届时改 [client.js](client.js) 顶部的常量即可（`FOLD_THRESHOLD`、`BUTTON_SIZE`、`GUTTER`、`ANCHOR_SELECTOR`）。

### 工作原理（简述）

控件注册在宿主的 `sidebar.footer.action` 座位里，但用 `position: absolute` 脱离 footer 的行流；接着把标题行的搜索槽命名为锚点（`anchor-name: --dsh-ws-search`），用 `anchor()` 把按钮放到它左边 32px。这样控件视觉上属于标题行的按钮组，却不占任何布局。

若所在引擎解析不了锚点，组件会退化为测量定位：用 `getBoundingClientRect()` 量出锚点位置，改用内联 `position: fixed` 钉在同一处（此时按钮带 `data-dsh-collapse-measured` 标记），并在 `ResizeObserver`、窗口尺寸变化和每次折叠后重新测量。

折叠本身是纯 CSS：`html:has([data-dsh-sidebar-collapse][aria-expanded="false"]) …` 把按钮条的每个子元素设为 `display: none`。没有任何 DOM 写在组件之外，样式表也是组件自己的 React 元素，卸载即消失。

### 许可

[MIT](LICENSE)

---

## English

### The problem

The DSH sidebar is one fixed-height column: brand row → New Session → **global plugin-button strip** → workspace/session list → footer. Every plugin that registers a panel adds a 36px row to that strip, and the strip never shrinks or scrolls — so the more plugins you install, the less room the workspace and session list get.

This plugin does exactly one thing: it puts a fold button in the **workspace header, immediately left of the search icon**. Press it and the whole plugin-button strip collapses, giving the column to the workspace list; press it again to bring the buttons back.

### Behaviour

- The button only appears once the strip holds **five** panel buttons.
- It stays visible while the strip is folded (that is the way back), and the state is kept in `localStorage` (`dsh-sidebar-collapse:collapsed`) across reloads.
- The fold is suspended while the sidebar is a 56px rail (the strip is the only navigation there), and the button steps aside while the header's search field is expanded.
- No height cap, no second scrollbar, no host component replaced, no other plugin's registration touched.

### Install

Either:

1. **Plugins page (recommended)**: Settings → Plugins → Add, enter `dsh-sidebar-collapse`; or let the agent call `plugin_manager` `install_bundle` with `target: dsh-sidebar-collapse`.
2. **CLI** (with the `dsh` CLI on `PATH`): `dsh plugin --profile <your profile> add dsh-sidebar-collapse`.

Uninstall from the Plugins page, or `plugin_manager` `remove_bundle` with `target: dsh-sidebar-collapse`.

### Compatibility

Developed and verified against **DSH 0.2.1-rc.3** (Electron 44 / Chromium ~144). It relies on two internal host names: the `…_panelList` class substring on the strip's `<nav>` (fold scope and the five-button threshold), and the `…_searchSlot` class substring of the workspace header's search area (positioning anchor, also used by the measured fallback). If a future release renames them, the worst case is a misplaced or missing button — never a broken sidebar; update the constants at the top of [client.js](client.js).

### How it works

The control is registered in the host's `sidebar.footer.action` seat, then taken out of flow with `position: absolute`; the header's search area is named as a CSS anchor (`anchor-name: --dsh-ws-search`) and `anchor()` places the button 32px to its left. When the engine cannot resolve the anchor, the component measures the anchor with `getBoundingClientRect()` and pins itself with inline `position: fixed` offsets instead (marked by `data-dsh-collapse-measured`), re-measuring on `ResizeObserver`, window resize and each fold.

The fold itself is pure CSS: `html:has([data-dsh-sidebar-collapse][aria-expanded="false"]) …` sets every child of the strip to `display: none`. Nothing is written outside the component tree, and the stylesheet is a React element that disappears with it.

### License

[MIT](LICENSE)
