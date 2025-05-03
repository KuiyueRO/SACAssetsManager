# 这个区段由开发者编写,未经允许禁止AI修改

# 修改日志

*   **2025-05-03 (织):**
    *   修正 `registerInterfaces.js` 中导入 `asyncModules.js` 的路径。
    *   之前的绝对路径错误指向了 `src/shared/`，已更正为正确的 `/plugins/SACAssetsManager/source/asyncModules.js`。
*   **2025-05-03 (织):**
    *   修复 `registerInterfaces.js` 中导入 `asyncModules.js` 的路径问题 (动态导入模块中的相对路径解析错误)。
    *   将导入路径从相对路径 `../asyncModules.js` 修改为绝对路径 `/plugins/SACAssetsManager/src/shared/asyncModules.js`。
*   **2025-05-03 (织):**
    *   迁移 `source/UI/dialog/` 目录到 `src/shared/ui/sacUI-vue/dialog/` (包含 `siyuanDialog.js`, `siyuanDialogValidator.js`, `AInote.md`)。
    *   修正 `registerInterfaces.js` 中指向 `toolBox` 的 `import` 路径。
*   **2025-05-03 (织):**
    *   迁移 `source/UI/registerInterfaces.js` 到 `src/shared/ui/sacUI-vue/registerInterfaces.js`。
    *   重构 `components/common/echarts.vue`：
        *   移除硬编码的 `<script src="...">` 标签，改为依赖全局 `window.echarts`。
        *   添加 `externalInstance` prop，允许传入外部 ECharts 实例。
        *   修改初始化和销毁逻辑以适配外部实例。
        *   添加 `window.echarts` 可用性检查和错误提示。
        *   添加 `normalizeOption` 辅助函数处理无效 series 配置。
*   **2025-05-03 (织):**
    *   重构并增强 `components/common/dropzone.vue`：
        *   添加 `accept`, `maxFileSize`, `maxTotalSize`, `multiple` props 用于文件验证。
        *   在 `handleDrop` 中实现文件类型、大小、数量验证逻辑。
        *   细化事件：`drop` 事件发送有效文件列表 (`File[]`)，`error` 事件发送无效文件列表及原因 (`{ file: File, reason: String }[]`)。
        *   改进 `dragleave` 处理逻辑，使用 `dragEnterCounter`。
        *   提供作用域插槽 `<slot :isDraggingOver="isDraggingOver">`。
        *   更新 CSS 样式和类名。
*   **2025-05-03 (织):**
    *   迁移 `source/UI/utils/scroll.js` 到 `utils/scroll.js`。
    *   迁移 `source/UI/components/common/thumbnailGalleryHori.vue` 到 `components/common/thumbnailGalleryHori.vue`。
    *   修复了因 `utils` 被错误创建为文件而导致的迁移失败。
    *   迁移 `source/UI/components/common/selection/multiple.vue` 到 `components/common/selection/multiple.vue`。
    *   **优化 `multiple.vue`:** 添加了键盘导航和 ARIA 属性。
    *   **重构 `multiple.vue`:** 将键盘导航逻辑提取到 Hook `useDropdownKeyboardNav.js`。
    *   **修正 `multiple.vue`:** 调整 `<script setup>` 中的代码顺序，修复因在初始化前访问 `filteredExtensions` 导致的 ReferenceError。
    *   **优化 `multiple.vue`:** 添加了键盘导航 (Enter/Space 打开关闭, Esc 关闭, Arrow Up/Down/Home/End 导航选项, Space/Enter 切换选项) 和 ARIA 属性 (role, aria-expanded, aria-selected) 以提升可访问性。
        *   **实现思路:** 使用 `ref` 获取触发器、搜索框、全选框和各选项的 DOM 元素。通过 `@keydown` 监听键盘事件。使用 `focusedOptionIndex` 状态追踪当前键盘焦点应在哪一项。通过 `nextTick` 和 `element.focus()` 管理焦点切换。为对应元素添加 ARIA role 和 state 属性。
    *   **重构 `multiple.vue`:** 将键盘导航和焦点管理逻辑提取到独立的 Hook `useDropdownKeyboardNav.js` 中，以降低主组件复杂度，解决代码行数过多的问题。 