import { getSiyuanApiUrl, handleSiyuanApiError } from '../../apiUtils.js';
import { forFetchWithTimeout } from '../../../base/forNetwork/forFetch/forFetchHelpers.js';
import { createAuthHeaders } from '../../../base/forNetwork/forAuthHeaders.js';

/**
 * 发送存储相关请求的通用方法
 * @private
 * @param {string} endpoint - API 端点
 * @param {Object} data - 请求数据
 * @param {Object} [options] - 可选配置
 * @param {string} [options.host] - API服务器地址
 * @param {string} [options.token] - 自定义认证令牌
 * @returns {Promise<{code: number, msg: string, data: Object}>}
 */
const sendStorageRequest = async (endpoint, data, options = {}) => {
  try {
    // 使用新的工具函数
    const apiUrl = getSiyuanApiUrl(`/api/storage/${endpoint}`, options.host);
    const token = options.token || localStorage.getItem('token');
    const headers = createAuthHeaders({ token: token, scheme: 'Token' });
    headers['Content-Type'] = 'application/json'; // 保留 Content-Type

    const response = await forFetchWithTimeout(apiUrl, { // 使用 forFetchWithTimeout
      method: 'POST',
      headers: headers,
      body: JSON.stringify(data)
    });
    // 检查响应状态
    if (!response.ok) {
      let errorMsg = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMsg = errorData.msg || errorMsg;
      } catch (e) {
        errorMsg = response.statusText || errorMsg;
      }
      throw new Error(errorMsg);
    }
    return await response.json();
  } catch (err) {
    return handleSiyuanApiError(err, `存储 ${endpoint} 操作`); // 使用新的错误处理
  }
};

/**
 * 获取本地存储
 * @param {Object} params - 查询选项
 * @param {string} params.key - 存储键名
 * @param {Object} [options] - 可选配置
 * @param {string} [options.host] - API服务器地址
 * @param {string} [options.token] - 自定义认证令牌
 * @returns {Promise<{
 *   code: number,
 *   msg: string,
 *   data: {
 *     key: string,
 *     val: string
 *   }
 * }>}
 */
export const getLocalStorage = (params, options = {}) => {
  const { key } = params;

  if (!key) {
    return Promise.resolve({
      code: -1,
      msg: '存储键名不能为空',
      data: null
    });
  }

  return sendStorageRequest('getLocalStorage', { key }, options);
};

/**
 * 设置本地存储
 * @param {Object} params - 设置选项
 * @param {string} params.key - 存储键名
 * @param {string} params.val - 存储值
 * @param {Object} [options] - 可选配置
 * @param {string} [options.host] - API服务器地址
 * @param {string} [options.token] - 自定义认证令牌
 * @returns {Promise<{
 *   code: number,
 *   msg: string,
 *   data: {
 *     closeTimeout: number
 *   }
 * }>}
 */
export const setLocalStorage = (params, options = {}) => {
  const { key, val } = params;

  if (!key) {
    return Promise.resolve({
      code: -1,
      msg: '存储键名不能为空',
      data: null
    });
  }

  if (typeof val !== 'string') {
    return Promise.resolve({
      code: -1,
      msg: '存储值必须是字符串',
      data: null
    });
  }

  return sendStorageRequest('setLocalStorage', { key, val }, options);
};

/**
 * 删除本地存储
 * @param {Object} params - 删除选项
 * @param {string} params.key - 存储键名
 * @param {Object} [options] - 可选配置
 * @param {string} [options.host] - API服务器地址
 * @param {string} [options.token] - 自定义认证令牌
 * @returns {Promise<{
 *   code: number,
 *   msg: string,
 *   data: {
 *     closeTimeout: number
 *   }
 * }>}
 */
export const removeLocalStorage = (params, options = {}) => {
  const { key } = params;

  if (!key) {
    return Promise.resolve({
      code: -1,
      msg: '存储键名不能为空',
      data: null
    });
  }

  return sendStorageRequest('removeLocalStorage', { key }, options);
};

/**
 * 获取本地存储键列表
 * @param {Object} [options] - 可选配置
 * @param {string} [options.host] - API服务器地址
 * @param {string} [options.token] - 自定义认证令牌
 * @returns {Promise<{
 *   code: number,
 *   msg: string,
 *   data: Array<string>
 * }>}
 */
export const getLocalStorageKeys = (options = {}) => {
  return sendStorageRequest('getLocalStorageKeys', {}, options);
};

/**
 * 清空本地存储
 * @param {Object} [options] - 可选配置
 * @param {string} [options.host] - API服务器地址
 * @param {string} [options.token] - 自定义认证令牌
 * @returns {Promise<{code: number, msg: string, data: null}>}
 */
export const clearLocalStorage = (options = {}) => {
  return sendStorageRequest('clearLocalStorage', {}, options);
};

/**
 * 批量设置本地存储
 * @param {Object} params - 设置选项
 * @param {Object} params.data - 键值对数据
 * @param {Object} [options] - 可选配置
 * @param {string} [options.host] - API服务器地址
 * @param {string} [options.token] - 自定义认证令牌
 * @returns {Promise<{code: number, msg: string, data: null}>}
 */
export const batchSetLocalStorage = (params, options = {}) => {
  const { data } = params;
  
  if (!data || typeof data !== 'object') {
    return Promise.resolve({
      code: -1,
      msg: '数据必须是对象',
      data: null
    });
  }

  // 验证所有值是否为字符串
  for (const val of Object.values(data)) {
    if (typeof val !== 'string') {
      return Promise.resolve({
        code: -1,
        msg: '所有值必须是字符串',
        data: null
      });
    }
  }

  return sendStorageRequest('batchSetLocalStorage', { data }, options);
};

// 使用示例：
/*
// 获取存储值
const item = await getLocalStorage({
  key: 'settings'
});

// 设置存储值
await setLocalStorage({
  key: 'settings',
  val: JSON.stringify({theme: 'dark'})
});

// 删除存储值
await removeLocalStorage({
  key: 'settings'
});

// 获取所有键名
const keys = await getLocalStorageKeys();
*/ 