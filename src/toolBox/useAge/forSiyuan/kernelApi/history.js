/**
 * @fileoverview 封装思源笔记历史记录 (History) 相关 Kernel API。
 * @module toolBox/useAge/forSiyuan/kernelApi/history
 */
// import { getApiUrl, handleApiError } from './utils/apiConfig'; // 旧导入
// import { fetchWithTimeout, getAuthHeaders } from './utils/fetchUtils'; // 旧导入
import { getSiyuanApiUrl, handleSiyuanApiError } from '../../apiUtils.js';
import { forFetchWithTimeout } from '../../../base/forNetwork/forFetch/forFetchHelpers.js';
import { createAuthHeaders } from '../../../base/forNetwork/forAuthHeaders.js';

/**
 * 发送历史记录相关请求的通用方法
 * @private
 * @param {string} endpoint - API 端点
 * @param {Object} data - 请求数据
 * @param {Object} [options] - 可选配置
 * @param {string} [options.host] - API服务器地址
 * @param {string} [options.token] - 自定义认证令牌
 * @returns {Promise<{
 *   code: number,  // 0表示成功，其他值表示失败
 *   msg: string,   // 返回消息
 *   data: Object   // 返回数据
 * }>}
 */
const sendHistoryRequest = async (endpoint, data, options = {}) => {
  try {
    // 使用新的工具函数
    const apiUrl = getSiyuanApiUrl(`/api/history/${endpoint}`, options.host);
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
    return handleSiyuanApiError(err, `历史记录 ${endpoint} 操作`); // 使用新的错误处理
  }
};

/**
 * 搜索历史记录
 * @param {Object} params - 搜索选项
 * @param {string} params.query - 搜索关键词
 * @param {string} [params.notebook] - 笔记本ID
 * @param {number} [params.type=0] - 历史类型(0:文档)
 * @param {number} [params.page=1] - 页码
 * @param {string} [params.op='all'] - 操作类型
 * @param {Object} [options] - 可选配置
 * @param {string} [options.host] - API服务器地址
 * @param {string} [options.token] - 自定义认证令牌
 * @returns {Promise<{
 *   code: number,
 *   msg: string,
 *   data: {
 *     histories: Array<{
 *       path: string,     // 历史文件路径
 *       title: string,    // 文档标题
 *       op: string,       // 操作类型
 *       created: string   // 创建时间
 *     }>,
 *     pageCount: number,  // 总页数
 *     totalCount: number  // 总记录数
 *   }
 * }>}
 */
export const searchHistory = (params, options = {}) => {
  const { query, notebook, type = 0, page = 1, op = 'all' } = params;
  if (!query) {
    return Promise.resolve({
      code: -1,
      msg: '搜索关键词不能为空',
      data: null
    });
  }
  return sendHistoryRequest('searchHistory', { query, notebook, type, page, op }, options);
};

/**
 * 获取历史条目
 * @param {Object} params - 查询选项
 * @param {string} params.created - 创建时间
 * @param {string} params.query - 搜索关键词
 * @param {string} [params.notebook] - 笔记本ID
 * @param {string} [params.op='all'] - 操作类型
 * @param {number} [params.type=0] - 历史类型(0:文档)
 * @param {Object} [options] - 可选配置
 * @param {string} [options.host] - API服务器地址
 * @param {string} [options.token] - 自定义认证令牌
 * @returns {Promise<{
 *   code: number,
 *   msg: string,
 *   data: {
 *     items: Array<{
 *       path: string,     // 历史文件路径
 *       title: string,    // 文档标题
 *       op: string,       // 操作类型
 *       created: string   // 创建时间
 *     }>
 *   }
 * }>}
 */
export const getHistoryItems = (params, options = {}) => {
  const { created, query, notebook, op = 'all', type = 0 } = params;
  if (!created || !query) {
    return Promise.resolve({
      code: -1,
      msg: '创建时间和搜索关键词不能为空',
      data: null
    });
  }
  return sendHistoryRequest('getHistoryItems', { created, query, notebook, op, type }, options);
};

/**
 * 获取文档历史内容
 * @param {Object} params - 查询选项
 * @param {string} params.historyPath - 历史文件路径
 * @param {string} [params.k] - 搜索关键词
 * @param {boolean} [params.highlight=true] - 是否高亮
 * @param {Object} [options] - 可选配置
 * @param {string} [options.host] - API服务器地址
 * @param {string} [options.token] - 自定义认证令牌
 * @returns {Promise<{
 *   code: number,
 *   msg: string,
 *   data: {
 *     id: string,         // 文档ID
 *     rootID: string,     // 根文档ID
 *     content: string,    // 文档内容
 *     isLargeDoc: boolean // 是否为大文档
 *   }
 * }>}
 */
