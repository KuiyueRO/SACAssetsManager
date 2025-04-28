/**
 * @fileoverview `base/usePlatform` 目录的统一导出文件。
 * 导出所有封装了特定平台 API 或功能的模块。
 */

export * from './forNode/forZipUtils.js';
// 如果未来有 forElectron, forBrowser 等特定平台封装，也在这里导出 