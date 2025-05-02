/**
 * 对话框接口注册模块
 * 
 * 注册思源笔记环境的对话框接口实现
 * 
 * @module registerDialogs
 * @date 2025-05-07 07:32
 * @author 织
 */

import { registerDialogInterfaces } from '../../src/toolBox/base/forUI/interfaces/dialogInterfaces.js';
import { confirmAsPromise } from '../UI/dialog/confirm.js';
import { showInputDialogPromise } from '../UI/dialog/inputDialog.js';
import { 打开任务控制对话框 } from '../UI/dialog/tasks.js';

/**
 * 注册思源笔记环境的对话框接口实现
 * 
 * 在插件初始化时调用此函数，将思源笔记环境的对话框实现注册到全局接口中
 */
export function registerSiyuanDialogs() {
  registerDialogInterfaces({
    /**
     * 确认对话框实现
     * 使用思源笔记的确认对话框
     * 
     * @param {string} title 标题
     * @param {string} message 消息
     * @returns {Promise<boolean>} 用户确认结果的Promise
     */
    confirmDialog: confirmAsPromise,
    
    /**
     * 输入对话框实现
     * 使用思源笔记的输入对话框
     * 
     * @param {Object} config 配置对象
     * @returns {Promise<string|null>} 用户输入的字符串或null的Promise
     */
    inputDialog: showInputDialogPromise,
    
    /**
     * 任务控制器创建函数
     * 使用思源笔记的任务控制对话框
     * 
     * @param {string} title 任务标题
     * @param {string} initMessage 初始消息
     * @returns {Promise<Object|null>} 任务控制器对象或null的Promise
     */
    taskController: 打开任务控制对话框
  });
  
  console.log('思源笔记对话框接口已注册');
} 