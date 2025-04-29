/**
 * @fileoverview 封装思源笔记导出 (Export) 相关 Kernel API。
 * @module toolBox/useAge/forSiyuan/kernelApi/export
 */
// import { getApiUrl, handleApiError } from './utils/apiConfig'; // 旧导入
// import { fetchWithTimeout, getAuthHeaders } from './utils/fetchUtils'; // 旧导入
import { getSiyuanApiUrl, handleSiyuanApiError } from '../../apiUtils.js';
import { forFetchWithTimeout } from '../../../base/forNetwork/forFetch/forFetchHelpers.js';
import { createAuthHeaders } from '../../../base/forNetwork/forAuthHeaders.js';

/**
 * 发送导出相关请求的通用方法
 * @private
 * @param {string} endpoint - API 端点
 * @param {Object} data - 请求数据
 * @param {Object} [options] - 可选配置
 * @param {string} [options.host] - API服务器地址
 * @param {string} [options.token] - 自定义认证令牌
 * @returns {Promise<{code: number, msg: string, data: Object}>}
 */
const sendExportRequest = async (endpoint, data, options = {}) => {
  try {
    // 使用新的工具函数
    const apiUrl = getSiyuanApiUrl(`/api/export/${endpoint}`, options.host);
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
    return handleSiyuanApiError(err, `导出 ${endpoint} 操作`); // 使用新的错误处理
  }
};

/**
 * 导出模板
 * @param {Object} params - 导出选项
 * @param {string} params.id - 文档ID
 * @param {string} params.name - 模板名称
 * @param {string} [params.title] - 标题
 * @param {string} [params.icon] - 图标
 * @param {Object} [options] - API可选配置
 * @param {string} [options.host] - API服务器地址
 * @param {string} [options.token] - 自定义认证令牌
 * @returns {Promise<{code: number, msg: string, data: null}>}
 */
export const exportTemplate = (params, options = {}) => {
  const { id, name, title, icon } = params;
  if (!id || !name) {
    return Promise.resolve({
      code: -1,
      msg: '文档ID和模板名称不能为空',
      data: null
    });
  }
  return sendExportRequest('exportTemplate', { id, name, title, icon }, options);
};

/**
 * 导出为Markdown
 * @param {Object} params - 导出选项
 * @param {string} params.id - 文档ID
 * @param {string} [params.path] - 保存路径
 * @param {Object} [options] - API可选配置
 * @param {string} [options.host] - API服务器地址
 * @param {string} [options.token] - 自定义认证令牌
 * @returns {Promise<{code: number, msg: string, data: {name: string, content: string}}>}
 */
export const exportMarkdown = (params, options = {}) => {
  const { id, path } = params;
  if (!id) {
    return Promise.resolve({
      code: -1,
      msg: '文档ID不能为空',
      data: null
    });
  }
  return sendExportRequest('exportMd', { id, path }, options);
};

/**
 * 导出为PDF
 * @param {Object} params - 导出选项
 * @param {string} params.id - 文档ID
 * @param {string} [params.path] - 保存路径
 * @param {boolean} [params.removeAssets=false] - 是否移除资源文件
 * @param {string} [params.pageSize='A4'] - 页面大小
 * @param {Object} [options] - API可选配置
 * @param {string} [options.host] - API服务器地址
 * @param {string} [options.token] - 自定义认证令牌
 * @returns {Promise<{code: number, msg: string, data: {pdf: string}}>}
 */
export const exportPDF = (params, options = {}) => {
  const { id, path, removeAssets = false, pageSize = 'A4' } = params;
  if (!id) {
    return Promise.resolve({
      code: -1,
      msg: '文档ID不能为空',
      data: null
    });
  }
  return sendExportRequest('exportPDF', { id, path, removeAssets, pageSize }, options);
};

/**
 * 导出为Word文档
 * @param {Object} params - 导出选项
 * @param {string} params.id - 文档ID
 * @param {string} [params.path] - 保存路径
 * @param {boolean} [params.removeAssets=false] - 是否移除资源文件
 * @param {Object} [options] - API可选配置
 * @param {string} [options.host] - API服务器地址
 * @param {string} [options.token] - 自定义认证令牌
 * @returns {Promise<{code: number, msg: string, data: {docx: string}}>}
 */
export const exportDocx = (params, options = {}) => {
  const { id, path, removeAssets = false } = params;
  if (!id) {
    return Promise.resolve({
      code: -1,
      msg: '文档ID不能为空',
      data: null
    });
  }
  return sendExportRequest('exportDocx', { id, path, removeAssets }, options);
};

/**
 * 导出数据
 * @param {Object} [params] - 导出选项
 * @param {string} [params.path] - 保存路径
 * @param {Object} [options] - API可选配置
 * @param {string} [options.host] - API服务器地址
 * @param {string} [options.token] - 自定义认证令牌
 * @returns {Promise<{code: number, msg: string, data: {path: string}}>}
 */
export const exportData = (params = {}, options = {}) => {
  return sendExportRequest('exportData', params, options);
};

/**
 * 导出笔记本为Markdown
 * @param {Object} params - 导出选项
 * @param {string} params.id - 笔记本ID
 * @param {string} [params.path] - 保存路径
 * @param {Object} [options] - API可选配置
 * @param {string} [options.host] - API服务器地址
 * @param {string} [options.token] - 自定义认证令牌
 * @returns {Promise<{code: number, msg: string, data: Object}>}
 */
