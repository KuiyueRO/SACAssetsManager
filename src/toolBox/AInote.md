# 这个区块的内容来自开发者,禁止AI未经允许修改

# AI 核心指令

*   **职责与规范:** 严格遵守 [`./GUIDELINES.md`](./GUIDELINES.md) 中定义的所有开发、重构原则和规范，特别是三层架构、函数式风格、命名规范、导入导出和依赖管理原则。
*   **文件夹文档:** `toolBox` 下的**每一个**功能性子文件夹都**必须**包含 `README.md` 或 `AInote.md`，清晰定义其职责范围和代码准入标准，并链接到架构总纲 [`./architecture_layers_explained.md`](./architecture_layers_explained.md)。
*   **当前任务:**
    *   扫描所有 `utils` 等类似命名的文件夹，尝试进行重构，迁移到 `toolBox`。
    *   集中处理思源笔记的环境依赖，通过 `useAge/forSiyuan` 相关模块封装。
    *   重构项目中零散分布的其他工具文件。
    *   发现 `node_modules` 依赖可用 `static/` ESM 替代时提出建议（**不修改**）。
*   **阶段计数与历史:** 阶段计数任务完成后减一，归零时总结进度到 [`./history.md`](./history.md) 并重置计数。`AInote.md` 只保留当前计数和焦点，详细历史记录在 `history.md`。
*   **重构目标:** 参考项目根目录 `index new.js` (如有)。
*   **关注点:** **先停止不断扩充工具箱, 开始检查功能代码的实现。**

---
*2024-07-27 织: 已阅读并理解 `toolBox` 目录的整体结构、主要内容以及开发要求与重构计划。*
*2024-07-28 织: 拆分 `AInote.md`，将规范、历史、计划等移至独立文件。*
*2024-07-29 织: 进一步精简 `AInote.md`，移除开发者区块中的细节描述和静态依赖分析，更新核心链接。*
---

# 工具箱重构笔记

## 当前状态与核心链接

**阶段计数:** 0 (请根据实际进度修改)

**当前重构焦点:** (请根据实际情况更新, 例如：检查 `feature/forFileSystem` 的代码实现)

**重要文档链接:**
- **开发与重构指南:** [`./GUIDELINES.md`](./GUIDELINES.md)
- **架构分层详解:** [`./architecture_layers_explained.md`](./architecture_layers_explained.md)
- **详细重构历史:** [`./history.md`](./history.md)
- **未来重构计划:** [`./phase4_plan.md`](./phase4_plan.md)
- **Static 依赖分析:** [`./static_deps_analysis.md`](./static_deps_analysis.md) (新)
- **工具箱根说明:** [`./README.md`](./README.md)

## 工具箱结构概览 (参考)

```
src/toolBox/
├── base/
├── feature/
├── useAge/
├── GUIDELINES.md
├── architecture_layers_explained.md
├── history.md
├── phase4_plan.md
├── static_deps_analysis.md (新)
├── toolBoxExports.js (**逐步废弃**)
└── README.md
```


