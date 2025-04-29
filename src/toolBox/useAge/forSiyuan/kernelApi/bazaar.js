/**
 * @fileoverview 封装思源笔记集市 (Bazaar) 相关 Kernel API。
 * @module toolBox/useAge/forSiyuan/kernelApi/bazaar
 */
// import { getApiUrl, handleApiError } from './utils/apiConfig'; // 旧导入
// import { fetchWithTimeout, getAuthHeaders } from './utils/fetchUtils'; // 旧导入
import { getSiyuanApiUrl, handleSiyuanApiError } from '../../apiUtils.js';
import { forFetchWithTimeout } from '../../../base/forNetwork/forFetch/forFetchHelpers.js';
import { createAuthHeaders } from '../../../base/forNetwork/forAuthHeaders.js';

/**
 * 发送集市相关请求的通用方法
 * @private
 * @param {string} endpoint - API 端点
 * @param {Object} data - 请求数据
 * @param {Object} [options] - 可选配置
 * @param {string} [options.host] - API服务器地址
 * @param {string} [options.token] - 自定义认证令牌
 * @returns {Promise<{code: number, msg: string, data: Object}>}
 */
const sendBazaarRequest = async (endpoint, data, options = {}) => {
  try {
    // 使用新的工具函数
    const apiUrl = getSiyuanApiUrl(`/api/bazaar/${endpoint}`, options.host);
    const token = options.token || localStorage.getItem('token');
    const headers = createAuthHeaders({ token: token, scheme: 'Token' });

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
    return handleSiyuanApiError(err, `集市 ${endpoint} 操作`); // 使用新的错误处理
  }
};

/**
 * 获取集市包列表
 * @param {Object} options - 查询选项
 * @param {string} options.type - 包类型：'theme' | 'icon' | 'template' | 'widget' | 'plugin'
 * @param {string} [options.frontend] - 前端类型(plugin专用)
 * @param {string} [options.keyword] - 搜索关键字
 * @param {Object} [apiOptions] - API可选配置
 * @param {string} [apiOptions.host] - API服务器地址
 * @param {string} [apiOptions.token] - 自定义认证令牌
 * @returns {Promise<{code: number, msg: string, data: {packages: Array}}>}
 */
export const getBazaarPackageList = (options, apiOptions = {}) => {
  const { type, frontend, keyword } = options;
  const endpoint = `getBazaar${type.charAt(0).toUpperCase() + type.slice(1)}`;
  return sendBazaarRequest(endpoint, { frontend, keyword }, apiOptions);
};

/**
 * 获取已安装的集市包列表
 * @param {Object} options - 查询选项 
 * @param {string} options.type - 包类型
 * @param {string} [options.frontend] - 前端类型(plugin专用)
 * @param {string} [options.keyword] - 搜索关键字
 * @param {Object} [apiOptions] - API可选配置
 * @param {string} [apiOptions.host] - API服务器地址
 * @param {string} [apiOptions.token] - 自定义认证令牌
 * @returns {Promise<{code: number, msg: string, data: {packages: Array}}>}
 */
export const getInstalledPackageList = (options, apiOptions = {}) => {
  const { type, frontend, keyword } = options;
  const endpoint = `getInstalled${type.charAt(0).toUpperCase() + type.slice(1)}`;
  return sendBazaarRequest(endpoint, { frontend, keyword }, apiOptions);
};

/**
 * 安装集市包
 * @param {Object} options - 安装选项
 * @param {string} options.type - 包类型
 * @param {string} options.repoURL - 仓库URL
 * @param {string} options.repoHash - 仓库Hash
 * @param {string} options.packageName - 包名称
 * @param {string} [options.frontend] - 前端类型(plugin专用)
 * @param {number} [options.mode] - 主题模式(theme专用)
 * @param {boolean} [options.update] - 是否更新(theme专用)
 * @param {Object} [apiOptions] - API可选配置
 * @param {string} [apiOptions.host] - API服务器地址
 * @param {string} [apiOptions.token] - 自定义认证令牌
 * @returns {Promise<{code: number, msg: string, data: {packages: Array, appearance?: Object}}>}
 */
export const installBazaarPackage = (options, apiOptions = {}) => {
  const { type, ...rest } = options;
  const endpoint = `installBazaar${type.charAt(0).toUpperCase() + type.slice(1)}`;
  return sendBazaarRequest(endpoint, rest, apiOptions);
};

/**
 * 卸载集市包
 * @param {Object} options - 卸载选项
 * @param {string} options.type - 包类型
 * @param {string} options.packageName - 包名称
 * @param {string} [options.frontend] - 前端类型(plugin专用)
 * @param {Object} [apiOptions] - API可选配置
 * @param {string} [apiOptions.host] - API服务器地址
 * @param {string} [apiOptions.token] - 自定义认证令牌
 * @returns {Promise<{code: number, msg: string, data: {packages: Array, appearance?: Object}}>}
 */
export const uninstallBazaarPackage = (options, apiOptions = {}) => {
  const { type, ...rest } = options;
  const endpoint = `uninstallBazaar${type.charAt(0).toUpperCase() + type.slice(1)}`;
  return sendBazaarRequest(endpoint, rest, apiOptions);
};

/**
 * 获取包的README内容
 * @param {Object} options - 选项
 * @param {string} options.repoURL - 仓库URL
 * @param {string} options.repoHash - 仓库Hash
 * @param {string} options.packageType - 包类型
 * @param {Object} [apiOptions] - API可选配置
 * @param {string} [apiOptions.host] - API服务器地址
 * @param {string} [apiOptions.token] - 自定义认证令牌
 * @returns {Promise<{code: number, msg: string, data: {html: string}}>}
 */
export const getBazaarPackageREADME = (options, apiOptions = {}) => {
  return sendBazaarRequest('getBazaarPackageREAME', options, apiOptions);
};

/**
 * 获取更新的包
 * @param {Object} options - 查询选项
 * @param {Object} [apiOptions] - API可选配置
 * @param {string} [apiOptions.host] - API服务器地址
 * @param {string} [apiOptions.token] - 自定义认证令牌
 * @returns {Promise<{code: number, msg: string, data: Object}>}
 */
export const getUpdatedPackage = (options, apiOptions = {}) => {
  return sendBazaarRequest('getUpdatedPackage', options, apiOptions);
};

/**
 * 批量更新包
 * @param {Object} options - 更新选项
 * @param {Object} [apiOptions] - API可选配置
 * @param {string} [apiOptions.host] - API服务器地址
 * @param {string} [apiOptions.token] - 自定义认证令牌
 * @returns {Promise<{code: number, msg: string, data: Object}>}
 */
export const batchUpdatePackage = (options, apiOptions = {}) => {
  return sendBazaarRequest('batchUpdatePackage', options, apiOptions);
}; 