# 这个区块的内容来自开发者,禁止AI未经允许修改

# AI 笔记

## 依赖位置原则

1.  **第三方库:**
    *   npm 依赖: 保留在 `node_modules`，直接 `import` 包名。
    *   独立 JS 文件: 放置在根目录 `static/` 下 (如 `rbush.js`)。
2.  **内部模块:**
    *   **核心/底层 (`src/toolBox/`):** 通用、独立工具，不反向依赖 `source/`，配置项通过参数传入。
    *   **应用/UI (`source/`):**
        *   通用 UI 工具 (`source/UI/utils/`): UI 层复用工具、常量 (如 `layoutConstants.js`)。
        *   UI 组件 (`source/UI/components/`): Vue 组件等。
        *   其他按功能划分 (server, data, polyfills)。

**目标:** 职责清晰，避免反向依赖，规范存放。

现在扫描所有utils等类似命名的文件夹,尝试进行重构

注意我们需要集中思源笔记的环境依赖,可以使用useSiyuan进行集中

由于一些原因项目中零散分布有一些工具文件,你也需要重构这些文件

对于外部依赖,当你发现一个node_modules中的依赖可能可以使用static中使用esm形式打包成静态文件时,你应该提出建议(但是不要修改,这一部分暂时由开发者处理)

注意项目中的**每一个**文件夹你都可以创建readme和AInote

有关重构的最终目标你可以查看项目根目录的index new.js

**已经完成的重构之后应该有一个倒数计数,每次计数为零时视为完成了一个阶段性重构,此时你应该总结当前的任务进度到history.md,不要让太多的细节干扰这个文件的框架**

**阶段计数是一个倒数进度,每次任务计划完成后需要减一,当减至零时表示完成一个阶段,此时应总结进度到history.md并重置计数**

**详细的历史记录应该只出现在history.md中,AInote.md只需要计数和简单提示,这个文件主要记录的是重构心得和要求而不是历史详情**

**先停止不断扩充工具箱,开始检查功能代码的实现**

---
*2024-07-27 织: 已阅读并理解 `toolBox` 目录的整体结构、主要内容以及 `AInote.md` 和 `README.md` 中的开发要求与重构计划。*
*2024-07-28 织: 将详细的重构原则、文件夹规范、架构说明、导入导出规范、依赖管理原则、历史记录和未来计划拆分到独立文件，使 `AInote.md` 保持精简。*
---

# 工具箱重构笔记

## 当前状态与核心链接

**阶段计数:** 3 (计数为零时总结到 `history.md` 并重置)

**当前重构焦点:** (根据实际情况更新)
- 开始阶段5：专注于思源笔记工具函数的整合与优化，解决模块间功能重叠问题
- 优化useSiyuanSlash、useSiyuanDialog、useSiyuanMenu等模块的接口规范化
- 对冗余代码进行清理，提高代码质量和性能表现
- 完善文档和示例，确保API的一致性和可用性


**重要文档链接:**
- **开发与重构指南:** [`./GUIDELINES.md`](./GUIDELINES.md) (包含重构原则、文件夹规范、导入导出规范等)
- **架构分层详解:** [`./architecture_layers_explained.md`](./architecture_layers_explained.md)
- **详细重构历史:** [`./history.md`](./history.md)
- **未来重构计划:** [`./phase4_plan.md`](./phase4_plan.md) (包含目录整理计划)
- **工具箱根说明:** [`./README.md`](./README.md)

## 工具箱结构概览 (参考)

```
src/toolBox/
├── base/           - 核心基础工具 (按技术基础分类)
├── feature/        - 特定功能模块 (按独立能力分类)
├── useAge/         - 应用场景/任务工具 (按领域或任务分类)
├── GUIDELINES.md   - 开发与重构指南 (新)
├── architecture_layers_explained.md - 架构分层详解
├── history.md      - 详细重构历史
├── phase4_plan.md  - 未来重构计划
├── toolBoxExports.js - (**逐步废弃**) 统一导出接口
└── README.md       - 工具箱说明
```

*注意：`toolBoxExports.js` 和桶文件 (`*Exports.js`) 将逐步被直接路径导入取代。*

# 这个区段由开发者编写,未经允许禁止AI修改
<开发者将会在这里提出要求,AI需要判断并满足这些要求>