export const getDocHistoryContent = (params, options = {}) => {
  const { historyPath, k, highlight = true } = params;
  if (!historyPath) {
    return Promise.resolve({
      code: -1,
      msg: '历史文件路径不能为空',
      data: null
    });
  }
  return sendHistoryRequest('getDocHistoryContent', { historyPath, k, highlight }, options);
};

/**
 * 重建历史索引
 * @param {Object} [options] - 可选配置
 * @param {string} [options.host] - API服务器地址
 * @param {string} [options.token] - 自定义认证令牌
 * @returns {Promise<{code: number, msg: string, data: null}>}
 */
export const reindexHistory = (options = {}) => {
  return sendHistoryRequest('reindexHistory', {}, options);
};

/**
 * 获取笔记本历史
 * @param {Object} [options] - 可选配置
 * @param {string} [options.host] - API服务器地址
 * @param {string} [options.token] - 自定义认证令牌
 * @returns {Promise<{
 *   code: number,
 *   msg: string,
 *   data: {
 *     histories: Array<{
 *       path: string,     // 历史文件路径
 *       title: string,    // 笔记本名称
 *       op: string,       // 操作类型
 *       created: string   // 创建时间
 *     }>
 *   }
 * }>}
 */
export const getNotebookHistory = (options = {}) => {
  return sendHistoryRequest('getNotebookHistory', {}, options);
};

/**
 * 清空工作空间历史
 * @param {Object} [options] - 可选配置
 * @param {string} [options.host] - API服务器地址
 * @param {string} [options.token] - 自定义认证令牌
 * @returns {Promise<{code: number, msg: string, data: null}>}
 */
export const clearWorkspaceHistory = (options = {}) => {
  return sendHistoryRequest('clearWorkspaceHistory', {}, options);
};

/**
 * 回滚文档历史
 * @param {Object} params - 回滚选项
 * @param {string} params.notebook - 笔记本ID
 * @param {string} params.historyPath - 历史文件路径
 * @param {Object} [options] - 可选配置
 * @param {string} [options.host] - API服务器地址
 * @param {string} [options.token] - 自定义认证令牌
 * @returns {Promise<{
 *   code: number,
 *   msg: string,
 *   data: {
 *     box: string  // 笔记本ID
 *   }
 * }>}
 */
export const rollbackDocHistory = (params, options = {}) => {
  return sendHistoryRequest('rollbackDocHistory', params, options);
};

/**
 * 回滚资源文件历史
 * @param {Object} params - 回滚选项
 * @param {string} params.historyPath - 历史文件路径
 * @param {Object} [options] - 可选配置
 * @param {string} [options.host] - API服务器地址
 * @param {string} [options.token] - 自定义认证令牌
 * @returns {Promise<{code: number, msg: string, data: null}>}
 */
export const rollbackAssetsHistory = (params, options = {}) => {
  return sendHistoryRequest('rollbackAssetsHistory', { historyPath: params.historyPath }, options);
};

/**
 * 回滚笔记本历史
 * @param {Object} params - 回滚选项
 * @param {string} params.historyPath - 历史文件路径
 * @param {Object} [options] - 可选配置
 * @param {string} [options.host] - API服务器地址
 * @param {string} [options.token] - 自定义认证令牌
 * @returns {Promise<{code: number, msg: string, data: null}>}
 */
export const rollbackNotebookHistory = (params, options = {}) => {
  return sendHistoryRequest('rollbackNotebookHistory', { historyPath: params.historyPath }, options);
};

// 使用示例：
/*
// 搜索历史记录
const searchResult = await searchHistory({
  query: '关键词',
  notebook: '20210808180117-6v0mkxr',
  page: 1
});

// 获取历史条目
const historyItems = await getHistoryItems({
  created: '20210808180117',
  query: '关键词'
});

// 获取文档历史内容
const historyContent = await getDocHistoryContent({
  historyPath: '/data/history/20210808180117.sy',
  highlight: true
});

// 回滚文档历史
await rollbackDocHistory({
  notebook: '20210808180117-6v0mkxr',
  historyPath: '/data/history/20210808180117.sy'
});
*/ 