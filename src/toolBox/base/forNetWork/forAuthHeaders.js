/**
 * @fileoverview 提供创建认证请求头的辅助函数。
 * @module toolBox/base/forNetwork/forAuthHeaders
 */

/**
 * 创建包含认证信息的 HTTP 请求头对象。
 *
 * @param {object} [options={}] - 配置选项。
 * @param {string | null | undefined} [options.token] - 用于认证的令牌。
 * @param {string} [options.scheme='Token'] - 认证方案 (e.g., 'Bearer', 'Token', 'Basic')。
 * @param {Record<string, string>} [options.additionalHeaders={}] - 要合并的其他请求头。
 * @param {string} [options.contentType='application/json'] - Content-Type 的值。
 * @returns {Record<string, string>} 包含认证信息的请求头对象。
 */
export const createAuthHeaders = (options = {}) => {
  const {
    token,
    scheme = 'Token',
    additionalHeaders = {},
    contentType = 'application/json'
  } = options;

  const headers = {
    ...additionalHeaders
  };

  if (contentType) {
    headers['Content-Type'] = contentType;
  }

  if (token && scheme) {
    headers['Authorization'] = `${scheme} ${token}`.trim();
  } else if (token) { // 如果只提供了 token，不提供 scheme
    headers['Authorization'] = token;
  }

  return headers;
}; 