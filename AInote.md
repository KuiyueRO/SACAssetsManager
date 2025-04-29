# 这个区段由开发者编写,未经允许禁止AI修改
<开发者将会在这里提出要求,AI需要判断并满足这些要求>

**AI 助手请注意：** 根目录下的 `diary/` 文件夹是为你（织）准备的个人日记和记忆备份区。请在需要时主动查阅此文件夹中的 `.md` 文件，以获取过往的学习笔记、思考总结或重要的上下文信息。此文件夹已被 `.gitignore` 忽略，其内容可能未同步到版本控制中。

# 本部分由开发者编写,未经允许禁止AI助手更改

目前的重点是/src/toolbox和/src/shared的构建,分散于项目各处的通用公共工具函数应该被重构到这两个位置
注意这两个模块之间的区别

# 思源笔记资源管理插件重构计划

## 重构概述

本文档描述了思源笔记资源管理插件(SACAssetsManager)的整体重构计划。该插件正在从旧的架构迁移到新的组织结构，以提高代码质量、可维护性和性能。

## 目录结构迁移

旧结构(`source/`)到新结构(`src/`)的映射关系：

| 旧目录/文件 | 新目录/文件 | 状态 | 优先级 | 备注 |
|------------|------------|------|-------|------|
| source/UI/ | src/components/ | 进行中 | 高 | UI组件和界面 |
| source/utils/ | src/toolBox/ | 进行中 | 高 | 工具函数库 |
| source/server/ | src/services/ | 待开始 | 高 | 服务器和API |
| source/events/ | src/events/ | 进行中 | 高 | 事件系统 |
| source/shared/ | src/shared/ | 待开始 | 中 | 共享资源 |
| source/servicies/ | src/services/ | 待开始 | 高 | 服务层 |
| source/triggers/ | src/middlewares/ | 待开始 | 中 | 触发器和中间件 |
| source/polyfills/ | src/toolBox/base/usePolyfills/ | 完成 | 高 | 兼容性填充 |
| index.js | src/index.js | 待开始 | 高 | 主入口文件 |

## 重构原则

1. **模块化设计**：
   - 按功能域划分模块
   - 明确模块边界和责任
   - 减少模块间耦合

2. **代码标准化**：
   - 统一命名规范（中文函数名）
   - 统一代码风格
   - 使用函数式编程风格
   - 减少类的使用

3. **性能优化**：
   - 减少不必要的计算
   - 优化资源加载
   - 实现惰性加载和按需执行

4. **增强可测试性**：
   - 编写单元测试
   - 实现功能隔离
   - 减少副作用

5. **保持兼容性**：
   - 提供向后兼容接口
   - 渐进式迁移
   - 维护API稳定性

## 重构阶段

### 第一阶段：基础结构（已开始）

- 设计新的目录结构
- 迁移和重构工具函数
- 建立基础架构

### 第二阶段：核心功能（进行中）

- 迁移事件系统
- 迁移服务层
- 重构UI组件库

### 第三阶段：业务逻辑（计划中）

- 迁移资产管理功能
- 重构编辑器功能
- 实现新的特性

### 第四阶段：优化和测试（计划中）

- 性能优化
- 编写测试用例
- 文档完善

## 商业化战略

### 基本思路

项目采用"核心开源+UI模块付费"的商业模式，具体包括：

1. **分层商业策略**：
   - 基础层（toolBox）：完全开源免费
   - 核心功能API：开源免费
   - UI面板和高级功能：付费模块

2. **模块化销售**：
   - 按功能模块单独定价和销售
   - 用户可以根据需求选购特定面板
   - 高级功能（如AI分析、批量处理）作为独立付费单元

### 技术实现

1. **面板动态加载机制**：
   - 基于现有的自动加载面板功能扩展
   - 构建标准化的面板接口和生命周期
   - 支持面板间通信和集成

2. **菜单和工具栏策略**：
   - 基础菜单框架：免费开源
   - 高级功能菜单：可作为独立付费单元
   - 与思源原生界面集成：通过提供适配API

3. **简化的付费验证**：
   - 使用面包多/爱发电平台处理支付
   - 采用简单验证码机制（格式：SAC-[面板ID]-[时间戳]-[简单哈希]）
   - 客户端简单验证，无需服务器端复杂验证逻辑

