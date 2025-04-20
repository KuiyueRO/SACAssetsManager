# 这个区段由开发者编写,未经允许禁止AI修改

- [ ] 重构此文件夹

# AI 笔记

**注意：此目录下的所有功能已被重构并迁移至 `src/toolBox/` 下的相应模块。**

原计划将此目录重构为前端（渲染进程）专用的文件操作工具集，但相关功能已被迁移到以下位置：

- `src/toolBox/feature/forFileSystem/`: 存放通用的文件系统操作函数。
- `src/toolBox/feature/forElectronFrontend/`: 存放依赖 Electron API 或需要前端 UI 交互的文件系统操作函数。

此目录可以被删除。

# 工具函数库重构笔记

## 重构状态

工具函数库正在重构中，计划将所有工具函数逐步迁移到src/toolBox目录下。
重构时注意渐进重构,遵循最小修改原则

## 职责范围

- 提供各种通用工具函数
- 支持核心业务功能
- 封装常用操作
- 处理跨平台兼容性

## 重构原则

1. **分类组织**：
   - 按功能域划分工具函数
   - 相关功能集中管理
   - 使用合理的目录结构

2. **功能提纯**：
   - 移除与业务逻辑耦合的部分
   - 提取纯粹的工具函数
   - 剥离思源特定依赖

3. **命名规范化**：
   - 统一函数命名风格
   - 使用中文函数名
   - 提供英文别名保持兼容性

4. **兼容保障**：
   - 保持API向后兼容
   - 提供兼容层和适配器
   - 支持平滑过渡

## 迁移进度跟踪

| 目录/文件 | 目标位置 | 状态 | 负责人 | 备注 |
|----------|---------|------|-------|------|
| base/ | src/toolBox/base | ✅ 完成 | AI助手 | 目录已移除 |
| events/ | src/toolBox/base/forEvent | ✅ 完成 | AI助手 | 子模块已迁移/移除 |
| fs/ | src/toolBox/feature/forFileSystem | 待处理 | - | 文件系统工具 |
| functions/ | src/toolBox/base/useEcma/forFunctions | 待处理 | - | 函数式工具 |
| math/ | src/toolBox/base/useEcma/forMath | 待处理 | - | 数学计算工具 |
| netWork/ | src/toolBox/base/forNetWork | ✅ 完成 | AI助手 | 目录已移除 |
| object/ | src/toolBox/base/useEcma/forObjectManagement | 待处理 | - | 对象操作工具 |
| strings/ | src/toolBox/base/useEcma/forString | ✅ 完成 | AI助手 | 子目录 (regexs, scripts, imageSrc) 已完成迁移并移除 |
| time/ | src/toolBox/base/useEcma/forTime | 待处理 | - | 时间处理工具 |
| objectTools.js | src/toolBox/base/useEcma/forObjectManagement | ✅ 完成 | AI助手 | 兼容层已移除 |
| functionTools.js | src/toolBox/base/useEcma/forFunctions | 待处理 | - | 函数工具集 |
| Math.js | src/toolBox/base/useEcma/forMath | ✅ 完成 | AI助手 | 兼容层已移除 |
| globBuilder.js | src/toolBox/base/useEcma/forFile | ✅ 完成 | AI助手 | 兼容层已移除 |
| port.js | src/toolBox/base/forNetWork/forPort | 完成 | AI助手 | 端口管理工具 |

### `strings/regexs/index.js` 处理说明

- **分析**: 该文件包含 `measureRegexComplexity` 和 `isValidFilePath` 函数。
  - `measureRegexComplexity` 被 `source/server/processors/thumbnail/` 下的代码引用。
  - `isValidFilePath` 未被引用。
  - `src/toolBox` 中无直接替代函数。
- **计划**:
  1. 将 `measureRegexComplexity` 迁移至 `src/toolBox/base/useEcma/forString/forRegexComplexity.js`。
  2. 将 `isValidFilePath` 迁移至 `src/toolBox/base/useEcma/forFile/forFilePath.js`。
  3. 更新 `source/server/processors/thumbnail/utils/regexs.js` 的导入路径。
  4. 删除 `src/utils/strings/regexs/index.js` 及空目录。

### `strings/imageSrc/index.js` 处理说明

- **分析**: 该文件包含 `isValidImageSrc` 和 `sanitizeUrl` 函数。
  - 这两个函数被 `source/data/attributies/attributeParsers.js` 引用。
  - `src/toolBox` 中无直接替代函数。
- **计划**:
  1. 将这两个函数迁移至 `src/toolBox/base/forNetWork/forURIValidation.js`。
  2. 更新 `source/data/attributies/attributeParsers.js` 的导入路径。
  3. 删除 `src/utils/strings/imageSrc/index.js` 及空目录。

### `events/emitter.js` 处理说明

- **分析**: 该文件定义了 `IEventEmitterSimple` 类，作为 `useEventBus` 的兼容适配层，主要为了兼容旧 API 和 `eventListeners` 属性。
  - 该类被 `source/UI/...` 和 `src/utils/queue/task.js` (包括继承) 等多处引用。
