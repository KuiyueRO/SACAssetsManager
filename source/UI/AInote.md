# UI组件库重构笔记

## 重构状态

UI组件库正在重构中，计划将组件逐步迁移到`/src/shared/components`或`source/shared/siyuanUI-vue/components`目录。

## 职责范围

- 提供用户界面组件
- 实现交互逻辑
- 管理视觉样式
- 支持主题定制
- 处理用户输入

## 重构原则

1. **组件化设计**：
   - 拆分复杂UI为独立组件
   - 明确组件接口和责任
   - 提高组件可复用性

2. **无状态优先**：
   - 优先设计无状态组件
   - 将状态逻辑提升到适当层级
   - 使用函数式风格编写组件

3. **样式隔离**：
   - 确保组件样式不影响其他元素
   - 使用CSS变量适配主题
   - 适当使用Shadow DOM或CSS模块

4. **渐进式重构**：
   - 保持与现有系统兼容
   - 增量替换而非全面重写
   - 提供适配层支持过渡期

## 迁移计划

### 第一阶段：基础组件（已开始）

- 按钮、输入框、下拉菜单等基础控件 (对应 `siyuanUI-vue`)
- 对话框和提示组件 (对应 `siyuanUI-vue`)
- 图标系统

### 第二阶段：复合组件（计划中）

- 面板和标签页组件 (对应 `siyuanUI-vue`)
- 表格和列表组件
- 树形结构组件

### 第三阶段：专用组件（计划中）

- 编辑器相关组件
- 思源特定组件
- 插件专用UI

### 第四阶段：样式系统（计划中）

- 主题管理系统
- 动态样式生成
- 样式预处理工具

## 目录迁移映射

| 现有目录/文件 | 目标位置 | 优先级 | 状态 | 备注 |
|--------------|---------|-------|------|------|
| `source/shared/siyuanUI-vue/` | `src/shared/ui/siyuanUI-vue/` | 高 | 已完成 | 标准Vue UI库已迁移 |
| components/ (旧 `source/UI/`) | src/components/base (或 `src/shared/ui/siyuanUI-vue/`) | 高 | 进行中 | 基础组件迁移中，逐步替换为标准库 |
| dialogs/ (旧 `source/UI/`) | `src/shared/ui/siyuanUI-vue/` (或保留js实现) | 高 | 待开始 | 对话框组件，优先使用标准库 |
| dynamicCss/ (旧 `source/UI/`) | src/styles/dynamic | 中 | 待开始 | 动态样式系统 |
| icons/ (旧 `source/UI/`) | src/assets/icons | 中 | 待开始 | 图标资源 |
| pannels/ (旧 `source/UI/`) | 各面板内部 (使用 `src/shared/ui/siyuanUI-vue/`) | 中 | 进行中 | 面板组件，逐步使用标准库 |
| siyuanCommon/ (旧 `source/UI/`) | 各功能内部 (使用 `src/shared/ui/siyuanUI-vue/`) | 低 | 待开始 | 思源特定UI，考虑使用标准库原子组件 |
| toolBox/ (旧 `source/UI/`) | src/utils/ui | 高 | 进行中 | UI工具函数 |
| tab.js (旧 `source/UI/`) | `src/shared/ui/siyuanUI-vue/components/STab.vue` | 中 | 待开始 | 标签页逻辑，优先使用标准组件 |
| dock.js (旧 `source/UI/`) | src/components/dock (?) | 中 | 待开始 | 停靠面板逻辑，待评估 |

## 特殊处理说明

### 组件状态管理

重构过程中，组件状态管理将从混合式模式逐渐转向更统一的方式：

1. 简单组件使用函数参数和返回值管理状态
2. 中等复杂度组件使用自定义Hook管理状态
3. 复杂组件集成统一状态管理（通过上下文或全局状态）

### 主题适配

所有迁移的组件必须支持思源的主题系统：

1. 使用CSS变量而非硬编码颜色值 (`siyuanUI-vue` 已实现)
2. 通过`dynamicTheme`API注册动态样式
3. 支持明暗主题自动切换 (`siyuanUI-vue` 已实现)
4. 尊重用户自定义主题设置

### 渲染性能优化

UI组件的渲染性能是重点关注领域：

1. 最小化DOM操作，使用文档片段和批量更新
2. 实现虚拟滚动用于长列表
3. 延迟加载非关键组件
4. 使用性能分析工具检测和解决瓶颈

## 测试策略

1. **单元测试**：
   - 为核心组件逻辑编写单元测试
   - 验证组件输入输出行为
   - 测试边界条件和异常处理

2. **UI测试**：
   - 使用快照测试验证渲染一致性
   - 模拟用户交互测试交互逻辑
   - 测试键盘导航和辅助功能

3. **主题测试**：
   - 在不同主题下测试组件外观
   - 验证动态主题切换效果
   - 测试自定义主题兼容性

## 文档要求

每个迁移到新架构的组件需要满足以下文档要求：

