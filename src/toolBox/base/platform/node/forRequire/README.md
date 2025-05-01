# Node.js Require 扩展 (forRequire)

本目录包含与 Node.js 的 `require` 机制相关的底层操作和扩展功能。

## 模块

-   `hackRequire.js`: **(重要例外机制)** 此模块通过修改全局 `require` 函数和 `module.load` 方法，扩展了 Node.js 的模块搜索路径。它的核心目的是为了**支撑项目的核心扩展系统**（类似 Rubick/uTools 的扩展），允许每个扩展方便地加载自己独立的依赖，而无需复杂配置或担心冲突。它通过 `require.setExternalBase(path)` 和 `require.setExternalDeps(path)` 添加外部搜索目录。

## 设计原则

-   **底层操作:** 直接与 Node.js 模块加载机制交互。
-   **扩展支持:** 优先保障扩展开发的便利性和依赖隔离性。
-   **谨慎使用:** 修改全局 `require` 是一种 hack 手段。虽然在此项目中因支持扩展机制而被允许作为例外，但在其他场景下应优先考虑标准依赖管理方案。

## 命名规范

**核心要求:** 所有导出函数（目前主要是附加到 `require` 上的方法）必须遵循 [`../../../GUIDELINES.md`](../../../GUIDELINES.md) 中定义的函数命名规范和 **"流畅优美的文式编程风格"** 核心要求。

## 使用示例

```javascript
// 在应用启动早期（例如 bootstrap 文件中）
import './path/to/toolBox/base/useNode/forRequire/hackRequire.js'; // 引入以应用 hack

// 设置外部依赖基础路径 (通常是插件或模块的根目录)
const externalModulePath = '/path/to/external/modules';
if (typeof require.setExternalBase === 'function') {
    require.setExternalBase(externalModulePath);
}

// 添加其他外部依赖路径 (如果需要)
if (typeof require.setExternalDeps === 'function') {
    require.setExternalDeps('/path/to/another/dep/folder');
}

// 后续代码中的 require 调用现在也会搜索设置的外部路径
try {
    const externalDep = require('some-external-dependency');
    // ... use externalDep
} catch (e) {
    console.error("Failed to load dependency, even from external paths:", e);
}
```

**注意:** 此模块依赖于 Node.js 环境，并且其 hack 方式可能在不同 Node.js 版本或特定打包工具下产生兼容性问题。使用时需充分测试。 