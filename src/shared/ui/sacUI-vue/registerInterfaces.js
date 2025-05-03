/**
 * 思源笔记接口注册模块
 * 
 * 负责向注册表注册思源笔记环境下的各种接口实现
 * 
 * @module registerInterfaces
 * @date 2025-05-07 11:00
 * @author 织
 */

import { registerDialogInterface } from '../../src/toolBox/feature/forUI/interfaces/baseDialogInterface.js';
import { registerTaskControllerFactory } from '../../src/toolBox/feature/forUI/interfaces/taskControllerInterface.js';
import * as siyuanDialog from './dialog/siyuanDialog.js';
import { validateDialogInterface } from './dialog/siyuanDialogValidator.js';
import { clientApi } from '../asyncModules.js';
import { registerSiyuanMenuImplementation } from '../../src/toolBox/feature/forUI/siyuanMenuImplementation.js';

/**
 * 注册各种接口实现
 * 
 * 该模块负责在应用启动时注册各种接口的具体实现
 * 
 * @module registerInterfaces
 */
export function registerAllInterfaces() {
  // 注册对话框接口实现
  registerDialogImpl();
  
  // 注册菜单接口实现
  registerMenuImpl();
}

/**
 * 注册对话框接口实现
 */
function registerDialogImpl() {
  // 创建对话框接口实现
  const dialogInterface = {
    alert: siyuanDialog.alert,
    confirm: siyuanDialog.confirm,
    prompt: siyuanDialog.prompt,
    custom: siyuanDialog.custom
  };
  
  // 验证接口实现是否符合要求
  const validation = validateDialogInterface(dialogInterface);
  if (!validation.isValid) {
    console.error('[SACAssetsManager] 对话框接口验证失败:', validation.errors);
    console.warn('[SACAssetsManager] 将使用默认接口');
    // 在验证失败时仍然注册，但使用带有警告日志的版本
    registerDialogInterface(dialogInterface);
  } else {
    // 验证通过，正常注册
    registerDialogInterface(dialogInterface);
    console.log('[SACAssetsManager] 对话框接口验证通过');
  }
  
  // 注册任务控制器工厂
  registerTaskControllerFactory({
    createTaskController: siyuanDialog.taskController
  });
  
  console.log('[SACAssetsManager] 已注册思源笔记接口');
}

/**
 * 注册菜单接口实现
 */
function registerMenuImpl() {
  registerSiyuanMenuImplementation(clientApi);
}

/**
 * 初始化思源笔记客户端API
 * 
 * 在全局上下文中设置思源笔记客户端API，供对话框实现使用
 * @param {Object} api 思源笔记客户端API
 */
export function initSiyuanClientAPI(api) {
  if (!api) {
    console.error('[SACAssetsManager] 初始化失败: 未提供思源笔记客户端API');
    return;
  }
  
  // 使用Symbol.for创建全局唯一的键，确保在不同模块间共享
  globalThis[Symbol.for('siyuanClientApi')] = api;
  console.log('[SACAssetsManager] 思源笔记客户端API初始化成功');
} 