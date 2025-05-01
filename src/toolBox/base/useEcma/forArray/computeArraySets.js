/**
 * @fileoverview 提供基于集合操作的数组计算函数。
 * 例如：获取唯一元素、计算交集、并集、差集等。
 */

/**
 * 获取数组中的唯一元素。
 * 利用 Set 数据结构的特性进行去重。
 * @param {Array<T>} array - 输入数组。
 * @returns {Array<T>} 包含唯一元素的新数组。
 * @template T
 */
export function getUniqueElements(array) {
  if (!Array.isArray(array)) {
    // 或者根据需要抛出错误
    console.warn('getUniqueElements: 输入不是一个有效的数组。');
    return []; 
  }
  return Array.from(new Set(array));
}

// 中文别名导出
export const 清理重复元素 = getUniqueElements; 