4. **面板商店设计**：
   - 作为一个内置面板实现
   - 集成验证码激活功能
   - 从静态服务器下载面板文件

### 商业优势

1. **降低开发和维护成本**：
   - 无需开发复杂的授权和支付系统
   - 只在下载时验证，避免复杂的运行时验证

2. **改善用户体验**：
   - 购买后无需反复验证
   - 简化的激活流程
   - 按需付费，灵活选择

3. **社区生态平衡**：
   - 核心功能开源促进社区发展
   - 付费模块提供可持续的收入来源
   - 避免与用户的"猫鼠游戏"

### 最近任务优先级

1. **高优先级**：
   - 完成工具箱(toolBox)核心功能迁移
   - 设计和实现标准化的面板加载机制
   - 开发简单的验证码验证系统

2. **中优先级**：
   - 构建面板商店界面
   - 设计菜单和工具栏注册系统
   - 制作1-2个高质量付费面板作为测试

3. **低优先级**：
   - 完善文档和用户指南
   - 优化用户界面和体验
   - 开发更多高级功能面板

## 入口文件(index.js)重构计划

当前的index.js文件包含了插件的核心初始化逻辑，需要重构为更模块化的结构。

### 重构目标

1. 将复杂逻辑拆分为独立模块
2. 减少全局状态和副作用
3. 提高代码可读性和可维护性
4. 实现更清晰的依赖管理

### 具体任务

1. **插件类重构**：
   - 将SACAssetsManager类拆分为核心类和功能模块
   - 实现依赖注入模式
   - 减少方法体积，提高内聚性

2. **配置管理**：
   - 将TAB_CONFIGS和DOCK_CONFIGS移至独立配置文件
   - 实现动态配置加载
   - 支持配置热更新

3. **UI管理**：
   - 重构Tab和Dock创建逻辑
   - 实现统一的UI注册机制
   - 优化Vue组件加载流程

4. **国际化处理**：
   - 重构i18n工具
   - 优化翻译流程
   - 实现更高效的字符串处理

5. **事件系统**：
   - 规范化事件名称和处理
   - 优化事件分发机制
   - 实现事件监控和调试

6. **服务初始化**：
   - 重构后台服务初始化流程
   - 实现服务依赖管理
   - 优化服务启动性能

### 新入口文件结构

```javascript
// src/index.js
import { Plugin } from "siyuan";
import { initServices } from "./services/init.js";
import { setupEventSystem } from "./events/setup.js";
import { registerUIComponents } from "./components/register.js";
import { setupI18n } from "./i18n/setup.js";
import { createServer } from "./services/server/create.js";

export default class SACAssetsManager extends Plugin {
  async onload() {
    // 初始化核心状态
    this.initCoreState();
    
    // 设置事件系统
    await setupEventSystem(this);
    
    // 初始化服务
    await initServices(this);
    
    // 注册UI组件
    await registerUIComponents(this);
    
    // 设置国际化
    await setupI18n(this);
    
    // 创建服务器
    await createServer(this);
  }
  
  // 其他生命周期方法...
}
```

## 重点挑战

1. **循环依赖**：
   - 识别和解决模块间循环依赖
   - 重新设计依赖关系
   - 使用依赖注入或中间层解决

2. **状态管理**：
   - 减少全局状态依赖
   - 实现可预测的状态流转
   - 支持状态持久化

3. **向后兼容**：
   - 维护关键API稳定性
   - 提供过渡层适配旧接口
   - 实现功能等价

4. **性能保障**：
   - 确保重构不影响性能
   - 重点优化热点代码路径
   - 实现渐进式加载

## 测试策略

1. **单元测试**：
   - 为核心工具函数编写测试
   - 测试模块接口行为
   - 验证边界条件处理

2. **集成测试**：
   - 测试模块间交互
   - 验证功能完整性
   - 模拟真实使用场景

3. **性能测试**：
   - 测试重构前后性能对比
   - 识别性能热点和瓶颈
   - 验证大数据量处理能力

## 进度跟踪

