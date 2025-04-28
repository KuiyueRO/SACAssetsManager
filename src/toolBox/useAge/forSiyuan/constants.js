/**
 * @fileoverview 定义思源笔记相关的常量数据。
 */

/**
 * 思源软件的默认图标 URL (相对路径)。
 * @constant
 * @type {string}
 */
export const SIYUAN_DEFAULT_ICON_URL = '/stage/icon-large.png';

/**
 * 思源块类型缩写到中文名称的映射表。
 * @constant
 * @type {Object<string, string>}
 */
export const SIYUAN_BLOCK_TYPE_MAP = {
    'd': "文档",   // Document
    'p': "段落",   // Paragraph
    'h': "标题",   // Heading
    // TODO: Add other block types as needed (e.g., 'i': 列表项, 'b': 引述, 't': 表格, 'c': 代码块, 'm': 数学公式, 's': 超级块, 'av': 属性视图 ...)
    // Ref: Check Siyuan documentation or source for a complete list.
}; 