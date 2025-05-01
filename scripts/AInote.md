# 这个区段由开发者编写,未经允许禁止AI修改

# AI 笔记

- **路径更新 (2024-07-29)**: 更新了 `scan-direct-dependencies.js` 脚本中用于排除 Node/Electron 封装目录的硬编码路径字符串，以匹配 `base` 目录下平台相关目录的整合结果 (从 `useNode/useElectron` 更新为 `platform/node` 和 `platform/electron`)。 