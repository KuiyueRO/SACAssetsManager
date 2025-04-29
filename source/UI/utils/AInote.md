# 这个区段由开发者编写,未经允许禁止AI修改

# AI 笔记

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