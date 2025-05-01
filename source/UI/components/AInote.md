# 这个区段由开发者编写,未经允许禁止AI修改

# AI 笔记

## 文件位置记录

-   之前位于 `source/UI/utils/threhold.js` 的布局相关常量（如 `LAYOUT_COLUMN`, `LAYOUT_ROW`, `表格视图阈值`）和函数（`根据尺寸获取显示模式`）已被重构并移动到 `source/UI/utils/layoutConstants.js` (原位于 `src/toolBox/base/useConstants/layoutConstants.js`)。
-   在 `assetGalleryPanel.vue` 中引用时，相对路径是 `../utils/layoutConstants.js`。
-   在 `assetsGridRbush.vue` 中引用时，相对路径是 `../../utils/layoutConstants.js`。
-   在 `assetStyles.js` 中引用时，相对路径是 `../utils/layoutConstants.js`。

## 注意事项与修复

- **路径修复 (2024-07-29)**: 更新了 `assetGalleryPanel.vue` 中 `computeMasonryLayoutMetrics.js` 的导入路径，从旧的 `src/toolBox/base/useMath/geometry/` 指向新的 `src/toolBox/base/math/`。
- **路径修复 (2024-07-29)**: 更新了 `componentUtils.js` 中 `forImage.js` 的导入路径，从旧的 `src/toolBox/base/forMime/` 指向新的 `src/toolBox/base/mime/`。
- **`$size` 计算属性**: 在 `assetGalleryPanel.vue` 中，`$size` 计算属性依赖于子组件 `assetsGridRbush` (`grid.value`) 暴露的 `getContainerWidth` 方法以及传递的 `columnCount`。
  - **问题:** 在初始渲染或子组件挂载完成前，`grid.value` 可能为 `null`，导致调用 `grid.value.getContainerWidth()` 时抛出 `TypeError: Cannot read properties of null (reading 'getContainerWidth')`。
  - **修复 (2024-07-31):** 在 `$size` 计算属性内部所有访问 `grid.value.getContainerWidth()` 的地方，都添加了 `grid.value && ...` 的前置检查，确保只在 `grid.value` 存在时才执行调用。 