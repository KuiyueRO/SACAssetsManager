/**
 * @fileoverview 封装思源笔记图谱 (Graph) 相关 Kernel API。
 * @module toolBox/useAge/forSiyuan/kernelApi/graph
 */
// import { getApiUrl, handleApiError } from './utils/apiConfig'; // 旧导入
// import { fetchWithTimeout, getAuthHeaders } from './utils/fetchUtils'; // 旧导入
import { getSiyuanApiUrl, handleSiyuanApiError } from '../../apiUtils.js';
import { forFetchWithTimeout } from '../../../base/forNetwork/forFetch/forFetchHelpers.js';
import { createAuthHeaders } from '../../../base/forNetwork/forAuthHeaders.js';

/**
 * 发送图谱相关请求的通用方法
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
const sendGraphRequest = async (endpoint, data, options = {}) => {
  try {
    // 使用新的工具函数
    const apiUrl = getSiyuanApiUrl(`/api/graph/${endpoint}`, options.host);
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
    return handleSiyuanApiError(err, `图谱 ${endpoint} 操作`); // 使用新的错误处理
  }
};

/**
 * 重置全局图谱配置
 * @param {Object} [options] - 可选配置
 * @param {string} [options.host] - API服务器地址
 * @param {string} [options.token] - 自定义认证令牌
 * @returns {Promise<{
 *   code: number,  // 0表示成功，其他值表示失败
 *   msg: string,   // 返回消息
 *   data: null     // 无返回数据
 * }>}
 */
export const resetGraph = (options = {}) => {
  return sendGraphRequest('resetGraph', {}, options);
};

/**
 * 重置局部图谱配置
 * @param {Object} [options] - 可选配置
 * @param {string} [options.host] - API服务器地址
 * @param {string} [options.token] - 自定义认证令牌
 * @returns {Promise<{
 *   code: number,  // 0表示成功，其他值表示失败
 *   msg: string,   // 返回消息
 *   data: null     // 无返回数据
 * }>}
 */
export const resetLocalGraph = (options = {}) => {
  return sendGraphRequest('resetLocalGraph', {}, options);
};

/**
 * 获取全局图谱数据
 * @param {Object} params - 查询选项
 * @param {string} [params.k=''] - 搜索关键词
 * @param {Object} params.conf - 图谱配置
 * @param {string} [params.reqId] - 请求ID，用于追踪请求
 * @param {Object} [options] - 可选配置
 * @param {string} [options.host] - API服务器地址
 * @param {string} [options.token] - 自定义认证令牌
 * @returns {Promise<{
 *   code: number,  // 0表示成功，其他值表示失败
 *   msg: string,   // 返回消息
 *   data: {
 *     nodes: Array<{
 *       id: string,      // 节点ID
 *       box: string,     // 笔记本ID
 *       path: string,    // 文档路径
 *       size: number,    // 节点大小
 *       title: string,   // 节点标题
 *       type: string     // 节点类型
 *     }>,
 *     links: Array<{
 *       source: string,  // 源节点ID
 *       target: string,  // 目标节点ID
 *       value: number    // 连接权重
 *     }>
 *   }
 * }>}
 */
export const getGraph = (params, options = {}) => {
  const { k = '', conf, reqId } = params;
  if (!conf) {
    return Promise.resolve({
      code: -1,
      msg: '图谱配置不能为空',
      data: null
    });
  }
  return sendGraphRequest('getGraph', { k, conf, reqId }, options);
};

/**
 * 获取局部图谱数据
 * @param {Object} params - 查询选项
 * @param {string} params.id - 文档ID
 * @param {string} [params.k=''] - 搜索关键词
 * @param {Object} params.conf - 图谱配置
 * @param {string} [params.reqId] - 请求ID，用于追踪请求
 * @param {Object} [options] - 可选配置
 * @param {string} [options.host] - API服务器地址
 * @param {string} [options.token] - 自定义认证令牌
 * @returns {Promise<{
 *   code: number,  // 0表示成功，其他值表示失败
 *   msg: string,   // 返回消息
 *   data: {
 *     nodes: Array<{
 *       id: string,      // 节点ID
 *       box: string,     // 笔记本ID
 *       path: string,    // 文档路径
 *       size: number,    // 节点大小
 *       title: string,   // 节点标题
 *       type: string     // 节点类型
 *     }>,
 *     links: Array<{
 *       source: string,  // 源节点ID
 *       target: string,  // 目标节点ID
 *       value: number    // 连接权重
 *     }>
 *   }
 * }>}
 */
export const getLocalGraph = (params, options = {}) => {
  const { id, k = '', conf, reqId } = params;
  if (!id || !conf) {
    return Promise.resolve({
      code: -1,
      msg: '文档ID和图谱配置不能为空',
      data: null
    });
  }
  return sendGraphRequest('getLocalGraph', { id, k, conf, reqId }, options);
};

// 使用示例：
/*
// 重置全局图谱配置
await resetGraph();

// 重置局部图谱配置
await resetLocalGraph();

// 获取全局图谱数据
const globalGraph = await getGraph({
  k: '搜索关键词',
  conf: {
    // 图谱配置项
  },
  reqId: 'request-123'
});

// 获取局部图谱数据
const localGraph = await getLocalGraph({
  id: '20210808180117-6v0mkxr',
  k: '搜索关键词',
  conf: {
    // 图谱配置项
  },
  reqId: 'request-123'
});
*/ 