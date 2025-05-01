# 这个区块由开发者编写,未经允许禁止AI修改

**职责范围 (Scope):** 提供与 Canvas 绘图相关的特定功能或高级特性，通常依赖于 `base` 层的能力或其他外部库 (通过 `useDeps` 引入)。例如：特定的笔刷实现、WebGPU 加速的混合效果、高级绘图工具封装等。

**所属层级:** Feature (`feature/forCanvas`)

**准入标准 (Criteria):**
- 必须是与 Canvas 绘图相关的功能性模块。
- 可以依赖 `base` 层的模块 (如 `base/useBrowser/useCanvas`, `base/useDeps/useSharp`)。
- **禁止**依赖 `useAge` 层的任何模块。
- **禁止**包含特定应用的业务逻辑。
- 外部依赖必须通过 `base/useDeps` 引入。
- **命名规范:** 必须遵循 [`../../GUIDELINES.md`](../../GUIDELINES.md) 中定义的 **"流畅优美的文式编程风格"** 核心要求。

**架构总纲:** [`../../architecture_layers_explained.md`](../../architecture_layers_explained.md)

---

# AI 笔记 - Canvas 特性功能

## 历史记录与重要变更

*   **2024-07-30 (织):**
    *   迁移 `gpuMix.js` (WebGPU 颜色混合) 到 `useWebGpu/useGpuMixer.js`。
    *   迁移 `brushSampleProcessor.js` (笔刷样本处理，依赖 Sharp) 到 `brushes/useBrushSampler.js`，并更新了其内部依赖。
    *   更新了 `brushes/brushes.js` 和 `useBrushProcessor.js` 以使用新的模块路径。
*   **2024-07-29 (织):**
    *   创建 `brushes/` 子目录，并将备份 (`trashed/`) 中的 `brushes.js` 和 `configs.js` 迁移至此。
    *   创建 `useBrushProcessor.js` 文件，用于封装加载、处理（依赖 Sharp）和缓存笔刷图像的逻辑，此逻辑原属于 `DrawingTools` 类。
    *   **TODO:** `brushes.js` 内部依赖的 `brushSampleProcessor.js` 和 `gpuMix.js` 也需要从备份中恢复、迁移并重构。
    *   **TODO:** `useBrushProcessor.js` 中调用 `brushImageProcessor.processColoredBrush` 的部分需要确认 `brushImageProcessor` 的实现并改造其对 Sharp 的依赖方式。 