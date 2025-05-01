# 这个区块由开发者编写,未经允许禁止AI修改

**职责范围 (Scope):** 提供与浏览器原生 Canvas API 相关的底层、通用工具，包括 Canvas 元素操作、图像加载、基本绘制功能封装等。

**所属层级:** Base (`base/useBrowser/useCanvas`)

**准入标准 (Criteria):**
- 必须是与原生 Canvas API 或图像处理（不依赖特定库）相关的基础功能。
- 应尽可能封装为纯函数或提供清晰状态管理的类/工厂函数。
- **禁止**依赖 `feature` 或 `useAge` 层的任何模块。
- **禁止**包含特定应用的业务逻辑或 UI 框架集成。
- 外部依赖 (如果极少情况下需要) 必须通过 `base/useDeps` 引入。
- **命名规范:** 必须遵循 [`../../../GUIDELINES.md`](../../../GUIDELINES.md) 中定义的 **"流畅优美的文式编程风格"** 核心要求。

**架构总纲:** [`../../../architecture_layers_explained.md`](../../../architecture_layers_explained.md)

---

# AI 笔记 - Canvas 工具集

## 历史记录与重要变更

*   **[日期 TBD]** 将 `source/utils/canvas/index.js` 重构并迁移至此目录，拆分为 `canvasProcessor.js`, `canvasLoaders.js`, `canvasFactory.js`。
*   **2024-07-29 (织):** 删除了 `index.js` 文件。
    *   **原因:** 该文件仅作为桶文件导出其他模块，且使用了不规范的默认导出，与提倡直接从源文件导入的原则相悖，因此被移除。
    *   **影响:** 所有对此目录功能的导入，**必须**直接指向 `canvasProcessor.js`, `canvasLoaders.js`, 或 `canvasFactory.js`。

## 重构内容 (历史参考)

原来的单一文件`source/utils/canvas/index.js`被拆分为以下几个功能明确的模块：
1.  `canvasProcessor.js` - 包含`CanvasProcessor`类，提供链式调用的Canvas处理功能。
2.  `canvasLoaders.js` - 包含从不同源加载图像的工具函数。
3.  `canvasFactory.js` - 包含创建Canvas处理器的工厂函数。

## 功能增强 (历史参考)

1.  增加了完整的JSDoc注释。
2.  增加了从SVG和二进制数据创建图像的专用函数。
3.  提供了中英文双命名。
4.  优化了错误处理。

## 使用示例 (修正)

```javascript
// 直接从具体模块导入
import { CanvasProcessor } from './canvasProcessor.js';
import { 从Blob创建图像 } from './canvasLoaders.js';
import { 创建Canvas处理器 } from './canvasFactory.js';

async function exampleUsage(canvasElement, imageBlob) {
    // 使用工厂函数创建处理器
    const processorInstance = 创建Canvas处理器(canvasElement);

    // 或直接使用 Processor 类
    const processor = new CanvasProcessor(canvasElement);
    processor.resize(800, 600).rotate(90);

    // 使用加载器函数
    const imageElement = await 从Blob创建图像(imageBlob);
    canvasElement.getContext('2d').drawImage(imageElement, 0, 0);
}
```

## 兼容性说明 (历史参考)

1.  保留了原有的API接口设计。
2.  为所有中文命名的函数提供了英文别名。

// ... 移除关于 index.js 兼容性的部分 ...
// ... 移除关于迁移路径的部分，因为 index.js 和 toolBoxExports.js 都已移除/废弃 ... 