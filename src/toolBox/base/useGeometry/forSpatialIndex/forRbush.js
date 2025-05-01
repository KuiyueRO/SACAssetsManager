/**
 * @fileoverview 封装并导出内嵌的 rbush R-Tree 库。
 * 提供符合项目规范的命名导出 `Rbush`，以及常用的辅助函数。
 * 原始库代码见同目录下的 `@rbush.static.js`。
 */
import RbushInternal from './@rbush.static.js';

// --- 辅助函数 ---

/**
 * 创建一个新的 Rbush 树实例。
 * @param {number} [maxEntries=9] - 每个节点的最大条目数。
 * @returns {RbushInternal} 一个新的 Rbush 树实例。
 */
export function createRbushTree(maxEntries = 9) {
  return new RbushInternal(maxEntries);
}

/**
 * 将一个项目插入 Rbush 树。
 * @param {RbushInternal} tree - Rbush 树实例。
 * @param {object} item - 要插入的项目 (必须包含 minX, minY, maxX, maxY)。
 */
export function insertIntoRbush(tree, item) {
  if (!tree || !item) return; // 基本检查
  // Rbush 内部似乎会处理重复插入，这里直接调用
  tree.insert(item);
}

/**
 * 从 Rbush 树中移除一个项目。
 * @param {RbushInternal} tree - Rbush 树实例。
 * @param {object} item - 要移除的项目。
 * @param {Function} [predicate] - (可选) 用于查找要移除项目的断言函数。
 */
export function removeFromRbush(tree, item, predicate) {
  if (!tree || !item) return; // 基本检查
  // Rbush 库的 remove 方法在找不到项时似乎不会抛出错误，但 predicate 可以帮助精确查找
  // 为了健壮性，还是包装一下
  try {
    tree.remove(item, predicate);
  } catch (e) {
    // 可以选择性地记录日志，暂时忽略
    // console.warn('尝试移除 Rbush 树中不存在的项目:', item, e);
  }
}

/**
 * 在 Rbush 树中搜索与指定边界框相交的项目。
 * @param {RbushInternal} tree - Rbush 树实例。
 * @param {object} bbox - 边界框 {minX, minY, maxX, maxY}。
 * @returns {Array<object>} 找到的项目数组。
 */
export function searchRbush(tree, bbox) {
  if (!tree || !bbox) return []; // 添加基本的健壮性检查
  return tree.search(bbox);
}

/**
 * 将项目数组批量加载到 Rbush 树中。通常比逐个插入更快。
 * @param {RbushInternal} tree - Rbush 树实例。
 * @param {Array<object>} items - 要加载的项目数组。
 */
export function loadIntoRbush(tree, items) {
  if (!tree || !Array.isArray(items)) return; // 添加检查
  tree.load(items);
}

/**
 * 清空 Rbush 树中的所有项目。
 * @param {RbushInternal} tree - Rbush 树实例。
 */
export function clearRbush(tree) {
  if (!tree) return; // 添加检查
  tree.clear();
}

// --- 原始类导出 (保留以备不时之需) ---

/**
 * Rbush R-Tree 类。
 *
 * 一个用于点和矩形的高性能 JavaScript R-Tree 实现。
 * @see {@link https://github.com/mourner/rbush}
 * @class
 */
export const Rbush = RbushInternal; 