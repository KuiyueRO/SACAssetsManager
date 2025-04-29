/**
 * 兼容层 - 请使用新路径: src/toolBox/feature/forStreamProcessing/streamFilters.js
 * @deprecated 此文件已被移动到工具箱，请更新导入路径
 */

import { createFilterStream } from '../../../../src/toolBox/feature/forStreamProcessing/streamFilters.js';

/**
 * 兼容旧的API - 创建过滤流
 * @deprecated 请使用 createFilterStream
 * @param {Function|Object} filter - 过滤函数或过滤器对象
 * @returns {Transform} 转换流
 */
export const buildFilterStream = (filter) => {
    console.warn('buildFilterStream 已弃用，请使用 createFilterStream 替代');
    return createFilterStream(filter);
}