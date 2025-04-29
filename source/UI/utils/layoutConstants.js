/**
 * @fileoverview 布局相关的常量和简单计算函数
 * @module toolBox/base/useConstants/layoutConstants
 */

// 表格视图阈值，可能用于判断何时从行布局切换到列布局或改变宽度计算方式
export const 表格视图阈值 = 100;

// 布局方向常量
export const LAYOUT_COLUMN = 'column';
export const LAYOUT_ROW = 'row';

/**
 * 根据尺寸和表格视图阈值计算最大宽度样式值
 * @param {number} size - 尺寸值
 * @returns {string} CSS max-width 值 ('100%' 或 '${size}px')
 */
export const computeMaxWidthStyleBySize = (size) => {
    return size < 表格视图阈值 ? `100%` : `${size}px`;
};

/**
 * 根据尺寸和表格视图阈值获取建议的显示模式（布局方向）
 * @param {number} size - 尺寸值
 * @returns {string} 布局模式常量 (LAYOUT_COLUMN 或 LAYOUT_ROW)
 */
export const getDisplayModeBySize = (size) => {
    return size >= 表格视图阈值 ? LAYOUT_COLUMN : LAYOUT_ROW;
};

// 保持旧的函数名作为别名以兼容（可选，但建议重构调用处）
/** @deprecated 请使用 computeMaxWidthStyleBySize */
export const 根据阈值计算最大宽度 = computeMaxWidthStyleBySize;
/** @deprecated 请使用 getDisplayModeBySize */
export const 根据尺寸获取显示模式 = getDisplayModeBySize; 