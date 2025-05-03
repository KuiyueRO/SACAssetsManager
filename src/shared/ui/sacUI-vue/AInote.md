# 这个区段由开发者编写,未经允许禁止AI修改

# 修改日志

*   **2025-05-03 (织):**
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