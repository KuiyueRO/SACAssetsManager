/**
 * @fileoverview 封装思源笔记广播 (WebSocket) 相关 Kernel API。
 * @module toolBox/useAge/forSiyuan/kernelApi/broadcast
 */
// import { getApiUrl, handleApiError } from './utils/apiConfig'; // 旧导入
// import { fetchWithTimeout, getAuthHeaders } from './utils/fetchUtils'; // 旧导入
import { getSiyuanApiUrl, handleSiyuanApiError } from '../../apiUtils.js';
import { forFetchWithTimeout } from '../../../base/forNetwork/forFetch/forFetchHelpers.js';
import { createAuthHeaders } from '../../../base/forNetwork/forAuthHeaders.js';

/**
 * 发送广播相关请求的通用方法
 * @private
 * @param {string} endpoint - API 端点
 * @param {Object} data - 请求数据
 * @param {Object} [options] - 可选配置
 * @param {string} [options.host] - API服务器地址
 * @param {string} [options.token] - 自定义认证令牌
 * @returns {Promise<{code: number, msg: string, data: Object}>}
 */
const sendBroadcastRequest = async (endpoint, data, options = {}) => {
  try {
    // 使用新的工具函数
    const apiUrl = getSiyuanApiUrl(`/api/broadcast/${endpoint}`, options.host);
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
    return handleSiyuanApiError(err, `广播 ${endpoint} 操作`); // 使用新的错误处理
  }
};

/**
 * 创建WebSocket广播连接
 * @param {string} channel - 频道名称
 * @param {Object} [options] - 可选配置
 * @param {string} [options.host] - API服务器地址
 * @param {string} [options.token] - 自定义认证令牌
 * @returns {WebSocket} WebSocket连接实例
 */
export const createBroadcastConnection = (channel, options = {}) => {
  if (!channel) {
    throw new Error('频道名称不能为空');
  }
  // 使用新的 URL 构建函数
  const wsUrl = getSiyuanApiUrl(`/ws/broadcast?channel=${channel}`, options.host).replace('http', 'ws');
  const ws = new WebSocket(wsUrl);
  
  ws.onclose = (event) => {
    console.log(`频道 [${channel}] 连接关闭, 状态码: ${event.code}, 原因: ${event.reason}`);
  };
  
  ws.onerror = (error) => {
    console.error(`频道 [${channel}] 连接错误:`, error);
  };
  
  return ws;
};

/**
 * 发送消息到广播频道
 * @param {Object} params - 发送选项
 * @param {string} params.channel - 频道名称
 * @param {string} params.message - 消息内容
 * @param {Object} [options] - 可选配置
 * @param {string} [options.host] - API服务器地址
 * @param {string} [options.token] - 自定义认证令牌
 * @returns {Promise<{
 *   code: number,
 *   msg: string,
 *   data: {
 *     channel: {
 *       name: string,
 *       count: number
 *     }
 *   }
 * }>}
 */
export const postMessage = (params, options = {}) => {
  const { channel, message } = params;
  if (!channel || !message) {
    return Promise.resolve({
      code: -1,
      msg: '频道名称和消息内容不能为空',
      data: null
    });
  }
  return sendBroadcastRequest('postMessage', { channel, message }, options);
};

/**
 * 获取频道信息
 * @param {string} name - 频道名称
 * @param {Object} [options] - 可选配置
 * @param {string} [options.host] - API服务器地址
 * @param {string} [options.token] - 自定义认证令牌
 * @returns {Promise<{
 *   code: number,
 *   msg: string,
 *   data: {
 *     channel: {
 *       name: string,
 *       count: number
 *     }
 *   }
 * }>}
 */
export const getChannelInfo = (name, options = {}) => {
  if (!name) {
    return Promise.resolve({
      code: -1,
      msg: '频道名称不能为空',
      data: null
    });
  }
  return sendBroadcastRequest('getChannelInfo', { name }, options);
};

/**
 * 获取所有频道列表
 * @param {Object} [options] - 可选配置
 * @param {string} [options.host] - API服务器地址
 * @param {string} [options.token] - 自定义认证令牌
 * @returns {Promise<{
 *   code: number,
 *   msg: string,
 *   data: {
 *     channels: Array<{
 *       name: string,
 *       count: number
 *     }>
 *   }
 * }>}
 */
export const getChannels = (options = {}) => {
  return sendBroadcastRequest('getChannels', {}, options);
};

// 使用示例：
/*
// 创建WebSocket连接
const ws = createBroadcastConnection('test-channel');
ws.onmessage = (event) => {
  console.log('收到消息:', event.data);
};

// 发送消息
await postMessage({
  channel: 'test-channel',
  message: 'Hello World!'
});

// 获取频道信息
const channelInfo = await getChannelInfo('test-channel');

// 获取所有频道
const channels = await getChannels();
*/ 