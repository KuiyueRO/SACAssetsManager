# 这个区段由开发者编写,未经允许禁止AI修改

# 文件系统监听器 (watcher) 笔记

**所属层级:** Source (Server Processors)

**职责范围:** 提供混合监听策略（parcel watcher + 轮询）来监控文件系统变化。

## 历史记录

### 2024-07-29 (织)
- 修改 `hybirdWatcher.js`：
  - 移除 `lodash` 依赖。
  - 修改为导入并使用 `src/toolBox/base/useEcma/forFunctions/forDebounce.js` 中的标准 `debounce` 函数，用于轮询逻辑。
  - 目标是移除不必要的外部依赖，并统一使用 `toolBox` 提供的工具函数。
- 修改 `hybirdWatcher.js` 的 `@parcel/watcher` 依赖导入方式：
  - 在 `base/deps/npm/` 下创建了 `parcelWatcher.js` 转发模块。
  - 修改 `hybirdWatcher.js` 以通过该转发模块导入 `@parcel/watcher`。
  - 遵循全局依赖引用规范。 