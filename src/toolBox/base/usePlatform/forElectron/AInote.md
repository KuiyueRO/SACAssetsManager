# 这个区段由开发者编写,未经允许禁止AI修改

# Electron 平台工具

此目录包含与 Electron 平台相关的基础工具函数。

**职责:**
*   封装 Electron 主进程和渲染进程的 API。
*   提供与 Electron 窗口、生命周期、IPC 通信等交互的底层能力。
*   处理 Electron 特有的平台兼容性问题。

**注意:**
*   这里的工具应专注于 Electron 平台本身，避免包含通用 Web 或 Node.js 功能（除非它们与 Electron 集成紧密相关）。
*   特定于应用的功能（如自定义窗口样式、特定业务逻辑的 IPC 处理）应放在 `feature` 或 `useAge` 目录。
*   遵循 `toolBox` 的通用编码和文档规范。 