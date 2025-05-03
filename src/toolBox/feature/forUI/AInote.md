# 这个区段由开发者编写,未经允许禁止AI修改

## UI接口层次设计指南

对于UI接口层次，我们采用了清晰的分层设计，特别是对话框系统，遵循以下原则：
1. 将基础UI接口定义放在toolBox层，保持环境无关性
2. 特定环境的UI实现（如思源笔记）放在对应的环境适配层
3. 使用依赖倒置原则，让高层模块和低层模块都依赖于抽象接口

# 对话框接口设计与实现

## 设计思路

我们采用了三层架构来设计对话框系统：

1. **基础层**：纯DOM/基础API对话框定义和实现(环境无关)
2. **接口抽象层**：提供统一的对话框接口定义
3. **环境实现层**：特定环境（如思源笔记）的具体实现

通过这种设计，实现了更清晰的依赖关系和更好的代码组织。

## 核心接口

### 基础对话框接口 (baseDialogInterface.js)

基础对话框接口定义了最基本的对话框行为：
- alert：显示简单消息框
- confirm：显示确认对话框
- prompt：显示带输入框的对话框
- custom：显示自定义对话框

这个接口作为UI交互的核心依赖注册点，所有需要使用对话框的功能都应该依赖于此接口，而不是直接依赖具体实现。

### 任务控制器接口 (taskControllerInterface.js)

任务控制器接口负责处理任务进度显示和控制：
- createTaskController：创建任务控制器实例
- updateProgress：更新进度
- destroy：销毁控制器

## 标准对话框实现

基于基础对话框接口，我们在toolBox层实现了一系列标准对话框功能：
- confirmWithOptions：带自定义按钮文本的确认对话框
- promptWithValidation：带验证功能的输入对话框
- selectDialog：多选对话框
- confirmWithDetails：带详细内容的确认对话框
- progressDialog：进度对话框

## 实现细节

### 接口设计

我们的接口设计以思源笔记的Dialog API为参考标准，这样可以：
1. 简化从直接使用clientApi.Dialog到使用接口的迁移
2. 减少不必要的适配层，提高性能
3. 保持API的一致性，降低学习成本

### 注册机制

使用Symbol.for创建全局唯一键，确保接口注册表在任何模块中都是单例：

```javascript
const REGISTRY_SYMBOL = Symbol.for('SACRegistry');
globalThis[REGISTRY_SYMBOL] = globalThis[REGISTRY_SYMBOL] || {};
```

这种方式避免了循环依赖问题，同时保证了接口实现的全局唯一性。

### 接口验证

为了确保接口实现符合预期，我们添加了验证机制：

1. 在注册时验证接口实现是否符合规范
2. 提供默认实现，确保即使没有注册接口也能有基本行为
3. 记录详细日志，便于调试

## 重构历程

### 2025-05-07

完成了基本接口定义和注册机制，实现了基础对话框和任务控制器接口。

### 2025-05-08

按照依赖倒置原则，对现有代码进行重构，替换所有直接使用clientApi.Dialog的地方，改为使用接口。修改了以下文件：

- src/toolBox/base/forUI/dialog/inputDialog.js
- src/toolBox/useAge/forSiyuan/useSiyuanDialog.js
- src/toolBox/base/useEnv/siyuanDialog.js
- src/toolBox/feature/useVue/dialogTools.js
- source/UI/composables/useFloatablePanel.js
- src/toolBox/useAge/forSiyuan/useSiyuanSlash.js
- source/UI/components/VFloat.vue 
- src/toolBox/base/forUI/dialog/imagePickerDialog.js 

### 接口优化

根据实际使用情况和效率考虑，我们对接口进行了进一步优化：

1. **简化参数映射**：移除了不必要的参数转换层，因为我们的接口本来就是参考思源设计的
2. **保留API兼容性**：对于一些需要保持原有API的场景，我们使用包装器模式兼容旧接口
3. **统一错误处理**：增强了异常情况处理，提供更友好的调试信息

## 后续计划

1. 完善单元测试，确保接口实现的正确性
2. 为其他UI组件也实现类似的抽象接口
3. 探索更复杂的对话框类型，如多步骤向导、异步操作对话框等

# 使用指南

## 基本用法

```javascript
import { getDialogInterface } from '../../feature/forUI/interfaces/baseDialogInterface.js';

// 获取对话框接口
const dialog = getDialogInterface();

// 使用alert
await dialog.alert('这是一条消息', '标题');

// 使用confirm
const result = await dialog.confirm('确认执行操作吗?', '确认');

// 使用prompt
const input = await dialog.prompt('请输入名称:', '默认值', '输入');

// 使用自定义对话框
const customResult = await dialog.custom({
  type: 'custom',
  title: '自定义对话框',
  message: '<div>自定义HTML内容</div>',
  width: '400px'
});
```

## 高级用法

### 标准对话框

```javascript
import { confirmWithOptions } from '../../feature/forUI/dialogs/standardDialogs.js';

// 使用带自定义按钮的确认对话框
const result = await confirmWithOptions(
  '确定要删除吗?', 
  '警告', 
  { 
    confirmText: '删除', 
    cancelText: '取消',
    confirmClass: 'dangerous'
  }
);
```

### 任务进度对话框

```javascript
import { getTaskControllerFactory } from '../../feature/forUI/interfaces/taskControllerInterface.js';

// 获取任务控制器工厂
const factory = getTaskControllerFactory();

// 创建任务控制器
const controller = await factory.createTaskController('处理中', '准备开始...');

// 更新进度
for (let i = 0; i <= 100; i += 10) {
  await controller.updateProgress(i, `完成 ${i}%`);
  await new Promise(r => setTimeout(r, 200));
}

// 销毁控制器
controller.destroy();
```

# 修改日志
*   **2025-05-03 (织):**
    *   修复 `dialogUtils.js` 内部导入路径错误：
        *   `useSiyuan.js` 的路径错误，修正为 `/plugins/SACAssetsManager/src/toolBox/useAge/useSiyuan.js`。
        *   `dialogInterfaces.js` 的路径错误，修正为 `/plugins/SACAssetsManager/src/toolBox/feature/interfaces/dialogInterfaces.js`。
*   **2025-05-03 (织):**
    *   创建 `dialogUtils.js`，用于存放通用的对话框打开辅助函数。
    *   从 `useAge/forSiyuan/useSiyuanSlash.js` 移入 `showApiAssetGallery` (原 `使用API配置打开对话框`), `showLocalAssetGallery` (原 `使用本地路径打开对话框`), `showDiskSelectionDialog` (原 `打开磁盘选择对话框`), `showEverythingDialog` (原 `打开Everything搜索对话框`), `showAnytxtDialog` (原 `打开Anytxt搜索对话框`)。
    *   **注意:** 移入的函数目前仍有 TODO 项，如依赖旧的 `openDialog`、硬编码组件路径和 UI 参数等，需要在后续重构中解决。 