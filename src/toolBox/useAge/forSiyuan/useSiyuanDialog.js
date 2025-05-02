/**
 * @file 思源笔记对话框API封装
 * @module toolBox/useAge/forSiyuan/useSiyuanDialog
 * @requires 思源环境
 */

import { 检查思源环境 } from '../useSiyuan.js';
import { confirmAsPromise, 创建输入对话框 as 基础创建输入对话框 } from '../../base/useEnv/siyuanDialog.js';
import { clientApi } from '../../../../source/asyncModules.js';
import { getDialogInterface } from '../../feature/interfaces/dialogInterfaces.js';

// 检查环境
if (!检查思源环境()) {
  console.warn('当前不在思源环境中，部分功能可能不可用');
}

// 重新导出基础函数
export { confirmAsPromise };

/**
 * 以英文命名的版本
 * @param {string} title - 对话框标题
 * @param {string} content - 对话框内容
 * @returns {Promise<boolean>} 用户确认返回true，取消返回false
 */
export const confirmPromise = confirmAsPromise;

/**
 * 创建简单对话框
 * @param {Object} 选项
 * @param {string} 选项.标题 - 对话框标题
 * @param {string} 选项.内容 - 对话框HTML内容
 * @param {string} [选项.宽度='520px'] - 对话框宽度
 * @param {string} [选项.高度='auto'] - 对话框高度
 * @param {Function} [选项.确认回调] - 确认按钮回调函数
 * @param {Function} [选项.取消回调] - 取消按钮回调函数
 * @returns {Promise<boolean>} 确认结果的Promise
 */
export const 创建简单对话框 = ({ 标题, 内容, 宽度 = '520px', 高度 = 'auto', 确认回调, 取消回调 }) => {
  const dialogInterface = getDialogInterface();
  
  return dialogInterface.custom({
    type: 'confirm',
    title: 标题,
    message: 内容,
    width: 宽度,
    height: 高度
  }).then(result => {
    if (result) {
      if (确认回调) 确认回调();
    } else {
      if (取消回调) 取消回调();
    }
    return result;
  });
};

/**
 * 显示确认对话框
 * @param {string} 标题 - 对话框标题
 * @param {string} 内容 - 对话框内容
 * @param {Function} [确认回调] - 确认按钮回调函数
 * @param {Function} [取消回调] - 取消按钮回调函数
 * @returns {Promise<boolean>} 确认结果的Promise
 */
export const 显示确认对话框 = (标题, 内容, 确认回调, 取消回调) => {
  const dialogInterface = getDialogInterface();
  
  return dialogInterface.confirm(内容, 标题).then(result => {
    if (result) {
      if (确认回调) 确认回调();
    } else {
      if (取消回调) 取消回调();
    }
    return result;
  });
};

/**
 * 显示输入对话框
 * @param {string} 标题 - 对话框标题
 * @param {string} 提示文本 - 输入框提示
 * @param {Function} 确认回调 - 确认回调，参数为输入内容
 * @param {Function} [取消回调] - 取消回调
 * @returns {Promise<string|null>} 输入内容的Promise
 */
export const 显示输入对话框 = (标题, 提示文本, 确认回调, 取消回调) => {
  const dialogInterface = getDialogInterface();
  
  return dialogInterface.prompt(提示文本, '', 标题).then(result => {
    if (result !== null) {
      if (确认回调) 确认回调(result);
    } else {
      if (取消回调) 取消回调();
    }
    return result;
  });
};

// 使用基础模块的函数
export const 创建输入对话框 = (options) => 基础创建输入对话框(options);

/**
 * 以英文命名的版本
 * @param {Object} options
 * @param {string} options.title - 对话框标题
 * @param {string} [options.hint=''] - 输入框提示文本
 * @param {string} [options.defaultValue=''] - 输入框默认值
 * @param {string} [options.width='520px'] - 对话框宽度
 * @returns {Promise<string|null>} 用户输入的值，取消则返回null
 */
export const createPromptDialog = ({ title, hint = '', defaultValue = '', width = '520px' }) => {
  return 创建输入对话框({
    title,
    text: hint,
    value: defaultValue,
    width
  });
}; 