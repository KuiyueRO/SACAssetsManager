# D5A 文件处理工具 (`forD5a`)

本模块 (`src/toolBox/feature/forD5a/`) 提供了用于处理 D5 Render 素材文件格式 (`.d5a`) 的工具函数，特别是与其内部缩略图 (`icon.jpg`) 相关的操作。

## 主要功能

*   `useD5a_replaceThumbnail`: 将指定的缩略图文件写入 `.d5a` 文件，替换 `icon.jpg`。
*   `computeD5a_getCacheThumbnailPath`: 根据 `.d5a` 文件路径计算其缓存缩略图的约定路径。
*   `fromD5aFile_extractThumbnail`: 从 `.d5a` 文件中提取 `icon.jpg` 并保存到指定路径。
*   `useD5a_processSingleThumbnail`: 处理单个 `.d5a` 文件的缩略图写入流程（包括检查和确认逻辑）。
*   `useD5a_processBatchThumbnails`: 批量处理多个 `.d5a` 文件的缩略图写入。

## 依赖

*   **Node.js 环境:** 需要 `fs.promises` 和 `path` 模块。
*   **`toolBox` 内部依赖:** 依赖 `src/toolBox/base/usePlatform/forNode/forZipUtils.js` 提供的 ZIP 和文件操作函数。

## 注意

*   `fromD5aData_extractThumbnail` 函数已弃用，无法直接从 Buffer 处理 D5A 文件。

## 定位

属于 `toolBox` 的 `feature` 层，封装了对 `.d5a` 这一特定文件格式的处理能力。 