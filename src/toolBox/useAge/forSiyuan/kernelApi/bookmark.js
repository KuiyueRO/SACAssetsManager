/**
 * @fileoverview 封装思源笔记书签 (Bookmark) 相关 Kernel API。
 * @module toolBox/useAge/forSiyuan/kernelApi/bookmark
 */
// import { getApiUrl, handleApiError } from './utils/apiConfig'; // 旧导入
// import { fetchWithTimeout, getAuthHeaders } from './utils/fetchUtils'; // 旧导入
import { getSiyuanApiUrl, handleSiyuanApiError } from '../../apiUtils.js';
import { forFetchWithTimeout } from '../../../base/forNetwork/forFetch/forFetchHelpers.js';
import { createAuthHeaders } from '../../../base/forNetwork/forAuthHeaders.js';

/**
 * 发送书签相关请求的通用方法
 * @private
 * @param {string} endpoint - API 端点
 * @param {Object} data - 请求数据
 * @param {Object} [options] - 可选配置
 * @param {string} [options.host] - API服务器地址
 * @param {string} [options.token] - 自定义认证令牌
 * @returns {Promise<{code: number, msg: string, data: Object}>}
 */
const sendBookmarkRequest = async (endpoint, data, options = {}) => {
  try {
    // 使用新的工具函数
    const apiUrl = getSiyuanApiUrl(`/api/bookmark/${endpoint}`, options.host);
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
    return handleSiyuanApiError(err, `书签 ${endpoint} 操作`); // 使用新的错误处理
  }
};

/**
 * 获取书签列表
 * @param {Object} [options] - 可选配置
 * @param {string} [options.host] - API服务器地址
 * @param {string} [options.token] - 自定义认证令牌
 * @returns {Promise<{
 *   code: number,
 *   msg: string,
 *   data: Array<{
 *     id: string,
 *     title: string,
 *     url: string,
 *     icon: string,
 *     created: string,
 *     updated: string
 *   }>
 * }>}
 */
export const getBookmarks = (options = {}) => {
  return sendBookmarkRequest('getBookmark', {}, options);
};

/**
 * 删除书签
 * @param {string} bookmark - 书签名称
 * @param {Object} [options] - 可选配置
 * @param {string} [options.host] - API服务器地址
 * @param {string} [options.token] - 自定义认证令牌
 * @returns {Promise<{
 *   code: number,
 *   msg: string,
 *   data: {closeTimeout?: number}
 * }>}
 */
export const removeBookmark = (bookmark, options = {}) => {
  if (!bookmark) {
    return Promise.resolve({
      code: -1,
      msg: '书签名称不能为空',
      data: { closeTimeout: 5000 }
    });
  }
  return sendBookmarkRequest('removeBookmark', { bookmark }, options);
};

/**
 * 重命名书签
 * @param {Object} params - 重命名选项
 * @param {string} params.oldBookmark - 原书签名称
 * @param {string} params.newBookmark - 新书签名称
 * @param {Object} [options] - 可选配置
 * @param {string} [options.host] - API服务器地址
 * @param {string} [options.token] - 自定义认证令牌
 * @returns {Promise<{
 *   code: number,
 *   msg: string,
 *   data: {closeTimeout?: number}
 * }>}
 */
export const renameBookmark = (params, options = {}) => {
  const { oldBookmark, newBookmark } = params;
  if (!oldBookmark || !newBookmark) {
    return Promise.resolve({
      code: -1,
      msg: '原书签名称和新书签名称不能为空',
      data: { closeTimeout: 5000 }
    });
  }
  return sendBookmarkRequest('renameBookmark', { oldBookmark, newBookmark }, options);
};

/**
 * 添加书签
 * @param {Object} params - 书签选项
 * @param {string} params.bookmark - 书签名称
 * @param {string} params.url - 书签URL
 * @param {string} [params.icon] - 书签图标
 * @param {Object} [options] - 可选配置
 * @param {string} [options.host] - API服务器地址
 * @param {string} [options.token] - 自定义认证令牌
 * @returns {Promise<{
 *   code: number,
 *   msg: string,
 *   data: {closeTimeout?: number}
 * }>}
 */
export const addBookmark = (params, options = {}) => {
  const { bookmark, url, icon } = params;
  if (!bookmark || !url) {
    return Promise.resolve({
      code: -1,
      msg: '书签名称和URL不能为空',
      data: { closeTimeout: 5000 }
    });
  }
  return sendBookmarkRequest('addBookmark', { bookmark, url, icon }, options);
}; 