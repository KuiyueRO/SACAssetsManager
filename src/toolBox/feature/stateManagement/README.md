# Vue 状态管理器 (feature/stateManagement)

**所属层级:** Feature

**职责范围:** 提供基于 Vue 响应式系统的状态管理功能和模式。

**准入标准:**
- 必须是提供**通用**状态管理能力的代码，不应包含特定应用的业务状态或逻辑。
- **必须**依赖 `base/deps/vue` 来获取 Vue API，禁止直接从 `static/` 导入。
- 可以依赖 `base` 层的其他模块。
- **禁止**依赖 `domain` 层的任何模块。

**当前内容:**
- `createVueStateManager.js`: 提供一个创建简单、基于 Ref 和全局注册表的状态管理器实例的工厂函数。

**架构总纲:** [../../../architecture_layers_explained.md](../../../architecture_layers_explained.md) 