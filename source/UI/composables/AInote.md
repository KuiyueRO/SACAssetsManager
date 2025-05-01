# 这个区段由开发者编写,未经允许禁止AI修改

**职责范围 (Scope):** 提供 UI 层通用的、可复用的 Vue Composition API 函数 (Composables)。

**所属层级:** UI (`source/UI/composables`)

**准入标准 (Criteria):
- 必须是封装可复用状态逻辑或副作用逻辑的 Composition API 函数。
- 可以依赖 `source/UI/utils`、`source/globalStatus` 等 UI 层模块。
- 可以依赖 `src/toolBox` 中的工具函数，但应优先通过 `source/UI/utils` 间接调用。
- **禁止**包含特定面板或组件的业务逻辑（应由调用方传入）。
- **命名规范:** 函数名通常以 `use` 开头，遵循项目 `GUIDELINES.md` 的其余规范。

**架构总纲:** [`../../../architecture_layers_explained.md`](../../../architecture_layers_explained.md)

---

# AI 笔记 - UI 可组合函数 (composables)

## 历史记录与重要变更

*   **2024-07-31 (织):**
    *   审查了目录下唯一的 Composable 函数 `useFloatablePanel.js`。
    *   **分析结论:** 该函数封装了响应式浮动面板的核心逻辑（根据容器宽度自动显隐、动态加载组件），定位准确，无需迁移。其主要依赖 Vue Composition API 和思源的 `clientApi.Dialog` (通过 `asyncModules.js` 导入)。内部无适合提取到 `toolBox` 的通用纯函数。

## 文件列表

*   `useFloatablePanel.js`: 管理可根据容器宽度自动切换的浮动面板。 