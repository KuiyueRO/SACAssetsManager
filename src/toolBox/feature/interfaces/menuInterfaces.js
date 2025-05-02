/**
 * 菜单交互接口定义
 * 
 * 提供统一的菜单交互接口，用于解耦toolBox与具体UI实现
 * 
 * @module menuInterfaces
 * @date 2023-05-02
 * @author 织
 */

import { getInterface, registerInterface } from '../../registry.js';

// 接口常量名称
export const MENU_INTERFACE = 'menuInterface';

/**
 * 创建默认的菜单接口实现
 * @returns {Object} 默认菜单接口实现
 */
export function createDefaultMenuInterface() {
  return {
    /**
     * 创建菜单实例
     * @param {string} [id] 菜单标识
     * @returns {Object} 菜单实例
     */
    createMenu: (id) => {
      console.warn(`未注册菜单实现，创建ID为 ${id} 的菜单失败`);
      // 返回一个空的菜单实现，避免空引用错误
      return {
        addItem: () => console.warn('使用默认空菜单，addItem操作无效'),
        addSeparator: () => console.warn('使用默认空菜单，addSeparator操作无效'),
        showAt: () => console.warn('使用默认空菜单，showAt操作无效'),
        close: () => console.warn('使用默认空菜单，close操作无效')
      };
    },
    
    /**
     * 在指定位置显示菜单
     * @param {Object} menu 菜单实例
     * @param {Object} position 显示位置
     * @param {number} position.x x坐标
     * @param {number} position.y y坐标
     */
    showMenuAt: (menu, position) => {
      console.warn(`未注册菜单实现，无法在位置(${position.x}, ${position.y})显示菜单`);
    },
    
    /**
     * 创建菜单项
     * @param {Object} options 菜单项选项
     * @param {string} options.id 菜单项ID
     * @param {string} options.label 菜单项标签
     * @param {Function} options.click 点击回调
     * @param {string} [options.icon] 菜单项图标
     * @param {boolean} [options.disabled] 是否禁用
     * @param {Object[]} [options.submenu] 子菜单项
     * @returns {Object} 菜单项对象
     */
    createMenuItem: (options) => {
      console.warn(`未注册菜单实现，无法创建菜单项: ${options.label}`);
      return {};
    },
    
    /**
     * 添加菜单项到现有菜单
     * @param {Object} menu 菜单实例
     * @param {Object} menuItem 菜单项
     */
    addMenuItem: (menu, menuItem) => {
      console.warn(`未注册菜单实现，无法添加菜单项`);
    },
    
    /**
     * 添加分隔线到菜单
     * @param {Object} menu 菜单实例
     */
    addSeparator: (menu) => {
      console.warn(`未注册菜单实现，无法添加分隔线`);
    },
    
    /**
     * 批量添加菜单项
     * @param {Object} menu 菜单实例
     * @param {Object[]} items 菜单项数组
     */
    addMenuItems: (menu, items) => {
      console.warn(`未注册菜单实现，无法批量添加菜单项`);
    },
    
    /**
     * 关闭菜单
     * @param {Object} menu 菜单实例
     */
    closeMenu: (menu) => {
      console.warn(`未注册菜单实现，无法关闭菜单`);
    },
    
    /**
     * 注册菜单位置钩子
     * @param {string} position 菜单位置标识
     * @param {Function} handler 处理函数
     * @returns {Function} 用于注销的函数
     */
    registerMenuHook: (position, handler) => {
      console.warn(`未注册菜单实现，无法为位置 ${position} 注册菜单钩子`);
      return () => {};
    }
  };
}

/**
 * 获取菜单接口
 * @returns {Object} 菜单接口实现
 */
export function getMenuInterface() {
  return getInterface(MENU_INTERFACE, createDefaultMenuInterface());
}

/**
 * 注册菜单接口实现
 * @param {Object} implementation 菜单接口实现
 */
export function registerMenuInterface(implementation) {
  registerInterface(MENU_INTERFACE, {
    ...createDefaultMenuInterface(),
    ...implementation
  });
}

/**
 * 是否已注册菜单接口
 * @returns {boolean} 是否已注册
 */
export function isMenuInterfaceRegistered() {
  return getInterface(MENU_INTERFACE) !== undefined;
}

/**
 * 创建自定义菜单接口
 * 
 * 用于测试或特殊UI场景
 * 
 * @param {Object} options 自定义选项
 * @param {Function} [options.createMenu] 自定义创建菜单函数
 * @param {Function} [options.showMenuAt] 自定义显示菜单函数
 * @param {Function} [options.createMenuItem] 自定义创建菜单项函数
 * @param {Function} [options.addMenuItem] 自定义添加菜单项函数
 * @param {Function} [options.addSeparator] 自定义添加分隔线函数
 * @param {Function} [options.addMenuItems] 自定义批量添加菜单项函数
 * @param {Function} [options.closeMenu] 自定义关闭菜单函数
 * @param {Function} [options.registerMenuHook] 自定义注册菜单钩子函数
 * @returns {Object} 自定义菜单接口
 */
export function createCustomMenuInterface(options = {}) {
  return {
    ...createDefaultMenuInterface(),
    ...options
  };
} 