基于对原有代码的理解，toolBox是一个经过深思熟虑的三层架构设计，旨在提供高度解耦、可重用和性能优化的工具函数库。

关键是保持每一层的职责清晰，确保依赖方向自下而上，避免循环引用。

# ToolBox - 工具箱模块

## 概述

工具箱(`toolBox`)模块是插件的核心基础设施，提供了一套高度模块化、可重用的工具函数集合。采用三层架构设计，确保功能的分离和依赖的清晰管理。

## 架构设计

### 三层架构

1. **基础层 (`base/`)**
   - 提供与环境、语言特性、基础设施相关的工具
   - 不依赖项目其他模块，保持高度独立性
   - 专注于底层能力的封装

2. **特性层 (`feature/`)**
   - 基于基础层构建的功能性工具
   - 解决特定领域问题的工具集
   - 可依赖基础层，但不应依赖应用层

3. **应用层 (`useAge/`)**
   - 面向具体应用场景的工具函数
   - 集成基础层和特性层能力，提供业务级解决方案
   - 可以依赖基础层和特性层

### 依赖规则

- 严格遵循自下而上的依赖原则:
  - `base` 不依赖任何其他模块
  - `feature` 只依赖 `base`
  - `useAge` 可依赖 `base` 和 `feature`

- 禁止循环依赖:
  - 同一层内的模块之间尽量避免互相依赖
  - 必要时通过依赖注入或事件机制解耦

### 导出机制

采用统一的模块导出机制，每一层有自己的导出文件:
- `baseExports.js`
- `featureExports.js`
- `useAgeExports.js`

顶层导出通过 `toolBoxExports.js` 聚合三层导出。

## 基础层详细结构

基础层(`base/`)主要包含以下核心模块:

1. **环境与平台 (`useEnv/`)**
   - 环境检测与适配
   - 平台特性检查
   - 运行时环境管理

2. **ECMA标准功能 (`useEcma/`)**
   - JavaScript语言特性增强
   - 标准函数增强与降级兼容
   - 函数式编程工具

3. **浏览器能力 (`useBrowser/`)**
   - DOM操作工具
   - BOM功能封装
   - 浏览器API适配

4. **网络功能 (`forNetWork/`)**
   - HTTP请求工具
   - 网络状态监测
   - WebSocket封装
   - 端口管理工具

5. **路径处理 (`usePath/`)**
   - 路径解析与构建
   - URL处理
   - 路径安全检查

6. **工具链 (`forChain/`)**
   - 函数组合工具
   - 管道处理函数
   - 链式调用支持

## 特性层详细结构

特性层(`feature/`)包含以下主要模块:

1. **Vue集成 (`useVue/`)**
   - Vue组件动态加载
   - Vue实例创建与管理
   - 自定义组件工具

2. **图像处理 (`useImage/`)**
   - 图像加载与优化
   - 图像转换工具
   - 图像分析功能

3. **面板绑定 (`panelBinding/`)**
   - 界面面板创建工具
   - 事件与数据绑定
   - 面板状态管理

4. **向量与嵌入 (`forVectorEmbedding/`)**
   - 向量计算工具
   - 嵌入模型接口
   - 相似度计算工具

## 应用层详细结构

应用层(`useAge/`)主要模块:

1. **思源笔记集成 (`forSiyuan/`)**
   - 思源API封装
   - 笔记本管理工具
   - 思源特性适配

2. **生态系统集成**
   - Eagle素材库集成 (`forEagle/`)
   - RSS处理工具 (`useRSS/`)
   - NPM集成工具 (`forNpm/`)

3. **文件管理 (`forFileManage/`)**
   - 文件操作工具
   - 目录管理功能
   - 文件系统集成

## 性能优化策略

工具箱模块采用以下性能优化策略:

1. **延迟加载**
   - 非核心功能采用动态导入
   - 按需加载减少初始加载时间

2. **函数优化**
   - 使用记忆化提高重复调用性能
   - 批处理机制减少频繁操作开销

3. **资源管理**
   - 适当缓存避免重复计算
   - 资源池管理重用对象

## 测试与文档

1. **单元测试**
   - 每个工具函数应有对应的单元测试
   - 测试覆盖率目标>90%

2. **文档生成**
   - 使用JSDoc注释生成API文档
   - 提供使用示例和最佳实践

