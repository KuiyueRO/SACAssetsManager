import { getSiyuanApiUrl, handleSiyuanApiError } from '../../apiUtils.js';
import { forFetchWithTimeout } from '../../../base/forNetwork/forFetch/forFetchHelpers.js';
import { createAuthHeaders } from '../../../base/forNetwork/forAuthHeaders.js';

/**
 * 发送事务相关请求的通用方法
 * @private
 * @param {string} endpoint - API 端点
 * @param {Object} data - 请求数据
 * @param {Object} [options] - 可选配置
 * @param {string} [options.host] - API服务器地址
 * @param {string} [options.token] - 自定义认证令牌
 * @returns {Promise<{code: number, msg: string, data: Object}>}
 */
const sendTransactionRequest = async (endpoint, data, options = {}) => {
  try {
    // 使用新的工具函数
    const apiUrl = getSiyuanApiUrl(`/api/transaction/${endpoint}`, options.host);
    const token = options.token || localStorage.getItem('token');
    const headers = createAuthHeaders({ token: token, scheme: 'Token' });
    headers['Content-Type'] = 'application/json'; // 保留 Content-Type

    const response = await forFetchWithTimeout(apiUrl, { // 使用 forFetchWithTimeout
      method: 'POST',
      headers: headers,
      body: JSON.stringify(data)
    });
    
    // 获取服务器处理时间
    const serverTiming = response.headers.get('Server-Timing');
    if (serverTiming) {
      console.debug(`Transaction timing: ${serverTiming}`);
    }
    
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
    return handleSiyuanApiError(err, `事务 ${endpoint} 操作`); // 使用新的错误处理
  }
};

/**
 * 执行事务操作
 * @param {Object} params - 事务选项
 * @param {Array<{
 *   doOperations: Array<{
 *     action: string,
 *     data: Object,
 *     id?: string,
 *     retData?: any
 *   }>,
 *   undoOperations: Array<{
 *     action: string,
 *     data: Object,
 *     id?: string,
 *     retData?: any
 *   }>,
 *   timestamp?: number
 * }>} params.transactions - 事务列表
 * @param {string} params.app - 应用标识
 * @param {string} params.session - 会话标识
 * @param {number} params.reqId - 请求ID(时间戳)
 * @param {Object} [options] - 可选配置
 * @param {string} [options.host] - API服务器地址
 * @param {string} [options.token] - 自定义认证令牌
 * @returns {Promise<{code: number, msg: string, data: Array<Object>}>}
 */
export const performTransactions = (params, options = {}) => {
  const { transactions, app, session, reqId } = params;

  // 参数验证
  if (!Array.isArray(transactions) || transactions.length === 0) {
    return Promise.resolve({
      code: -1,
      msg: '事务列表不能为空',
      data: null
    });
  }

  if (!app || !session) {
    return Promise.resolve({
      code: -1,
      msg: '应用标识和会话标识不能为空',
      data: null
    });
  }

  // 验证每个事务的必要字段
  for (const transaction of transactions) {
    if (!Array.isArray(transaction.doOperations) || 
        !Array.isArray(transaction.undoOperations)) {
      return Promise.resolve({
        code: -1,
        msg: '事务操作必须包含 doOperations 和 undoOperations 数组',
        data: null
      });
    }

    // 验证操作的必要字段
    for (const op of [...transaction.doOperations, ...transaction.undoOperations]) {
      if (!op.action || !op.data) {
        return Promise.resolve({
          code: -1,
          msg: '操作必须包含 action 和 data 字段',
          data: null
        });
      }
    }
  }

  // 设置时间戳
  transactions.forEach(tx => {
    tx.timestamp = reqId || Date.now();
  });

  return sendTransactionRequest('performTransactions', {
    transactions,
    app,
    session,
    reqId: reqId || Date.now()
  }, options);
};

/**
 * 刷新事务
 * @param {Object} [options] - 可选配置
 * @param {string} [options.host] - API服务器地址
 * @param {string} [options.token] - 自定义认证令牌
 * @returns {Promise<{code: number, msg: string, data: null}>}
 */
export const flushTransaction = (options = {}) => {
  return sendTransactionRequest('flushTransaction', {}, options);
};

/**
 * 获取标题层级变更事务
 * @param {Object} params - 事务选项
 * @param {string} params.id - 块ID
 * @param {number} params.level - 目标层级
 * @param {Object} [options] - 可选配置
 * @param {string} [options.host] - API服务器地址
 * @param {string} [options.token] - 自定义认证令牌
 * @returns {Promise<{
 *   code: number,
 *   msg: string,
 *   data: Array<{
 *     doOperations: Array<Object>,
 *     undoOperations: Array<Object>
 *   }>
 * }>}
 */
export const getHeadingLevelTransaction = (params, options = {}) => {
  const { id, level } = params;

  if (!id || !/^[\w\-]+$/.test(id)) {
    return Promise.resolve({
      code: -1,
      msg: '无效的块ID',
      data: null
    });
  }

  if (typeof level !== 'number' || level < 1 || level > 6) {
    return Promise.resolve({
      code: -1,
      msg: '无效的标题层级',
      data: null
    });
  }

  return sendTransactionRequest('getHeadingLevelTransaction', { id, level }, options);
};

/**
 * 获取标题删除事务
 * @param {Object} params - 事务选项
 * @param {string} params.id - 块ID
 * @param {Object} [options] - 可选配置
 * @param {string} [options.host] - API服务器地址
 * @param {string} [options.token] - 自定义认证令牌
 * @returns {Promise<{
 *   code: number,
 *   msg: string,
 *   data: Array<{
 *     doOperations: Array<Object>,
 *     undoOperations: Array<Object>
 *   }>
 * }>}
 */
export const getHeadingDeleteTransaction = (params, options = {}) => {
  const { id } = params;

  if (!id || !/^[\w\-]+$/.test(id)) {
    return Promise.resolve({
      code: -1,
      msg: '无效的块ID',
      data: null
    });
  }

  return sendTransactionRequest('getHeadingDeleteTransaction', { id }, options);
};

// 使用示例：
/*
// 执行事务
const result = await performTransactions({
  transactions: [{
    doOperations: [{
      action: 'insert',
      data: { content: '新内容' },
      id: '20210808180117-6v0mkxr'
    }],
    undoOperations: [{
      action: 'delete',
      data: { id: '20210808180117-6v0mkxr' }
    }],
    timestamp: Date.now()
  }],
  app: 'editor',
  session: 'session123',
  reqId: Date.now()
});
*/ 