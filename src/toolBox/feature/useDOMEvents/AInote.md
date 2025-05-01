# 这个区段由开发者编写,未经允许禁止AI修改

# DOM 事件处理工具 (useDOMEvents) 笔记

**所属层级:** Feature

**职责范围:** 提供更高级的 DOM 事件处理功能，例如事件收集、连续事件（双击、三击等）处理。

**准入标准:**
- 构建于 `base/useBrowser` 层提供的基础事件处理能力之上。
- 可以依赖 `base` 层的其他模块。
- **禁止**依赖 `useAge` 层或特定应用的逻辑。

## 历史记录

### 2024-07-29 (织)
- 重构 `useDomEventCollector.js`：
  - 移除了内部的 `debounce` 实现逻辑。
  - 修改为导入并使用 `base/useEcma/forFunctions/forDebounce.js` 中新增的 `keyedDebounce` 函数。
  - 使用外部 `debounceTimers` Map 传递给 `keyedDebounce` 来管理不同事件目标的计时器。
  - 更新了 `dispose` 函数以正确清理 `debounceTimers`。
  - 目标是统一防抖实现，利用基础层提供的更灵活的防抖工具。 