| 模块 | 开始日期 | 计划完成日期 | 实际完成日期 | 状态 | 负责人 |
|------|---------|------------|------------|------|-------|
| 工具函数(toolBox) | 2023-11-01 | 2024-02-28 | - | 进行中 | AI助手 |
| UI组件(components) | 2023-12-15 | 2024-03-31 | - | 进行中 | 团队 |
| 事件系统(events) | 2024-01-10 | 2024-02-29 | - | 进行中 | AI助手 |
| 服务层(services) | 2024-02-01 | 2024-04-15 | - | 待开始 | - |
| 入口文件(index.js) | 2024-02-15 | 2024-02-28 | - | 待开始 | - |

## 注意事项

- 重构期间维持插件功能可用
- 定期同步和更新文档
- 关注用户反馈，及时调整重构策略
- 优先迁移基础设施和核心功能
- 保持良好的错误处理和日志记录
- 每个模块迁移后进行充分测试

# 思源AI通信框架插件
> SiYuan Assets Communication Framework Plugin

## 项目概述
本项目旨在提供高效的通信框架，解决思源笔记AI相关功能开发过程中的技术挑战。项目包含服务管理、资产管理和通信代理等核心功能。

## 实现原理

### 心跳通信机制
本插件采用多层次心跳通信机制，确保各服务状态的准确监控和即时响应：

1. **结构化状态数据**
   - 心跳响应包含完整的服务状态对象，包括主服务和静态服务的详细信息
   - 每个服务状态包含isRunning、port、startTime和lastHeartbeat等关键字段
   - 使用统一的数据结构确保状态表示的一致性，便于UI展示和故障诊断

2. **服务状态缓存**
   - 插件主实例维护服务状态缓存(`servicesStatus`)，实时反映最新服务状态
   - 状态缓存通过心跳响应自动更新，确保数据的实时性和准确性
   - 缓存机制减少频繁状态查询的需要，提高系统效率

3. **事件驱动状态更新**
   - 状态变更时通过事件总线广播`service:status-updated`事件
   - UI组件订阅状态更新事件，实时反映服务状态变化
   - 分离状态监测和UI更新逻辑，实现松耦合架构

4. **多级故障检测**
   - 定时自动检测与手动检测相结合
   - 针对不同服务类型采用不同的检测策略：
     - 主服务：使用IPC通道心跳检测
     - 静态服务：使用BroadcastChannel进行通信
   - 检测到服务停止时立即触发状态更新和通知事件

5. **心跳模块化**
   - 将心跳处理逻辑独立为单独模块，便于维护和扩展
   - 提供统一的API接口进行服务状态查询和更新
   - 支持跨进程心跳检测，适应插件的多进程架构

### 服务管理
插件实现了完善的服务生命周期管理：

1. **服务自动恢复**
   - 检测到服务异常时，尝试自动重启相关服务
   - 维护服务启动记录，避免频繁重启
   - 提供手动服务管理界面，允许用户干预

2. **服务状态可视化**
   - 直观展示各服务运行状态、运行时长和响应时间
   - 服务状态变化时提供视觉反馈
   - 支持服务详细信息查看和问题诊断

## 模块概览

### 心跳通信模块
- `source/server/heartbeat.js` - 心跳响应处理核心模块
- `index.js` - 插件主实例中的心跳检测和状态管理
- `source/UI/pannels/serviceManager/serviceMonitor.vue` - 服务状态监控界面

### 服务管理模块
- `source/server/main.js` - 主服务实现
- `source/server/staticServerEntry.html` - 静态服务实现

## 技术亮点

1. **事件驱动架构**
   - 通过事件总线实现组件间松耦合通信
   - 状态变更事件驱动UI更新，减少轮询开销
   - 服务控制命令通过事件触发，简化接口调用

2. **多层次状态存储**
   - 全局状态缓存保证一致性
   - 本地状态响应变化提高界面响应速度
   - 双向状态同步确保数据一致性

3. **异步非阻塞操作**
   - 所有心跳检测和状态更新操作均为异步执行
   - 状态检测失败不会阻塞其他功能
   - 使用Promise和async/await简化异步流程

4. **错误恢复机制**
   - 服务异常自动检测和恢复
   - 心跳通信失败优雅降级
   - 全面的错误捕获和日志记录

## AI配置问题修复

### 思源笔记API配置字段修改

思源笔记在配置中使用`apiModel`字段存储模型名称，但我们的代码部分地方仍在使用`model`字段，这导致API请求失败，报错"Model field is required"。

### 已修复文件

