/**
 * 标准对话框实现
 * 
 * 基于基础对话框接口实现的通用对话框功能
 * 
 * @module standardDialogs
 * @date 2025-05-07 10:30
 * @author 织
 */

import { getDialogInterface } from '../interfaces/baseDialogInterface.js';

/**
 * 显示确认对话框，带自定义按钮文本
 * @param {string} message 消息内容
 * @param {string} [title] 标题
 * @param {Object} [options] 选项
 * @param {string} [options.okText='确定'] 确认按钮文本
 * @param {string} [options.cancelText='取消'] 取消按钮文本 
 * @returns {Promise<boolean>} 用户选择结果
 */
export async function confirmWithOptions(message, title, options = {}) {
  const dialogInterface = getDialogInterface();
  
  if (dialogInterface.custom) {
    const customOptions = {
      type: 'confirm',
      message,
      title,
      buttons: {
        ok: options.okText || '确定',
        cancel: options.cancelText || '取消'
      }
    };
    
    return dialogInterface.custom(customOptions);
  } else {
    // 降级到基本的confirm
    return dialogInterface.confirm(message, title);
  }
}

/**
 * 显示输入对话框，带验证功能
 * @param {string} message 消息内容
 * @param {string} [defaultValue=''] 默认值
 * @param {Object} [options] 选项
 * @param {string} [options.title] 标题
 * @param {Function} [options.validator] 验证函数，返回true表示验证通过
 * @param {string} [options.errorMessage='输入无效，请重新输入'] 验证失败时显示的消息
 * @returns {Promise<string|null>} 用户输入内容或null（用户取消）
 */
export async function promptWithValidation(message, defaultValue = '', options = {}) {
  const dialogInterface = getDialogInterface();
  
  while (true) {
    const result = await dialogInterface.prompt(message, defaultValue, options.title);
    
    if (result === null) return null; // 用户取消
    
    // 如果没有验证函数或验证通过，返回结果
    if (!options.validator || options.validator(result)) {
      return result;
    }
    
    // 验证失败，显示错误消息
    await dialogInterface.alert(options.errorMessage || '输入无效，请重新输入');
  }
}

/**
 * 显示多选对话框
 * @param {string} message 消息内容
 * @param {Array<string|{label: string, value: any}>} items 选项列表
 * @param {Object} [options] 选项
 * @param {string} [options.title] 标题
 * @param {boolean} [options.multiple=false] 是否允许多选
 * @returns {Promise<any|Array<any>|null>} 用户选择的结果或null（用户取消）
 */
export async function selectDialog(message, items, options = {}) {
  const dialogInterface = getDialogInterface();
  
  if (dialogInterface.custom) {
    const normalizedItems = items.map(item => {
      if (typeof item === 'string') {
        return { label: item, value: item };
      }
      return item;
    });
    
    const customOptions = {
      type: 'select',
      message,
      title: options.title,
      multiple: options.multiple || false,
      items: normalizedItems
    };
    
    return dialogInterface.custom(customOptions);
  } else {
    // 降级处理：如果没有custom方法，只能返回null
    console.warn('当前对话框接口不支持选择对话框，请实现custom方法');
    return null;
  }
}

/**
 * 显示确认对话框，带详细内容
 * @param {string} title 标题
 * @param {string} message 简短消息
 * @param {string} [details] 详细内容（可包含HTML）
 * @returns {Promise<boolean>} 用户选择结果
 */
export async function confirmWithDetails(title, message, details) {
  const dialogInterface = getDialogInterface();
  
  if (dialogInterface.custom) {
    const customOptions = {
      type: 'confirmDetails',
      title,
      message,
      details
    };
    
    return dialogInterface.custom(customOptions);
  } else {
    // 降级到基本的confirm，合并message和details
    const combinedMessage = details 
      ? `${message}\n\n${details.replace(/<[^>]+>/g, '')}`  // 简单移除HTML标签
      : message;
    
    return dialogInterface.confirm(combinedMessage, title);
  }
}

/**
 * 显示进度对话框
 * @param {string} title 标题
 * @param {string} [initialMessage=''] 初始消息
 * @param {Object} [options] 选项
 * @param {boolean} [options.cancellable=true] 是否可取消
 * @param {boolean} [options.showPercentage=true] 是否显示百分比
 * @returns {Promise<{updateProgress: Function, close: Function, setError: Function}>} 进度控制器
 */
export async function progressDialog(title, initialMessage = '', options = {}) {
  const dialogInterface = getDialogInterface();
  
  // 检查是否支持任务控制器
  if (dialogInterface.taskController) {
    const controller = await dialogInterface.taskController(title, initialMessage);
    return controller;
  } else if (dialogInterface.custom) {
    // 尝试使用custom实现
    const customOptions = {
      type: 'progress',
      title,
      message: initialMessage,
      cancellable: options.cancellable !== false,
      showPercentage: options.showPercentage !== false
    };
    
    return dialogInterface.custom(customOptions);
  } else {
    // 提供一个基本实现，仅记录到控制台
    console.warn('当前对话框接口不支持进度对话框，将使用控制台输出');
    
    return {
      updateProgress: (percent, message) => {
        console.log(`[进度] ${percent}% - ${message || initialMessage}`);
      },
      close: () => {
        console.log('[进度] 关闭');
      },
      setError: (message) => {
        console.error(`[进度] 错误: ${message}`);
      }
    };
  }
} 