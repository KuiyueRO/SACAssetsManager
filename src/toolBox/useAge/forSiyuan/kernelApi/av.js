/**
 * @fileoverview 封装思源笔记属性视图 (Attribute View) 相关 Kernel API。
 * @module toolBox/useAge/forSiyuan/kernelApi/av
 */
// import { getApiUrl, handleApiError } from './utils/apiConfig'; // 旧导入
// import { fetchWithTimeout, getAuthHeaders } from './utils/fetchUtils'; // 旧导入
import { getSiyuanApiUrl, handleSiyuanApiError } from '../../apiUtils.js';
import { forFetchWithTimeout } from '../../../base/forNetwork/forFetch/forFetchHelpers.js';
import { createAuthHeaders } from '../../../base/forNetwork/forAuthHeaders.js';

/**
 * 发送属性视图相关请求的通用方法
 * @private
 * @param {string} endpoint - API 端点
 * @param {Object} data - 请求数据
 * @param {Object} [options] - 可选配置
 * @param {string} [options.host] - API服务器地址
 * @param {string} [options.token] - 自定义认证令牌
 * @returns {Promise<{code: number, msg: string, data: Object}>}
 */
const sendAVRequest = async (endpoint, data, options = {}) => {
  try {
    // 使用新的工具函数
    const apiUrl = getSiyuanApiUrl(`/api/av/${endpoint}`, options.host);
    // 显式从 localStorage 获取 token (保持原行为)
    const token = options.token || localStorage.getItem('token');
    const headers = createAuthHeaders({ token: token, scheme: 'Token' }); // 传入 token 和 scheme

    const response = await forFetchWithTimeout(apiUrl, { // 使用 forFetchWithTimeout
      method: 'POST',
      headers: headers,
      body: JSON.stringify(data)
    });
    // 检查响应状态
    if (!response.ok) {
      // 尝试解析错误信息，如果解析失败则使用通用错误
      let errorMsg = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMsg = errorData.msg || errorMsg;
      } catch (e) {
        // 解析 JSON 失败，使用状态文本
        errorMsg = response.statusText || errorMsg;
      }
      throw new Error(errorMsg);
    }
    return await response.json();
  } catch (err) {
    return handleSiyuanApiError(err, `属性视图 ${endpoint} 操作`); // 使用新的错误处理
  }
};

/**
 * 获取属性视图
 * @param {string} id - 属性视图ID
 * @param {Object} [options] - 可选配置
 * @param {string} [options.host] - API服务器地址
 * @param {string} [options.token] - 自定义认证令牌
 * @returns {Promise<{code: number, msg: string, data: Object}>}
 */
export const getAttributeView = (id, options = {}) => {
  return sendAVRequest('getAttributeView', { id }, options);
};

/**
 * 渲染属性视图
 * @param {Object} options - 渲染选项
 * @param {string} options.id - 属性视图ID
 * @param {string} [options.viewID] - 视图ID
 * @param {string} [options.query] - 查询条件
 * @param {number} [options.page=1] - 页码
 * @param {number} [options.pageSize=-1] - 每页大小
 * @param {Object} [apiOptions] - API可选配置
 * @param {string} [apiOptions.host] - API服务器地址
 * @param {string} [apiOptions.token] - 自定义认证令牌
 * @returns {Promise<{
 *   code: number,
 *   msg: string,
 *   data: {
 *     name: string,
 *     id: string,
 *     viewType: string,
 *     viewID: string,
 *     views: Array<{
 *       id: string,
 *       icon: string,
 *       name: string,
 *       hideAttrViewName: boolean,
 *       type: string,
 *       pageSize: number
 *     }>,
 *     view: Object,
 *     isMirror: boolean
 *   }
 * }>}
 */
export const renderAttributeView = (options, apiOptions = {}) => {
  if (!options?.id) {
    return Promise.resolve({
      code: -1,
      msg: '属性视图ID不能为空',
      data: null
    });
  }
  return sendAVRequest('renderAttributeView', options, apiOptions);
};

/**
 * 设置属性视图块属性
 * @param {Object} options - 设置选项
 * @param {string} options.avID - 属性视图ID
 * @param {string} options.keyID - 键ID
 * @param {string} options.rowID - 行ID
 * @param {*} options.value - 属性值
 * @param {Object} [apiOptions] - API可选配置
 * @param {string} [apiOptions.host] - API服务器地址
 * @param {string} [apiOptions.token] - 自定义认证令牌
 * @returns {Promise<{code: number, msg: string, data: {value: *}}>}
 */
