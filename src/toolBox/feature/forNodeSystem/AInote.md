# 这个区段由开发者编写,未经允许禁止AI修改

- 需要解决nodeToMenuItem模块中对UI组件的直接依赖问题
- 使用依赖倒置原则重构代码
- 在插件初始化时注册环境相关的交互组件实现

# 节点与菜单项转换模块重构记录

## 2025-05-07 07:27 - nodeToMenuItem依赖方向问题分析

今天发现`nodeToMenuItem.js`中存在依赖方向问题。该模块作为toolBox层的组件，直接引入了上层UI组件：

```javascript
import { confirmAsPromise } from '../../../toolBox/base/useEnv/siyuanDialog.js';
import { 打开任务控制对话框 } from '../../UI/dialog/tasks.js';
import { showInputDialogPromise } from '../../UI/dialog/inputDialog.js';
import { 渲染模板 } from '../../../toolBox/useAge/forText/useArtTemplate.js';
```

这违反了项目架构中"核心/底层不应反向依赖上层"的原则。

### 问题的影响

1. 降低了`toolBox`的独立性和可复用性
2. 创建了循环依赖的风险
3. 使模块间耦合增加，维护成本上升
4. 违背了分层设计原则

## 2025-05-07 07:50 - 全局注册表解决方案

根据开发者的意见，我们需要修改之前的解决方案，避免在根目录index.js中使用静态import，并且使用Symbol.for机制确保全局单例性。

### 关键设计原则

1. 使用Symbol.for实现全局注册表，保证全局单例性
2. UI接口不应放在base层，应该放在feature层
3. 使用动态导入避免循环依赖

### 新方案实现

#### 1. 全局注册表 (src/toolBox/registry.js)

使用Symbol.for创建全局注册表：

```javascript
// 注册表Symbol标识符
const REGISTRY_SYMBOL = Symbol.for('SACRegistry');

// 确保全局注册表存在
globalThis[REGISTRY_SYMBOL] = globalThis[REGISTRY_SYMBOL] || {};

// 注册和获取接口的函数
export function getRegistry() { ... }
export function registerInterface(interfaceName, implementation) { ... }
export function getInterface(interfaceName, defaultImpl) { ... }
```

#### 2. 对话框接口 (src/toolBox/feature/interfaces/dialogInterfaces.js)

```javascript
import { getInterface, registerInterface } from '../../registry.js';

// 接口常量名称
export const DIALOG_INTERFACE = 'dialogInterface';

// 创建默认实现
export function createDefaultDialogInterface() { ... }

// 获取接口实现
export function getDialogInterface() {
  return getInterface(DIALOG_INTERFACE, createDefaultDialogInterface());
}

// 注册接口实现
export function registerDialogInterface(implementation) { ... }
```

#### 3. 在UI层实现接口注册 (source/UI/registerInterfaces.js)

使用动态导入避免循环依赖：

```javascript
export async function registerSiyuanDialogs() {
  try {
    // 动态导入UI组件，避免循环依赖
    const confirmModule = await import('./dialog/confirm.js');
    const inputDialogModule = await import('./dialog/inputDialog.js');
    const tasksModule = await import('./dialog/tasks.js');
    
    registerDialogInterface({
      confirmDialog: confirmModule.confirmAsPromise,
      inputDialog: inputDialogModule.showInputDialogPromise,
      taskController: tasksModule.打开任务控制对话框
    });
  } catch (error) {
    console.error('注册思源笔记对话框接口失败:', error);
  }
}
```

#### 4. 修改nodeToMenuItem使用接口 (src/toolBox/feature/forNodeSystem/nodeToMenuItem.js)

```javascript
import { getDialogInterface } from '../interfaces/dialogInterfaces.js';

export function nodeDefine2MenuItem(nodeDefine) {
  return (options) => {
    // ...
    
    // 获取对话框接口
    const dialogInterface = getDialogInterface();
    
    // 使用接口
    const confirmed = await dialogInterface.confirmDialog(title, prompt);
    // ...
  };
}
```

#### 5. 在插件初始化过程中注册UI接口

在index.js中的初始化函数中使用动态导入：

```javascript
async 初始化插件异步状态() {
  // 注册UI接口
  import(`${this.插件自身伺服地址}/source/UI/registerInterfaces.js`).then(module => {
    module.registerAllInterfaces();
  }).catch(err => {
    console.error('[SAC资源管理器] UI接口注册失败:', err);
  });
  
  // ... 其他初始化代码
}
```

## 优势

1. **全局单例性**：使用Symbol.for确保全局注册表的单例性，避免多实例问题
2. **依赖倒置**：低层模块不再依赖高层模块，而是依赖抽象接口
3. **动态加载**：使用动态import，避免加载问题和循环依赖
4. **合理的层次结构**：UI相关接口放在更合适的位置
5. **可测试性**：便于注入测试实现

## 后续工作

- [x] 创建registry.js
- [x] 创建dialogInterfaces.js
- [x] 修改nodeToMenuItem.js
- [x] 创建registerInterfaces.js
- [ ] 修改index.js中的初始化代码
- [ ] 移除旧的依赖结构 