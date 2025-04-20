/**
 * @fileoverview 提供获取JavaScript值精确类型的工具函数。
 */

/**
 * 获取一个值的精确类型字符串。
 * 
 * @param {*} value 需要检测类型的值。
 * @returns {string} 返回表示值类型的字符串（例如 'array', 'null', 'object', 'string', 'number', 'boolean', 'undefined', 'function', 'symbol', 'bigint'）。
 */
export const getValueType = (value) => {
  if (Array.isArray(value)) return 'array';
  if (value === null) return 'null';
  // 对于其他类型，直接使用 typeof 并转为小写
  return (typeof value).toLowerCase();
}; 