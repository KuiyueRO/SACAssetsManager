/**
 * 任务控制器接口定义
 * 
 * 提供任务进度显示和控制的接口，作为UI交互的依赖注册点
 * 
 * @module taskControllerInterface
 * @date 2025-05-07 09:15
 * @author 织
 */

import { getInterface, registerInterface } from '../../../registry.js';

// 接口常量名称
export const TASK_CONTROLLER_INTERFACE = 'taskControllerInterface';

/**
 * 任务控制器接口
 * @typedef {Object} ITaskController
 * @property {function(number, string): void} updateProgress 更新进度
 * @property {function(): void} destroy 销毁控制器
 */

/**
 * 创建默认的任务控制器工厂函数
 * @returns {Object} 默认任务控制器工厂
 */
export function createDefaultTaskControllerFactory() {
  return {
    /**
     * 创建任务控制器
     * @param {string} title 任务标题
     * @param {string} initMessage 初始消息
     * @returns {Promise<ITaskController>} 任务控制器实例
     */
    createTaskController: async (title, initMessage) => {
      console.warn(`未注册任务控制器实现，标题: ${title}, 初始消息: ${initMessage}`);
      return {
        /**
         * 更新进度
         * @param {number} percent 进度百分比（0-100）
         * @param {string} message 进度消息
         */
        updateProgress: (percent, message) => {
          console.log(`任务进度: ${percent}%, 消息: ${message}`);
        },
        
        /**
         * 销毁控制器
         */
        destroy: () => {
          console.log('销毁任务控制器');
        }
      };
    }
  };
}

/**
 * 获取任务控制器工厂
 * @returns {Object} 任务控制器工厂实现
 */
export function getTaskControllerFactory() {
  return getInterface(TASK_CONTROLLER_INTERFACE, createDefaultTaskControllerFactory());
}

/**
 * 注册任务控制器工厂实现
 * @param {Object} implementation 任务控制器工厂实现
 */
export function registerTaskControllerFactory(implementation) {
  registerInterface(TASK_CONTROLLER_INTERFACE, {
    ...createDefaultTaskControllerFactory(),
    ...implementation
  });
}

/**
 * 是否已注册任务控制器工厂
 * @returns {boolean} 是否已注册
 */
export function isTaskControllerFactoryRegistered() {
  return getInterface(TASK_CONTROLLER_INTERFACE) !== undefined;
} 