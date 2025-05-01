# Canvas 特性功能 (forCanvas)

本目录提供与 Canvas 绘图相关的特定功能或高级特性，通常依赖于 `base` 层的能力或其他外部库 (通过 `useDeps` 引入)。

## 模块

-   `brushes/`: 包含各种具体笔刷的定义 (`brushes.js`)、配置 (`configs.js`) 和样本处理 (`useBrushSampler.js`)。
-   `useBrushProcessor.js`: 提供加载、处理（如着色、应用效果）和缓存笔刷图像资源的工具。
-   `useWebGpu/`: 包含使用 WebGPU 加速的功能，如颜色混合 (`useGpuMixer.js`)。
-   `useDrawingUtils.js` (TODO: 确认或创建): 可能包含一些高级的绘图辅助函数。
-   `usePointPipeline.js` (TODO: 创建): 负责处理绘图点序列（采样、平滑、预测等）。

## 设计原则

-   **分层依赖:** 严格遵守 `feature` 层规范，只依赖 `base` 层和通过 `base/useDeps` 引入的外部库。
-   **功能聚焦:** 每个模块应专注于解决 Canvas 绘图中的某个特定高级问题。
-   **接口清晰:** 提供简洁、明确的函数或对象接口供上层（如 UI 组件或其他 `feature`、`useAge` 模块）调用。

## 命名规范

**核心要求:** 所有导出函数必须遵循 [`../../GUIDELINES.md`](../../GUIDELINES.md) 中定义的 **"流畅优美的文式编程风格"**。

## 使用示例

```javascript
// 示例：获取处理后的水彩笔刷
import { useBrushProcessor } from './useBrushProcessor.js';

async function getWatercolorBrush() {
    // 假设 baseSamples 已通过 loadAndProcessBrushSamples 加载
    const watercolorBrushImage = await useBrushProcessor.getProcessedBrush(
        'watercolor',
        '#4a90e2',
        0.5,
        baseSamples
    );
    return watercolorBrushImage;
}
```

**注意:** 本目录下的功能通常需要与 `base/useBrowser/useCanvas` 中的基础渲染功能配合使用。 