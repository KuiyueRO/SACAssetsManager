/**
 * 思源笔记对话框基础工具
 * 提供对话框相关的基础功能，避免循环依赖
 * @module siyuanDialog
 */

import { 检查思源环境 } from './siyuanEnv.js';
import { getDialogInterface } from '../../feature/interfaces/dialogInterfaces.js';

/**
 * 创建确认对话框并返回Promise
 * @param {string} title 对话框标题
 * @param {string} text 对话框内容
 * @param {Object} options 附加选项
 * @returns {Promise<boolean>} 用户确认返回true，取消返回false
 */
export const confirmAsPromise = (title, text, options = {}) => {
  if (!检查思源环境()) {
    console.warn('当前不在思源环境中，对话框功能可能无法正常工作');
    return Promise.resolve(false);
  }
  
  const dialogInterface = getDialogInterface();
  
  return dialogInterface.custom({
    type: 'confirm',
    title,
    message: text,
    buttons: {
      ok: options.confirmText || '确定',
      cancel: options.cancelText || '取消'
    },
    width: options.width
  });
};

/**
 * 创建输入对话框并返回Promise
 * @param {string} title 对话框标题
 * @param {string} placeholder 输入框占位文本
 * @param {string} defaultValue 默认值
 * @param {Object} options 附加选项
 * @returns {Promise<string|null>} 用户输入内容或null（取消）
 */
export const 创建输入对话框 = (title, placeholder, defaultValue = '', options = {}) => {
  if (!检查思源环境()) {
    console.warn('当前不在思源环境中，对话框功能可能无法正常工作');
    return Promise.resolve(null);
  }
  
  const dialogInterface = getDialogInterface();
  
  return dialogInterface.inputDialog({
    title,
    text: placeholder,
    placeholder,
    value: defaultValue,
    ...options
  });
}; 