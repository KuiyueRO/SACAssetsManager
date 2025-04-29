import { getSiyuanApiUrl, handleSiyuanApiError } from '../../apiUtils.js';
import { forFetchWithTimeout } from '../../../base/forNetwork/forFetch/forFetchHelpers.js';
import { createAuthHeaders } from '../../../base/forNetwork/forAuthHeaders.js';

/**
 * 发送代码片段相关请求的通用方法
 * @private
 * @param {string} endpoint - API 端点
 * @param {Object} data - 请求数据
 * @param {Object} [options] - 可选配置
 * @param {string} [options.host] - API服务器地址
 * @param {string} [options.token] - 自定义认证令牌
 * @returns {Promise<{code: number, msg: string, data: Object}>}
 */
const sendSnippetRequest = async (endpoint, data, options = {}) => {
  try {
    // 使用新的工具函数
    const apiUrl = getSiyuanApiUrl(`/api/snippet/${endpoint}`, options.host);
    const token = options.token || localStorage.getItem('token');
    const headers = createAuthHeaders({ token: token, scheme: 'Token' });
    headers['Content-Type'] = 'application/json'; // 保留 Content-Type

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
    return handleSiyuanApiError(err, `代码片段 ${endpoint} 操作`); // 使用新的错误处理
  }
};

/**
 * 获取代码片段列表
 * @param {Object} params - 查询选项
 * @param {string} params.type - 片段类型(js/css/all)
 * @param {number} params.enabled - 启用状态(0:禁用,1:启用,2:全部)
 * @param {string} [params.keyword] - 搜索关键词
 * @param {Object} [options] - 可选配置
 * @param {string} [options.host] - API服务器地址
 * @param {string} [options.token] - 自定义认证令牌
 * @returns {Promise<{
 *   code: number,
 *   msg: string,
 *   data: {
 *     snippets: Array<{
 *       id: string,
 *       name: string,
 *       type: string,
 *       content: string,
 *       enabled: boolean
 *     }>
 *   }
 * }>}
 */
export const getSnippet = (params, options = {}) => {
  const { type, enabled, keyword } = params;

  // 参数验证
  if (!['js', 'css', 'all'].includes(type)) {
    return Promise.resolve({
      code: -1,
      msg: '无效的片段类型，必须是 js/css/all',
      data: null
    });
  }

  if (![0, 1, 2].includes(enabled)) {
    return Promise.resolve({
      code: -1,
      msg: '无效的启用状态，必须是 0/1/2',
      data: null
    });
  }

  return sendSnippetRequest('getSnippet', {
    type,
    enabled,
    keyword: keyword || ''
  }, options);
};

/**
 * 设置代码片段
 * @param {Object} params - 设置选项
 * @param {Array<{
 *   id?: string,
 *   name: string,
 *   type: string,
 *   content: string,
 *   enabled: boolean
 * }>} params.snippets - 代码片段列表
 * @param {Object} [options] - 可选配置
 * @param {string} [options.host] - API服务器地址
 * @param {string} [options.token] - 自定义认证令牌
 * @returns {Promise<{code: number, msg: string, data: null}>}
 */
export const setSnippet = (params, options = {}) => {
  const { snippets } = params;

  // 参数验证
  if (!Array.isArray(snippets)) {
    return Promise.resolve({
      code: -1,
      msg: '代码片段列表必须是数组',
      data: null
    });
  }

  // 验证每个片段的必要字段
  for (const snippet of snippets) {
    if (!snippet.name || !snippet.type || !snippet.content) {
      return Promise.resolve({
        code: -1,
        msg: '代码片段缺少必要字段(name/type/content)',
        data: null
      });
    }

    if (!['js', 'css'].includes(snippet.type)) {
      return Promise.resolve({
        code: -1,
        msg: '无效的片段类型，必须是 js/css',
        data: null
      });
    }
  }

  return sendSnippetRequest('setSnippet', { snippets }, options);
};

/**
 * 删除代码片段
 * @param {Object} params - 删除选项
 * @param {string} params.id - 片段ID
 * @param {Object} [options] - 可选配置
 * @param {string} [options.host] - API服务器地址
 * @param {string} [options.token] - 自定义认证令牌
 * @returns {Promise<{code: number, msg: string, data: null}>}
 */
export const removeSnippet = (params, options = {}) => {
  const { id } = params;
  if (!id) {
    return Promise.resolve({
      code: -1,
      msg: '片段ID不能为空',
      data: null
    });
  }
  return sendSnippetRequest('removeSnippet', { id }, options);
};

// 使用示例：
/*
// 获取代码片段列表
const snippets = await getSnippet({
  type: 'js',
  enabled: 1,
  keyword: '搜索关键词'
});

// 设置代码片段
await setSnippet({
  snippets: [{
    name: '测试片段',
    type: 'js',
    content: 'console.log("test")',
    enabled: true
  }]
});

// 删除代码片段
await removeSnippet('20210808180117-6v0mkxr');
*/ 