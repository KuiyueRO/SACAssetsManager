# 特定功能工具 (Feature Tools)

本目录包含针对特定功能领域的工具函数和模块，提供了各种专业功能的集成实现。这些工具通常依赖于特定的技术栈或框架，但经过封装后提供了统一的接口。

## 目录结构

- `useVue/` - Vue框架相关工具
- `forFileSystem/` - 文件系统操作工具
- `forAssets/` - 资源管理相关工具
- `useChat/` - 聊天功能相关工具
- `useImage/` - 图像处理工具
- `useStateMachine/` - 状态机实现工具
- `useSyncedstore/` - 同步存储工具
- `forColors/` - 颜色处理工具
- `useSvg/` - SVG图形处理工具
- `useKonva/` - Konva绘图库工具
- `useOpenAI/` - OpenAI接口集成工具

## 使用指南

特定功能工具应通过 `toolBoxExports.js` 导入使用：

```js
// 推荐：通过统一导出接口导入
import { 图像缩放, 图像裁剪 } from '../toolBox/toolBoxExports.js';

// 或者直接从具体模块导入
import { Vue组件挂载 } from '../toolBox/feature/useVue/vueTools.js';
```

## 特定功能工具的设计原则

1. **功能模块化**：
   - 每个模块专注于一个特定功能领域
   - 相关功能集中在同一目录下
   - 通过清晰的接口暴露功能

2. **依赖隔离**：
   - 尽量减少外部依赖
   - 显式声明所有依赖
   - 避免隐式依赖和副作用

3. **统一风格**：
   - 保持一致的API设计风格
   - 使用统一的错误处理方式
   - 遵循项目的命名规范

4. **扩展性设计**：
   - 设计易于扩展的接口
   - 支持自定义配置和选项
   - 考虑未来的功能增强

## 贡献指南

向特定功能工具添加新模块时，请遵循以下原则：

1. **目录组织**：
   - 为新功能创建专门的子目录
   - 使用适当的前缀（use或for）
   - 相关功能集中管理

2. **代码风格**：
   - 使用函数式风格
   - 避免使用类，除非确实必要
   - 减少嵌套和副作用

3. **文档**：
   - 为每个导出的函数添加JSDoc注释
   - 提供使用示例
   - 说明函数的限制和注意事项

4. **测试**：
   - 为每个关键功能添加单元测试
   - 覆盖边界情况和错误处理
   - 确保向后兼容性

## 文件命名规范

特定功能工具目录使用以下命名规范：
- `useXXX/` - 提供特定技术栈或框架的集成工具
- `forXXX/` - 提供针对特定领域的功能工具

文件命名应该反映其功能，避免使用无语义的名称如index.js或main.js。

```javascript
// 示例：使用图像处理特性
import { 图像缩放, 图像裁剪 } from './useImage/imageToolBox.js'; // 指向具体实现

async function handleImage(imageBlob) {
    const resizedImage = await 图像缩放(imageBlob, { width: 500 });
    const croppedImage = await 图像裁剪(resizedImage, { x: 0, y: 0, width: 100, height: 100 });
    return croppedImage;
} 