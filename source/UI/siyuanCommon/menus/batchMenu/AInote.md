# 这个区段由开发者编写,未经允许禁止AI修改

批处理菜单（batchMenu）是SACAssetsManager的文件批处理功能集合，包含文件扫描、处理、整理等多种功能。

## 当前注意事项

- 维护批处理功能的完整性和一致性
- 确保用户交互体验流畅
- 支持大量文件的高效处理
- 提供充分的进度反馈和错误处理

# AI工作记录

## 2025-05-02 05:35 批处理菜单与节点系统集成方案

我已经创建了详细的批处理菜单与节点系统集成方案，记录在 `diary/batch_menu_integration.md` 中。该方案的核心是将批处理菜单中的功能转化为可在Petri网络编辑器和工具面板中使用的节点，同时保留其交互特性（用户确认、进度显示等）。

### 集成方案概述

当前批处理菜单有三个关键特点需要在节点化过程中保留：

1. **用户交互依赖**：确认对话框、输入对话框和任务进度显示
2. **文件系统操作**：大量耗时的文件读写和处理操作
3. **三阶段结构**：用户确认→执行操作→显示结果

### 节点化方案

通过扩展JSDoc注释系统，添加特殊标签实现交互式节点：

```js
/**
 * @nodeInteraction confirm 确认提示信息
 * @nodeInteraction input 输入提示信息
 * @nodeProgress 进度标题
 * @nodeVisibility flow|panel|both
 */
```

### 优先节点化的功能

以下批处理功能将优先进行节点化：

1. **文件扫描类**
   - 扫描重复文件 (`duplicateScanner.js`)
   - 扫描空文件夹 (`emptyFolder.js`)
   - 整理纯色图片 (`getPureColorImages.js`)

2. **文件处理类**
   - 文件去重 (`duplicateScanner.js`, `restoreDuplicates.js`)
   - 展平并按扩展名分组 (`flatWithExtend.js`)
   - 图片去重 (`duplicateImageScanner.js`)

3. **文件组织类**
   - 复制文档树结构 (`copyFileTree.js`)
   - 批量打包文件 (`zip.js`)

### 实施方法

1. 为每个批处理功能添加标准化的JSDoc注释
2. 创建批处理函数包装器，保留交互特性
3. 确保任务控制器接口兼容

### 节点化转换示例

以下是一个批处理功能节点化的示例：

**原始菜单项代码**：
```js
export const 扫描重复文件 = (options) => {
    return {
        label: '扫描重复文件',
        click: async () => {
            const localPath = options.data.localPath;
            if (!localPath) {
                console.error('无法获取本地路径');
                return;
            }
            let confirm = await confirmAsPromise(
                `确认开始扫描?`,
                `开始后,将会开始查找${localPath}中的重复文件...`
            )
            if (confirm) {
                await 执行扫描重复文件(localPath)
            }
        }
    }
};
```

**节点化后**：
```js
/**
 * 扫描文件夹中的重复文件
 * 
 * 扫描指定路径下的所有文件，找出内容完全相同的重复文件，并生成报告
 * 
 * @param {string} path 要扫描的文件夹路径
 * @param {boolean} [quickMode=false] 是否使用快速模式（仅比较文件大小和部分内容）
 * @returns {Object} 包含重复文件信息的结果对象
 * 
 * @nodeCategory 文件批处理
 * @nodeType function
 * @nodeName 扫描重复文件
 * @nodeIcon fas fa-copy
 * @nodeInteraction confirm 确认开始扫描?开始后,将会查找{path}中的重复文件
 * @nodeProgress 扫描重复文件
 * @nodeVisibility both
 */
export const 扫描重复文件 = async (inputs, taskController) => {
  // 实现逻辑...
};
```

## 代码重用与维护策略

在节点化过程中，我将：

1. 将核心业务逻辑从UI交互中分离
2. 将已有的执行函数（如`执行扫描重复文件`）重用于节点实现
3. 保留用户交互体验的一致性
4. 确保批处理菜单和节点版本功能保持同步

## 后续工作

1. 创建详细的函数签名和参数规范
2. 实现交互式标签解析器
3. 开发批处理函数包装器
4. 优先实施文件扫描类节点 