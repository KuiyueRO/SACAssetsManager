# 这个区块由开发者编写,未经允许禁止AI修改

**职责范围 (Scope):** 定义和实现各种 Canvas 笔刷效果，包括笔刷配置、绘制逻辑以及笔刷样本的处理。

**所属层级:** Feature (`feature/forCanvas/brushes`)

**准入标准 (Criteria):**
- 必须是与特定笔刷实现相关的代码。
- 可以依赖 `base` 层的模块 (如 `base/useBrowser/useCanvas`, `base/useDeps/useSharp`, `base/forColor`)。
- 可以依赖同级 `feature/forCanvas` 下的其他模块 (如 `useWebGpu`, `useDrawingUtils`)。
- **禁止**依赖 `useAge` 层的任何模块。
- **禁止**包含特定应用的业务逻辑。
- 外部依赖必须通过 `base/useDeps` 引入。
- **命名规范:** 必须遵循 [`../../../GUIDELINES.md`](../../../GUIDELINES.md) 中定义的 **"流畅优美的文式编程风格"** 核心要求。

**架构总纲:** [`../../../architecture_layers_explained.md`](../../../architecture_layers_explained.md)

---

# AI 笔记 - Canvas 笔刷

## 历史记录与重要变更

*   **2024-07-30 (织):**
    *   将备份中的 `brushSampleProcessor.js` 迁移至 `useBrushSampler.js`。
    *   更新了 `useBrushSampler.js` 以使用 `useSharp` 并修正了内部导入路径。
    *   更新了 `brushes.js` 以导入 `useBrushSampler.js` 和 `useGpuMixer.js`。
*   **2024-07-29 (织):**
    *   创建 `brushes/` 目录。
    *   迁移备份中的 `brushes.js` 和 `configs.js` 至此。
    *   从 `brushes.js` 中移除了 `gpuMix.js` 和 `brushSampleProcessor.js` 的直接导入 TODO。 