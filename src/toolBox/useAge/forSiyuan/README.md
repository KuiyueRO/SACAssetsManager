# 思源笔记特定功能工具 (forSiyuan)

本目录包含专门为思源笔记设计的工具函数和模块，提供与思源笔记紧密集成的能力。

## 文件结构

- `useSiyuanMenu.js` - 思源菜单工具，提供菜单创建和管理功能
- `useSiyuanDialog.js` - 思源对话框工具，提供对话框创建和管理功能
- `useSiyuanSystem.js` - 思源系统API，提供对思源核心功能的访问
- `useSiyuanSlash.js` - 思源斜杠菜单工具，提供斜杠命令注册和管理
- `useSiyuanTab.js` - 思源页签管理工具，提供页签创建和管理功能
- `useSiyuanColor.js` - 思源颜色工具，提供颜色相关功能
- `useSiyuanMenuBuilder.js` - 思源菜单构建工具，提供组合式菜单构建能力
- `useSiyuanFile.js` - 思源文件操作工具，提供文件的读写删等基础操作
- `useSiyuanFiletree.js` - 思源文件树操作工具，提供文档管理和文档树操作功能
- `useSiyuanNotebook.js` - 思源笔记本管理工具，提供笔记本的操作和管理功能
- `useSiyuanAsset.js` - 思源资源文件管理工具，提供资源文件的操作和管理功能
- `useSiyuanBlock.js` - 思源块操作工具，提供块的创建、更新和管理功能

## 使用指南

思源特定工具应通过 `toolBoxExports.js` 或 `useSiyuan.js` 统一导入使用：

```js
// 推荐：通过思源环境依赖管理器导入
import { 思源API, 思源菜单, 思源对话框 } from '../../../toolBox/useAge/useSiyuan.js';

// 或者直接从具体模块导入
import { 创建思源菜单 } from '../../../toolBox/useAge/forSiyuan/useSiyuanMenu.js';
```

## 主要功能

### 思源菜单工具 (useSiyuanMenu.js)

提供思源笔记菜单的创建和管理功能：

```js
// 创建思源菜单
const menu = 创建思源菜单();

// 添加菜单项
menu.添加菜单项({
  文本: '菜单项',
  图标: 'iconSettings',
  点击: () => {
    console.log('菜单项被点击');
  }
});

// 显示菜单
menu.显示菜单();
```

### 思源对话框工具 (useSiyuanDialog.js)

提供思源笔记对话框的创建和管理功能：

```js
// 创建简单对话框
显示思源对话框({
  标题: '对话框标题',
  内容: '对话框内容',
  确认回调: () => {
    console.log('确认按钮被点击');
  }
});

// 创建自定义对话框
创建思源对话框({
  标题: '自定义对话框',
  内容组件: CustomVueComponent,
  宽度: '500px'
});
```

### 思源系统API (useSiyuanSystem.js)

提供对思源笔记核心功能的访问：

```js
// 获取当前打开的文档
const 当前文档 = 获取当前文档();

// 执行思源内核API
调用思源内核API('api/query/sql', {
  stmt: 'SELECT * FROM blocks WHERE type = "d" LIMIT 7'
}).then(结果 => {
  console.log(结果);
});
```

### SQL 查询 (`useSiyuanWorkspace.js` / `getSQLQueries.js`)

-   `sql(sql)`: 执行 SQL 语句 (仅限写操作和非 select 读操作)。
-   `querySql(sql)`: 执行 SQL select 语句并返回结果。
-   `getSqlQuery_*`: (位于 `getSQLQueries.js`) 提供一系列函数，用于生成常见的思源数据库查询语句（如按 ID 查块、按笔记本查附件等）。

## 贡献指南

向思源特定工具添加新函数时，请遵循以下原则：

1. **版本兼容**：
   - 注意思源笔记不同版本的API差异
   - 提供适当的错误处理和回退机制
   - 在注释中标明支持的思源版本

2. **集中管理**：
   - 相关功能应集中在同一模块
   - 避免重复实现思源相关功能
   - 保持与useSiyuan.js的一致性

3. **文档完善**：
   - 提供完整的JSDoc注释
   - 包含使用示例
   - 说明函数的限制和注意事项

4. **性能考虑**：
   - 避免不必要的API调用
   - 合理缓存结果
   - 考虑操作的性能影响

## 注意事项

- 思源笔记API可能随版本变化，请注意兼容性处理
- 所有涉及思源内核API的调用都应该有适当的错误处理
- 思源特定功能应该集中管理，以便于维护和更新
- 在适当情况下使用思源的事件系统进行通信

## 目录结构

```
forSiyuan/
├── useSiyuanMenu.js - 思源菜单处理工具
└── README.md        - 本说明文件
```

## 主要模块

