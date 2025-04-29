/**
 * 兼容层 - 请使用新路径: src/toolBox/feature/forFileSystem/forFileListProcessing.js
 * @deprecated 此文件已被移动到工具箱，请更新导入路径
 */

import { createFileListToStatsStream } from '../../../../src/toolBox/feature/forFileSystem/forFileListProcessing.js';
import { statWithCatch } from '../fs/stat.js';

/**
 * 兼容旧的API - 创建文件列表到状态的转换流
 * @deprecated 请使用 createFileListToStatsStream
 * @returns {Transform} 转换流
 */
export const buildFileListStream = () => {
  console.warn('buildFileListStream 已弃用，请使用 createFileListToStatsStream 替代');
  return createFileListToStatsStream(statWithCatch);
};