/**
 * @fileoverview 封装对 JSZip 库 (来自 static 目录) 的依赖。
 * 所有需要使用 JSZip 的 toolBox 模块都应通过此文件导入。
 */

// 注意：路径深度可能需要根据实际 toolBox 结构调整
import * as JSZip from '../../../../../static/jszip.js';

// 导出 JSZip 主对象，供其他模块使用
export { JSZip }; 