### useSiyuanMenu.js

提供思源笔记菜单相关的处理函数，如创建菜单、添加菜单项等。

## 注意事项

### 使用新的集中式API

为了更好地集中管理思源笔记环境依赖，我们推荐使用位于 `useAge/useSiyuan.js` 的集中式模块。这个模块整合了思源笔记的各种API和环境访问方法，提供了更统一的接口。

#### 迁移示例

**旧方式：**

```js
import { 创建并打开思源原生菜单 } from "../../toolBox/useAge/forSiyuan/useSiyuanMenu.js";

// 直接访问全局对象
const workspaceDir = window.siyuan.config.system.workspaceDir;
const lang = window.siyuan.config.lang;

// 使用菜单
const menu = 创建并打开思源原生菜单();
```

**推荐方式：**

```js
import { system, menuTools } from "../../toolBox/useAge/useSiyuan.js";

// 使用集中式API
const workspaceDir = system.获取工作空间路径();
const lang = system.获取语言设置();

// 使用菜单
const menu = menuTools.创建并打开思源原生菜单();
```

### 后续开发计划

1. 将 `source/utils/siyuanUI/` 和 `source/fromThirdParty/siyuanKernel/` 等思源相关工具迁移到本目录
2. 进一步整合和增强思源特定功能
3. 为所有工具添加完整的JSDoc文档

## 思源环境依赖声明

所有与思源笔记相关的文件应当在顶部声明其依赖的思源环境：

```js
/**
 * @fileoverview 思源特定功能示例
 * @module toolBox/useAge/forSiyuan/example
 * @requires 思源环境
 */

import { 检查思源环境 } from '../../useSiyuan.js';

// 检查环境
if (!检查思源环境()) {
  console.warn('当前不在思源环境中，部分功能可能不可用');
}
```

这样可以清晰表明文件的环境需求，并在不满足时提供适当的警告。

# 思源环境依赖模块

这个目录包含了思源笔记环境相关的API封装，提供了对思源笔记特定功能的统一访问接口。所有模块均采用函数式风格设计，并同时提供中英文API。

## 模块概览

当前目录包含以下模块：

- `useSiyuanSystem.js` - 思源系统API封装
- `useSiyuanDialog.js` - 思源对话框API封装
- `useSiyuanMenu.js` - 思源菜单API封装
- `useSiyuanBlock.js` - 思源块操作API封装
- `useSiyuanWorkspace.js` - 思源工作区操作API封装
- `useSiyuanNotebook.js` - 思源笔记本操作API封装
- `useSiyuanAsset.js` - 思源资源文件操作API封装
- `useSiyuanFile.js` - 思源文件操作API封装
- `useSiyuanFiletree.js` - 思源文件树和文档管理API封装
- `useSiyuanSlash.js` - 思源斜杠菜单工具
- `useSiyuanTab.js` - 思源页签管理工具

## 使用方式

所有模块可以通过`useSiyuan.js`统一导入，推荐使用以下方式：

```javascript
import { fs, api, system, ui, plugin } from '../../toolBox/useAge/useSiyuan.js';

// 使用文件系统相关API
async function 示例1() {
  // 获取笔记本列表
  const 结果 = await fs.获取笔记本列表();
  console.log('笔记本列表', 结果.data);
  
  // 获取文件树
  const 文件树 = await fs.获取文件树列表();
  console.log('文件树', 文件树.data);
  
  // 上传资源文件
  const 文件 = new File(['hello'], 'hello.txt', { type: 'text/plain' });
  const 上传结果 = await fs.上传资源文件(文件);
  console.log('上传结果', 上传结果.data);
}

// 使用块操作API
async function 示例2() {
  // 获取块信息
  const 块信息 = await api.block.获取块信息('20220101121212-abcdef');
  console.log('块信息', 块信息.data);
  
  // 更新块内容
  const 更新结果 = await api.block.更新块({
    id: '20220101121212-abcdef',
    data: '新的内容',
    dataType: 'markdown'
  });
  console.log('更新结果', 更新结果);
}

// 使用系统环境信息
function 示例3() {
  console.log('工作空间路径', system.获取工作空间路径());
  console.log('应用版本', system.获取应用版本());
  console.log('语言设置', system.获取语言设置());
}

// 使用UI组件
function 示例4() {
  // 显示通知
  ui.显示通知({
    title: '操作成功',
    body: '文件已上传',
    type: 'success'
  });
  
  // 打开确认对话框
  ui.确认对话框('确认操作', '确定要删除这个文件吗？')
    .then(confirmed => {
      if (confirmed) {
        console.log('用户确认删除');
      } else {
        console.log('用户取消操作');
      }
    });
}
```

## 模块详细说明

### 1. useSiyuanBlock.js