export const setAttributeViewBlockAttr = (options, apiOptions = {}) => {
  return sendAVRequest('setAttributeViewBlockAttr', options, apiOptions);
};

/**
 * 添加属性视图键
 * @param {Object} options - 添加选项
 * @param {string} options.avID - 属性视图ID
 * @param {string} options.keyID - 键ID
 * @param {string} options.keyName - 键名称
 * @param {string} options.keyType - 键类型
 * @param {string} options.keyIcon - 键图标
 * @param {string} options.previousKeyID - 前一个键ID
 * @param {Object} [apiOptions] - API可选配置
 * @param {string} [apiOptions.host] - API服务器地址
 * @param {string} [apiOptions.token] - 自定义认证令牌
 * @returns {Promise<{code: number, msg: string, data: null}>}
 */
export const addAttributeViewKey = (options, apiOptions = {}) => {
  return sendAVRequest('addAttributeViewKey', options, apiOptions);
};

/**
 * 移除属性视图键
 * @param {Object} options - 移除选项
 * @param {string} options.avID - 属性视图ID
 * @param {string} options.keyID - 键ID
 * @param {boolean} [options.removeRelationDest=false] - 是否移除关联目标
 * @param {Object} [apiOptions] - API可选配置
 * @param {string} [apiOptions.host] - API服务器地址
 * @param {string} [apiOptions.token] - 自定义认证令牌
 * @returns {Promise<{code: number, msg: string, data: null}>}
 */
export const removeAttributeViewKey = (options, apiOptions = {}) => {
  return sendAVRequest('removeAttributeViewKey', options, apiOptions);
};

/**
 * 搜索属性视图
 * @param {Object} options - 搜索选项
 * @param {string} options.keyword - 搜索关键字
 * @param {string[]} [options.excludes] - 排除的ID列表
 * @param {Object} [apiOptions] - API可选配置
 * @param {string} [apiOptions.host] - API服务器地址
 * @param {string} [apiOptions.token] - 自定义认证令牌
 * @returns {Promise<{code: number, msg: string, data: {results: Array}}>}
 */
export const searchAttributeView = (options, apiOptions = {}) => {
  return sendAVRequest('searchAttributeView', options, apiOptions);
};

/**
 * 获取属性视图键列表
 * @param {string} id - 属性视图ID
 * @param {Object} [options] - API可选配置
 * @param {string} [options.host] - API服务器地址
 * @param {string} [options.token] - 自定义认证令牌
 * @returns {Promise<{code: number, msg: string, data: Array}>}
 */
export const getAttributeViewKeys = (id, options = {}) => {
  return sendAVRequest('getAttributeViewKeys', { id }, options);
};

/**
 * 设置属性视图名称
 * @param {Object} options - 设置选项
 * @param {string} options.id - 属性视图ID
 * @param {string} options.name - 新名称
 * @param {Object} [apiOptions] - API可选配置
 * @param {string} [apiOptions.host] - API服务器地址
 * @param {string} [apiOptions.token] - 自定义认证令牌
 * @returns {Promise<{code: number, msg: string, data: null}>}
 */
export const setAttributeViewName = (options, apiOptions = {}) => {
  return sendAVRequest('setAttributeViewName', options, apiOptions);
};

/**
 * 设置属性视图过滤器
 * @param {Object} options - 设置选项
 * @param {string} options.id - 属性视图ID
 * @param {Array} options.filters - 过滤器配置
 * @param {Object} [apiOptions] - API可选配置
 * @param {string} [apiOptions.host] - API服务器地址
 * @param {string} [apiOptions.token] - 自定义认证令牌
 * @returns {Promise<{code: number, msg: string, data: null}>}
 */
export const setAttributeViewFilters = (options, apiOptions = {}) => {
  return sendAVRequest('setAttributeViewFilters', options, apiOptions);
};

/**
 * 设置属性视图排序
 * @param {Object} options - 设置选项
 * @param {string} options.id - 属性视图ID
 * @param {Array} options.sorts - 排序配置
 * @param {Object} [apiOptions] - API可选配置
 * @param {string} [apiOptions.host] - API服务器地址
 * @param {string} [apiOptions.token] - 自定义认证令牌
 * @returns {Promise<{code: number, msg: string, data: null}>}
 */
