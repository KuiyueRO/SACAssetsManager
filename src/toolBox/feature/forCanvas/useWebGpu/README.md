# Canvas WebGPU 加速 (useWebGpu)

本目录包含使用 WebGPU 为 Canvas 相关计算提供加速的功能。

## 模块

-   `useGpuMixer.js`: 提供一个基于 WebGPU 实现的高级颜色混合器 (`mixer` 单例)，使用 Kubelka-Munk 理论模拟颜料混合效果。
-   `mixer.wgsl`: `useGpuMixer.js` 使用的 WGSL 着色器代码，实现了颜色转换和混合逻辑。

## 设计原则

-   **性能优先:** 利用 GPU 并行计算能力加速复杂的图形操作。
-   **封装性:** 将 WebGPU 的复杂性封装在模块内部，对外提供简洁易用的接口。
-   **分层依赖:** 严格遵守 `feature` 层规范。

## 命名规范

**核心要求:** 所有导出函数必须遵循 [`../../../GUIDELINES.md`](../../../GUIDELINES.md) 中定义的 **"流畅优美的文式编程风格"**。

## 使用示例

```javascript
import { mixer } from './useGpuMixer.js';

// 假设 ctx 是 CanvasRenderingContext2D, brushImage 是 ImageBitmap
async function applyGpuBrush(ctx, brushImage, x, y, width, height) {
    if (mixer) { // 检查 mixer 是否成功初始化
        await mixer.mixColors(ctx, brushImage, x, y, width, height);
    } else {
        // Fallback to CPU rendering
        ctx.drawImage(brushImage, x, y, width, height);
    }
}
```

**注意:** WebGPU 的可用性取决于浏览器和硬件支持。模块内部包含初始化检查和失败回退逻辑。 