提供对思源块操作的封装，包括获取块信息、更新块、插入块、追加块等。

主要功能：
- 获取块信息、DOM和Markdown源码
- 获取子块、块引用文本和面包屑
- 更新、插入和追加块
- 检查块是否存在

### 2. useSiyuanWorkspace.js

提供对思源工作区操作的封装，包括文档树操作、文档移动、重命名等。

主要功能：
- 获取和设置工作区配置
- 获取文件树列表
- 创建、重命名、删除和移动文档
- 文档树排序
- 获取工作区状态和数据历史

### 3. useSiyuanNotebook.js

提供对思源笔记本操作的封装，包括笔记本的创建、打开、关闭等。

主要功能：
- 获取笔记本列表
- 打开、关闭笔记本
- 创建、重命名、删除笔记本
- 获取和设置笔记本配置
- 设置笔记本图标和排序
- 导入Markdown文件到笔记本

### 4. useSiyuanAsset.js

提供对思源资源文件操作的封装，包括上传、下载、删除资源文件等。

主要功能：
- 上传资源文件（单个、批量、基于URL）
- 获取、删除、重命名资源文件
- 创建资源目录
- 列出资源文件
- 复制资源文件
- 获取资源文件预览信息

### 5. useSiyuanSlash.js

提供斜杠菜单相关功能：
- 处理对话框销毁后的操作
- 打开API配置的对话框
- 打开本地路径对话框
- 打开磁盘选择对话框
- 注册斜杠菜单项

### 6. useSiyuanTab.js

提供页签相关功能：
- 打开附件面板
- 打开笔记本资源视图
- 打开笔记资源视图
- 打开标签资源视图
- 打开本地资源视图
- 打开efu文件视图
- 打开颜色资源视图
- 打开搜索面板
- 注册页签事件处理函数
- 页签生命周期管理

## 统一请求处理机制

为了提升API调用的可靠性和性能，所有思源API模块现在使用统一的请求处理机制（`base/forNetWork/forSiyuanApi/apiBase.js`），提供以下高级特性：

### 1. 请求缓存

频繁访问但数据变化不大的API（如笔记本列表、文件树、资源列表等）默认启用缓存，以减少重复请求：

```javascript
// 使用默认缓存（特定API已内置）
const 笔记本列表 = await fs.获取笔记本列表();

// 自定义缓存选项
const 文件树 = await fs.获取文件树列表(false, {
  使用缓存: true,
  缓存时间: 30000 // 30秒缓存
});

// 强制刷新缓存
const 刷新文件树 = await fs.获取文件树列表(false, {
  使用缓存: false
});
```

### 2. 请求重试

所有API请求自动支持重试机制，默认在请求失败时自动重试，无需额外处理：

```javascript
// 使用默认重试设置
const 块信息 = await api.block.获取块信息('块ID');

// 自定义重试选项
const 自定义重试 = await api.block.获取块信息('块ID', {
  重试次数: 5,     // 最多重试5次 
  重试延迟: 500    // 初始延迟500毫秒，后续会指数增加
});
```

### 3. 请求超时

所有API请求支持超时设置，避免请求长时间未响应：

```javascript
// 自定义超时时间
const 结果 = await api.block.获取块信息('块ID', {
  超时时间: 10000  // 10秒超时
});
```

### 4. 清除缓存

当需要刷新数据时，可以手动清除缓存：

```javascript
import { 清除API缓存 } from '../../base/forNetWork/forSiyuanApi/apiBase.js';

// 清除所有缓存
清除API缓存();

// 清除特定缓存
清除API缓存('notebook/lsNotebooks/{}');
```

### 5. 批量请求

对于需要批量处理的请求，可以结合Promise.all使用：

```javascript
// 批量获取多个块信息
async function 批量获取块(块ID列表) {
  const 请求列表 = 块ID列表.map(id => api.block.获取块信息(id));
  return Promise.all(请求列表);
}
```

### 使用注意事项

1. 针对不同场景选择合适的缓存策略
   - 频繁变化的数据（如编辑中的块）应避免使用缓存
   - 相对稳定的数据（如笔记本列表）可以使用较长缓存
   
2. 错误处理已统一集成
   - 所有请求失败都会通过 `code` 和 `msg` 字段返回错误信息
   - 重试机制可能导致请求时间延长，但会提高成功率

3. 对于上传等使用FormData的请求不使用缓存

## 注意事项

1. 所有API调用均会进行环境检查，确保在思源环境中运行
2. 所有接口同时提供中英文版本，可根据需要选择
3. 错误处理已内置，返回统一的错误格式
4. 参数验证已在每个函数内部实现，无效参数会返回错误

## 后续计划

- 添加更多思源特有功能的封装
- 优化性能和错误处理
- 添加更多的使用示例和单元测试 