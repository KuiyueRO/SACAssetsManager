/**
 * 对话框交互接口定义
 * 
 * 提供统一的对话框交互接口，用于解耦toolBox与具体UI实现
 * 
 * @module dialogInterfaces
 * @date 2025-05-07 07:42
 * @author 织
 */

import { getInterface, registerInterface } from '../../registry.js';

// 接口常量名称
export const DIALOG_INTERFACE = 'dialogInterface';

/**
 * 创建默认的对话框接口实现
 * @returns {Object} 默认对话框接口实现
 */
export function createDefaultDialogInterface() {
  return {
    /**
     * 默认确认对话框实现
     * @param {string} title 标题
     * @param {string} message 消息
     * @returns {Promise<boolean>} 用户确认结果
     */
    confirmDialog: async (title, message) => {
      console.warn(`未注册确认对话框实现，标题: ${title}, 消息: ${message}`);
      return true;
    },
    
    /**
     * 默认输入对话框实现
     * @param {Object} config 配置对象
     * @param {string} config.title 标题
     * @param {string} config.text 提示文本
     * @param {string} [config.placeholder] 输入框占位文本
     * @param {string} [config.value] 默认值
     * @returns {Promise<string|null>} 用户输入或null
     */
    inputDialog: async (config) => {
      console.warn(`未注册输入对话框实现，配置: ${JSON.stringify(config)}`);
      return null;
    },
    
    /**
     * 默认任务控制器实现
     * @param {string} title 标题
     * @param {string} initMessage 初始消息
     * @returns {Promise<Object|null>} 任务控制器对象
     */
    taskController: async (title, initMessage) => {
      console.warn(`未注册任务控制器实现，标题: ${title}, 初始消息: ${initMessage}`);
      return {
        updateProgress: (percent, message) => {
          console.log(`任务进度: ${percent}%, 消息: ${message}`);
        },
        destroy: () => {
          console.log('销毁任务控制器');
        }
      };
    }
  };
}

/**
 * 获取对话框接口
 * @returns {Object} 对话框接口实现
 */
export function getDialogInterface() {
  return getInterface(DIALOG_INTERFACE, createDefaultDialogInterface());
}

/**
 * 注册对话框接口实现
 * @param {Object} implementation 对话框接口实现
 */
export function registerDialogInterface(implementation) {
  registerInterface(DIALOG_INTERFACE, {
    ...createDefaultDialogInterface(),
    ...implementation
  });
}

/**
 * 是否已注册对话框接口
 * @returns {boolean} 是否已注册
 */
export function isDialogInterfaceRegistered() {
  return getInterface(DIALOG_INTERFACE) !== undefined;
}

/**
 * 创建自定义对话框接口
 * 
 * 用于测试或特殊UI场景
 * 
 * @param {Object} options 自定义选项
 * @param {Function} [options.confirmDialog] 自定义确认对话框
 * @param {Function} [options.inputDialog] 自定义输入对话框
 * @param {Function} [options.taskController] 自定义任务控制器
 * @returns {Object} 自定义对话框接口
 */
export function createCustomDialogInterface(options = {}) {
  return {
    ...createDefaultDialogInterface(),
    ...options
  };
} 