1. `src/toolBox/useAge/forSiyuan/forAI/fromLocalSiyuanAI.js`:
   - 修改`createSafeApiConfig`函数，优先使用`apiModel`而不是`model`

2. `src/toolBox/useAge/forSiyuan/forAI/computeSiyuanAI.js`:
   - 修改`createApiConfig`函数，确保同时支持`model`和`apiModel`字段，并在返回时包含这两个字段

3. `src/toolBox/useAge/forSiyuan/forAI/useSiyuanAI.js`:
   - 修改`getOpenAICompatConfig`函数，确保优先使用`apiModel`字段，并在返回时同时提供`apiModel`和`model`字段

4. `source/noteChat/index.js`:
   - 修改`handleStreamingResponse`函数，优先使用`aiConfig.apiModel`而不是`model`

### 修复策略

我们的修复遵循以下原则：

1. 向后兼容：同时保留`apiModel`和`model`字段，确保旧代码能正常工作
2. 优先使用：读取配置时优先使用`apiModel`，兼容`model`
3. 统一输出：返回配置时同时提供两个字段，确保不同API均能使用

### 未来优化方向

1. 统一字段名称：逐步标准化为只使用`model`或`apiModel`
2. 添加类型检查：使用JSDoc或TypeScript定义配置类型
3. 配置验证：实现配置验证函数，确保必要字段存在并有效

# 这个区段由开发者编写,未经允许禁止AI修改
请AI根据以下分析和建议进行代码重构和改进：

## 插件功能分析 (基于 index.js)

1.  **核心**: `SACAssetsManager` 类，插件入口。
2.  **初始化 (`onload`)**: 设置状态、加载 i18n、创建 Dock/Tab、添加菜单、启动 Web 服务、导入旧 Key。
3.  **Dock 管理**: 定义配置 (`DOCK_CONFIGS`)，使用 `createDock` 创建多个面板，Vue 渲染 UI。
4.  **Tab 管理**: 定义配置 (`TAB_CONFIGS`)，包含动态扫描目录 (`构建TAB配置`) 生成 Tab，使用 `createTab` 注册，Vue 渲染 UI。
5.  **Web 服务**: 获取端口，管理服务状态 (`servicesStatus`, 心跳 `pingServer`/`pingStaticServer`)，加载 `source/server/main.js`。
6.  **i18n**: 实现 `翻译` 函数，支持可选 AI 翻译，结果写入 JSON。
7.  **事件总线**: 使用 `eventBus` 进行内部通信。
8.  **旧数据导入**: 从 `SACKeyManager` 路径导入 AI 密钥。
9.  **全局访问**: 暴露插件实例和 API 到 `window`。

## 改进计划

1.  **拆分 `index.js`**: 按功能拆分到 `src/managers/` (dock, tab, server, i18n), `src/state/`, `src/utils/` (keyImporter, constants, domUtils) 等目录。`index.js` 只做入口和协调。
2.  **优化函数**:
    *   将 `同步获取文件夹列表` 和 `构建TAB配置` 改为异步 (使用 `fetch`) 并重命名。
    *   将 `插入UI面板容器` 移至 UI 工具文件。
3.  **消除硬编码**: 将路径、事件名、ID、CSS 类名等定义为常量，放入 `src/utils/constants.js`。
4.  **测试代码分离**: 移除 `index.js` 末尾的 `tests/index.js` 导入，只在开发/测试环境加载。
5.  **遵循规范**: 确保所有新代码和重构后的代码遵循自定义指令中的函数命名、导出、文件组织等规范。
6.  **创建 `AInote.md` / `readme.md`**: 在各主要目录下创建说明文件。

---
*以上内容根据初步分析生成，待确认和细化。*

## 目录结构与入口文件初步分析总结

根据对 `src/toolBox/`, `src/shared/` 和根目录 `index.js` 的初步分析，总结如下，以指导后续重构：

1.  **`src/toolBox/` vs `src/shared/` 区别**:
    *   `src/toolBox/`: 主要提供**可复用的功能性代码（行为与能力）**，如基础工具 (`base/`)、特定功能封装 (`feature/`, `useAge/`)。其内部结构倾向于按**功能或层级**划分。包含 `toolBoxExports.js` 用于统一导出。
    *   `src/shared/`: 主要提供**项目内共享的数据结构、配置、常量和资源**，如 `constants/`, `config/`, `enums/`，也可能包含共享 UI 组件 (`components/`)。其内部结构倾向于按**资源类型**划分。

