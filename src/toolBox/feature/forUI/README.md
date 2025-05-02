# 对话框接口设计与使用指南

## 概述

本文档描述了对话框接口的设计原理和使用方法。我们采用依赖倒置原则，实现了一个灵活、可扩展的对话框系统，适用于各种环境。

## 核心组件

### 1. 基础对话框接口 (baseDialogInterface.js)

基础对话框接口定义了最基本的对话框行为，包括：

```javascript
{
  alert: async (message, title) => {...},
  confirm: async (message, title) => {...},
  prompt: async (message, defaultValue, title) => {...},
  custom: async (options) => {...}
}
```

### 2. 任务控制器接口 (taskControllerInterface.js)

任务控制器接口负责处理任务进度显示和控制：

```javascript
{
  createTaskController: async (title, initMessage) => {
    return {
      updateProgress: (percent, message) => {...},
      destroy: () => {...}
    };
  }
}
```

### 3. 标准对话框 (standardDialogs.js)

基于基础对话框接口实现的一系列标准对话框功能：

- `confirmWithOptions`: 带自定义按钮文本的确认对话框
- `promptWithValidation`: 带验证功能的输入对话框
- `selectDialog`: 多选对话框
- `confirmWithDetails`: 带详细内容的确认对话框
- `progressDialog`: 进度对话框

### 4. 具体环境实现 (siyuanDialog.js)

思源笔记环境下的具体实现：

- 使用思源笔记客户端API实现基础对话框功能
- 为不支持的高级功能提供降级实现

### 5. 接口校验 (siyuanDialogValidator.js)

确保接口实现与思源笔记期望一致：

- 校验接口方法的存在性和签名
- 验证方法的异步性（返回Promise）
- 提供适配器功能，将思源Dialog转换为我们的接口格式

## 使用方法

### 基础用法

```javascript
import { getDialogInterface } from '../../feature/forUI/interfaces/baseDialogInterface.js';

async function example() {
  const dialogInterface = getDialogInterface();
  
  // 显示简单消息框
  await dialogInterface.alert('操作成功！', '提示');
  
  // 显示确认对话框
  const confirmed = await dialogInterface.confirm('确定要删除吗？', '确认');
  if (confirmed) {
    // 用户点击了确认
  }
  
  // 显示带输入框的对话框
  const userInput = await dialogInterface.prompt('请输入名称：', '默认名称', '输入');
  if (userInput !== null) {
    // 用户输入了内容
    console.log('用户输入：', userInput);
  }
}
```

### 使用标准对话框

```javascript
import { confirmWithOptions, promptWithValidation } from '../../feature/forUI/dialogs/standardDialogs.js';

async function example() {
  // 带自定义按钮文本的确认对话框
  const result = await confirmWithOptions(
    '确定要执行此操作吗？',
    '操作确认',
    { okText: '执行', cancelText: '取消' }
  );
  
  // 带验证功能的输入对话框
  const name = await promptWithValidation(
    '请输入名称：',
    '',
    {
      title: '名称输入',
      validator: (value) => value.length >= 3,
      errorMessage: '名称长度必须大于等于3'
    }
  );
}
```

### 使用任务控制器

```javascript
import { getTaskControllerFactory } from '../../feature/forUI/interfaces/taskControllerInterface.js';

async function example() {
  const taskControllerFactory = getTaskControllerFactory();
  
  // 创建任务控制器
  const taskController = await taskControllerFactory.createTaskController(
    '正在处理数据',
    '初始化中...'
  );
  
  try {
    // 更新进度
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 300));
      taskController.updateProgress(i, `处理中: ${i}%`);
    }
    
    // 完成任务
    taskController.updateProgress(100, '处理完成');
    
    // 延迟关闭
    setTimeout(() => {
      taskController.destroy();
    }, 1000);
  } catch (error) {
    // 处理错误
    taskController.updateProgress(0, `出错: ${error.message}`);
    setTimeout(() => {
      taskController.destroy();
    }, 3000);
  }
}
```

## 扩展指南

### 添加新的对话框类型

1. 扩展 `baseDialogInterface.js` 中的 `custom` 方法以支持新类型
2. 在 `standardDialogs.js` 中添加新的对话框函数
3. 在具体环境实现中提供对应实现

### 为新环境提供实现

1. 创建新的环境实现文件 (例如 `webDialog.js`)
2. 实现基础对话框接口中定义的所有方法
3. 创建注册函数并在环境初始化时调用
4. 使用 `siyuanDialogValidator.js` 作为参考，创建对应的校验器

## 最佳实践

1. **始终使用接口**：业务代码应该只依赖接口，不应该依赖具体实现
2. **提供降级实现**：对于不支持的高级功能，应提供降级实现
3. **异步处理**：所有对话框相关的API都应返回Promise
4. **错误处理**：合理处理用户取消等特殊情况
5. **校验接口**：在注册前使用校验器确保接口实现符合规范

## 设计优势

1. **松耦合**：业务代码不直接依赖具体UI实现
2. **可测试性**：可以轻松模拟对话框接口进行测试
3. **可扩展性**：可以轻松添加新的对话框类型
4. **环境适应性**：可以在不同环境中使用相同的业务逻辑 