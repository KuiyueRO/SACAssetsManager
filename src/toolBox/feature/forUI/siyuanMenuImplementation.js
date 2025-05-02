/**
 * 思源笔记菜单接口实现
 * 
 * 为思源笔记环境提供菜单接口的具体实现
 * 
 * @module siyuanMenuImplementation
 * @date 2023-05-02
 * @author 织
 */

import { 检查思源环境 } from '../../base/useEnv/siyuanEnv.js';
import { registerMenuInterface } from '../interfaces/menuInterfaces.js';
import { 思源内置事件菜单位置对照表 } from './siyuanMenuPositions.js';

/**
 * 注册思源笔记菜单接口实现
 * @param {Object} clientApi 思源客户端API对象
 */
export function registerSiyuanMenuImplementation(clientApi) {
  // 检查是否在思源环境中
  if (!检查思源环境()) {
    console.warn('当前不在思源环境中，菜单实现将使用默认空实现');
    return;
  }

  // 检查API是否可用
  if (!clientApi || !clientApi.Menu) {
    console.error('思源API不可用，无法注册菜单实现');
    return;
  }

  // 初始化全局菜单钩子注册表
  const menuHooks = initializeMenuHooks();

  // 注册思源菜单接口实现
  registerMenuInterface({
    /**
     * 创建思源菜单实例
     * @param {string} [id] 菜单标识
     * @returns {Object} 思源菜单实例
     */
    createMenu: (id) => {
      const menu = new clientApi.Menu(id);
      return menu;
    },

    /**
     * 在指定位置显示思源菜单
     * @param {Object} menu 思源菜单实例
     * @param {Object} position 显示位置
     * @param {number} position.x x坐标
     * @param {number} position.y y坐标
     */
    showMenuAt: (menu, position) => {
      if (menu && typeof menu.showAt === 'function') {
        menu.showAt(position.x, position.y);
      }
    },

    /**
     * 创建思源菜单项
     * @param {Object} options 菜单项选项
     * @returns {Object} 思源菜单项对象
     */
    createMenuItem: (options) => {
      // 思源菜单项配置格式转换
      const menuItem = {
        id: options.id,
        label: options.label,
        click: options.click,
        icon: options.icon,
        accelerator: options.accelerator,
      };

      // 处理禁用状态
      if (typeof options.disabled !== 'undefined') {
        menuItem.disabled = options.disabled;
      }

      // 处理子菜单
      if (Array.isArray(options.submenu) && options.submenu.length > 0) {
        menuItem.submenu = options.submenu;
      }

      return menuItem;
    },

    /**
     * 添加菜单项到思源菜单
     * @param {Object} menu 思源菜单实例
     * @param {Object} menuItem 菜单项
     */
    addMenuItem: (menu, menuItem) => {
      if (menu && typeof menu.addItem === 'function') {
        menu.addItem(menuItem);
      }
    },

    /**
     * 添加分隔线到思源菜单
     * @param {Object} menu 思源菜单实例
     */
    addSeparator: (menu) => {
      if (menu && typeof menu.addSeparator === 'function') {
        menu.addSeparator();
      }
    },

    /**
     * 批量添加菜单项到思源菜单
     * @param {Object} menu 思源菜单实例
     * @param {Object[]} items 菜单项数组
     */
    addMenuItems: (menu, items) => {
      if (!menu || !Array.isArray(items)) return;

      items.forEach(item => {
        if (item.type === 'separator') {
          menu.addSeparator();
        } else {
          menu.addItem(item);
        }
      });
    },

    /**
     * 关闭思源菜单
     * @param {Object} menu 思源菜单实例
     */
    closeMenu: (menu) => {
      if (menu && typeof menu.close === 'function') {
        menu.close();
      }
    },

    /**
     * 注册思源菜单位置钩子
     * @param {string} position 菜单位置标识
     * @param {Function} handler 处理函数
     * @returns {Function} 用于注销的函数
     */
    registerMenuHook: (position, handler) => {
      if (!menuHooks[position]) {
        menuHooks[position] = [];
      }
      
      menuHooks[position].push(handler);
      
      // 返回注销函数
      return () => {
        if (menuHooks[position]) {
          const index = menuHooks[position].indexOf(handler);
          if (index !== -1) {
            menuHooks[position].splice(index, 1);
          }
        }
      };
    }
  });

  // 注册思源菜单事件监听
  registerSiyuanMenuEvents(clientApi, menuHooks);

  console.log('思源菜单接口实现已注册');
}

/**
 * 初始化菜单钩子注册表
 * @returns {Object} 菜单钩子注册表
 */
function initializeMenuHooks() {
  // 使用Symbol确保全局唯一性
  const MENU_HOOKS_SYMBOL = Symbol.for('SACMenuHooks');
  
  // 初始化全局菜单钩子注册表
  if (!globalThis[MENU_HOOKS_SYMBOL]) {
    globalThis[MENU_HOOKS_SYMBOL] = Object.keys(思源内置事件菜单位置对照表)
      .reduce((acc, key) => {
        const position = 思源内置事件菜单位置对照表[key];
        acc[position] = [];
        return acc;
      }, {});
  }
  
  return globalThis[MENU_HOOKS_SYMBOL];
}

/**
 * 注册思源菜单事件监听
 * @param {Object} clientApi 思源客户端API对象
 * @param {Object} menuHooks 菜单钩子注册表
 */
function registerSiyuanMenuEvents(clientApi, menuHooks) {
  const eventBus = clientApi.eventBus;
  if (!eventBus) return;

  // 为每个菜单位置注册事件监听
  Object.entries(思源内置事件菜单位置对照表).forEach(([eventName, position]) => {
    eventBus.on(eventName, (event) => {
      // 确保事件和detail存在
      if (!event || !event.detail) return;

      const detail = event.detail;
      const menu = detail.menu;
      
      // 确保菜单对象存在
      if (!menu) return;
      
      // 调用注册的钩子函数
      const hooks = menuHooks[position] || [];
      hooks.forEach(hook => {
        try {
          hook(menu, detail);
        } catch (error) {
          console.error(`执行菜单钩子出错(${position}):`, error);
        }
      });
    });
  });
} 