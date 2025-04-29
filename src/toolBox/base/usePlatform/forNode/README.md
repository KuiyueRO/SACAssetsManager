# Node.js Platform Tools (`forNode`)

This directory provides base utilities specifically designed for or dependent on the Node.js runtime environment.

## Scope

*   Wrappers around Node.js built-in modules (e.g., `fs`, `path`, `crypto`).
*   Functions interacting with the Node.js process or environment.
*   Utilities leveraging Node.js-specific APIs.

## Usage

Import functions directly from their respective files within this directory.

```javascript
import { computeFileFingerprint } from 'path/to/toolBox/base/usePlatform/forNode/useFileFingerprint.js';
```

## Node.js ZIP & FS 工具 (`forZipUtils.js`)

本模块 (`src/toolBox/base/usePlatform/forNode/forZipUtils.js`) 提供了一系列基于 Node.js 文件系统 (`fs`) 和 `jszip` 库的 ZIP 文件操作工具，以及一个通用的文件保存函数。

## 主要功能

*   **ZIP 操作:**
    *   `addFileToZip`: 向现有 ZIP 添加文件。
    *   `createZip`: 创建新的 ZIP 文件。
    *   `extractFileFromZip`: 从 ZIP 提取单个文件。
    *   `extractAllFromZip`: 提取 ZIP 所有内容到目录。
    *   `removeFileFromZip`: 从 ZIP 删除文件。
    *   `listFilesInZip`: 列出 ZIP 内的文件。
    *   `addFolderToZip`: 将本地文件夹添加到 ZIP。
    *   `hasEntryInZip`: 检查 ZIP 中是否存在文件或目录。
*   **文件系统:**
    *   `saveBufferToFile`: 将 Buffer 数据异步保存到指定路径。

## 依赖

*   **Node.js 环境:** 需要 `fs.promises` 和 `path` 模块。
*   **JSZip:** 通过 `../../useDeps/forZipUtils/useJsZipDep.js` 引入。

## 使用

```javascript
import {
    addFileToZip,
    createZip,
    extractAllFromZip,
    saveBufferToFile
    // ... 其他函数
} from 'path/to/toolBox/base/usePlatform/forNode/forZipUtils.js';

// 示例
// await addFileToZip('archive.zip', 'new_file.txt', 'data/new_file.txt');
// const imageBuffer = await getSomeImageBuffer();
// await saveBufferToFile(imageBuffer, 'output/image.png');
```

## 定位

属于 `toolBox` 的 `base/usePlatform/forNode` 层，封装了依赖 Node.js 平台的底层文件和 ZIP 操作能力。 