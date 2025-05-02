# 这个区段由开发者编写,未经允许禁止AI修改

Petri网络编辑器是SACAssetsManager的核心功能之一，用于创建和执行可视化流程图。编辑器使用卡片和连接的方式构建流程，支持节点的动态加载与执行。

## 当前注意事项

- 保持节点定义和解析系统的稳定性
- 确保节点连接逻辑的正确性
- 优化流程执行性能
- 提升用户交互体验

# AI工作记录

## 2025-05-02 05:35 批处理菜单与节点系统集成方案

我已经创建了详细的批处理菜单与节点系统集成方案，记录在 `diary/batch_menu_integration.md` 中。该方案的核心是将批处理菜单中的功能转化为可在Petri网络编辑器中使用的节点，实现更灵活的流程自动化。

### 集成重点

1. **节点可见性控制**
   - 通过 `@nodeVisibility` 标签控制节点在流程编辑器和工具面板中的显示
   - 对于复杂度高的操作，优先在流程编辑器中显示
   - 简单的数学计算等通用功能可仅在流程编辑器中显示

2. **交互式标签支持**
   - 添加 `@nodeInteraction` 和 `@nodeProgress` 标签
   - 允许节点在流程执行过程中暂停并等待用户交互
   - 支持在流程中显示进度反馈

3. **批处理功能改造**
   - 将批处理菜单中的功能重构为适合流程编辑器的节点
   - 保留确认对话框和进度显示等交互特性
   - 确保高效处理大量文件的能力

### 对节点定义生成器的修改

现有的 `jsDoc2NodeDefine` 函数将进行如下增强：

```javascript
export function jsDoc2NodeDefine(jsDocResult, module, exportName) {
  const {
    inputTypes, 
    outputTypes, 
    defaultValues, 
    interactions, 
    showProgress,
    visibility
  } = jsDocResult;
  
  // 获取原始函数
  let processFunc = module[exportName];
  
  // 如果有交互配置，包装函数
  if (interactions || showProgress) {
    processFunc = wrapBatchFunction(processFunc, {
      interactions,
      showProgress,
      progressTitle: jsDocResult.progressTitle
    });
  }
  
  return {
    flowType: 'process',
    inputs: inputTypes || {},
    outputs: outputTypes || {
      $result: { type: 'any', label: '结果' }
    },
    process: processFunc,
    description: jsDocResult.description || '',
    category: jsDocResult.category || 'default',
    visibility: visibility || 'both', // 默认同时在流程和面板中显示
    interactive: !!(interactions || showProgress)
  };
}
```

### 文件批处理节点示例

以下是批处理功能节点化的示例：

```javascript
/**
 * 扫描文件夹中的重复文件
 * 
 * @param {string} path 要扫描的文件夹路径
 * @param {boolean} [quickMode=false] 是否使用快速模式
 * @returns {Object} 包含重复文件信息的结果对象
 * 
 * @nodeCategory 文件批处理
 * @nodeType function
 * @nodeIcon fas fa-copy
 * @nodeInteraction confirm 确认开始扫描?开始后,将会查找{path}中的重复文件
 * @nodeProgress 扫描重复文件
 * @nodeVisibility flow
 */
export const 扫描重复文件_流程节点 = async (inputs, taskController) => {
  // 实现逻辑...
};
```

### 与通用节点系统的整合

该方案与现有的Petri网络节点解析系统完全兼容，无需修改现有的节点加载和执行逻辑，只需:

1. 扩展JSDoc解析器以支持新标签
2. 创建函数包装器实现交互功能
3. 修改节点定义生成器增加可见性支持

### 流程执行中的交互处理

在流程执行过程中处理用户交互需要特别注意：

1. 当遇到需要交互的节点时，流程会暂停等待用户响应
2. 交互完成后，流程将继续执行
3. 对于包含多个交互节点的流程，交互将按顺序进行

## 后续工作计划

1. 实现交互式标签解析器
2. 开发批处理函数包装器
3. 优先将文件处理功能转换为Petri网络节点
4. 测试复杂流程中的交互处理 