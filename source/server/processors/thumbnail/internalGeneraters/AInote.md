# 这个区段由开发者编写,未经允许禁止AI修改

# 缩略图内部生成器 (internalGeneraters) 笔记

**所属层级:** Source (Server Processors)

**职责范围:** 包含各种文件类型的具体缩略图生成逻辑。

## 历史记录

### 2024-07-29 (织)
- 删除 `preload.js` 文件。根据开发者指示，该文件中实现的自定义 `require` hack 功能已被废弃，存在更好的替代实现。
- **依赖规范化:** 对 `d5m.js` 和 `pdf.js` 中的外部依赖（`fs`, `jszip`, `pdf-lib`, `pdf2pic`）进行了统一处理：
  - **创建转发模块:** 在 `base/deps/` 目录下为这些依赖创建了对应的转发模块 (`node/fs.js`, `npm/jszip.js`, `npm/pdf-lib.js`, `npm/pdf2pic.js`)。
    - 转发模块内部使用 `require` 获取原始依赖。
    - 转发模块统一使用 `export` 提供 ESM 接口 (`fs.js` 导出 `fsPromises`, 其他导出相应对象/类)。
  - **修改引用:** `d5m.js` 和 `pdf.js` 改为通过 `import { ... } from 'path/to/deps/...'` 引入这些依赖。
  - **API 调整:** `d5m.js` 和 `pdf.js` 中的文件读取操作改为使用 `fsPromises.readFile` (异步)。
  - **目标:** 严格遵循全局依赖引用规范，优先使用 ESM 接口，统一异步文件操作。

### 2024-07-29 (织) - 修正
- 修正 `d5m.js` 的依赖导入方式：
  - `fs` 依赖保持 `import { promises as fs } from 'fs';`。
  - 确认 `jszip.js` 转发模块内部使用 `require('jszip')`，外部使用 `export`。
  - `d5m.js` 使用 `import { JSZip } from 'path/to/deps/npm/jszip.js';`。
- 修正 `pdf.js` 的依赖导入方式：
  - 将 `fs.readFileSync` 修改为 `import { promises as fs } from 'fs';` 和 `await fs.readFile(...)`。
  - 确认 `pdf-lib.js` 和 `pdf2pic.js` 转发模块内部使用 `require`，外部使用 `export`。
  - `pdf.js` 使用 `import { PDFDocument } from 'path/to/deps/npm/pdf-lib.js';` 和 `import { pdf2pic } from 'path/to/deps/npm/pdf2pic.js';`。
- 修正后的策略：`deps/npm` 模块内部用 `require` 引入 CJS 包，用 `export` 导出 ESM 接口；项目其他地方用 `import` 消费 `deps` 模块。

### 2024-08-01 (织)
- 修正 `systermThumbnailWin64.js` 中对 `useCSharpLoader.js` 和 `创建不可见Webview` 的引用路径错误，将路径中的 `.../base/useElectron/...` 修改为 `.../base/platform/electron/...`。 