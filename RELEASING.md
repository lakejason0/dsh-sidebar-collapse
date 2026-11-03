# 发布流程 / Releasing

面向维护者。发布使用 **trusted publishing**（GitHub Actions OIDC），不保存任何 npm 长期令牌。
Maintainer notes: releases use trusted publishing from GitHub Actions; no long-lived npm token is stored anywhere.

## 一次性设置 / One-time setup

1. 在本机执行（需要 npm 2FA；先加 `--dry-run` 可以预览）：

   ```
   npm trust github dsh-sidebar-collapse --file release.yml --repo lakejason0/dsh-sidebar-collapse --allow-stage-publish --yes
   ```

   `--file` 必须与 `.github/workflows/release.yml` 的文件名一致。

   只授予「分阶段发布」权限（`--allow-stage-publish`），不授予直接发布（`--allow-publish`），
   这样 CI 无法绕过人工确认。Only staging is granted, so CI can never publish without a human.

2. 确认信任关系：

   ```
   npm trust list dsh-sidebar-collapse
   ```

## 每次发版 / Each release

1. 改 `package.json` 的 `version`，在 `CHANGELOG.md` 补一节。
2. 提交并打标签：

   ```
   git tag v0.1.1
   git push origin v0.1.1
   ```

3. GitHub Actions 的 `Release` 工作流会把该版本**暂存**到 npm（不对外可见）。
4. 批准发布（本机执行，需要 2FA）：

   ```
   npm stage list
   npm stage approve <stage-id>
   ```

   想放弃这次发布：`npm stage reject <stage-id>`。

## 为什么这么绕 / Why stage instead of publish

暂存发布把「证明本人在场」（2FA）从 CI 里挪到批准那一步：CI 不需要任何可长期滥用的凭据，
而每次真正上线仍然有一个人工确认。npm 官方推荐的姿势就是这一种。

## 本地直接发布 / Publishing locally

`npm publish` 仍然可以手动执行，同样需要 2FA。trusted publishing 只影响 CI 侧。
