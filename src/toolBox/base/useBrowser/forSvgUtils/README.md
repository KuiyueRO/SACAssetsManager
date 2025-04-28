# SVG Data URL 生成工具 (`forSvgUtils`)

本模块 (`src/toolBox/base/useBrowser/forSvgUtils/`) 提供一组用于生成 SVG Data URL 的函数。

## 主要功能

*   `formatEmptySvgDataUrl(options)`: 生成一个指定尺寸的空 SVG Data URL。
*   `formatCssSvgDataUrl(cssString, options)`: 生成一个 SVG Data URL，其内容是一个应用了指定 CSS 的 HTML `<div>`。
*   `formatTextSvgDataUrl(textContent, options)`: 生成一个包含居中对齐文本的 SVG Data URL。
*   `formatEmojiSvgDataUrl(emojiUnicode, options)`: 生成一个包含指定 Unicode Emoji 的 SVG Data URL。

## 依赖

无外部依赖，仅使用 JavaScript 内建功能。

## 使用

```javascript
import {
    formatTextSvgDataUrl,
    formatEmojiSvgDataUrl
} from 'path/to/toolBox/base/useBrowser/forSvgUtils/formatSvgDataUrl.js';

const textIcon = formatTextSvgDataUrl('AB', { width: 32, height: 32, fontSize: 16 });
const emojiIcon = formatEmojiSvgDataUrl('1F600', { width: 64, height: 64 });

// textIcon 和 emojiIcon 可以用作 <img> 的 src 或 CSS background-image
```

## 定位

属于 `toolBox` 的 `base/useBrowser` 层，提供基础的、与浏览器 SVG 显示相关的工具函数。 