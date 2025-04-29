# 网络工具 (networkingUtils)

**所属层级:** Feature

**职责范围:** 提供与网络请求和数据流处理相关的通用功能，包括流式JSON数据处理、数据流控制、HTTP请求增强等功能。

**准入标准:**
- 必须关注网络数据传输和处理的通用技术能力
- 可以依赖`base`层的网络原语和工具
- **禁止**依赖`useAge`层的任何模块
- **禁止**包含特定应用的业务逻辑
- 外部依赖必须通过`base/useDeps`引入

**架构总纲:** [../../architecture_layers_explained.md](../../architecture_layers_explained.md)

## 模块内容

本目录包含以下主要功能模块：

1. **streamProcessors.js** - 提供处理特定格式（data: JSON\n）流式Fetch响应的功能
2. **streamHandlers.js** - 提供通用数据流处理和控制功能

## 使用示例

```javascript
// 使用流式JSON处理器
import { processJsonStream } from '../../feature/networkingUtils/streamProcessors.js';

// 处理流式JSON数据
await processJsonStream('https://api.example.com/stream', (action, data) => {
  switch(action) {
    case 'pushData':
      console.log('Received data:', data);
      break;
    case 'updateTotal':
      console.log('Total items:', data);
      break;
    case 'complete':
      console.log('Stream completed');
      break;
  }
});
``` 