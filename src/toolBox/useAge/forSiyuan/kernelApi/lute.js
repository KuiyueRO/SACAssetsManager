import { getSiyuanApiUrl, handleSiyuanApiError } from '../../apiUtils.js';
import { forFetchWithTimeout } from '../../../base/forNetwork/forFetch/forFetchHelpers.js';
import { createAuthHeaders } from '../../../base/forNetwork/forAuthHeaders.js';

/**
 * 发送Lute相关请求的通用方法
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
const sendLuteRequest = async (endpoint, data, options = {}) => {
  try {
    // 使用新的工具函数
    const apiUrl = getSiyuanApiUrl(`/api/lute/${endpoint}`, options.host);
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
    return handleSiyuanApiError(err, `Lute ${endpoint} 操作`); // 使用新的错误处理
  }
};

/**
 * 复制标准Markdown
 * @param {Object} params - 复制选项
 * @param {string} params.id - 块ID
 * @param {Object} [options] - 可选配置
 * @param {string} [options.host] - API服务器地址
 * @param {string} [options.token] - 自定义认证令牌
 * @returns {Promise<{
 *   code: number,
 *   msg: string,
 *   data: string  // 标准Markdown内容
 * }>}
 */
export const copyStdMarkdown = (params, options = {}) => {
  const { id } = params;
  if (!id) {
    return Promise.resolve({
      code: -1,
      msg: '块ID不能为空',
      data: null
    });
  }
  return sendLuteRequest('copyStdMarkdown', { id }, options);
};

/**
 * HTML转换为块DOM
 * @param {Object} params - 转换选项
 * @param {string} params.dom - HTML内容
 * @param {boolean} [params.enableMath=false] - 是否启用数学公式
 * @param {Object} [options] - 可选配置
 * @param {string} [options.host] - API服务器地址
 * @param {string} [options.token] - 自定义认证令牌
 * @returns {Promise<{
 *   code: number,
 *   msg: string,
 *   data: string  // 转换后的块DOM
 * }>}
 */
export const html2BlockDOM = (params, options = {}) => {
  const { dom, enableMath = false } = params;
  if (!dom) {
    return Promise.resolve({
      code: -1,
      msg: 'HTML内容不能为空',
      data: null
    });
  }
  return sendLuteRequest('html2BlockDOM', { 
    dom,
    enableMath,
    options: {
      sup: true,
      sub: true,
      mark: true,
      gfmStrikethrough: true,
      inlineAsterisk: true,
      inlineUnderscore: true,
      htmlTag2TextMark: true
    }
  }, options);
};

/**
 * 旋转块DOM
 * @param {Object} params - 旋转选项
 * @param {string} params.dom - 块DOM内容
 * @param {Object} [options] - 可选配置
 * @param {string} [options.host] - API服务器地址
 * @param {string} [options.token] - 自定义认证令牌
 * @returns {Promise<{
 *   code: number,
 *   msg: string,
 *   data: {
 *     dom: string  // 旋转后的块DOM
 *   }
 * }>}
 */
export const spinBlockDOM = (params, options = {}) => {
  const { dom } = params;
  if (!dom) {
    return Promise.resolve({
      code: -1,
      msg: '块DOM内容不能为空',
      data: null
    });
  }
  return sendLuteRequest('spinBlockDOM', { dom }, options);
};

/**
 * 将Markdown转换为HTML
 * @param {Object} params - 转换选项
 * @param {string} params.markdown - Markdown内容
 * @param {boolean} [params.enableMath=false] - 是否启用数学公式
 * @param {Object} [options] - 可选配置
 * @param {string} [options.host] - API服务器地址
 * @param {string} [options.token] - 自定义认证令牌
 * @returns {Promise<{
 *   code: number,
 *   msg: string,
 *   data: string  // 转换后的HTML
 * }>}
 */
export const markdown2HTML = (params, options = {}) => {
  const { markdown, enableMath = false } = params;
  if (!markdown) {
    return Promise.resolve({
      code: -1,
      msg: 'Markdown内容不能为空',
      data: null
    });
  }
  return sendLuteRequest('markdown2HTML', { 
    markdown,
    enableMath,
    options: {
      sup: true,
      sub: true,
      mark: true,
      gfmStrikethrough: true,
      inlineAsterisk: true,
      inlineUnderscore: true,
      htmlTag2TextMark: true
    }
  }, options);
};

/**
 * 将HTML转换为Markdown
 * @param {Object} params - 转换选项
 * @param {string} params.html - HTML内容
 * @param {boolean} [params.enableMath=false] - 是否启用数学公式
 * @param {Object} [options] - 可选配置
 * @param {string} [options.host] - API服务器地址
 * @param {string} [options.token] - 自定义认证令牌
 * @returns {Promise<{
 *   code: number,
 *   msg: string,
 *   data: string  // 转换后的Markdown
 * }>}
 */
export const html2Markdown = (params, options = {}) => {
  const { html, enableMath = false } = params;
  if (!html) {
    return Promise.resolve({
      code: -1,
      msg: 'HTML内容不能为空',
      data: null
    });
  }
  return sendLuteRequest('html2Markdown', { 
    html,
    enableMath,
    options: {
      sup: true,
      sub: true,
      mark: true,
      gfmStrikethrough: true,
      inlineAsterisk: true,
      inlineUnderscore: true,
      htmlTag2TextMark: true
    }
  }, options);
};

// 使用示例：
/*
// 复制标准Markdown
const mdContent = await copyStdMarkdown({
  id: '20210808180117-6v0mkxr'
});

// HTML转块DOM
const blockDOM = await html2BlockDOM({
  dom: '<p>测试内容</p>'
});

// 旋转块DOM
const spinResult = await spinBlockDOM({
  dom: '<div data-node-id="20210808180117-6v0mkxr">测试内容</div>'
});

// Markdown转HTML
const htmlContent = await markdown2HTML({
  markdown: '**粗体文本**',
  enableMath: true
});

// HTML转Markdown
const mdContent = await html2Markdown({
  html: '<strong>粗体文本</strong>',
  enableMath: true
});
*/ 