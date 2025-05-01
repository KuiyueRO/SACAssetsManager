/**
 * @deprecated 2024-07-30 (织)
 * 原因：此文件是一个过时的兼容性垫片。它指向的路径 
 *      `src/toolBox/feature/useImage/imageToolBox.js` 已不存在。
 *      `src/toolBox/feature/useImage/` 目录下的功能现在由 
 *      `useSeamlessDetector.js`, `forImageManipulation.js` 等具体文件提供。
 * 此文件不再需要，保留备份仅供参考。
 */

/**
 * @fileoverview 已弃用 - 图像处理工具箱参考
 * @deprecated 请直接从对应toolBox文件导入：
 * - imageToolBox: src/toolBox/feature/useImage/imageToolBox.js
 * - 图像工具箱参考: src/toolBox/feature/useImage/imageToolBox.js
 */

// 从新路径导入
import { imageToolBox, 图像工具箱参考 } from './src/toolBox/feature/useImage/imageToolBox.js';

// 重新导出保持兼容性
export { imageToolBox, 图像工具箱参考 };

// 默认导出
export default imageToolBox;

// 在导入时发出警告
console.warn('imageToolBox.js 已弃用，请直接从toolBox导入相应模块'); 