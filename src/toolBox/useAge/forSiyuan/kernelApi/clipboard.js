/**
 * @fileoverview 封装思源笔记剪贴板 (Clipboard) 相关 Kernel API。
 * @module toolBox/useAge/forSiyuan/kernelApi/clipboard
 */
// import { getApiUrl, handleApiError } from './utils/apiConfig'; // 旧导入
// import { fetchWithTimeout, getAuthHeaders } from './utils/fetchUtils'; // 旧导入
import { getSiyuanApiUrl, handleSiyuanApiError } from '../../apiUtils.js';
import { forFetchWithTimeout } from '../../../base/forNetwork/forFetch/forFetchHelpers.js';
import { createAuthHeaders } from '../../../base/forNetwork/forAuthHeaders.js';

/**
 * 发送剪贴板相关请求的通用方法
 * @private
 * @param {string} endpoint - API 端点
 * @param {Object} data - 请求数据
 * @param {Object} [options] - 可选配置
 * @param {string} [options.host] - API服务器地址
 * @param {string} [options.token] - 自定义认证令牌
 * @returns {Promise<{code: number, msg: string, data: Object}>}
 */
const sendClipboardRequest = async (endpoint, data, options = {}) => {
  try {
    // 使用新的工具函数
    const apiUrl = getSiyuanApiUrl(`/api/clipboard/${endpoint}`, options.host);
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
    return handleSiyuanApiError(err, `剪贴板 ${endpoint} 操作`); // 使用新的错误处理
  }
};

/**
 * 获取剪贴板内容
 * @param {Object} [options] - 可选配置
 * @param {string} [options.host] - API服务器地址
 * @param {string} [options.token] - 自定义认证令牌
 * @returns {Promise<{
 *   code: number,
 *   msg: string,
 *   data: {
 *     text: string,
 *     html: string
 *   }
 * }>}
 */
export const getClipboard = (options = {}) => {
  return sendClipboardRequest('getClipboard', {}, options);
};

/**
 * 设置剪贴板内容
 * @param {Object} params - 剪贴板内容
 * @param {string} [params.text] - 纯文本内容
 * @param {string} [params.html] - HTML内容
 * @param {Object} [options] - 可选配置
 * @param {string} [options.host] - API服务器地址
 * @param {string} [options.token] - 自定义认证令牌
 * @returns {Promise<{code: number, msg: string, data: null}>}
 */
export const setClipboard = (params, options = {}) => {
  if (!params?.text && !params?.html) {
    return Promise.resolve({
      code: -1,
      msg: '剪贴板内容不能为空',
      data: null
    });
  }
  return sendClipboardRequest('setClipboard', params, options);
};

/**
 * 读取剪贴板中的文件路径
 * @param {Object} [options] - 可选配置
 * @param {string} [options.host] - API服务器地址
 * @param {string} [options.token] - 自定义认证令牌
 * @returns {Promise<{
 *   code: number,
 *   msg: string,
 *   data: string[]
 * }>}
 */
export const readFilePaths = (options = {}) => {
  return sendClipboardRequest('readFilePaths', {}, options);
};

/**
 * 添加块到剪贴板
 * @param {Object} params - 选项
 * @param {string} params.id - 块ID
 * @param {string} [params.format='text/html'] - 格式：'text/html' | 'text/plain'
 * @param {Object} [options] - 可选配置
 * @param {string} [options.host] - API服务器地址
 * @param {string} [options.token] - 自定义认证令牌
 * @returns {Promise<{code: number, msg: string, data: null}>}
 */
export const addBlockToClipboard = (params, options = {}) => {
  const { id, format = 'text/html' } = params;
  if (!id) {
    return Promise.resolve({
      code: -1,
      msg: '块ID不能为空',
      data: null
    });
  }
  if (format !== 'text/html' && format !== 'text/plain') {
    return Promise.resolve({
      code: -1,
      msg: '无效的格式',
      data: null
    });
  }
  return sendClipboardRequest('addBlockToClipboard', { id, format }, options);
};

// 使用示例：
/*
// 获取剪贴板内容
const clipboard = await getClipboard();
console.log('剪贴板文本:', clipboard.data.text);
console.log('剪贴板HTML:', clipboard.data.html);

// 设置剪贴板内容
await setClipboard({
  text: '纯文本内容',
  html: '<b>HTML内容</b>'
});

// 添加块到剪贴板
await addBlockToClipboard('20210808180117-6v0mkxr', 'text/html');
*/ 