/**
 * @fileoverview 提供与思源 API 交互相关的工具函数，例如 URL 构建和错误处理。
 * @module toolBox/useAge/forSiyuan/apiUtils
 */

// TODO: 应考虑将此默认 URL 移至更全局的配置中
const DEFAULT_SIYUAN_API_BASE_URL = 'http://127.0.0.1:6806';

/**
 * 构建完整的思源 API 请求 URL。
 * @param {string} endpoint - API 端点路径 (e.g., '/api/block/getBlockInfo')。
 * @param {string} [host=DEFAULT_SIYUAN_API_BASE_URL] - 思源 API 的主机地址。
 * @returns {string} 完整的请求 URL。
 */
export const getSiyuanApiUrl = (endpoint, host = DEFAULT_SIYUAN_API_BASE_URL) => {
  const baseUrl = host.endsWith('/') ? host.slice(0, -1) : host;
  // 确保 endpoint 以 '/' 开头
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${cleanEndpoint}`;
};

/**
 * 处理思源 API 请求中发生的错误。
 * 打印错误日志并返回标准错误格式对象。
 * @param {Error} err - 捕获到的错误对象。
 * @param {string} operation - 执行的操作描述 (e.g., '获取块信息')。
 * @returns {{code: number, msg: string, data: null}} 标准错误响应体。
 */
export const handleSiyuanApiError = (err, operation) => {
  console.error(`${operation}失败:`, err);
  return {
    code: -1, // 使用 -1 作为通用错误代码
    msg: `${operation}出错: ${err.message}`,
    data: null
  };
}; 