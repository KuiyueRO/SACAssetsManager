/**
 * @fileoverview 提供通用的几何计算函数。
 */

/**
 * 计算宽高比 (width / height)。
 * @param {{width: number, height: number}} dimensions - 包含 width 和 height 属性的对象。
 * @returns {number} 宽高比。如果 height 为 0 或输入无效，则返回 NaN 或 Infinity。
 */
export const computeAspectRatio = (dimensions) => {
  if (!dimensions || typeof dimensions !== 'object' || 
      typeof dimensions.width !== 'number' || typeof dimensions.height !== 'number') {
    console.warn('computeAspectRatio: 输入无效，需要 {width: number, height: number} 格式。', dimensions);
    return NaN; // 返回 NaN 表示无效输入
  }
  if (dimensions.height === 0) {
      console.warn('computeAspectRatio: height 为 0，宽高比为 Infinity。');
      return Infinity;
  }
  return dimensions.width / dimensions.height;
}; 