export const exportNotebookMd = (params, options = {}) => {
  const { id, path } = params;
  if (!id) {
    return Promise.resolve({
      code: -1,
      msg: '笔记本ID不能为空',
      data: null
    });
  }
  return sendExportRequest('exportNotebookMd', { id, path }, options);
};

/**
 * 导出为HTML
 * @param {Object} params - 导出选项
 * @param {string} params.id - 文档ID
 * @param {string} [params.path] - 保存路径
 * @param {boolean} [params.removeAssets=false] - 是否移除资源文件
 * @param {Object} [options] - API可选配置
 * @param {string} [options.host] - API服务器地址
 * @param {string} [options.token] - 自定义认证令牌
 * @returns {Promise<{code: number, msg: string, data: Object}>}
 */
export const exportHTML = (params, options = {}) => {
  const { id, path, removeAssets = false } = params;
  if (!id) {
    return Promise.resolve({
      code: -1,
      msg: '文档ID不能为空',
      data: null
    });
  }
  return sendExportRequest('exportHTML', { id, path, removeAssets }, options);
};

/**
 * 导出多个文档为Markdown
 * @param {Object} params - 导出选项
 * @param {string[]} params.ids - 文档ID列表
 * @param {string} [params.path] - 保存路径
 * @param {Object} [options] - API可选配置
 * @param {string} [options.host] - API服务器地址
 * @param {string} [options.token] - 自定义认证令牌
 * @returns {Promise<{code: number, msg: string, data: Object}>}
 */
export const exportMds = (params, options = {}) => {
  const { ids, path } = params;
  if (!ids?.length) {
    return Promise.resolve({
      code: -1,
      msg: '文档ID列表不能为空',
      data: null
    });
  }
  return sendExportRequest('exportMds', { ids, path }, options);
};

/**
 * 导出为思源格式
 * @param {Object} params - 导出选项
 * @param {string} params.id - 文档ID
 * @param {string} [params.path] - 保存路径
 * @param {Object} [options] - API可选配置
 * @param {string} [options.host] - API服务器地址
 * @param {string} [options.token] - 自定义认证令牌
 * @returns {Promise<{code: number, msg: string, data: Object}>}
 */
export const exportSY = (params, options = {}) => {
  const { id, path } = params;
  if (!id) {
    return Promise.resolve({
      code: -1,
      msg: '文档ID不能为空',
      data: null
    });
  }
  return sendExportRequest('exportSY', { id, path }, options);
};

/**
 * 导出笔记本为思源格式
 * @param {Object} params - 导出选项
 * @param {string} params.id - 笔记本ID
 * @param {string} [params.path] - 保存路径
 * @param {Object} [options] - API可选配置
 * @param {string} [options.host] - API服务器地址
 * @param {string} [options.token] - 自定义认证令牌
 * @returns {Promise<{code: number, msg: string, data: Object}>}
 */
export const exportNotebookSY = (params, options = {}) => {
  const { id, path } = params;
  if (!id) {
    return Promise.resolve({
      code: -1,
      msg: '笔记本ID不能为空',
      data: null
    });
  }
  return sendExportRequest('exportNotebookSY', { id, path }, options);
};

/**
 * 导出预览HTML
 * @param {Object} params - 导出选项
 * @param {string} params.id - 文档ID
 * @param {string} [params.path] - 保存路径
 * @param {Object} [options] - API可选配置
 * @param {string} [options.host] - API服务器地址
 * @param {string} [options.token] - 自定义认证令牌
 * @returns {Promise<{code: number, msg: string, data: Object}>}
 */
export const exportPreviewHTML = (params, options = {}) => {
  const { id, path } = params;
  if (!id) {
    return Promise.resolve({
      code: -1,
      msg: '文档ID不能为空',
      data: null
    });
  }
  return sendExportRequest('exportPreviewHTML', { id, path }, options);
};

/**
 * 导出为其他格式
 * @param {Object} params - 导出选项
 * @param {string} params.id - 文档ID
 * @param {string} [params.path] - 保存路径
 * @param {Object} [options] - API可选配置
 * @param {string} [options.host] - API服务器地址
 * @param {string} [options.token] - 自定义认证令牌
 * @returns {Promise<{code: number, msg: string, data: Object}>}
 */
export const exportReStructuredText = (params, options = {}) => {
  const { id, path } = params;
  if (!id) {
    return Promise.resolve({
      code: -1,
      msg: '文档ID不能为空',
      data: null
    });
  }
  return sendExportRequest('exportReStructuredText', { id, path }, options);
};

export const exportAsciiDoc = (params, options = {}) => {
  const { id, path } = params;
  if (!id) {
    return Promise.resolve({
      code: -1,
      msg: '文档ID不能为空',
      data: null
    });
  }
  return sendExportRequest('exportAsciiDoc', { id, path }, options);
};

export const exportTextile = (params, options = {}) => {
  const { id, path } = params;
  if (!id) {
    return Promise.resolve({
      code: -1,
      msg: '文档ID不能为空',
      data: null
    });
  }
  return sendExportRequest('exportTextile', { id, path }, options);
};

export const exportOPML = (params, options = {}) => {
  const { id, path } = params;
  if (!id) {
    return Promise.resolve({
      code: -1,
      msg: '文档ID不能为空',
      data: null
    });
  }
  return sendExportRequest('exportOPML', { id, path }, options);
}; 