/**
 * 基础对话框接口定义
 * 
 * 提供最基本的对话框行为定义，作为UI交互的核心依赖注册点
 * 
 * @module baseDialogInterface
 * @date 2025-05-07 08:01
 * @author 织
 */

import { getInterface, registerInterface } from '../../../registry.js';

// 接口常量名称
export const BASE_DIALOG_INTERFACE = 'baseDialogInterface';

/**
 * 创建默认的基础对话框接口实现
 * @returns {Object} 默认基础对话框接口
 */
export function createDefaultDialogInterface() {
  return {
    /**
     * 显示简单消息框
     * @param {string} message 消息内容
     * @param {string} [title] 标题
     * @returns {Promise<void>} Promise
     */
    alert: async (message, title) => {
      console.warn(`未注册alert对话框实现，消息: ${message}`);
      // 在控制台显示消息作为备选
      console.log(`[Alert${title ? ' - ' + title : ''}] ${message}`);
    },
    
    /**
     * 显示确认对话框（是/否）
     * @param {string} message 消息内容
     * @param {string} [title] 标题
     * @returns {Promise<boolean>} 用户选择结果
     */
    confirm: async (message, title) => {
      console.warn(`未注册confirm对话框实现，消息: ${message}`);
      // 默认返回true，避免阻塞流程
      return true;
    },
    
    /**
     * 显示带输入框的对话框
     * @param {string} message 消息内容
     * @param {string} [defaultValue] 默认值
     * @param {string} [title] 标题
     * @returns {Promise<string|null>} 用户输入内容或null（用户取消）
     */
    prompt: async (message, defaultValue = '', title) => {
      console.warn(`未注册prompt对话框实现，消息: ${message}`);
      // 默认返回空字符串，避免阻塞流程
      return defaultValue;
    },
    
    /**
     * 显示自定义对话框
     * @param {Object} options 对话框选项
     * @param {string} options.type 对话框类型
     * @param {string} options.message 消息内容
     * @param {string} [options.title] 标题
     * @param {Object} [options.buttons] 按钮配置
     * @param {Object} [options.input] 输入框配置
     * @returns {Promise<any>} 对话框结果
     */
    custom: async (options) => {
      console.warn(`未注册custom对话框实现，选项: ${JSON.stringify(options)}`);
      // 根据类型返回不同的默认值
      switch(options.type) {
        case 'confirm':
          return true;
        case 'prompt':
          return options.input?.defaultValue || '';
        default:
          return null;
      }
    },
    
    /**
     * 显示确认对话框（供nodeToMenuItem使用）
     * @param {string} title 标题
     * @param {string} prompt 提示信息
     * @returns {Promise<boolean>} 确认结果
     */
    confirmDialog: async (title, prompt) => {
      console.warn(`未注册confirmDialog对话框实现，标题: ${title}, 提示: ${prompt}`);
      return await this.confirm(prompt, title);
    },
    
    /**
     * 显示输入对话框（供nodeToMenuItem使用）
     * @param {Object} config 配置对象 
     * @param {string} config.title 标题
     * @param {string} config.text 提示文本
     * @param {string} [config.placeholder] 输入框占位文本
     * @param {string} [config.value] 默认值
     * @returns {Promise<string|null>} 用户输入内容或null（用户取消）
     */
    inputDialog: async (config) => {
      console.warn(`未注册inputDialog对话框实现，配置: ${JSON.stringify(config)}`);
      return await this.prompt(config.text, config.value || '', config.title);
    },
    
    /**
     * 创建任务控制器（供nodeToMenuItem使用）
     * @param {string} title 标题
     * @param {string} initMessage 初始消息
     * @returns {Promise<Object|null>} 任务控制器对象
     */
    taskController: async (title, initMessage) => {
      console.warn(`未注册taskController实现，标题: ${title}, 初始消息: ${initMessage}`);
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
  return getInterface(BASE_DIALOG_INTERFACE, createDefaultDialogInterface());
}

/**
 * 注册对话框接口实现
 * @param {Object} implementation 接口实现
 */
export function registerDialogInterface(implementation) {
  registerInterface(BASE_DIALOG_INTERFACE, {
    ...createDefaultDialogInterface(),
    ...implementation
  });
}

/**
 * 是否已注册对话框接口
 * @returns {boolean} 是否已注册
 */
export function isDialogInterfaceRegistered() {
  return getInterface(BASE_DIALOG_INTERFACE) !== undefined;
} 