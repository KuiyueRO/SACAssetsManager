# 这个区块由开发者编写,未经允许禁止AI修改

**职责范围 (Scope):** 提供使用 WebGPU 加速 Canvas 相关计算的功能，例如高级颜色混合、物理模拟效果等。

**所属层级:** Feature (`feature/forCanvas/useWebGpu`)

**准入标准 (Criteria):**
- 必须是利用 WebGPU 为 Canvas 提供加速的功能。
- 可以依赖 `base` 层的模块 (如 `base/useBrowser/useCanvas`, `feature/forWebGPU/*`)。
- **禁止**依赖 `useAge` 层的任何模块。
- **禁止**包含特定应用的业务逻辑。
- 外部依赖必须通过 `base/useDeps` 引入。
- **命名规范:** 必须遵循 [`../../../GUIDELINES.md`](../../../GUIDELINES.md) 中定义的 **"流畅优美的文式编程风格"** 核心要求。

**架构总纲:** [`../../../architecture_layers_explained.md`](../../../architecture_layers_explained.md)

---

# AI 笔记 - Canvas WebGPU 加速

## 历史记录与重要变更

*   **2024-07-30 (织):**
    *   创建 `useWebGpu/` 子目录。
    *   将备份 (`trashed/`) 中的 `gpuMix.js` 迁移至 `useGpuMixer.js`。
    *   将 `gpuMix.js` 依赖的 `mixer.wgsl`, `colors.wgsl`, `constants.wgsl` 迁移/合并至 `mixer.wgsl`，并修正了 `useGpuMixer.js` 中的 WGSL 加载逻辑和导入路径，使其能够正确处理自定义的 `#import` 语法。
    *   `useGpuMixer.js` 导出一个 `mixer` 单例，提供了基于 WebGPU 的颜色混合能力。 