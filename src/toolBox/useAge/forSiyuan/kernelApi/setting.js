import { getSiyuanApiUrl, handleSiyuanApiError } from '../../apiUtils.js';
import { forFetchWithTimeout } from '../../../base/forNetwork/forFetch/forFetchHelpers.js';
import { createAuthHeaders } from '../../../base/forNetwork/forAuthHeaders.js';

/**
 * 发送设置相关请求的通用方法
 * @private
 * @param {string} endpoint - API 端点
 * @param {Object} data - 请求数据
 * @param {Object} [options] - 可选配置
 * @param {string} [options.host] - API服务器地址
 * @param {string} [options.token] - 自定义认证令牌
 * @returns {Promise<{code: number, msg: string, data: Object}>}
 */
const sendSettingRequest = async (endpoint, data, options = {}) => {
  try {
    // 使用新的工具函数
    const apiUrl = getSiyuanApiUrl(`/api/setting/${endpoint}`, options.host);
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
    return handleSiyuanApiError(err, `设置 ${endpoint} 操作`); // 使用新的错误处理
  }
};

/**
 * 设置编辑器
 * @param {Object} params - 编辑器配置
 * @param {string} [params.plantUMLServePath] - PlantUML服务路径
 * @param {string} [params.katexMacros] - KaTeX宏
 * @param {Object} [options] - 可选配置
 * @param {string} [options.host] - API服务器地址
 * @param {string} [options.token] - 自定义认证令牌
 * @returns {Promise<{code: number, msg: string, data: Object}>}
 */
export const setEditor = (params, options = {}) => {
  const editor = { ...params };
  if (!editor.plantUMLServePath) {
    editor.plantUMLServePath = 'https://www.plantuml.com/plantuml/svg/~1';
  }
  if (!editor.katexMacros) {
    editor.katexMacros = '{}';
  }
  return sendSettingRequest('setEditor', editor, options);
};

/**
 * 设置导出配置
 * @param {Object} params - 导出配置
 * @param {string} [params.pandocBin] - Pandoc可执行文件路径
 * @param {Object} [options] - 可选配置
 * @param {string} [options.host] - API服务器地址
 * @param {string} [options.token] - 自定义认证令牌
 * @returns {Promise<{code: number, msg: string, data: Object}>}
 */
export const setExport = (params, options = {}) => {
  if (params.pandocBin && !isValidPandocBin(params.pandocBin)) {
    return Promise.resolve({
      code: -1,
      msg: '无效的 Pandoc 路径',
      data: { closeTimeout: 5000 }
    });
  }
  return sendSettingRequest('setExport', params, options);
};

/**
 * 设置文件树配置
 * @param {Object} params - 文件树配置
 * @param {string} [params.refCreateSavePath] - 引用创建保存路径
 * @param {string} [params.docCreateSavePath] - 文档创建保存路径
 * @param {number} [params.maxOpenTabCount] - 最大打开标签页数量
 * @param {Object} [options] - 可选配置
 * @param {string} [options.host] - API服务器地址
 * @param {string} [options.token] - 自定义认证令牌
 * @returns {Promise<{code: number, msg: string, data: Object}>}
 */
export const setFiletree = (params, options = {}) => {
  const fileTree = { ...params };
  
  // 参数验证和处理
  fileTree.refCreateSavePath = fileTree.refCreateSavePath?.trim() || '';
  if (fileTree.refCreateSavePath && !fileTree.refCreateSavePath.endsWith('/')) {
    fileTree.refCreateSavePath += '/';
  }
  
  fileTree.docCreateSavePath = fileTree.docCreateSavePath?.trim() || '';
  
  // 限制最大打开标签页数量
  fileTree.maxOpenTabCount = Math.min(Math.max(fileTree.maxOpenTabCount || 8, 1), 32);
  
  return sendSettingRequest('setFiletree', fileTree, options);
};

/**
 * 设置搜索配置
 * @param {Object} params - 搜索配置
 * @param {number} [params.limit] - 搜索结果限制
 * @param {Object} [options] - 可选配置
 * @param {string} [options.host] - API服务器地址
 * @param {string} [options.token] - 自定义认证令牌
 * @returns {Promise<{code: number, msg: string, data: Object}>}
 */
export const setSearch = (params, options = {}) => {
  const search = { ...params };
  if (search.limit < 32) {
    search.limit = 32;
  }
  return sendSettingRequest('setSearch', search, options);
};

