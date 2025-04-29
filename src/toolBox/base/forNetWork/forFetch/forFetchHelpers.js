/**
 * @fileoverview 提供 fetch 相关的辅助函数。
 * @module toolBox/base/forNetwork/forFetch/forFetchHelpers
 */

const DEFAULT_TIMEOUT = 30000;

/**
 * 使用指定的超时时间执行 fetch 请求。
 * @param {string|URL} url - 请求的 URL。
 * @param {RequestInit & { timeout?: number }} [options] - fetch 的选项，可以额外包含一个 timeout (毫秒)。
 * @returns {Promise<Response>} fetch 的响应。
 * @throws {Error} 如果请求超时或发生其他网络错误。
 */
export const forFetchWithTimeout = async (url, options = {}) => {
  const { timeout = DEFAULT_TIMEOUT, ...fetchOptions } = options;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (err) {
    clearTimeout(timeoutId);
    // 如果是 AbortError 且由超时引起，可以抛出更具体的错误
    if (err.name === 'AbortError') {
      throw new Error(`Request timed out after ${timeout} ms`);
    }
    throw err;
  }
}; 