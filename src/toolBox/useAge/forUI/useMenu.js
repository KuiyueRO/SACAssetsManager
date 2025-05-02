/**
 * 菜单接口使用辅助工具
 * 
 * 提供简化的API让开发者更容易使用菜单功能
 * 
 * @module useMenu
 * @date 2023-05-02
 * @author 织
 */

import { getMenuInterface } from '../../feature/interfaces/menuInterfaces.js';
import { SiyuanMenuPositions } from '../../feature/forUI/siyuanMenuPositions.js';

/**
 * 创建菜单
 * @param {string} [id] 菜单ID
 * @returns {Object} 菜单对象及其操作方法
 */
export function createMenu(id) {
  const menuInterface = getMenuInterface();
  const menu = menuInterface.createMenu(id);
  
  return {
    /**
     * 原始菜单对象
     */
    menu,
    
    /**
     * 添加菜单项
     * @param {string} label 菜单项标签
     * @param {Function} onClick 点击回调
     * @param {Object} [options] 附加选项
     * @param {string} [options.icon] 图标
     * @param {boolean} [options.disabled] 是否禁用
     * @param {string} [options.id] 菜单项ID
     * @param {string} [options.accelerator] 快捷键
     * @returns {Object} 菜单构建器，用于链式调用
     */
    addItem(label, onClick, options = {}) {
      const menuItem = menuInterface.createMenuItem({
        id: options.id || `menu-item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        label,
        click: onClick,
        icon: options.icon,
        disabled: options.disabled,
        accelerator: options.accelerator
      });
      
      menuInterface.addMenuItem(menu, menuItem);
      return this;
    },
    
    /**
     * 添加分隔线
     * @returns {Object} 菜单构建器，用于链式调用
     */
    addSeparator() {
      menuInterface.addSeparator(menu);
      return this;
    },
    
    /**
     * 添加子菜单
     * @param {string} label 子菜单标签
     * @param {Function} subMenuBuilder 子菜单构建器函数
     * @param {Object} [options] 附加选项
     * @param {string} [options.icon] 图标
     * @param {boolean} [options.disabled] 是否禁用
     * @returns {Object} 菜单构建器，用于链式调用
     */
    addSubMenu(label, subMenuBuilder, options = {}) {
      // 创建子菜单
      const subMenu = createMenu(`${id || ''}-sub-${Date.now()}`);
      
      // 调用构建器函数填充子菜单
      if (typeof subMenuBuilder === 'function') {
        subMenuBuilder(subMenu);
      }
      
      // 创建子菜单项
      const menuItem = menuInterface.createMenuItem({
        id: `submenu-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        label,
        icon: options.icon,
        disabled: options.disabled,
        submenu: subMenu.menu
      });
      
      menuInterface.addMenuItem(menu, menuItem);
      return this;
    },
    
    /**
     * 批量添加菜单项
     * @param {Array} items 菜单项数组
     * @returns {Object} 菜单构建器，用于链式调用
     */
    addItems(items) {
      if (!Array.isArray(items)) return this;
      
      items.forEach(item => {
        if (item.type === 'separator') {
          this.addSeparator();
        } else if (item.submenu) {
          this.addSubMenu(item.label, (subMenu) => {
            subMenu.addItems(item.submenu);
          }, {
            icon: item.icon,
            disabled: item.disabled
          });
        } else {
          this.addItem(item.label, item.click, {
            id: item.id,
            icon: item.icon,
            disabled: item.disabled,
            accelerator: item.accelerator
          });
        }
      });
      
      return this;
    },
    
    /**
     * 在指定位置显示菜单
     * @param {number} x X坐标
     * @param {number} y Y坐标
     */
    showAt(x, y) {
      menuInterface.showMenuAt(menu, { x, y });
    },
    
    /**
     * 关闭菜单
     */
    close() {
      menuInterface.closeMenu(menu);
    }
  };
}

/**
 * 注册菜单位置钩子
 * @param {string} position 菜单位置
 * @param {Function} handler 处理函数
 * @returns {Function} 注销函数
 */
export function registerMenuHook(position, handler) {
  const menuInterface = getMenuInterface();
  return menuInterface.registerMenuHook(position, handler);
}

/**
 * 获取所有菜单位置常量
 * @returns {Object} 菜单位置常量
 */
export function getMenuPositions() {
  return { ...SiyuanMenuPositions };
}

/**
 * 创建菜单项配置
 * @param {string} label 菜单项标签
 * @param {Function} onClick 点击回调
 * @param {Object} [options] 附加选项
 * @returns {Object} 菜单项配置
 */
export function createMenuItem(label, onClick, options = {}) {
  return {
    label,
    click: onClick,
    ...options
  };
}

/**
 * 创建分隔线配置
 * @returns {Object} 分隔线配置
 */
export function createSeparator() {
  return { type: 'separator' };
}

/**
 * 创建子菜单配置
 * @param {string} label 子菜单标签
 * @param {Array} items 子菜单项
 * @param {Object} [options] 附加选项
 * @returns {Object} 子菜单配置
 */
export function createSubMenu(label, items, options = {}) {
  return {
    label,
    submenu: items,
    ...options
  };
} 