# 这个区段由开发者编写,未经允许禁止AI修改

# Node.js 内置模块转发笔记

**所属层级:** Base (Deps)

**职责范围:** 为 Node.js 内置模块提供统一的 ESM 导出接口。

**实现原则:**
- 内部使用 `require()` 加载对应的 Node.js 内置模块。
- 外部使用 `export` 导出，供项目其他部分通过 `import` 使用。
- 目标是隔离 `require` 调用，统一项目依赖引用方式。

## 历史记录

### 2024-07-29 (织)
- 创建 `http.js`：转发 Node.js 的 `http` 模块。
- 创建 `fs.js`：转发 Node.js 的 `fs` 模块，主要导出其 `promises` API (`fsPromises`)。 