- **计划**:
  1. 将 `IEventEmitterSimple` 类迁移至 `src/toolBox/base/forEvent/useCompatibleEmitter.js`。
  2. 更新所有引用处的导入路径。
  3. 删除 `src/utils/events/emitter.js`。
  4. (未来可考虑逐步替换 `IEventEmitterSimple` 为 `createEventBus`)
- **状态**: ✅ 完成 (类已迁移至 `toolBox`, 旧文件已删除)

### `events/getPressure.js` & `system/surport/pressure.js` 处理说明

- **分析**: `getPressure.js` 导出 `获取事件压力值`，依赖 `system/surport/pressure.js` 的 `当前设备支持压感`。
  - 这两个函数均被 `src/utils/canvas/draw/index.js` 引用。
  - `src/toolBox` 中无直接替代功能。
- **计划**:
  1. 将 `当前设备支持压感` 的逻辑合并入 `获取事件压力值`。
  2. 将合并后的函数迁移至 `src/toolBox/base/forEvent/usePointerEventUtils.js`。
  3. 更新 `src/utils/canvas/draw/index.js` 的导入和使用。
  4. 删除旧文件 `src/utils/events/getPressure.js` 和 `src/utils/system/surport/pressure.js`。
- **状态**: ✅ 完成 (功能已合并迁移至 `toolBox`, 旧文件已删除)

### `events/pointer.js` 处理说明

- **分析**: 该文件包含 `优化高速移动事件` 函数，用于处理事件合并与预测。
  - 经检查，该函数未在项目其他地方被使用。
- **状态**: ✅ 完成 (未使用，文件已删除)

### `events/addEvents.js` & `object/addMethod.js` 处理说明

- **分析**: `addEvents.js` 提供混入式事件功能，依赖 `object/addMethod.js` 添加方法。
  - `addEvents` 被 `source/UI/.../anchor.js` 引用。
  - `src/toolBox` 中无直接替代功能。
- **计划**:
  1. 将 `object/addMethod.js` 迁移至 `src/toolBox/base/useEcma/useObject/forMethodInjection.js`。
  2. 将 `events/addEvents.js` 迁移至 `src/toolBox/base/forEvent/useEventMixin.js`，更新内部导入路径。
  3. 更新 `anchor.js` 的导入路径。
  4. 删除旧文件 `src/utils/events/addEvents.js` 和 `src/utils/object/addMethod.js`。
- **状态**: ✅ 完成 (功能已迁移至 `toolBox`, 旧文件已删除)

### `events/siyuan/broadcast.js` 处理说明

- **分析**: 该文件为空。
- **状态**: ✅ 完成 (空文件及目录已删除)

## 优先级设定

1. **高优先级**：
   - 核心通用工具（纯函数）
   - 频繁使用的功能
   - 底层基础功能
   - 示例：base/, forNetWork/, forEvent/

2. **中优先级**：
   - 特定功能域工具
   - 中等使用频率的功能
   - 示例：DOM/, canvas/, image/

3. **低优先级**：
   - 特殊用途工具
   - 使用频率低的功能
   - 依赖特定环境的功能
   - 示例：webworker/, cluster/

## 重构难点

1. **循环依赖**：
   - 工具函数间可能存在循环依赖
   - 需要重新设计依赖关系
   - 使用依赖注入或函数组合解决

2. **冗余实现**：
   - 多个地方可能实现了类似功能
   - 需要识别和合并重复功能
   - 提供统一的实现

3. **思源依赖**：
   - 部分工具函数依赖思源环境
   - 需要分离通用功能和思源特定功能
   - 使用适配器模式处理依赖

4. **命名冲突**：
   - 不同文件中可能有同名函数
   - 需要统一命名规范
   - 解决名称空间冲突

## 迁移步骤

1. **分析和映射**：
   - 分析当前工具函数的功能和依赖
   - 确定迁移的目标位置
   - 创建功能映射表

2. **功能提取**：
   - 从现有代码中提取核心功能
   - 移除业务逻辑和环境依赖
   - 重新设计API和实现

3. **迁移实现**：
   - 在新位置实现功能
   - 确保功能正确性和兼容性
   - 添加测试和文档

4. **兼容层建立**：
   - 在原位置创建兼容导出
   - 确保现有代码不受影响
   - 逐步替换导入路径

5. **清理和优化**：
   - 移除不再使用的代码
   - 优化新实现的性能
   - 完善错误处理和边界情况

## 测试策略

1. **单元测试**：
   - 为每个迁移的工具函数编写单元测试
   - 覆盖主要功能和边界情况
   - 确保功能等价性

2. **集成测试**：
   - 测试工具函数在真实环境中的使用
   - 验证与其他组件的交互
   - 确保系统级别的兼容性

3. **兼容性测试**：
   - 测试在不同环境中的行为
   - 确保跨平台兼容性
   - 验证向后兼容性

## 注意事项

- 每次迁移都要记录详细的变更日志
- 优先迁移基础功能，再处理依赖这些基础功能的高级功能
- 注意处理错误情况和边界条件
- 为所有函数添加清晰的JSDoc文档
- 定期同步和更新迁移进度 