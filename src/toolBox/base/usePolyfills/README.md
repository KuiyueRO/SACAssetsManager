# 平台兼容性和检测工具 (usePolyfills)

本目录包含平台兼容性和检测相关的工具函数，提供跨平台、跨浏览器的能力支持。

## 文件结构

- `uaAnalysis.js` - 用户代理(UA)分析工具，用于检测浏览器和操作系统
- 其他平台兼容性和检测工具文件

## 使用指南

平台兼容性工具应通过 `toolBoxExports.js` 导入使用：

```js
// 推荐：通过统一导出接口导入
import { 检测浏览器, 检测操作系统 } from '../../../toolBox/toolBoxExports.js';

// 或者直接从具体模块导入
import { 解析UA } from '../../../toolBox/base/usePolyfills/uaAnalysis.js';
```

## 主要功能

### UA分析工具 (uaAnalysis.js)

提供用户代理字符串解析和浏览器/平台检测能力：

```js
// 检测当前浏览器
const browser = 检测浏览器();
if (browser.isChrome && browser.version >= 80) {
  // Chrome 80+特定代码
}

// 检测操作系统
const os = 检测操作系统();
if (os.isWindows) {
  // Windows特定代码
}

// 解析自定义UA字符串
const customUA = '自定义UA字符串';
const parsedUA = 解析UA(customUA);
```

## 贡献指南

向平台兼容性工具添加新函数时，请遵循以下原则：

1. **兼容性优先**：
   - 确保工具在所有支持的平台上正常工作
   - 提供合理的回退机制
   - 考虑边缘情况和特殊环境

2. **测试覆盖**：
   - 在不同平台上测试功能
   - 覆盖常见的浏览器和操作系统
   - 验证在不支持的环境中的行为

3. **性能考虑**：
   - 避免过度的运行时检测
   - 优先使用特性检测而非用户代理检测
   - 合理缓存检测结果

4. **文档完善**：
   - 明确说明支持的平台和浏览器版本
   - 记录已知的兼容性问题
   - 提供使用示例和最佳实践

## 注意事项

- 用户代理检测应作为最后手段，优先使用特性检测
- 考虑兼容性工具对整体包大小的影响，避免不必要的polyfill
- 跟踪并更新对新平台和浏览器版本的支持
- 兼容性工具应该设计为可选依赖，不应成为其他模块的硬依赖

## 示例代码

```javascript
// 错误的做法：依赖全局状态或不易测试的函数
// import { isMobile, osName } from './someGlobalStateModule';

// 正确的做法：导入纯函数或明确依赖的工具
import { 检测浏览器 } from './browserDetection.js'; // 直接从同目录导入
import { 检测操作系统 } from './osDetection.js'; // 直接从同目录导入

const browserInfo = 检测浏览器();
const osInfo = 检测操作系统();

console.log(`浏览器：${browserInfo.name} ${browserInfo.version}`);
console.log(`操作系统：${osInfo.name} ${osInfo.version}`);
```