/**
 * 思源笔记菜单位置常量定义
 * 
 * 定义思源笔记内置事件与菜单位置的对照关系
 * 
 * @module siyuanMenuPositions
 * @date 2023-05-02
 * @author 织
 */

/**
 * 思源内置事件与菜单位置的对照表
 * key: 事件名称
 * value: 菜单位置标识
 */
export const 思源内置事件菜单位置对照表 = {
  'open-menu-doctree': 'siyuan-doctree',
  'open-menu-blockref': 'siyuan-blockref',
  'open-menu-fileannotationref': 'siyuan-fileannotationref',
  'open-menu-tag': 'siyuan-tag',
  'open-menu-link': 'siyuan-link',
  'open-menu-image': 'siyuan-image',
  'open-menu-av': 'siyuan-av',
  'open-menu-content': 'siyuan-content',
  'open-menu-breadcrumbmore': 'siyuan-breadcrumbmore',
  'open-menu-inbox': 'siyuan-inbox',
  'open-siyuan-url-plugin': 'siyuan-url-plugin',
  'open-siyuan-url-block': 'siyuan-url-block',
  'click-editorcontent': 'siyuan-editorcontent',
  'click-blockicon': 'siyuan-blockicon',
  'click-pdf': 'siyuan-pdf',
  'click-editortitleicon': 'siyuan-editortitleicon',
  'click-backlink': 'siyuan-backlink',
  'click-backlinkitem': 'siyuan-backlinkitem',
  'click-refs': 'siyuan-refs',
  'click-refsitem': 'siyuan-refsitem',
  'click-toc': 'siyuan-toc',
  'click-flashcard': 'siyuan-flashcard',
  'click-item': 'siyuan-item'
};

/**
 * 思源菜单位置常量
 * 提供类型安全的菜单位置常量
 */
export const SiyuanMenuPositions = {
  DOCTREE: 'siyuan-doctree',
  BLOCKREF: 'siyuan-blockref',
  FILEANNOTATIONREF: 'siyuan-fileannotationref',
  TAG: 'siyuan-tag',
  LINK: 'siyuan-link',
  IMAGE: 'siyuan-image',
  AV: 'siyuan-av',
  CONTENT: 'siyuan-content',
  BREADCRUMBMORE: 'siyuan-breadcrumbmore',
  INBOX: 'siyuan-inbox',
  URL_PLUGIN: 'siyuan-url-plugin',
  URL_BLOCK: 'siyuan-url-block',
  EDITORCONTENT: 'siyuan-editorcontent',
  BLOCKICON: 'siyuan-blockicon',
  PDF: 'siyuan-pdf',
  EDITORTITLEICON: 'siyuan-editortitleicon',
  BACKLINK: 'siyuan-backlink',
  BACKLINKITEM: 'siyuan-backlinkitem',
  REFS: 'siyuan-refs',
  REFSITEM: 'siyuan-refsitem',
  TOC: 'siyuan-toc',
  FLASHCARD: 'siyuan-flashcard',
  ITEM: 'siyuan-item'
};

/**
 * 根据事件名称获取对应的菜单位置
 * @param {string} eventName 思源内置事件名称
 * @returns {string|null} 对应的菜单位置，不存在则返回null
 */
export function getMenuPosition(eventName) {
  return 思源内置事件菜单位置对照表[eventName] || null;
}

/**
 * 获取所有可用的菜单位置
 * @returns {Array<string>} 菜单位置数组
 */
export function getAllMenuPositions() {
  return Object.values(思源内置事件菜单位置对照表);
}

/**
 * 获取所有可用的菜单事件
 * @returns {Array<string>} 菜单事件数组
 */
export function getAllMenuEvents() {
  return Object.keys(思源内置事件菜单位置对照表);
} 