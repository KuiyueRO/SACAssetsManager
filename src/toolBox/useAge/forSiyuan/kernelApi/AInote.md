# 这个区段由开发者编写,未经允许禁止AI修改

# kernelApi 重构笔记

**所属层级:** UseAge (forSiyuan)

**职责范围:** 存放从 `source/fromThirdParty/siyuanKernel/` 迁移过来的、直接封装思源 Kernel API 的模块。

**准入标准:**
- 必须是直接调用思源 `/api/` 下 Kernel 接口的封装。
- 文件名应尽可能与对应的 Kernel API 模块保持一致 (e.g., `asset.js`, `block.js`)。
- 内部实现应使用 `toolBox/base` 或 `toolBox/useAge/forSiyuan` 下的基础工具 (如 `apiUtils.js`, `forFetchHelpers.js`, `forAuthHeaders.js`)。
- **禁止**包含复杂的业务逻辑，只做 API 的基础封装和调用。

**架构总纲:** [../../../architecture_layers_explained.md](../../../architecture_layers_explained.md)

## 历史记录

### 2024-07-28 (织)
- 创建本目录及 `AInote.md`。
- 检查 `source/fromThirdParty/siyuanKernel/asset.js`，发现其为废弃兼容层，更新引用后将其移动到 `@trashed`。
- 检查 `source/fromThirdParty/siyuanKernel/block.js`，发现其为废弃兼容层，移动到 `@trashed`。
- 检查 `source/fromThirdParty/siyuanKernel/attr.js`，发现其为废弃兼容层，更新引用后将其移动到 `@trashed`。
- 将 `source/fromThirdParty/siyuanKernel/av.js` 迁移至此目录，并更新其内部对 `utils/` 的导入为指向 `toolBox` 的工具函数。
- 将 `source/fromThirdParty/siyuanKernel/bazaar.js` 迁移至此目录，并更新其内部对 `utils/` 的导入为指向 `toolBox` 的工具函数。
- 检查 `source/fromThirdParty/siyuanKernel/blockOp.js`，发现其为废弃兼容层，移动到 `@trashed`。
- 将 `source/fromThirdParty/siyuanKernel/bookmark.js` 迁移至此目录，并更新其内部对 `utils/` 的导入为指向 `toolBox` 的工具函数。
- 将 `source/fromThirdParty/siyuanKernel/broadcast.js` 迁移至此目录，并更新其内部对 `utils/` 的导入为指向 `toolBox` 的工具函数。
- 将 `source/fromThirdParty/siyuanKernel/clipboard.js` 迁移至此目录，并更新其内部对 `utils/` 的导入为指向 `toolBox` 的工具函数。
- 将 `source/fromThirdParty/siyuanKernel/export.js` 迁移至此目录，并更新其内部对 `utils/` 的导入为指向 `toolBox` 的工具函数。
- 将 `source/fromThirdParty/siyuanKernel/extension.js` 迁移至此目录，并更新其内部对 `utils/` 的导入为指向 `toolBox` 的工具函数。
- 检查 `source/fromThirdParty/siyuanKernel/file.js`，发现其为废弃兼容层，移动到 `@trashed`。
- 检查 `source/fromThirdParty/siyuanKernel/filetree.js`，发现其为废弃兼容层，移动到 `@trashed`。
- 将 `source/fromThirdParty/siyuanKernel/format.js` 迁移至此目录，并更新其内部对 `utils/` 的导入为指向 `toolBox` 的工具函数。
- 将 `source/fromThirdParty/siyuanKernel/graph.js` 迁移至此目录，并更新其内部对 `utils/` 的导入为指向 `toolBox` 的工具函数。
- 将 `source/fromThirdParty/siyuanKernel/history.js` 迁移至此目录，并更新其内部对 `utils/` 的导入为指向 `toolBox` 的工具函数。
- 将 `source/fromThirdParty/siyuanKernel/icon.js` 迁移至此目录，并更新其内部对 `utils/` 的导入为指向 `toolBox` 的工具函数。
- 将 `source/fromThirdParty/siyuanKernel/import.js` 迁移至此目录，并更新其内部对 `utils/` 的导入为指向 `toolBox` 的工具函数。
- 将 `source/fromThirdParty/siyuanKernel/inbox.js` 迁移至此目录，并更新其内部对 `utils/` 的导入为指向 `toolBox` 的工具函数。
- 将 `source/fromThirdParty/siyuanKernel/lute.js` 迁移至此目录，并更新其内部对 `utils/` 的导入为指向 `toolBox` 的工具函数。
- 将 `source/fromThirdParty/siyuanKernel/network.js` 迁移至此目录，并更新其内部对 `utils/` 的导入为指向 `toolBox` 的工具函数。
- 将 `source/fromThirdParty/siyuanKernel/notification.js` 迁移至此目录，并更新其内部对 `utils/` 的导入为指向 `toolBox` 的工具函数。
- 将 `source/fromThirdParty/siyuanKernel/outline.js` 迁移至此目录，并更新其内部对 `utils/` 的导入为指向 `toolBox` 的工具函数。
- 将 `source/fromThirdParty/siyuanKernel/pandoc.js` 迁移至此目录，并更新其内部对 `utils/` 的导入为指向 `toolBox` 的工具函数。
- 将 `source/fromThirdParty/siyuanKernel/petal.js` 迁移至此目录，并更新其内部对 `utils/` 的导入为指向 `toolBox` 的工具函数。
- 将 `source/fromThirdParty/siyuanKernel/ref.js` 迁移至此目录，并更新其内部对 `utils/` 的导入为指向 `toolBox` 的工具函数。
- 将 `source/fromThirdParty/siyuanKernel/repo.js` 迁移至此目录，并更新其内部对 `utils/` 的导入为指向 `toolBox` 的工具函数。
- 将 `source/fromThirdParty/siyuanKernel/riff.js` 迁移至此目录，并更新其内部对 `utils/` 的导入为指向 `toolBox` 的工具函数。
- 将 `source/fromThirdParty/siyuanKernel/search.js` 迁移至此目录，并更新其内部对 `utils/` 的导入为指向 `toolBox` 的工具函数。
- 将 `source/fromThirdParty/siyuanKernel/setting.js` 迁移至此目录，并更新其内部对 `utils/` 的导入为指向 `toolBox` 的工具函数。
- 将 `source/fromThirdParty/siyuanKernel/snippet.js` 迁移至此目录，并更新其内部对 `utils/` 的导入为指向 `toolBox` 的工具函数。
- 将 `source/fromThirdParty/siyuanKernel/sql.js` 迁移至此目录，并更新其内部对 `utils/` 的导入为指向 `toolBox` 的工具函数。
- 将 `source/fromThirdParty/siyuanKernel/storage.js` 迁移至此目录，并更新其内部对 `utils/` 的导入为指向 `toolBox` 的工具函数。
- 将 `source/fromThirdParty/siyuanKernel/sync.js` 迁移至此目录，并更新其内部对 `utils/` 的导入为指向 `toolBox` 的工具函数。
- 将 `source/fromThirdParty/siyuanKernel/tag.js` 迁移至此目录，并更新其内部对 `utils/` 的导入为指向 `toolBox` 的工具函数。
- 将 `source/fromThirdParty/siyuanKernel/template.js` 迁移至此目录，并更新其内部对 `utils/` 的导入为指向 `toolBox` 的工具函数。
- 将 `source/fromThirdParty/siyuanKernel/transaction.js` 迁移至此目录，并更新其内部对 `utils/` 的导入为指向 `toolBox` 的工具函数。
- 将 `siyuanKernel/account.js` 迁移至此目录，并更新其内部对 `utils/` 的导入为指向 `toolBox` 的工具函数。 