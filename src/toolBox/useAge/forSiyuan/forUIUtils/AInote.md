# 这个区段由开发者编写,未经允许禁止AI修改
- 确保文件内的函数都与 Siyuan UI 相关，例如获取图标、处理样式等。
- 遵循通用函数规范。

# AI 笔记区
- 20240729：将 `getSiyuanBlockIcon` 相关的功能从 `app/siyuan/useSiyuanUi/` 迁移到此处。主要函数是 `getSiyuanBlockIconUrl`，用于根据块信息获取合适的图标 URL（可能是内置图标、emoji 或 SVG Data URL）。
- 包含一个简单的 LRU 缓存来存储文档信息，以减少对 API 的频繁调用。 