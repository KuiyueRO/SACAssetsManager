# 这个区段由开发者编写,未经允许禁止AI修改
# 请确保此目录下的所有 SemVer 相关函数都经过充分测试，并与标准 semver 行为兼容（除非明确标示为扩展或非标准功能）。
# 优先使用 compute* 前缀。

# AI Note

此目录包含用于处理语义化版本（Semantic Versioning, SemVer）的函数。
主要功能包括版本解析、比较、范围检查和操作。
代码已从旧的 `utils/useAges/forVersionCompare/useIownSemver.js` 迁移并拆分。

**结构调整 (2024-07-29):**
- 确认此目录功能已覆盖 `src/toolBox/base/forVersion` 目录。
- 删除了本目录下的聚合导出文件 `index.js`，调用方应直接从各 `compute*.js` 或 `use*.js` 文件导入所需函数。 