1. 组件功能描述
2. API参数和返回值说明
3. 使用示例代码
4. 依赖关系说明
5. 性能考虑因素
6. 主题适配指南

## 重构日志

*   **2025-05-03 (织):**
    *   迁移 `common/dropzone.vue` 到 `src/shared/ui/sacUI-vue/components/common/`。
    *   确认 `common/icons.js` 功能可被 `SIcon.vue` 替代并完成替换。
    *   删除了 `common/icons.js`。
    *   迁移 `utils/layoutConstants.js` 到 `src/shared/utils/`。
    *   修正 `src/shared/assetStyles.js` 内部引用及所有外部引用路径。
    *   修复动态加载 `SIcon.vue` 时的路径问题。
    *   修复面包屑组件 (`breadCrumbItem.vue`, `localbreadCrumb.vue`) 图标和标签显示问题。
    *   迁移 `utils/scroll.js` 到 `src/shared/ui/sacUI-vue/utils/`。
    *   迁移 `components/common/thumbnailGalleryHori.vue` 到 `src/shared/ui/sacUI-vue/components/common/`。
    *   更新引用 `thumbnailGalleryHori.vue` 的路径。
    *   修正:** 更新 `pannels/assetInfoPanel/assetInfoPanel.vue` 和 `components/assetGalleryPanel.vue` 中对 `scroll.js` 的旧路径引用，解决 404 错误。
    *   迁移 `components/common/selection/multiple.vue` 到 `src/shared/ui/sacUI-vue/components/common/selection/`。
    *   更新引用 `multiple.vue` 的路径。
*   **2024-05-03 (织):**
    *   迁移 `fileList.vue` (17行) 到 `src/shared/ui/sacUI-vue/components/`。
    *   迁移 `common/fileListItem.vue` (47行) 到 `src/shared/ui/sacUI-vue/components/common/`。
    *   更新了引用路径并确认无外部旧路径引用。
*   **2024-04-29 (织):**
    *   分析了 `source/UI/` 目录结构和 `README.md`, `AInote.md`。
    *   添加了"标准组件应用点分析"章节。
*   **2024-04-27 (织):**
    *   将 `source/UI/components/NumberInput.vue` 的实现替换为使用标准库 `src/shared/ui/siyuanUI-vue/components/SNumberInput.vue`。
    *   修复了替换过程中错误的 import 路径。
| 日期 | 工作内容 | 状态 | 负责人 |
|------|---------|------|-------|
| 2023-12-01 | 初始化UI组件库重构计划 | 完成 | 团队 |
| 2023-12-15 | 完成基础按钮组件迁移 | 完成 | AI助手 |
| 2024-01-10 | 完成对话框组件设计 | 进行中 | AI助手 |
| 2024-01-25 | 建立动态CSS系统 | 进行中 | 团队 |
| 2024-04-27 | 完成`siyuanUI-vue`基础组件(Card, Dialog, Select, Toggle, Progress, Tab)的CSS变量化 | 完成 | AI助手 |
| 2024-04-27 | 优化 `siyuanUI-vue` 中的 `SIcon.vue` 组件 | 完成 | AI助手 |
| 2024-04-27 | 将 `source/UI/components/NumberInput.vue` 替换为使用标准的 `SNumberInput.vue` | 完成 | AI助手 |
| 2024-05-03 | 迁移 `fileList.vue` 到 `src/shared/ui/sacUI-vue/components/` | 完成 | 团队 |
| 2024-04-29 | 分析 `source/UI/` 目录结构和 `README.md`, `AInote.md` | 完成 | 团队 |

## 标准组件应用点分析 (2024-04-28)

根据对 `source/UI` 目录的分析，以下是可以使用 `src/shared/ui/siyuanUI-vue/components/` 中标准化Vue组件的潜在区域：

1.  **`source/UI/components/`**: 
    - 内部的 `.vue` 文件 (如 `assetGalleryPanel.vue`, `VWindow.vue`, `UrlInput.vue`, `logContent.vue`等) 包含大量可被标准组件替换的UI元素。
    - `NumberInput.vue` 可被 `SNumberInput.vue` 替代。
    - `CCDialog.vue` 可考虑使用 `SDialog.vue` 重构。
2.  **`source/UI/pannels/`**: 
    - 各面板子目录下的 `.vue` 文件是标准组件的主要应用场景。
    - 面板内的表单、按钮、信息展示、布局等都应使用标准组件库（`SCard`, `SInput`, `SSelect`, `SToggle`, `SButton`, `STab` 等）。
3.  **`source/UI/dialogs/`**: 
    - 现有的 `.js` 文件如果进行Vue化重构，或新增Vue对话框，应使用 `SDialog.vue`。
4.  **`source/UI/siyuanCommon/`**: 
    - 在与思源原生UI（菜单、Slash命令等）集成时，若涉及自定义渲染，可使用标准库中的原子组件（`SButton`, `SIcon`)保持风格统一。
    - `tabs.js` 的逻辑可能与 `STab.vue`