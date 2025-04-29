# Vue 依赖封装 (base/deps/vue)

**所属层级:** Base

**职责范围:** 统一封装对项目使用的 Vue.js 核心库 (`static/vue.esm-browser.js`) 的导入和导出。

**准入标准:**
- 仅包含从 Vue 源文件导入并重新导出的语句。
- **禁止**添加任何自定义逻辑或辅助函数。
- **禁止**依赖 `feature` 或 `domain` 层的任何模块。

**目的:**
- 提供一个单一的、稳定的 Vue 依赖入口点。
- 隔离对 `static` 目录下具体文件路径的直接依赖。
- 便于未来可能的 Vue 版本升级或依赖替换。

**架构总纲:** [../../../architecture_layers_explained.md](../../../architecture_layers_explained.md) 