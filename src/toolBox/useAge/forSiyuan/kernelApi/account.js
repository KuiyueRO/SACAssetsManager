import { getSiyuanApiUrl, handleSiyuanApiError } from '../../apiUtils.js';
import { forFetchWithTimeout } from '../../../base/forNetwork/forFetch/forFetchHelpers.js';
import { createAuthHeaders } from '../../../base/forNetwork/forAuthHeaders.js';

// 账户相关 API 封装

// 定义通用的请求发送函数
const sendAccountRequest = async (endpoint, method = 'POST', data = {}, options = {}) => {
  try {
    const apiUrl = getSiyuanApiUrl(`/api/account/${endpoint}`, options.host);
    const token = options.token || localStorage.getItem('token');
    const headers = createAuthHeaders({ token: token, scheme: 'Token' });
    if (method === 'POST') {
      headers['Content-Type'] = 'application/json';
    }

    const fetchOptions = {
      method: method.toUpperCase(),
      headers: headers
    };

    if (method === 'POST' && Object.keys(data).length > 0) {
      fetchOptions.body = JSON.stringify(data);
    }

    const response = await forFetchWithTimeout(apiUrl, fetchOptions);
    
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
    return handleSiyuanApiError(err, `账户 ${endpoint} 操作`);
  }
};

/**
 * 用户登录
 * @param {string} userName - 用户名
 * @param {string} password - 用户密码
 * @param {string} [captcha=''] - 验证码（可选）
 * @param {number} [cloudRegion=0] - 云服务器区域，默认为0
 * @param {Object} [options] - 可选配置
 * @param {string} [options.host] - API服务器地址
 * @param {string} [options.token] - 自定义认证令牌
 * @returns {Promise<{code: number, msg: string, data: {token: string, username: string}}}>
 */
export const login = async (userName, password, captcha = '', cloudRegion = 0, options = {}) => {
  const result = await sendAccountRequest('login', 'POST', {
    userName,
    userPassword: password,
    captcha,
    cloudRegion
  }, options);

  if(result.code === 0 && result.data?.token) {
    localStorage.setItem('token', result.data.token);
  }

  return result;
};

/**
 * 注销当前登录用户
 * @param {Object} [options] - 可选配置
 * @param {string} [options.host] - API服务器地址
 * @param {string} [options.token] - 自定义认证令牌
 * @returns {Promise<{code: number, msg: string, data: null}>}
 */
export const logout = async (options = {}) => {
  // 注意：logout 接口虽然是 POST，但通常不带 body
  return sendAccountRequest('logout', 'POST', {}, options);
};

/**
 * 获取当前用户账户信息
 * @param {Object} [options] - 可选配置
 * @param {string} [options.host] - API服务器地址
 * @param {string} [options.token] - 自定义认证令牌
 * @returns {Promise<{
 *   code: number,
 *   msg: string,
 *   data: {
 *     userName: string,
 *     userPassword: string,
 *     activated: boolean,
 *     subscriptionStatus: string,
 *     subscriptionPlan: string,
 *     subscriptionExpireTime: number
 *   }
 * }>}
 */
export const getAccountInfo = async (options = {}) => {
  // 注意：info 接口是 GET
  return sendAccountRequest('info', 'GET', {}, options);
};

/**
 * 更新账户信息
 * @param {Object} accountInfo - 要更新的账户信息
 * @param {string} [accountInfo.userName] - 用户名
 * @param {string} [accountInfo.userPassword] - 用户密码
 * @param {boolean} [accountInfo.activated] - 是否已激活
 * @param {Object} [options] - 可选配置
 * @param {string} [options.host] - API服务器地址
 * @param {string} [options.token] - 自定义认证令牌
 * @returns {Promise<{code: number, msg: string, data: null}>}
 */
export const updateAccountInfo = async (accountInfo, options = {}) => {
  return sendAccountRequest('update', 'POST', accountInfo, options);
};

/**
 * 刷新认证令牌
 * @param {Object} [options] - 可选配置
 * @param {string} [options.host] - API服务器地址
 * @param {string} [options.token] - 自定义认证令牌
 * @returns {Promise<{code: number, msg: string, data: {token: string}}}>
 */
export const refreshToken = async (options = {}) => {
  const result = await sendAccountRequest('refreshToken', 'POST', {}, options);

  if(result.code === 0 && result.data?.token) {
    localStorage.setItem('token', result.data.token);
  }

  return result;
};

/**
 * 检查激活码有效性
 * @param {string} activationCode - 激活码
 * @param {Object} [options] - 可选配置
 * @param {string} [options.host] - API服务器地址
 * @param {string} [options.token] - 自定义认证令牌
 * @returns {Promise<{code: number, msg: string, data: null}>}
 */
export const checkActivationCode = async (activationCode, options = {}) => {
  return sendAccountRequest('checkActivationcode', 'POST', { data: activationCode }, options);
};

/**
 * 使用激活码激活账户
 * @param {string} activationCode - 激活码
 * @param {Object} [options] - 可选配置
 * @param {string} [options.host] - API服务器地址
 * @param {string} [options.token] - 自定义认证令牌
 * @returns {Promise<{code: number, msg: string, data: null}>}
 */
export const useActivationCode = async (activationCode, options = {}) => {
  return sendAccountRequest('useActivationcode', 'POST', { data: activationCode }, options);
};

/**
 * 注销账户
 * @param {Object} [options] - 可选配置
 * @param {string} [options.host] - API服务器地址
 * @param {string} [options.token] - 自定义认证令牌
 * @returns {Promise<{code: number, msg: string, data: null}>}
 */
export const deactivateAccount = async (options = {}) => {
  return sendAccountRequest('deactivate', 'POST', {}, options);
};

/**
 * 开始免费试用
 * @param {Object} [options] - 可选配置
 * @param {string} [options.host] - API服务器地址
 * @param {string} [options.token] - 自定义认证令牌
 * @returns {Promise<{code: number, msg: string, data: null}>}
 */
export const startFreeTrial = async (options = {}) => {
  return sendAccountRequest('startFreeTrial', 'POST', {}, options);
};
