"""Add the retirement notes to README.md and CHANGELOG.md (idempotent).

Run once when archiving the plugin: DSH 0.2.2 moved the panel strip into the
same scroll container as the workspace list, so the find no longer scrolls the
list away and this plugin stopped being needed.
"""

import io
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

BANNER = """# ⚠️ 已归档（Deprecated）

**2026-11-12 归档。** DSH **0.2.2** 起，侧栏的「全局面板按钮条」与工作区列表已放进同一个滚动容器：向下滚动侧栏，按钮条会自然滚出视野，不再需要这个插件。

As of DSH 0.2.2 the panel strip and the workspace list share one scroll container, so scrolling the sidebar moves the buttons out of view natively. This plugin is no longer needed and no longer maintained.

已知限制：本插件在 DSH 0.2.2+ 上**不会显示折叠按钮**（面板行结构改为 `div.panelEntry` 包裹，旧的「≥5 个按钮」阈值选择器失效）。需要旧行为请使用 DSH ≤ 0.2.1 与 npm 上的 v0.1.1。

---

"""

CHANGELOG_SECTION = """## [Deprecated] — 2026-11-12

- 归档，不再维护。DSH 0.2.2-rc2 起，侧栏的面板按钮条与工作区列表共用同一个滚动容器，滚动即可让位。
- 已知问题：在 DSH 0.2.2+ 上折叠按钮不会显示——面板行改为 `div.panelEntry` 包裹，旧的「≥5 个按钮」阈值选择器匹配不到。

"""


def main() -> None:
    readme_path = os.path.join(ROOT, "README.md")
    with io.open(readme_path, encoding="utf-8") as handle:
        readme = handle.read()
    if readme.startswith("# ⚠️ 已归档"):
        print("README.md: already archived")
    else:
        with io.open(readme_path, "w", encoding="utf-8", newline="\n") as handle:
            handle.write(BANNER + readme)
        print("README.md: banner prepended")

    changelog_path = os.path.join(ROOT, "CHANGELOG.md")
    with io.open(changelog_path, encoding="utf-8") as handle:
        changelog = handle.read()
    if "## [Deprecated]" in changelog:
        print("CHANGELOG.md: already noted")
    else:
        marker = "All notable changes to this project are documented here.\n\n"
        if marker in changelog:
            changelog = changelog.replace(marker, marker + CHANGELOG_SECTION, 1)
        else:
            changelog = CHANGELOG_SECTION + changelog
        with io.open(changelog_path, "w", encoding="utf-8", newline="\n") as handle:
            handle.write(changelog)
        print("CHANGELOG.md: deprecation section added")


if __name__ == "__main__":
    main()
