# 这个区段由开发者编写,未经允许禁止AI修改

## 职责范围
本目录 (`src/shared/`) 是插件所有共享代码的统一存放位置，包含可复用的UI组件、核心逻辑、工具函数、常量、配置等。

## 目录结构

- `constants/`: 存放共享常量。
- `config/`: 存放共享配置。
- `enums/`: 存放共享枚举。
- `logViewer/`: 存放日志查看器模块 (独立功能模块)。
- `ui/`: 存放所有共享 **UI 组件**。
    - `siyuanUI-vue/`: **(标准思源UI库)** 存放严格遵循思源设计规范的 **Vue** UI 组件。
    - `sacUI-vue/`: **(插件定制UI库)** 存放 SAC 插件特有的、可复用的 **Vue** UI 组件 (例如特殊查看器、复杂表单组合等)。
- `components/`: **(遗留/非标组件)** 存放项目早期遗留的、不同风格或非标准的共享组件。**此目录下的组件应逐步被 `ui/` 中的标准组件替换或重构。避免在此添加新的UI组件。**
- `composables/`: 存放通用的 Vue 组合式 API 逻辑。
- `utils/`: 存放通用的、与UI或框架无关的工具函数。
- `core/`: (如果需要) 存放核心的共享逻辑。
- `index.js`: 模块入口文件。
- `README.md`, `AInote.md`, `history.md`: 文档与记录。

## 迁移计划 (`source/UI/` -> `src/shared/`)

**状态:** 进行中

**策略:**

1.  **目标:** 将 `source/UI/components/` 和 `source/UI/composables/` 下的可复用、非面板类组件和逻辑迁移到 `src/shared/` 下对应的 `ui/sacUI-vue/` 或 `composables/`/`utils/` 目录。
2.  **原则:**
    *   **从小到大:** 优先迁移行数较少的文件。
    *   **遇大则分:** 对于超过 200 行的组件，考虑是否需要拆分成更小的、更通用的组件或 composables，然后再迁移。
    *   **暂不迁移面板:** `source/UI/pannels/` 中的大型面板组件暂时不迁移，待共享组件库稳定后再评估。
3.  **分类:**
    *   思源标准风格 UI 组件 -> `src/shared/ui/siyuanUI-vue/` (已完成标准化)
    *   插件特定可复用 UI 组件 -> `src/shared/ui/sacUI-vue/components/`
    *   插件特定可复用逻辑 (Composables) -> `src/shared/ui/sacUI-vue/composables/` 或 `src/shared/composables/` (根据通用性判断)
    *   通用工具函数 -> `src/shared/utils/`
    *   遗留/非标/待整理组件 -> 暂存 `src/shared/components/` (未来需重构或归类)

**待处理列表 (来自 `source/UI/components/`):**

*   [x] `fileList.vue` (17行) -> 已迁移至 `src/shared/ui/sacUI-vue/components/`
*   [x] `common/fileListItem.vue` (47行) -> 已迁移至 `src/shared/ui/sacUI-vue/components/common/`
*   [x] `common/icons.js` (2行) -> **已使用 SIcon 替换并删除**
*   [x] `common/dropzone.vue` (16行) -> 已迁移至 `src/shared/ui/sacUI-vue/components/common/`
*   [ ] `common/dockSubPanelTitle.vue` (30行)
*   [ ] `assetCard.vue` (305行) -> **需要拆分?**
*   [ ] `collectionPanel.vue` (197行) -> **面板, 暂缓**
*   [ ] `NumberInput.vue` (20行) -> **已替换为 SNumberInput, 待删除/归档**
*   [ ] `common/assetStyles.js` (115行) -> **样式脚本? 待分析**
*   [ ] `common/assetsThumbnailCard.vue` (203行) -> **需要拆分?**
*   [ ] `common/thumbnailGalleryHori.vue` (236行) -> **需要拆分?**
*   [ ] `common/echarts.vue` (107行)
*   [ ] `common/apiTester.vue` (214行) -> **需要拆分?**
*   [ ] `common/multiSrcImage.vue` (136行)

**待处理列表 (来自 `source/UI/composables/`):**

*   [ ] `useFloatablePanel.js` (146行)


**路径映射 (旧 -> 新):**

*   `source/shared/siyuanUI-vue/` -> `src/shared/ui/siyuanUI-vue/`
*   `source/UI/components/fileList.vue` -> `src/shared/ui/sacUI-vue/components/fileList.vue`
*   `source/UI/components/common/fileListItem.vue` -> `src/shared/ui/sacUI-vue/components/common/fileListItem.vue`
*   `source/UI/components/common/dropzone.vue` -> `src/shared/ui/sacUI-vue/components/common/dropzone.vue`

---

# 历史记录

(原有 history.md 内容可以合并到这里，或者保留独立文件)

# 本部分由开发者编写,未经允许禁止AI助手更改

shared目录是项目共享资源的集中管理中心，用于存放跨模块使用的常量、模型和配置等。
i18n不由这个文件处理


## 重构计划

阶段计数: 2

当前正在进行shared目录基础结构的建设，已完成了常量定义、枚举类型和配置管理，接下来重点完成以下任务：

1. 创建models目录，定义数据模型
2. 完善config目录，添加defaultSettings.js和featureFlags.js
3. 创建i18n目录，整合国际化资源
4. 迁移source/shared/siyuanUI-vue组件

## 重构原则

1. **去中心化**:
   - 避免使用大型的中央配置文件
   - 按功能域分散配置，便于维护和扩展

2. **类型定义**:
   - 为所有共享资源提供明确的类型定义和文档
   - 使用JSDoc注释增强代码提示和验证

3. **不可变性**:
   - 所有常量应该是只读的，防止意外修改
   - 使用Object.freeze()保证对象常量的不可变性

4. **命名规范**:
   - 常量使用全大写下划线命名或驼峰命名（中文名称）
   - 枚举使用PascalCase命名（英文）或正常中文名称
   - 配置使用camelCase命名（英文）或正常中文名称

## 从现有代码中迁移

需要从以下位置迁移共享资源：

1. `source/shared/` - 旧的共享资源目录
2. `source/constants/` - 常量定义
3. 各个模块中散落的常量定义
4. `index.js`中定义的全局常量

## 注意事项

1. shared目录中的文件不应该依赖其他模块，以避免循环依赖
2. 所有常量应该有明确的分类和命名，避免通用名称造成冲突
3. 在迁移过程中保持向后兼容，可以使用导出兼容层
4. 新增的常量和配置应该遵循项目的整体设计理念 