/**
 * 设置AI配置
 * @param {Object} params - AI配置
 * @param {Object} params.openAI - OpenAI配置
 * @param {number} [params.openAI.apiTimeout] - API超时时间
 * @param {number} [params.openAI.apiMaxTokens] - API最大token数
 * @param {number} [params.openAI.apiTemperature] - API温度
 * @param {number} [params.openAI.apiMaxContexts] - API最大上下文数
 * @param {Object} [options] - 可选配置
 * @param {string} [options.host] - API服务器地址
 * @param {string} [options.token] - 自定义认证令牌
 * @returns {Promise<{code: number, msg: string, data: Object}>}
 */
export const setAI = (params, options = {}) => {
  const ai = { ...params };
  
  // API超时时间限制
  ai.openAI.apiTimeout = Math.min(Math.max(ai.openAI.apiTimeout || 30, 5), 600);
  
  // API最大token限制
  ai.openAI.apiMaxTokens = Math.max(ai.openAI.apiMaxTokens || 0, 0);
  
  // API温度限制
  if (ai.openAI.apiTemperature <= 0 || ai.openAI.apiTemperature > 2) {
    ai.openAI.apiTemperature = 1.0;
  }
  
  // API最大上下文数限制
  ai.openAI.apiMaxContexts = Math.min(Math.max(ai.openAI.apiMaxContexts || 7, 1), 64);
  
  return sendSettingRequest('setAI', ai, options);
};

/**
 * 设置闪卡配置
 * @param {Object} params - 闪卡配置
 * @param {number} [params.newCardLimit] - 新卡片数量限制
 * @param {number} [params.reviewCardLimit] - 复习卡片数量限制
 * @param {Object} [options] - 可选配置
 * @param {string} [options.host] - API服务器地址
 * @param {string} [options.token] - 自定义认证令牌
 * @returns {Promise<{code: number, msg: string, data: Object}>}
 */
export const setFlashcard = (params, options = {}) => {
  const flashcard = { ...params };
  
  // 新卡片数量限制
  flashcard.newCardLimit = Math.max(flashcard.newCardLimit || 20, 0);
  
  // 复习卡片数量限制
  flashcard.reviewCardLimit = Math.max(flashcard.reviewCardLimit || 200, 0);
  
  return sendSettingRequest('setFlashcard', flashcard, options);
};

/**
 * 设置账号配置
 * @param {Object} params - 账号配置
 * @param {Object} [options] - 可选配置
 * @param {string} [options.host] - API服务器地址
 * @param {string} [options.token] - 自定义认证令牌
 * @returns {Promise<{code: number, msg: string, data: Object}>}
 */
export const setAccount = (params, options = {}) => {
  return sendSettingRequest('setAccount', params, options);
};

/**
 * 获取云端用户信息
 * @param {Object} [params] - 查询参数
 * @param {string} [params.token] - 用户令牌
 * @param {Object} [options] - 可选配置
 * @param {string} [options.host] - API服务器地址
 * @param {string} [options.token] - 自定义认证令牌
 * @returns {Promise<{code: number, msg: string, data: Object}>}
 */
export const getCloudUser = (params = {}, options = {}) => {
  return sendSettingRequest('getCloudUser', { token: params.token }, options);
};

/**
 * 退出云端用户
 * @param {Object} [options] - 可选配置
 * @param {string} [options.host] - API服务器地址
 * @param {string} [options.token] - 自定义认证令牌
 * @returns {Promise<{code: number, msg: string, data: null}>}
 */
export const logoutCloudUser = (options = {}) => {
  return sendSettingRequest('logoutCloudUser', {}, options);
};

// 辅助函数，用于验证 Pandoc 路径 (保持不变)
function isValidPandocBin(path) {
  // 这里可以添加更复杂的验证逻辑，例如检查文件是否存在或格式是否正确
  return typeof path === 'string' && path.trim() !== '';
}

// 使用示例：
/*
// 设置编辑器配置
await setEditor({
  fontSize: 16,
  fontFamily: 'Microsoft YaHei',
  theme: 'dark'
});

// 设置搜索配置
await setSearch({
  caseSensitive: true,
  limit: 50
});

// 设置外观
await setAppearance({
  mode: 'dark',
  language: 'zh_CN'
});

// 获取云端用户信息
const user = await getCloudUser('user-token-123');

// 退出云端用户
await logoutCloudUser();
*/ 