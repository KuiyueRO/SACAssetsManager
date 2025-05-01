# Canvas 笔刷 (brushes)

本目录定义和实现各种 Canvas 笔刷效果，包括笔刷配置、绘制逻辑以及笔刷样本的处理。

## 模块

-   `brushes.js`: 包含各种笔刷（如马克笔、水彩笔、铅笔等）的绘制逻辑实现，通过 `createBrush` 工厂函数生成具体的绘制函数。
-   `configs.js`: 定义了各种笔刷的详细配置参数，如类型、大小、不透明度、间距、路径等，并导出 `brushConfigs` 对象。
-   `useBrushSampler.js`: (原 `brushSampleProcessor.js`) 导出 `brushImageProcessor` 对象，负责使用 Sharp 处理笔刷图像（着色、应用效果、生成变体），并包含颜色沾染和流动效果的逻辑。
-   `placeholder.txt`: 临时占位文件。

## 设计原则

-   **配置驱动:** 笔刷行为主要由 `configs.js` 中的配置决定。
-   **效果分离:** 基础绘制逻辑在 `brushes.js`，复杂的图像处理和效果（如水彩、沾染）在 `useBrushSampler.js`。
-   **性能考量:** 通过 `useBrushSampler.js` 中的缓存机制 (`cache`, `sharpCache`, `processingQueue`) 优化重复处理。

## 命名规范

**核心要求:** 所有导出函数必须遵循 [`../../../GUIDELINES.md`](../../../GUIDELINES.md) 中定义的 **"流畅优美的文式编程风格"**。

## 使用示例

```javascript
import { 铅笔 } from './brushes.js';
import { useBrushProcessor } from '../useBrushProcessor.js'; // 用于获取处理后的样本

async function drawWithPencil(ctx, startX, startY, endX, endY, color, size, opacity, pressure, velocity) {
    // 1. 获取处理好的笔刷样本 (通常由 useBrushProcessor 管理)
    // 假设 baseSamples 已加载, currentProcessedSample 已获取
    const currentProcessedSample = await useBrushProcessor.getProcessedBrush(
        'pencil', // 对应 configs.js 中的 name
        color,
        opacity, 
        baseSamples
    );

    // 2. 调用笔刷绘制函数
    if (currentProcessedSample) {
         // 注意：这里的 currentProcessedSample 对应 brushes.js -> createBrush -> brushSamples 参数
         // 需要确认 getProcessedBrush 返回的是否是 generateVariants 返回的结构
        await 铅笔(ctx, currentProcessedSample, startX, startY, endX, endY, color, size, opacity, pressure, velocity);
    }
}
```

**注意:** `useBrushSampler.js` 依赖 Node.js 环境的 `sharp` 库，并通过 `base/useDeps/useSharp.js` 引入。其生成的 `ImageBitmap` 需要相应的环境支持。 