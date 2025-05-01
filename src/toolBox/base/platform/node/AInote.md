# 这个区段由开发者编写,未经允许禁止AI修改

# Node.js 平台工具

此目录包含与 Node.js 运行时环境相关的基础工具函数。

**职责:**
*   封装 Node.js 核心 API。
*   提供与 Node.js 环境交互的底层能力。
*   确保跨平台兼容性（如果适用）。

**注意:**
*   这里的工具应尽可能保持平台无关性，或者明确标记其 Node.js 依赖。
*   避免包含特定应用逻辑，应将其放在 `feature` 或 `useAge` 目录。
*   遵循 `toolBox` 的通用编码和文档规范。

# AI 笔记

此模块提供了基于 Node.js 环境的 ZIP 文件操作工具函数。

**核心功能:**
-   添加、创建、提取、删除、列出 ZIP 文件中的条目。
-   支持文件和文件夹操作。
-   包含一个通用的将 Buffer 保存到文件的函数 (`saveBufferToFile`)。

**依赖:**
-   Node.js: `fs.promises`, `path`。
-   JSZip 库: 通过 `toolBox/base/useDeps/forZipUtils/useJsZipDep.js` 导入。

**定位:**
-   属于 `base/usePlatform/forNode` 层，因为其功能强依赖于 Node.js 平台提供的文件系统 API。 