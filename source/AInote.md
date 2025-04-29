# 本区块由开发者编写,未经允许禁止AI助手更改

utils子文件夹是重构进度的重点,它们需要被移动到toolBox中

重构的时候注意阅读toolBox层中的相关文件

# 源代码重构笔记

## 重构状态

本目录包含原始源代码，当前正在进行重构，将逐步迁移到新的架构中。

## 职责范围

- 包含插件的原始源代码和实现
- 提供UI组件、工具函数、服务等功能
- 实现插件与思源笔记的交互

## 重构原则

1. **逐步迁移**：
   - 按照功能模块逐步迁移
   - 保持兼容性，确保功能正常
   - 优先迁移基础工具和通用功能

2. **分类重组**：
   - 工具函数迁移到src/toolBox
   - 业务服务迁移到src/services
   - UI组件迁移到src/modules
   - 中间层处理迁移到src/middlewares

3. **代码规范化**：
   - 使用ES模块语法
   - 函数式编程风格
   - 中文命名函数和变量
   - 添加完善的注释和文档

4. **依赖处理**：
   - 梳理依赖关系
   - 处理循环依赖问题
   - 集中管理外部依赖

## 重构计划

### 阶段1：分析和梳理

计划目标：
- 分析现有代码结构
- 建立功能模块映射
- 识别重构优先级
- 制定迁移路径

### 阶段2：工具函数迁移

计划目标：
- 迁移utils目录下的通用工具
- 迁移polyfills目录下的兼容代码
- 迁移shared目录下的共享功能
- 建立兼容层，保证旧代码正常工作

### 阶段3：服务和核心功能迁移

计划目标：
- 迁移servicies目录下的业务服务
- 迁移server目录下的服务端代码
- 迁移events目录下的事件处理
- 迁移globalStatus目录下的状态管理

### 阶段4：UI组件迁移

计划目标：
- 迁移UI目录下的界面组件
- 迁移previewers目录下的预览功能
- 迁移utilWebviews目录下的Webview工具
- 建立基于模块的UI组件架构

## 目录迁移映射

| 现有目录 | 迁移目标 | 优先级 | 状态 |
|---------|---------|-------|------|
| utils/ | src/toolBox/base | 高 | 进行中 |
| polyfills/ | src/toolBox/base/usePolyfills | 高 | 进行中 |
| shared/ | src/toolBox/base | 高 | 待处理 |
| servicies/ | src/services | 中 | 待处理 |
| events/ | src/services | 中 | 待处理 |
| server/ | src/services | 中 | 待处理 |
| UI/ | src/modules | 低 | 待处理 |
| host/ | src/services | 中 | 待处理 |
| fromDeps/ | src/toolBox/base/useDeps | 中 | 待处理 |
| fromThirdParty/ | src/toolBox/base/useDeps | 中 | 待处理 |
| fromRuntime/ | src/services | 低 | 待处理 |
| triggers/ | src/middlewares | 低 | 待处理 |
| noteChat/ | src/modules | 低 | 待处理 |
| globalStatus/ | src/services | 中 | 待处理 |
| data/ | src/services | 中 | 待处理 |
| URT/ | src/toolBox/base/forURT | 低 | 待处理 |
| utilWebviews/ | src/modules | 低 | 待处理 |
| previewers/ | src/modules | 低 | 待处理 |
| wgslLibs/ | src/toolBox/feature | 低 | 待处理 |

## 特殊处理说明

1. **异步模块处理**：
   - asyncModules.js将被重构为模块加载系统
   - 使用动态import替代自定义异步加载

2. **常量管理**：
   - constants.js将被分解到各模块中
   - 集中管理通用常量

3. **插件符号注册**：
   - pluginSymbolRegistry.js将被整合到服务注册系统

## 注意事项

- 确保每个迁移的模块都有完善的测试
- 保持向后兼容性，不破坏现有功能
- 记录迁移过程中的问题和解决方案
- 定期检查重构进度和质量

## 历史记录

### 2024-07-28 (织)
- 清理 `source/fromThirdParty/siyuanClient/` 目录下的废弃兼容层文件 (`runtime.js`, `index.js`, `dialogs/confirmPromises.js`)。
- 更新 `src/toolBox/useAge/forSiyuan/forAsset/useSiyuanUpload.js` 和 `source/UI/components/CCDialog.vue` 中对上述废弃文件的引用，使其直接从 `toolBox` 导入。
- **学习到:** 搜索文件引用时应使用更通用的路径片段，删除文件前应先移动到 `@trashed` 目录，并在对应文件夹的 AInote.md 中记录删除。
- 开始迁移 `source/fromThirdParty/siyuanKernel/utils/` 下的函数，将 `fetchWithTimeout` 迁移至 `toolBox`。
- 完成 `siyuanKernel/utils/` 的迁移和清理，将 `getAuthHeaders` 迁移至 `toolBox`。
- 清理 `source/fromThirdParty/siyuanKernel/asset.js` (兼容层)。
- 清理 `source/fromThirdParty/siyuanKernel/block.js` (兼容层)。
- 清理 `source/fromThirdParty/siyuanKernel/attr.js` (兼容层)。
- 迁移 `source/fromThirdParty/siyuanKernel/av.js` 到 `toolBox` 并更新内部引用。
- 迁移 `source/fromThirdParty/siyuanKernel/bazaar.js` 到 `toolBox` 并更新内部引用。
- 清理 `source/fromThirdParty/siyuanKernel/blockOp.js` (兼容层)。
- 迁移 `source/fromThirdParty/siyuanKernel/bookmark.js` 到 `toolBox` 并更新内部引用。
- 迁移 `source/fromThirdParty/siyuanKernel/broadcast.js` 到 `toolBox` 并更新内部引用。
- 迁移 `source/fromThirdParty/siyuanKernel/clipboard.js` 到 `toolBox` 并更新内部引用。
- 迁移 `source/fromThirdParty/siyuanKernel/export.js` 到 `toolBox` 并更新内部引用。
- 迁移 `source/fromThirdParty/siyuanKernel/extension.js` 到 `toolBox` 并更新内部引用。
- 清理 `source/fromThirdParty/siyuanKernel/file.js` (兼容层)。
- 清理 `source/fromThirdParty/siyuanKernel/filetree.js` (兼容层)。
- 迁移 `source/fromThirdParty/siyuanKernel/format.js` 到 `toolBox` 并更新内部引用。
- 迁移 `source/fromThirdParty/siyuanKernel/graph.js` 到 `toolBox` 并更新内部引用。
- 迁移 `source/fromThirdParty/siyuanKernel/history.js` 到 `toolBox` 并更新内部引用。

### 2024-03-28
- 开始分析source目录结构
- 建立初步重构计划

### 2024-03-25
- 完成工具箱基础框架设计
- 开始规划source目录迁移

## source 目录重构记录

- 原 `source/fromThirdParty/` 目录下的所有第三方封装（siyuanKernel, anytext 等）已完成迁移或清理，相关历史记录已移至 `diary/fromThirdParty_Migration_History.md`。
- 清理了 `source/` 目录下空的 `thumbnail.html` 和 `constants.js` 文件。
- 将 `source/AInote-阅读进度.md` 移动到 `diary/source_Code_Reading_Notes.md`。
- 将 `source/URT/` 目录整体迁移至 `src/toolBox/base/forURT/`。 