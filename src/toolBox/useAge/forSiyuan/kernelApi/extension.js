/**
 * @fileoverview 封装思源笔记扩展 (Extension) 相关 Kernel API，主要用于处理复制操作。
 * @module toolBox/useAge/forSiyuan/kernelApi/extension
 */
// import { getApiUrl, handleApiError } from './utils/apiConfig'; // 旧导入
// import { fetchWithTimeout, getAuthHeaders } from './utils/fetchUtils'; // 旧导入
import { getSiyuanApiUrl, handleSiyuanApiError } from '../../apiUtils.js';
import { forFetchWithTimeout } from '../../../base/forNetwork/forFetch/forFetchHelpers.js';
import { createAuthHeaders } from '../../../base/forNetwork/forAuthHeaders.js';

/**
 * 发送扩展相关请求的通用方法
 * @private
 * @param {string} endpoint - API 端点
 * @param {Object|FormData} data - 请求数据
 * @param {boolean} [isFormData=false] - 是否为FormData格式
 * @param {Object} [options] - 可选配置
 * @param {string} [options.host] - API服务器地址
 * @param {string} [options.token] - 自定义认证令牌
 * @returns {Promise<{code: number, msg: string, data: Object}>}
 */
const sendExtensionRequest = async (endpoint, data, isFormData = false, options = {}) => {
  try {
    // 使用新的工具函数
    const apiUrl = getSiyuanApiUrl(`/api/extension/${endpoint}`, options.host);
    const token = options.token || localStorage.getItem('token');
    // 对于 FormData，不需要 Content-Type，浏览器会自动设置，但仍需认证头
    const headers = createAuthHeaders({ token: token, scheme: 'Token', contentType: isFormData ? undefined : 'application/json' });

    const response = await forFetchWithTimeout(apiUrl, { // 使用 forFetchWithTimeout
      method: 'POST',
      headers: headers,
      body: isFormData ? data : JSON.stringify(data)
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
    return handleSiyuanApiError(err, `扩展 ${endpoint} 操作`); // 使用新的错误处理
  }
};

/**
 * 复制扩展内容
 * @param {Object} params - 复制选项
 * @param {string} params.dom - HTML内容
 * @param {string} [params.notebook] - 笔记本ID
 * @param {string} [params.href] - 链接地址
 * @param {File[]} [params.files] - 文件列表
 * @param {Object} [options] - API可选配置
 * @param {string} [options.host] - API服务器地址
 * @param {string} [options.token] - 自定义认证令牌
 * @returns {Promise<{
 *   code: number,
 *   msg: string,
 *   data: {
 *     md: string,
 *     withMath: boolean,
 *     isLiandi?: boolean
 *   }
 * }>}
 */
export const extensionCopy = async (params, options = {}) => {
  const { dom, notebook, href, files } = params;
  
  if (!dom) {
    return Promise.resolve({
      code: -1,
      msg: 'HTML内容不能为空',
      data: null
    });
  }

  const formData = new FormData();
  formData.append('dom', dom);
  
  if (notebook) {
    formData.append('notebook', notebook);
  }
  
  if (href) {
    formData.append('href', href);
  }
  
  if (files?.length > 0) {
    for (const file of files) {
      try {
        const fileName = encodeURIComponent(file.name);
        formData.append(fileName, file);
      } catch (err) {
        console.warn(`文件 [${file.name}] 编码失败:`, err);
        continue;
      }
    }
  }

  const result = await sendExtensionRequest('copy', formData, true, options);
  
  // 处理链滴文章特殊情况
  if (href && (href.startsWith('https://ld246.com/article/') || 
      href.startsWith('https://liuyun.io/article/'))) {
    result.data = {
      ...result.data,
      isLiandi: true
    };
  }

  return result;
};

/**
 * 处理扩展资源文件
 * @param {string} fileName - 文件名
 * @param {ArrayBuffer} fileData - 文件数据
 * @param {Object} [options] - API可选配置
 * @param {string} [options.host] - API服务器地址
 * @param {string} [options.token] - 自定义认证令牌
 * @returns {string} 处理后的文件名
 */
const handleExtensionAsset = (fileName, fileData, options = {}) => {
  let ext = fileName.split('.').pop()?.toLowerCase();
  
  // 处理没有扩展名的情况
  if (!ext || ext.includes('!')) {
    const buffer = new Uint8Array(fileData);
    // 检测 SVG
    if (buffer.indexOf('<svg ') === 0 && 
        buffer.indexOf('</svg>') === buffer.length - 6) {
      ext = 'svg';
      fileName += '.svg';
    }
    // 其他类型需要后端 mimetype 检测
  }
  
  return fileName;
}; 