## 工具函数迁移计划

发现source目录下存在多处工具函数需要迁移到toolBox中，特别是source/utils下的函数。

### 待迁移内容分析

1. **来自source/utils/functionTools.js**
   - 函数式编程工具：`顺序组合函数`, `管道函数`, `柯里化`, `等待参数达到长度后执行`, `组合函数`等
   - 迁移目标：`src/toolBox/base/forChain/`，作为基础层的函数链功能

2. **来自source/utils/functionAndClass/performanceRun.js**
   - 性能监测包装器：`withPerformanceLogging`
   - 迁移目标：`src/toolBox/base/useEcma/performance.js`或创建新的性能监测目录

3. **来自source/utils/vector/similarity.js**
   - 向量计算工具：`计算归一化向量余弦相似度`, `计算余弦相似度`, `计算欧氏距离相似度`, `计算Levenshtein距离`
   - 迁移目标：`src/toolBox/feature/forVectorEmbedding/similarity.js`

### 迁移优先级

1. **高优先级**
   - 基础函数式工具 (functionTools.js)：这些是构建其他功能的基础
   - 性能监测工具 (performanceRun.js)：用于优化其他工具函数

2. **中优先级**
   - 向量计算工具 (similarity.js)：在AI特性中使用但不是最基础的组件

### 迁移步骤

1. **代码分析与清理**
   - 检查现有代码质量和依赖关系
   - 删除废弃或多余代码
   - 标准化函数签名和返回值

2. **功能迁移**
   - 遵循三层架构划分功能
   - 创建适当的文件和目录结构
   - 保留原有功能的同时优化实现

3. **接口统一**
   - 提供一致的中英文命名
   - 统一错误处理机制
   - 完善函数文档

4. **测试与验证**
   - 为迁移的功能添加单元测试
   - 验证与原有功能的一致性
   - 检查性能差异

5. **更新引用**
   - 通过导出别名保持向后兼容
   - 渐进式更新调用代码
   - 记录废弃的API并设置迁移计划

## 历史记录与更新日志

### 2023-12-15 更新
- 优化了useVue组件加载机制
- 添加了forSiyuan的API封装
- 完善了工具箱导出结构

### 2023-10-20 更新
- 实现了三层架构基本框架
- 添加了核心工具函数
- 建立了模块间依赖规则

## 网络处理工具迁移建议

以下是source目录中可整理到toolBox的网络处理相关的通用代码：

### 已完成迁移
- `source/data/fetchStream.js` → `src/toolBox/feature/networkingUtils/streamProcessors.js`
  - 对流式JSON数据处理的功能已经被现代化、规范化并移至工具箱
- `source/data/utils/streamHandler.js` → `src/toolBox/feature/networkingUtils/streamHandlers.js`
  - 将类转换为函数式风格，提供更灵活的数据流处理API
- `source/server/processors/streams/fileList2Stats.js` → `src/toolBox/feature/forFileSystem/forFileListProcessing.js`
  - 重构为纯函数风格，提供文件列表到状态转换的功能
- `source/server/processors/streams/withFilter.js` → `src/toolBox/feature/forStreamProcessing/streamFilters.js`
  - 重构为纯函数风格，提供通用的流过滤器构建功能

### 引用更新状态
- 已更新 `source/server/handlers/stream-glob.js` 使用新的工具箱函数
- 已为原始位置的文件创建兼容层重定向，确保现有代码不会中断

### 清理计划
为了确保代码库整洁和易于维护，计划在以下时间节点逐步移除兼容层：

1. **第一阶段（当前）**：
   - 保留兼容层，但添加弃用警告
   - 鼓励新代码直接使用工具箱中的函数

2. **第二阶段（2024年9月）**：
   - 扫描项目中所有直接引用旧路径的代码，更新为新路径
   - 收集兼容层使用情况的数据（通过警告日志）

3. **第三阶段（2024年10月）**：
   - 完全移除兼容层
   - 检查并修复任何引用错误

### 下一步计划
- 优化新创建的模块之间的互操作性
- 添加更多单元测试确保功能正确性
- 继续扫描项目中对旧文件路径的引用，主动更新

所有迁移工作遵循toolBox的架构规范，保持清晰的代码组织结构和职责划分。

阶段计数:0