export const setAttributeViewSorts = (options, apiOptions = {}) => {
  return sendAVRequest('setAttributeViewSorts', options, apiOptions);
};

/**
 * 设置属性视图列宽
 * @param {Object} options - 设置选项
 * @param {string} options.id - 属性视图ID
 * @param {string} options.keyID - 键ID
 * @param {number} options.width - 列宽
 * @param {Object} [apiOptions] - API可选配置
 * @param {string} [apiOptions.host] - API服务器地址
 * @param {string} [apiOptions.token] - 自定义认证令牌
 * @returns {Promise<{code: number, msg: string, data: null}>}
 */
export const setAttributeViewColWidth = (options, apiOptions = {}) => {
  return sendAVRequest('setAttributeViewColWidth', options, apiOptions);
};

/**
 * 设置属性视图列固定
 * @param {Object} options - 设置选项
 * @param {string} options.id - 属性视图ID
 * @param {string} options.keyID - 键ID
 * @param {string} options.pin - 固定位置
 * @param {Object} [apiOptions] - API可选配置
 * @param {string} [apiOptions.host] - API服务器地址
 * @param {string} [apiOptions.token] - 自定义认证令牌
 * @returns {Promise<{code: number, msg: string, data: null}>}
 */
export const setAttributeViewColPin = (options, apiOptions = {}) => {
  return sendAVRequest('setAttributeViewColPin', options, apiOptions);
};

/**
 * 设置属性视图列隐藏
 * @param {Object} options - 设置选项
 * @param {string} options.id - 属性视图ID
 * @param {string} options.keyID - 键ID
 * @param {boolean} options.hidden - 是否隐藏
 * @param {Object} [apiOptions] - API可选配置
 * @param {string} [apiOptions.host] - API服务器地址
 * @param {string} [apiOptions.token] - 自定义认证令牌
 * @returns {Promise<{code: number, msg: string, data: null}>}
 */
export const setAttributeViewColHidden = (options, apiOptions = {}) => {
  return sendAVRequest('setAttributeViewColHidden', options, apiOptions);
};

/**
 * 设置属性视图列文本换行
 * @param {Object} options - 设置选项
 * @param {string} options.id - 属性视图ID
 * @param {string} options.keyID - 键ID
 * @param {boolean} options.wrap - 是否换行
 * @param {Object} [apiOptions] - API可选配置
 * @param {string} [apiOptions.host] - API服务器地址
 * @param {string} [apiOptions.token] - 自定义认证令牌
 * @returns {Promise<{code: number, msg: string, data: null}>}
 */
export const setAttributeViewColWrap = (options, apiOptions = {}) => {
  return sendAVRequest('setAttributeViewColWrap', options, apiOptions);
};

/**
 * 设置属性视图列图标
 * @param {Object} options - 设置选项
 * @param {string} options.id - 属性视图ID
 * @param {string} options.keyID - 键ID
 * @param {string} options.icon - 图标
 * @param {Object} [apiOptions] - API可选配置
 * @param {string} [apiOptions.host] - API服务器地址
 * @param {string} [apiOptions.token] - 自定义认证令牌
 * @returns {Promise<{code: number, msg: string, data: null}>}
 */
export const setAttributeViewColIcon = (options, apiOptions = {}) => {
  return sendAVRequest('setAttributeViewColIcon', options, apiOptions);
};

/**
 * 设置属性视图列计算
 * @param {Object} options - 设置选项
 * @param {string} options.id - 属性视图ID
 * @param {string} options.keyID - 键ID
 * @param {Object} options.calc - 计算配置
 * @param {Object} [apiOptions] - API可选配置
 * @param {string} [apiOptions.host] - API服务器地址
 * @param {string} [apiOptions.token] - 自定义认证令牌
 * @returns {Promise<{code: number, msg: string, data: null}>}
 */
export const setAttributeViewColCalc = (options, apiOptions = {}) => {
  return sendAVRequest('setAttributeViewColCalc', options, apiOptions);
};

// 使用示例：
/*
// 获取属性视图
const av = await getAttributeView('20210808180117-6v0mkxr');

// 渲染属性视图
const rendered = await renderAttributeView({
  id: '20210808180117-6v0mkxr',
  viewID: 'view1',
  page: 1,
  pageSize: 20
});

// 设置属性
await setAttributeViewBlockAttr({
  avID: '20210808180117-6v0mkxr',
  keyID: 'key1',
  rowID: 'row1',
  value: 'new value'
});
*/ 