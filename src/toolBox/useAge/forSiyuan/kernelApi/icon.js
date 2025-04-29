import { getSiyuanApiUrl, handleSiyuanApiError } from '../../apiUtils.js';
import { forFetchWithTimeout } from '../../../base/forNetwork/forFetch/forFetchHelpers.js';
import { createAuthHeaders } from '../../../base/forNetwork/forAuthHeaders.js';

/**
 * 发送图标相关请求的通用方法
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
const sendIconRequest = async (endpoint, data, options = {}) => {
  try {
    // 使用新的工具函数
    const apiUrl = getSiyuanApiUrl(`/api/icon/${endpoint}`, options.host);
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
    return handleSiyuanApiError(err, `图标 ${endpoint} 操作`); // 使用新的错误处理
  }
};

/**
 * 获取动态图标
 * @param {Object} params - 图标选项
 * @param {string} [params.type='1'] - 图标类型(1-8)
 *   1: 显示年月日星期
 *   2: 显示年月日
 *   3: 显示年月
 *   4: 仅显示年
 *   5: 显示周数
 *   6: 仅显示星期
 *   7: 倒数日
 *   8: 文字图标
 * @param {string} [params.color] - 颜色值(支持预定义颜色名或十六进制值)
 * @param {string} [params.date] - 日期(YYYY-MM-DD)
 * @param {string} [params.lang] - 语言(zh_CN|zh_CHT|en_US)
 * @param {string} [params.weekdayType='1'] - 星期显示类型
 *   zh_CN: 1:周日 2:周天 3:星期日 4:星期天
 *   en_US: 1:Mon 2:MON 3:Monday 4:MONDAY
 * @param {string} [params.content] - 文字内容(type=8时使用)
 * @param {string} [params.id] - 文档ID(type=8时使用)
 * @param {Object} [options] - 可选配置
 * @param {string} [options.host] - API服务器地址
 * @param {string} [options.token] - 自定义认证令牌
 * @returns {Promise<string>} SVG字符串
 */
export const getDynamicIcon = async (params, options = {}) => {
  const {
    type = '1',
    color = '',
    date = '',
    lang = '',
    weekdayType = '1',
    content = '',
    id = ''
  } = params;

  try {
    const urlParams = new URLSearchParams({
      type,
      color,
      date,
      lang,
      weekdayType,
      content,
      id
    });
    // 使用新的工具函数
    const apiUrl = getSiyuanApiUrl(`/api/icon/getDynamicIcon?${urlParams}`, options.host);
    const token = options.token || localStorage.getItem('token');
    const headers = createAuthHeaders({ token: token, scheme: 'Token' });

    const response = await forFetchWithTimeout( // 使用 forFetchWithTimeout
      apiUrl,
      {
        headers: headers
      }
    );
    // 检查响应状态 (getDynamicIcon 返回 text)
    if (!response.ok) {
      let errorMsg = `HTTP error! status: ${response.status}`;
      try {
        // 尝试解析json错误信息
        const errorData = await response.json();
        errorMsg = errorData.msg || errorMsg;
      } catch (e) {
         // 如果不是json，尝试读取text
         try {
            const textError = await response.text();
            errorMsg = textError || response.statusText || errorMsg;
         } catch (textErr) {
            errorMsg = response.statusText || errorMsg;
         }
      }
      throw new Error(errorMsg);
    }
    return await response.text();
  } catch (err) {
    return handleSiyuanApiError(err, '获取动态图标'); // 使用新的错误处理
  }
};

/**
 * 预定义的颜色方案
 * @type {Object.<string, {primary: string, secondary: string}>}
 */
export const colorSchemes = {
  red: { primary: '#d13d51', secondary: '#ba2c3f' },
  blue: { primary: '#3eb0ea', secondary: '#0097e6' },
  yellow: { primary: '#eec468', secondary: '#d89b18' },
  green: { primary: '#52E0B8', secondary: '#19b37a' },
  purple: { primary: '#a36cda', secondary: '#8952d5' },
  pink: { primary: '#f183aa', secondary: '#e05b8a' },
  orange: { primary: '#f3865e', secondary: '#ef5e2a' },
  grey: { primary: '#576574', secondary: '#374a60' }
};

// 使用示例：
/*
// 获取年月日星期图标
const icon1 = await getDynamicIcon({
  type: '1',
  color: 'red',
  date: '2024-01-01'
});

// 获取星期图标
const icon6 = await getDynamicIcon({
  type: '6',
  color: 'blue',
  weekdayType: '3'
});

// 获取文字图标
const icon8 = await getDynamicIcon({
  type: '8',
  color: '#ff0000',
  content: '测试',
  id: '20210808180117-6v0mkxr'
});
*/ 