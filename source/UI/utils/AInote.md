# 这个区段由开发者编写,未经允许禁止AI修改

**职责范围 (Scope):** 提供 UI 层通用的辅助函数，与具体业务逻辑解耦。

**所属层级:** UI (`source/UI/utils`)

**准入标准 (Criteria):
- 必须是多个 UI 组件或面板可能复用的逻辑。
- 优先封装纯函数或与 UI 框架无关的逻辑。
- 可以依赖 `src/toolBox` 中的 `base` 层或 `feature` 层工具。
- **禁止**包含特定面板或组件的业务逻辑。
- **命名规范:** 必须遵循项目 `GUIDELINES.md` 中定义的函数命名规范和 "流畅优美的文式编程风格" 核心要求。

**架构总纲:** [`../../../architecture_layers_explained.md`](../../../architecture_layers_explained.md)

---

# AI 笔记 - UI 通用工具 (utils)

## 历史记录与重要变更

*   **2024-07-31 (织):**
    *   创建 `formatDisplayUtils.js` 文件，用于统一管理 UI 层的数据显示格式化函数。
    *   将 `src/toolBox` 中的 `生成文件列表描述` 导入并重命名为 `formatFileListDescription` 导出，供 UI 组件使用，以降低耦合。
    *   调整 `formatFileListDescription` 函数，使其在输入为空时返回 '无选择'，以匹配某些 UI 组件的期望行为。
    *   在 `formatDisplayUtils.js` 中添加 TODO，提醒后续需要添加 `formatFileFormatDescription` 函数来处理文件格式显示。

## 文件依赖记录

- `source/UI/utils/layoutComputer/masonry/layout.js` 依赖于第三方库 `rbush.js`。
- `rbush.js` 已被移动到标准位置 `static/rbush.js` (之前错误地放在 `src/toolBox/base/useDeps/thirdParty/`)。
- `layout.js` 中对应的 import 路径为 `../../../../../static/rbush.js`。

## 依赖位置原则

1.  **第三方库:**
    *   npm 依赖: 保留在 `node_modules`，直接 `import` 包名。
    *   独立 JS 文件: 放置在根目录 `static/` 下 (如 `rbush.js`)。
2.  **内部模块:**
    *   **核心/底层 (`src/toolBox/`):** 通用、独立工具，不反向依赖 `source/`，配置项通过参数传入。
    *   **应用/UI (`source/`):
        *   通用 UI 工具 (`source/UI/utils/`): UI 层复用工具、常量 (如 `layoutConstants.js`)。
        *   UI 组件 (`source/UI/components/`): Vue 组件等。
        *   其他按功能划分 (server, data, polyfills)。

**目标:** 职责清晰，避免反向依赖，规范存放。 