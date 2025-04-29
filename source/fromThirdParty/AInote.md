# 这个区段由开发者编写,未经允许禁止AI修改

# fromThirdParty 重构笔记

## 职责范围

本目录用于临时存放或初始封装来自第三方库、外部系统（如 Eagle、思源 API）的代码，是将其标准化并迁移到 `toolBox/base/useDeps` 或 `toolBox/feature` 的过渡区域。

## 重构状态

- 正在进行重构，目标是将所有有效封装迁移至 `toolBox`。

## 历史记录

### 2024-07-28 (织)
- 清理并删除了已废弃的 `siyuanClient/` 子目录及其兼容层文件 (`runtime.js`, `index.js`, `dialogs/confirmPromises.js`)。
- 相关引用已在 `src/toolBox/useAge/forSiyuan/forAsset/useSiyuanUpload.js` 和 `source/UI/components/CCDialog.vue` 中更新。
- 将 `siyuanKernel/utils/fetchUtils.js` 中的 `fetchWithTimeout` 函数迁移到 `src/toolBox/base/forNetwork/forFetch/forFetchHelpers.js` 并重命名为 `forFetchWithTimeout`。
- 将 `siyuanKernel/utils/apiConfig.js` 文件完整迁移到 `src/toolBox/useAge/forSiyuan/apiUtils.js`。
- 将 `siyuanKernel/utils/fetchUtils.js` 中剩余的 `getAuthHeaders` 函数迁移到 `toolBox` 并进行了通用化改造。
- 清理并移动了空的 `siyuanKernel/utils/` 目录到 `@trashed`。
- 清理了已废弃的 `siyuanKernel/asset.js` 兼容层文件（实际功能已在 `toolBox`），更新相关引用并将其移动到 `@trashed`。
- 清理了已废弃的 `siyuanKernel/block.js` 兼容层文件（实际功能已在 `toolBox`），将其移动到 `@trashed`。
- 清理了已废弃的 `siyuanKernel/attr.js` 兼容层文件（实际功能已在 `toolBox`），更新相关引用并将其移动到 `@trashed`。
- 将 `siyuanKernel/av.js` 迁移到 `toolBox` 并更新内部引用。
- 将 `siyuanKernel/bazaar.js` 迁移到 `toolBox` 并更新内部引用。
- 清理了已废弃的 `siyuanKernel/blockOp.js` 兼容层文件（实际功能已在 `toolBox`），将其移动到 `@trashed`。
- 将 `siyuanKernel/bookmark.js` 迁移到 `src/toolBox/useAge/forSiyuan/kernelApi/`，更新其内部导入，并将原始文件移动到 `@trashed`。
- 将 `siyuanKernel/broadcast.js` 迁移到 `src/toolBox/useAge/forSiyuan/kernelApi/`，并更新其内部导入以使用 `toolBox` 中的工具函数。
- 将 `siyuanKernel/clipboard.js` 迁移到 `toolBox` 并更新内部引用。
- 将 `siyuanKernel/export.js` 迁移到 `toolBox` 并更新内部引用。
- 将 `siyuanKernel/extension.js` 迁移到 `toolBox` 并更新内部引用。
- 清理了已废弃的 `siyuanKernel/file.js` 兼容层文件（实际功能已在 `toolBox`），将其移动到 `@trashed`。
- 清理了已废弃的 `siyuanKernel/filetree.js` 兼容层文件（实际功能已在 `toolBox`），将其移动到 `@trashed`。
- 将 `siyuanKernel/format.js` 迁移到 `src/toolBox/useAge/forSiyuan/kernelApi/`，并更新其内部导入以使用 `toolBox` 中的工具函数。
- 将 `siyuanKernel/graph.js` 迁移到 `src/toolBox/useAge/forSiyuan/kernelApi/`，并更新其内部导入以使用 `toolBox` 中的工具函数。
- 将 `siyuanKernel/history.js` 迁移到 `src/toolBox/useAge/forSiyuan/kernelApi/`，并更新其内部导入以使用 `toolBox` 中的工具函数。
- 将 `siyuanKernel/icon.js` 迁移到 `toolBox` 并更新内部引用。
- 将 `siyuanKernel/import.js` 迁移到 `toolBox` 并更新内部引用。
- 将 `siyuanKernel/inbox.js` 迁移到 `toolBox` 并更新内部引用。
- 将 `siyuanKernel/lute.js` 迁移到 `toolBox` 并更新内部引用。
- 将 `siyuanKernel/network.js` 迁移到 `toolBox` 并更新内部引用。
- 将 `siyuanKernel/notification.js` 迁移到 `toolBox` 并更新内部引用。
- 清理了已废弃的 `siyuanKernel/notebook.js` 兼容层文件，将其移动到 `@trashed`。
- 将 `siyuanKernel/outline.js` 迁移到 `toolBox` 并更新内部引用。
- 将 `siyuanKernel/pandoc.js` 迁移到 `toolBox` 并更新内部引用。
- 将 `siyuanKernel/petal.js` 迁移到 `toolBox` 并更新内部引用。
- 将 `siyuanKernel/ref.js` 迁移到 `toolBox` 并更新内部引用。
- 将 `siyuanKernel/repo.js` 迁移到 `toolBox` 并更新内部引用。
- 将 `siyuanKernel/riff.js` 迁移到 `toolBox` 并更新内部引用。
- 将 `siyuanKernel/search.js` 迁移到 `toolBox` 并更新内部引用。
- 将 `siyuanKernel/setting.js` 迁移到 `toolBox` 并更新内部引用。
- 将 `siyuanKernel/snippet.js` 迁移到 `toolBox` 并更新内部引用。
- 将 `siyuanKernel/sql.js` 迁移到 `toolBox` 并更新内部引用。
- 将 `siyuanKernel/storage.js` 迁移到 `toolBox` 并更新内部引用。
- 将 `siyuanKernel/sync.js` 迁移到 `toolBox` 并更新内部引用。
- 将 `siyuanKernel/tag.js` 迁移到 `toolBox` 并更新内部引用。
- 将 `siyuanKernel/template.js` 迁移到 `toolBox` 并更新内部引用。
- 将 `siyuanKernel/transaction.js` 迁移到 `toolBox` 并更新内部引用。
- 清理了已废弃的 `siyuanKernel/system.js` 兼容层文件，将其移动到 `@trashed`。
- 清理了已废弃的 `siyuanKernel/workspace.js` 兼容层文件，将其移动到 `@trashed`。
- 将 `siyuanKernel/account.js` 迁移到 `toolBox` 并更新内部引用。
- 清理了 `eagle/` 目录下的所有废弃兼容层文件 (`index.js`, `api/*`, `core/request.js`, `fromLocal/tags.js`)，并尝试删除了空目录。
- 清理了 `npm/` 目录下的废弃兼容层文件 `index.js`，并尝试删除了空目录。

## 迁移与重构记录

- `siyuanKernel/utils/` 下的通用工具函数已迁移至 `src/toolBox/` 下的 `general/` 目录。
- 清理了废弃的 `siyuanKernel/filetree.js` 兼容层文件 (已移至 `@trashed`)。
- 迁移 `siyuanKernel/format.js` 到 `toolBox`, 并更新了内部引用。
- 迁移 `siyuanKernel/graph.js` 到 `src/toolBox/useAge/forSiyuan/kernelApi/`, 并更新了内部引用。
- 迁移 `siyuanKernel/history.js` 到 `src/toolBox/useAge/forSiyuan/kernelApi/`, 并更新了内部引用。
- 清理了废弃的 `npm/` 目录及其下的 `index.js` (已移至 `@trashed`)。
- 迁移 `siyuanKernel/archive.js` 到 `src/toolBox/useAge/forSiyuan/kernelApi/`, 并更新了内部引用。
- 迁移 `siyuanKernel/ai.js` 到 `src/toolBox/useAge/forSiyuan/kernelApi/`, 并更新了内部引用。
- 清理并删除了空的 `siyuanKernel/utils/` 目录。
- 清理并删除了空的 `siyuanKernel/` 目录。 