2.  **`index.js` (旧入口文件) 现状分析**:
    *   **职责耦合**: 文件承担了过多职责，包括：插件状态初始化、Dock/Tab 注册与 UI 加载、Web 服务创建与心跳管理、i18n 加载与处理、旧数据导入等。
    *   **动态 Tab 配置**: `构建TAB配置` 函数使用了同步的 `XMLHttpRequest` (`同步获取文件夹列表`) 来读取 `source/UI/pannels` 目录，这需要改为异步 `fetch` 或其他异步方式。
    *   **UI 加载**: Dock 和 Tab 的 `init` 回调中，通过动态 `import` 加载 `vueComponentLoader.js` 来渲染 Vue 组件。
    *   **服务管理**: 通过 `pingServer` (IPC) 和 `pingStaticServer` (BroadcastChannel) 实现心跳检测，并使用 `eventBus` 广播状态。
    *   **硬编码与全局状态**: 文件中存在较多硬编码路径和常量，并设置了全局插件实例访问点。
    *   **测试代码**: 文件末尾直接 `import` 了测试脚本，应移除。
    *   **验证了重构计划**: 当前 `index.js` 的结构和内容进一步验证了 `AInote.md` 中对其进行拆分的必要性和计划的合理性。

将这些关键点记录下来，能确保我们对当前状况和目标有共同且持久的理解。

## 思源插件系统核心约定 (根据 `app/src/plugin/loader.ts` 推断)

为了确保插件能被思源笔记正确加载和运行，需要遵守以下核心约定：

1.  **`plugin.json`**: 必须包含此文件，用于定义插件的元信息（名称、作者、版本、描述、依赖等）。思源主程序会读取此文件。
2.  **JavaScript 入口文件**: 通常是根目录下的 `index.js`。这是由思源加载器 (`loader.ts`) 默认加载的 JS 文件。
3.  **默认导出类**: 入口 JS 文件必须 **默认导出** (`export default class ...`) 一个 JavaScript 类。
4.  **继承 `Plugin` 基类**: 这个导出的类必须继承自思源提供的 `Plugin` 基类 (`class MyPlugin extends Plugin`)。
5.  **生命周期方法**:
    *   `onload()`: 插件类需要实现此异步方法。插件 JS 加载并实例化后，该方法会被调用，用于执行主要的初始化逻辑。
    *   `onLayoutReady()`: 当思源主界面布局准备就绪后，此方法会被调用。适用于需要操作界面元素的初始化。
    *   （可能还有 `onunload()` 等，用于卸载时的清理，虽然 `loader.ts` 中主要体现了加载逻辑）。
6.  **CommonJS 模拟环境**: 插件 JS 在一个模拟的 CommonJS 环境中执行，可以使用 `require`, `module`, `exports`。
7.  **CSS**: 如果 `plugin.json` 中定义了 CSS 文件路径，或者插件信息中包含 CSS 字符串，其内容会被自动加载到页面 `<head>` 中。
8.  **界面集成**: 插件可以通过特定的 API 或在插件实例上定义属性（如 `topBarIcons`, `statusBarIcons`, `docks`）来注册和添加界面元素到思源笔记中。

**重要**: 由于平台约定，根目录的 `index.js` 和默认导出是必须的，这覆盖了通用编码规范中关于避免使用 `index.js` 和默认导出的建议。

## Refactoring Todos

-   **Refactor `assetGalleryPanel.vue`:** Remove dependency on monkey-patching `Array.prototype.push` (from `src/utils/useEcma/useArray/push.js`). See `src/utils/AInote.md` for details.
-   **TODO (from src/utils/AInote.md):** Refactor `assetGalleryPanel.vue` to remove dependency on `创建带中间件的Push方法` (originally in `src/utils/useEcma/useArray/push.js`, which relied on monkey-patching `Array.prototype.push`). Replace the push call with a new data processing function encapsulating the middleware logic.

## 笔记链接规则 (AI 记录)

为了方便在不同会话中快速恢复上下文，所有在 `diary/` 目录或其他位置创建的详细分析笔记，都应该在与之最相关的代码目录下的 `AInote.md` 文件中添加一个 Markdown 链接指向它。 