/**
 * @fileoverview 封装思源笔记格式化 (Format) 相关 Kernel API。
 * @module toolBox/useAge/forSiyuan/kernelApi/format
 */
// import { getApiUrl, handleApiError } from './utils/apiConfig'; // 旧导入
// import { fetchWithTimeout, getAuthHeaders } from './utils/fetchUtils'; // 旧导入
import { getSiyuanApiUrl, handleSiyuanApiError } from '../../apiUtils.js';
import { forFetchWithTimeout } from '../../../base/forNetwork/forFetch/forFetchHelpers.js';
import { createAuthHeaders } from '../../../base/forNetwork/forAuthHeaders.js';

/**
 * 发送格式化相关请求的通用方法
 * @private
 * @param {string} endpoint - API 端点
 * @param {Object} data - 请求数据
 * @param {Object} [options] - 可选配置
 * @param {string} [options.host] - API服务器地址
 * @param {string} [options.token] - 自定义认证令牌
 * @returns {Promise<{code: number, msg: string, data: Object}>}
 */
const sendFormatRequest = async (endpoint, data, options = {}) => {
  try {
    // 使用新的工具函数
    const apiUrl = getSiyuanApiUrl(`/api/format/${endpoint}`, options.host);
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
    return handleSiyuanApiError(err, `格式化 ${endpoint} 操作`); // 使用新的错误处理
  }
};

/**
 * 网络资源转换为本地资源
 * @param {Object} params - 转换选项
 * @param {string} params.id - 块ID
 * @param {Object} [options] - 可选配置
 * @param {string} [options.host] - API服务器地址
 * @param {string} [options.token] - 自定义认证令牌
 * @returns {Promise<{code: number, msg: string, data: {closeTimeout: number}}>}
 */
export const netAssets2LocalAssets = (params, options = {}) => {
  const { id } = params;
  if (!id) {
    return Promise.resolve({
      code: -1,
      msg: '块ID不能为空',
      data: null
    });
  }
  return sendFormatRequest('netAssets2LocalAssets', params, options);
};

/**
 * 网络图片转换为本地资源
 * @param {Object} params - 转换选项
 * @param {string} params.id - 块ID
 * @param {string} [params.url] - 图片URL
 * @param {Object} [options] - 可选配置
 * @param {string} [options.host] - API服务器地址
 * @param {string} [options.token] - 自定义认证令牌
 * @returns {Promise<{code: number, msg: string, data: {closeTimeout: number}}>}
 */
export const netImg2LocalAssets = (params, options = {}) => {
  const { id } = params;
  if (!id) {
    return Promise.resolve({
      code: -1,
      msg: '块ID不能为空',
      data: null
    });
  }
  return sendFormatRequest('netImg2LocalAssets', params, options);
};

/**
 * 自动空格
 * @param {string} id - 块ID
 * @param {Object} [options] - 可选配置
 * @param {string} [options.host] - API服务器地址
 * @param {string} [options.token] - 自定义认证令牌
 * @returns {Promise<{code: number, msg: string, data: {closeTimeout: number}}>}
 */
export const autoSpace = (id, options = {}) => {
  if (!id) {
    return Promise.resolve({
      code: -1,
      msg: '块ID不能为空',
      data: null
    });
  }
  return sendFormatRequest('autoSpace', { id }, options);
};

// 使用示例：
/*
// 网络资源转本地
await netAssets2LocalAssets({
  id: '20210808180117-6v0mkxr'
});

// 网络图片转本地
await netImg2LocalAssets({
  id: '20210808180117-6v0mkxr',
  url: 'https://example.com/image.png'
});

// 自动空格
await autoSpace('20210808180117-6v0mkxr');
*/ 