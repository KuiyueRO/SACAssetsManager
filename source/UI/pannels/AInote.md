# 这个区段由开发者编写,未经允许禁止AI修改
<开发者将会在这里提出要求,AI需要判断并满足这些要求>

## 面板规范

1. 每个面板使用单独的文件夹
2. 面板必须有一个入口文件（通常是index.vue或类似语义化名称）
3. 面板必须导出default方法来创建面板
4. 复杂面板应该使用单独的组件文件
5. 请遵循Vue3组合式API的风格编写代码

## 关于协作编辑

1. 使用useSyncedStore系列函数实现协作编辑
2. 避免直接操作底层Yjs对象
3. 协作编辑时注意冲突处理
4. 使用roomName区分不同编辑空间

## 设计思路

1. **Tab唤起机制需求**：
   - 从全景图预览器唤起批量视频导出器
   - 保持单视频导出功能在全景图预览器内

2. **实现方式**：
   - 使用事件总线进行组件间通信
   - 扩展Plugin类，添加统一的Tab唤起方法
   - 模块化设计，保持职责分离

3. **代码结构**：
   - 在index.js中添加openTab方法，基于思源笔记原生API
   - 定义标准化事件格式，便于跨组件通信
   - 为每个组件添加必要的事件监听器

## 实现细节

1. **通信机制**：
   - 使用eventBus作为中央事件总线
   - 定义特定的事件类型，如`open-tab`
   - 包含所需参数：tabType, data等

2. **事件集成点**：
   - 在各个组件的onMounted生命周期中注册事件监听
   - 在组件销毁时自动移除监听器，避免内存泄漏

3. **UI设计**：
   - 在全景图预览器中添加"批量导出"按钮
   - 提供清晰的用户引导，说明功能区别

## 注意事项

1. 所有Tab通信都通过中央事件总线，避免直接引用
2. 采用单向数据流，保持组件解耦
3. 提供合理的错误处理和降级机制

---

# AI 笔记 - UI 面板 (pannels)

## 历史记录与重要变更

*   **YYYY-MM-DD (织):**
    *   将 `source/UI/pannels/toolbox.vue` 迁移到 `source/UI/pannels/toolPanel/toolPanel.vue`，以符合面板组件的目录结构规范。
*   **2024-07-31 (织):**
    *   开始审查 `assetInfoPanel` 面板。
    *   修正了 `assetInfoPanel.vue` 和 `assetInfoPanel.js` 的文件名拼写错误。
    *   移除了 `assetInfoPanel` 目录下已废弃的兼容层垫片 `assetLabelUtils.js` 和 `fileUtils.js`。
    *   将 `assetInfoPanel.js` 中通用的数组去重函数 `清理重复元素` 迁移到 `src/toolBox/base/useEcma/forArray/computeArraySets.js`，并更新了 `assetInfoPanel.js` 的导入。
    *   修复了 `assetInfoPanel/index.vue` 中对主组件 `assetInfoPanel.vue` 的导入路径错误 (因之前文件名修正导致)。
    *   修复了 `assetInfoPanel.vue` 中对 Eagle 元数据搜集函数 (`搜集eagle元数据`) 的导入路径错误，改为引用 `src/toolBox/feature/forEagleFs/fromEagleFs.js` 中的 `fromEagleFs_findMetadataFiles` 函数。
    *   修复了 `assetInfoPanel.vue` 中对获取素材笔记信息函数 (`获取数组中素材所在笔记`) 的导入路径错误，改为引用 `src/toolBox/useAge/forSiyuan/fromSiyuanData/fromSiyuanData.js` 中的 `fromSiyuan_getAssetNotesByPaths` 函数。

## 面板列表与状态

*   `assetInfoPanel`: 资产信息展示与编辑面板 (正在审查与重构中)
*   ... 